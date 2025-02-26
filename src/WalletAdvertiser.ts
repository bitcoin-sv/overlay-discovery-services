import { Transaction, Script, PublicKey, PrivateKey, WalletInterface, KeyDeriver, PushDrop, TaggedBEEF, Utils, Beef, CreateActionInput, SignActionSpend } from '@bsv/sdk'
import { Advertisement, Engine, AdvertisementData, Advertiser } from '@bsv/overlay'
import { Wallet, WalletSigner, WalletStorageManager, StorageClient, Services } from '@bsv/wallet-toolbox-client'
import { isAdvertisableURI } from './utils/isAdvertisableURI.js'
import { isValidTopicOrServiceName } from './utils/isValidTopicOrServiceName.js'

const AD_TOKEN_VALUE = 1

/**
 * Implements the Advertiser interface for managing SHIP and SLAP advertisements using a Wallet.
 */
export class WalletAdvertiser implements Advertiser {
  private readonly wallet: WalletInterface
  private readonly storageManager: WalletStorageManager
  private initialized: boolean
  private engine: Engine | undefined

  /**
   * Constructs a new WalletAdvertiser instance.
   * @param chain - The blockchain (main or test) where this advertiser is advertising
   * @param privateKey - The private key used for signing transactions.
   * @param storageURL - The URL of the UTXO storage server for the Wallet.
   * @param advertisableURI - The advertisable URI where services are made available.
   */
  constructor(
    public chain: 'main' | 'test',
    public privateKey: string,
    public storageURL: string,
    public advertisableURI: string
  ) {
    if (!isAdvertisableURI(advertisableURI)) {
      throw new Error(`Refusing to initialize with non-advertisable URI: ${advertisableURI}`)
    }
    const keyDeriver = new KeyDeriver(new PrivateKey(privateKey, 'hex'))
    const storageManager = new WalletStorageManager(keyDeriver.identityKey)
    const signer = new WalletSigner(chain, keyDeriver, storageManager)
    const services = new Services(chain)
    const wallet = new Wallet(signer, services)
    this.initialized = false
    this.storageManager = storageManager
    this.wallet = wallet
  }

  /**
   * Initializes the wallet asynchronously and binds the advertiser with its Engine.
   * 
   * Sets the Engine instance to be used by this WalletAdvertiser. This method allows for late
   * binding of the Engine, thus avoiding circular dependencies during instantiation. The Engine
   * provides necessary context with the relevant topic managers and lookup services,
   * as well as the lookup function used for querying advertisements.
   *
   * @param engine The Engine instance to be associated with this NinjaAdvertiser. The Engine should
   * be fully initialized before being passed to this method to ensure all functionalities are available.
   */
  async initWithEngine(engine: Engine): Promise<void> {
    const client = new StorageClient(this.wallet, this.storageURL)
    await client.makeAvailable()
    await this.storageManager.addWalletStorageProvider(client)
    this.engine = engine
    this.initialized = true
  }

  /**
   * Utility function to create multiple advertisements in a single transaction.
   * @param adsData Array of advertisement details.
   * @returns The Tagged BEEF for the created advertisement
   * @throws Will throw an error if the locking key is invalid.
   */
  async createAdvertisements(
    adsData: AdvertisementData[]
  ): Promise<TaggedBEEF> {
    if (!this.initialized) {
      throw new Error('Initialize the Advertiser using initWithEngine() before use.')
    }
    const pushdrop = new PushDrop(this.wallet)
    const { publicKey: identityKey } = await this.wallet.getPublicKey({ identityKey: true })
    const outputs = await Promise.all(adsData.map(async (ad) => {
      if (!isValidTopicOrServiceName(ad.topicOrServiceName)) {
        throw new Error(`Refusing to create ${ad.protocol} advertisement with invalid topic or service name: ${ad.topicOrServiceName}`)
      }
      const lockingScript = await pushdrop.lock(
        [
          Utils.toArray(ad.protocol, 'utf8'),
          Utils.toArray(identityKey, 'hex'),
          Utils.toArray(this.advertisableURI, 'utf8'),
          Utils.toArray(ad.topicOrServiceName, 'utf8')
        ],
        [2, ad.protocol === 'SHIP' ? 'service host interconnect' : 'service lookup availability'],
        '1',
        'anyone',
        true
      )

      return {
        outputDescription: `${ad.protocol} advertisement of ${ad.topicOrServiceName}`,
        satoshis: AD_TOKEN_VALUE,
        lockingScript: lockingScript.toHex()
      }
    }))

    const tx = await this.wallet.createAction({
      outputs,
      description: 'SHIP/SLAP Advertisement Issuance',
    })

    const beef = Transaction.fromAtomicBEEF(tx.tx).toBEEF()

    return {
      beef,
      topics: [...new Set(adsData.map(ad => ad.protocol === 'SHIP' ? 'tm_ship' : 'tm_slap'))]
    }
  }

  /**
   * Finds all SHIP advertisements for a given topic.
   * @param topic - The topic name to search for.
   * @returns A promise that resolves to an array of SHIP advertisements.
   */
  async findAllAdvertisements(protocol: 'SHIP' | 'SLAP'): Promise<Advertisement[]> {
    if (!this.initialized || this.engine === undefined) {
      throw new Error('Initialize the Advertiser using initWithEngine() before use.')
    }
    const advertisements: Advertisement[] = []
    const lookupAnswer = await this.engine.lookup({
      service: protocol === 'SHIP' ? 'ls_ship' : 'ls_slap',
      query: 'findAll'
    })

    // Lookup will currently always return type output-list
    if (lookupAnswer.type === 'output-list') {
      lookupAnswer.outputs.forEach(output => {
        try {
          // Parse out the advertisements using the provided parser
          const tx = Transaction.fromBEEF(output.beef)
          const advertisement = this.parseAdvertisement(tx.outputs[output.outputIndex].lockingScript)
          if (advertisement !== undefined && advertisement !== null && advertisement.protocol === protocol) {
            advertisements.push({
              ...advertisement,
              beef: output.beef,
              outputIndex: output.outputIndex
            })
          }
        } catch (error) {
          console.error('Failed to parse advertisement output:', error)
        }
      })
    }

    return advertisements
  }

  /**
   * Revokes an existing advertisement.
   * @param advertisements - The advertisements to revoke, either SHIP or SLAP.
   * @returns A promise that resolves to the revoked advertisement as TaggedBEEF.
   */
  async revokeAdvertisements(advertisements: Advertisement[]): Promise<TaggedBEEF> {
    if (advertisements.length === 0) {
      throw new Error('Must provide advertisements to revoke!')
    }
    if (!this.initialized) {
      throw new Error('Initialize the Advertiser using initWithEngine() before use.')
    }
    const inputBeef = new Beef()
    const txInputs: CreateActionInput[] = []
    for (const advertisement of advertisements) {
      if (advertisement.beef === undefined || advertisement.outputIndex === undefined) {
        throw new Error('Advertisement to revoke must contain tagged beef!')
      }
      // Merge the BEEF into inputBEEF
      inputBeef.mergeBeef(advertisement.beef)

      // Parse the transaction and UTXO to spend
      const advertisementTx = Transaction.fromBEEF(advertisement.beef)
      const adTxid = advertisementTx.id('hex')
      txInputs.push({
        outpoint: `${adTxid}.${advertisement.outputIndex}`,
        inputDescription: `Revoke a ${advertisement.protocol} advertisement for ${advertisement.topicOrService}`,
        unlockingScriptLength: 74 // Typical PushDrop signature length
      })
    }

    // Create a new transaction that spends the SHIP or SLAP advertisement issuance token
    const revokePartial = await this.wallet.createAction({
      inputBEEF: inputBeef.toBinary(),
      inputs: txInputs,
      description: 'Revoke SHIP/SLAP advertisements'
    })

    const signableTx = Transaction.fromAtomicBEEF(revokePartial.signableTransaction.tx)
    const spends: Record<number, SignActionSpend> = {}
    const pushdrop = new PushDrop(this.wallet)

    // Sign the inputs now that wwe have the transaction
    for (let i = 0; i < advertisements.length; i++) {
      const advertisement = advertisements[i]
      const unlocker = pushdrop.unlock(
        [2, advertisement.protocol === 'SHIP' ? 'service host interconnect' : 'service lookup availability'],
        '1',
        'self'
      )
      const unlockingScript = await unlocker.sign(signableTx, i)
      spends[i] = { unlockingScript: unlockingScript.toHex() }
    }

    const revokeTx = await this.wallet.signAction({
      spends,
      reference: revokePartial.signableTransaction.reference
    })

    return {
      beef: Transaction.fromAtomicBEEF(revokeTx.tx).toBEEF(),
      topics: [...new Set(advertisements.map(ad => ad.protocol === 'SHIP' ? 'tm_ship' : 'tm_slap'))]
    }
  }

  /**
   * Parses an advertisement from the provided output script.
   * @param outputScript - The output script to parse.
   * @returns An Advertisement object if the script matches the expected format, otherwise throws an error.
   */
  parseAdvertisement(outputScript: Script): Advertisement {
    try {
      const result = PushDrop.decode(outputScript)

      if (result.fields.length < 4) {
        throw new Error('Invalid SHIP/SLAP advertisement!')
      }

      const protocol = Utils.toUTF8(result.fields[0])
      if (protocol !== 'SHIP' && protocol !== 'SLAP') {
        throw new Error('Invalid protocol type!')
      }

      const identityKey = Utils.toHex(result.fields[1])
      const domain = Utils.toUTF8(result.fields[2])
      const topicOrService = Utils.toUTF8(result.fields[3])

      // Construct a unified Advertisement object
      return {
        protocol,
        identityKey,
        domain,
        topicOrService
      }
    } catch (error) {
      console.error('Error parsing advertisement:', error)
      throw new Error('Error parsing advertisement!')
    }
  }
}
