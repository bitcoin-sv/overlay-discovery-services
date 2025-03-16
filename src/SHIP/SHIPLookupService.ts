import { LookupService, LookupQuestion, LookupAnswer, LookupFormula } from '@bsv/overlay'
import { SHIPStorage } from './SHIPStorage.js'
import { Script, PushDrop, Utils } from '@bsv/sdk'
import { SHIPQuery } from 'src/types.js'
import SHIPLookupDocs from './SHIPLookup.docs.js'

/**
 * Implements the SHIP lookup service
 *
 * The SHIP lookup service allows querying for overlay services hosting specific topics
 * within the overlay network.
 */
export class SHIPLookupService implements LookupService {
  constructor(public storage: SHIPStorage) { }

  /**
   * Handles the addition of a new output to the topic.
   * @param txid - The transaction ID containing the output.
   * @param outputIndex - The index of the output in the transaction.
   * @param outputScript - The script of the output to be processed.
   * @param topic - The topic associated with the output.
   */
  async outputAdded?(txid: string, outputIndex: number, outputScript: Script, topic: string): Promise<void> {
    if (topic !== 'tm_ship') return
    const result = PushDrop.decode(outputScript)
    const shipIdentifier = Utils.toUTF8(result.fields[0])
    const identityKey = Utils.toHex(result.fields[1])
    const domain = Utils.toUTF8(result.fields[2])
    const topicSupported = Utils.toUTF8(result.fields[3])
    if (shipIdentifier !== 'SHIP') return
    await this.storage.storeSHIPRecord(txid, outputIndex, identityKey, domain, topicSupported)
  }

  /**
   * Handles the spending of an output in the topic.
   * @param txid - The transaction ID of the spent output.
   * @param outputIndex - The index of the spent output.
   * @param topic - The topic associated with the spent output.
   */
  async outputSpent?(txid: string, outputIndex: number, topic: string): Promise<void> {
    if (topic !== 'tm_ship') return
    await this.storage.deleteSHIPRecord(txid, outputIndex)
  }

  /**
   * Handles the deletion of an output in the topic.
   * @param txid - The transaction ID of the deleted output.
   * @param outputIndex - The index of the deleted output.
   * @param topic - The topic associated with the deleted output.
   */
  async outputDeleted?(txid: string, outputIndex: number, topic: string): Promise<void> {
    if (topic !== 'tm_ship') return
    await this.storage.deleteSHIPRecord(txid, outputIndex)
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
    if (question.service !== 'ls_ship') {
      throw new Error('Lookup service not supported!')
    }

    if (question.query === 'findAll') {
      return await this.storage.findAll()
    }

    // Validate lookup query
    const { domain, topics, identityKey } = question.query as SHIPQuery
    if (typeof domain !== 'string' && typeof domain !== 'undefined') {
      throw new Error('query.domain must be a string if provided')
    }
    if (!Array.isArray(topics) && typeof topics !== 'undefined') {
      throw new Error('query.topics must be an array of strings if provided')
    }
    if (typeof identityKey !== 'string' && typeof identityKey !== 'undefined') {
      throw new Error('query.identityKey must be a string if provided')
    }
    return await this.storage.findRecord({ domain, topics, identityKey })
  }

  /**
   * Returns documentation specific to this overlay lookup service.
   * @returns A promise that resolves to the documentation string.
   */
  async getDocumentation(): Promise<string> {
    return SHIPLookupDocs
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
      name: 'SHIP Lookup Service',
      shortDescription: 'Provides lookup capabilities for SHIP tokens.'
    }
  }
}
