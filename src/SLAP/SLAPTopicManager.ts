import { AdmittanceInstructions, TopicManager } from '@bsv/overlay'
import { Transaction, PushDrop, Utils } from '@bsv/sdk'
import { verifyToken } from '../utils/verifyToken.js'
import { isValidServiceName } from '../utils/isValidServiceName.js'
import { getDocumentation } from '../utils/getDocumentation.js'

/**
 * 🤚 SLAP Topic Manager
 * Implements the TopicManager interface for SLAP (Service Lookup Availability Protocol) tokens.
 *
 * The SLAP Topic Manager identifies admissible outputs based on SLAP protocol requirements.
 * SLAP tokens facilitate the advertisement of lookup services availability within the overlay network.
 */
export class SLAPTopicManager implements TopicManager {
  /**
   * Identifies admissible outputs for SLAP tokens.
   * @param beef - The transaction data in BEEF format.
   * @param previousCoins - The previous coins to consider.
   * @returns A promise that resolves with the admittance instructions.
   */
  async identifyAdmissibleOutputs(
    beef: number[],
    previousCoins: number[]
  ): Promise<AdmittanceInstructions> {
    const outputsToAdmit: number[] = []
    try {
      const parsedTransaction = Transaction.fromBEEF(beef)

      for (const [i, output] of parsedTransaction.outputs.entries()) {
        try {
          const result = PushDrop.decode(output.lockingScript)

          if (result.fields.length !== 4) continue // SLAP tokens should have 4 fields

          const slapIdentifier = Utils.toUTF8(result.fields[0])
          const identityKey = Utils.toHex(result.fields[1])
          // const domain = result.fields[2].toString()
          const service = Utils.toUTF8(result.fields[3])
          if (slapIdentifier !== 'SLAP') continue

          // Validate domain and service
          // if (isValidDomain(domain) !== true) continue
          if (!isValidServiceName(service)) continue

          // Verify the token locking key and signature
          const signature = Utils.toHex(result.fields.pop())
          verifyToken(
            identityKey,
            result.lockingPublicKey,
            result.fields,
            signature
          )

          outputsToAdmit.push(i)
        } catch (error) {
          // It's common for other outputs to be invalid; no need to log an error here
          continue
        }
      }
    } catch (error) {
      // Only log an error if no outputs were admitted and no previous coins consumed
      if (outputsToAdmit.length === 0 && (!previousCoins || previousCoins.length === 0)) {
        console.error('🤚 Error identifying admissible outputs:', error)
      }
    }

    // Friendly logging with slappy emojis!
    if (outputsToAdmit.length > 0) {
      console.log(`👏 Admitted ${outputsToAdmit.length} SLAP ${outputsToAdmit.length === 1 ? 'output' : 'outputs'}!`)
    }

    if (previousCoins && previousCoins.length > 0) {
      console.log(`✋ Consumed ${previousCoins.length} previous SLAP ${previousCoins.length === 1 ? 'coin' : 'coins'}!`)
    }

    if (outputsToAdmit.length === 0 && (!previousCoins || previousCoins.length === 0)) {
      console.warn('😕 No SLAP outputs admitted and no previous SLAP coins consumed.')
    }

    return {
      outputsToAdmit,
      coinsToRetain: []
    }
  }

  /**
   * Returns documentation specific to the SLAP topic manager.
   * @returns A promise that resolves to the documentation string.
   */
  async getDocumentation(): Promise<string> {
    return await getDocumentation('./docs/SLAP/slap-lookup-service.md')
  }

  /**
   * Returns metadata associated with this topic manager.
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
      name: 'SLAP Topic Manager',
      shortDescription: 'Manages SLAP tokens for service lookup availability.'
    }
  }
}
