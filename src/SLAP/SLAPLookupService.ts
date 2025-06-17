import { LookupService, LookupQuestion, LookupAnswer, LookupFormula, AdmissionMode, OutputAdmittedByTopic, OutputSpent, SpendNotificationMode } from '@bsv/overlay'
import { PushDrop, Utils } from '@bsv/sdk'
import { SLAPStorage } from './SLAPStorage.js'
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
  admissionMode: AdmissionMode = 'locking-script'
  spendNotificationMode: SpendNotificationMode = 'none'
  constructor(public storage: SLAPStorage) { }

  async outputAdmittedByTopic(payload: OutputAdmittedByTopic): Promise<void> {
    if (payload.mode !== 'locking-script') throw new Error('Invalid mode')
    const { txid, outputIndex, lockingScript, topic } = payload
    if (topic !== 'tm_slap') return
    const result = PushDrop.decode(lockingScript)
    const protocol = Utils.toUTF8(result.fields[0])
    const identityKey = Utils.toHex(result.fields[1])
    const domain = Utils.toUTF8(result.fields[2])
    const service = Utils.toUTF8(result.fields[3])
    if (protocol !== 'SLAP') return
    await this.storage.storeSLAPRecord(txid, outputIndex, identityKey, domain, service)
  }

  async outputSpent(payload: OutputSpent): Promise<void> {
    if (payload.mode !== 'none') throw new Error('Invalid payload')
    const { topic, txid, outputIndex } = payload
    if (topic !== 'tm_slap') return
    await this.storage.deleteSLAPRecord(txid, outputIndex)
  }

  async outputEvicted (txid: string, outputIndex: number): Promise<void> {
    await this.storage.deleteSLAPRecord(txid, outputIndex)
  }

  async lookup(question: LookupQuestion): Promise<LookupFormula> {
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

    // Validate that provided values are strings.
    if (domain !== undefined && typeof domain !== 'string') {
      throw new Error('query.domain must be a string if provided')
    }
    if (service !== undefined && typeof service !== 'string') {
      throw new Error('query.service must be a string if provided')
    }
    if (identityKey !== undefined && typeof identityKey !== 'string') {
      throw new Error('query.identityKey must be a string if provided')
    }

    // Build the query object dynamically to omit any undefined values.
    const query: Partial<SLAPQuery> = {}
    if (domain !== undefined) query.domain = domain
    if (service !== undefined) query.service = service
    if (identityKey !== undefined) query.identityKey = identityKey

    const result = await this.storage.findRecord(query)
    console.log('LOOKUP RESULT', result)
    return result
  }

  async getDocumentation(): Promise<string> {
    return SLAPLookupDocs
  }

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
