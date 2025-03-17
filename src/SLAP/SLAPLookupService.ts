import { LookupService, LookupQuestion, LookupAnswer, LookupFormula } from '@bsv/overlay'
import { SLAPStorage } from './SLAPStorage.js'
import { Script, PushDrop, Utils } from '@bsv/sdk'
import { SLAPQuery } from 'src/types.js'
import SLAPLookupDocs from './SLAPLookup.docs.js'

/**
 * Implements the SLAP lookup service
 *
 * The SLAP lookup service allows querying for service availability within the
 * overlay network. This service listens for SLAP-related UTXOs and stores relevant
 * records for lookup purposes.
 */
export class SLAPLookupService implements LookupService {
  constructor(public storage: SLAPStorage) { }

  /**
   * Handles the addition of a new output to the topic.
   * @param txid - The transaction ID containing the output.
   * @param outputIndex - The index of the output in the transaction.
   * @param outputScript - The script of the output to be processed.
   * @param topic - The topic associated with the output.
   */
  async outputAdded?(txid: string, outputIndex: number, outputScript: Script, topic: string): Promise<void> {
    if (topic !== 'tm_slap') return
    const result = PushDrop.decode(outputScript)
    const protocol = Utils.toUTF8(result.fields[0])
    const identityKey = Utils.toHex(result.fields[1])
    const domain = Utils.toUTF8(result.fields[2])
    const service = Utils.toUTF8(result.fields[3])
    if (protocol !== 'SLAP') return
    await this.storage.storeSLAPRecord(txid, outputIndex, identityKey, domain, service)
  }

  /**
   * Handles the spending of an output in the topic.
   * @param txid - The transaction ID of the spent output.
   * @param outputIndex - The index of the spent output.
   * @param topic - The topic associated with the spent output.
   */
  async outputSpent?(txid: string, outputIndex: number, topic: string): Promise<void> {
    if (topic !== 'tm_slap') return
    await this.storage.deleteSLAPRecord(txid, outputIndex)
  }

  /**
   * Handles the deletion of an output in the topic.
   * @param txid - The transaction ID of the deleted output.
   * @param outputIndex - The index of the deleted output.
   * @param topic - The topic associated with the deleted output.
   */
  async outputDeleted?(txid: string, outputIndex: number, topic: string): Promise<void> {
    if (topic !== 'tm_slap') return
    await this.storage.deleteSLAPRecord(txid, outputIndex)
  }

  /**
   * Answers a lookup query.
   * @param question - The lookup question to be answered.
   * @returns A promise that resolves to a lookup answer or formula.
   */
  async lookup(question: LookupQuestion): Promise<LookupAnswer | LookupFormula> {
    if (question.query === undefined || question.query === null) {
      throw new Error('A valid query must be provided!')
    }
    if (question.service !== 'ls_slap') {
      throw new Error('Lookup service not supported!')
    }

    if (question.query === 'findAll') {
      return await this.storage.findAll()
    }

    // Validate lookup query
    const { domain, service, identityKey } = question.query as SLAPQuery
    if (typeof domain !== 'string' && typeof domain !== 'undefined') {
      throw new Error('query.domain must be a string if provided')
    }
    if (typeof service !== 'string' && typeof service !== 'undefined') {
      throw new Error('query.service must be a string if provided')
    }
    if (typeof identityKey !== 'string' && typeof identityKey !== 'undefined') {
      throw new Error('query.identityKey must be a string if provided')
    }
    const result = await this.storage.findRecord({ domain, service, identityKey })
    console.log('LOOKUP RESULT', result)
    return result
  }

  /**
   * Returns documentation specific to this overlay lookup service.
   * @returns A promise that resolves to the documentation string.
   */
  async getDocumentation(): Promise<string> {
    return SLAPLookupDocs
  }

  /**
   * Returns metadata associated with this lookup service.
   * @returns A promise that resolves to an object containing metadata.
   */
  async getMetaData(): Promise<{
    name: string
    shortDescription: string
    iconURL?: string
    version?: string
    informationURL?: string
  }> {
    return {
      name: 'SLAP Lookup Service',
      shortDescription: 'Provides lookup capabilities for SLAP tokens.'
    }
  }
}
