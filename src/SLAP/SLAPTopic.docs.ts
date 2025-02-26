export default `# SLAP Topic Manager

**Protocol Name**: SLAP (Service Lookup Availability Protocol)  
**Manager Name**: \`SLAPTopicManager\`  

---

## Overview

The SLAP Topic Manager is responsible for identifying valid SLAP outputs in transactions. These outputs advertise the availability of a **lookup service** that can be accessed within an overlay network. By publishing a SLAP token, a node declares it is providing a specific service, prefixed \`ls_\`.

---

## Purpose

- **Announce**: Declare that the identity key provides a certain lookup service, such as \`ls_slap\` or other overlay lookups.
- **Availability**: Indicate that the node or service is currently active and can be queried via the provided URI.

---

## Requirements for a Valid SLAP Output

Similar to SHIP, SLAP tokens must follow a specific 5-field structure in a [PushDrop](https://www.npmjs.com/package/@bsv/sdk#pushdrop) script:

1. \`"SLAP"\` — The literal string indicating SLAP protocol.
2. \`identityKey\` — The public key in hex that claims ownership of this advertisement.
3. \`advertisedURI\` — A valid URI, passing [\`isAdvertisableURI\`](./isAdvertisableURI.js).
4. \`service\` — The name of the service. Must:
   - Pass [\`isValidTopicOrServiceName\`](./isValidTopicOrServiceName.js).
   - Start with \`ls_\`.
5. \`signature\` — The ECDSA signature from \`identityKey\` covering the above 4 fields.

---

## Signature and Locking Key

The final field is a signature that **must** link back to the identity key. The \`SLAPTopicManager\` uses [\`isTokenSignatureCorrectlyLinked\`](./isTokenSignatureCorrectlyLinked.js) to confirm:

- The signature is valid for the data in the first four fields.
- The \`lockingPublicKey\` of the UTXO matches the derived key from the identity key used to sign.

If any step fails, the SLAP output is rejected.

---

## Data Format and Validation

1. **Exact 5 PushDrop Fields**:
   - If fewer or more than 5 fields are found, the SLAP manager will skip the output.
2. **Valid \`service\`**:
   - Must begin with \`ls_\`.
   - Only letters (lowercase) and underscores are allowed, per \`isValidTopicOrServiceName\`.
3. **Advertised URI**:
   - Must not be \`localhost\`.
   - Must use a recognized scheme (\`https://\`, \`wss://\`, or specialized custom \`https+\` forms).
4. **Signature**:
   - Must be in raw bytes format.
   - Must match the identity key.

---

## How to Create a Valid SLAP Transaction

1. Prepare the data fields (4 total):
   1. \`"SLAP"\`
   2. \`identityKey\` (hex)
   3. \`advertisedURI\` (must pass \`isAdvertisableURI\`)
   4. \`service\` (must start with \`ls_\` and match \`isValidTopicOrServiceName\`)
2. Sign these fields with the private key corresponding to \`identityKey\`.
3. Encode via \`PushDrop\`.
4. Include this script in your transaction output.
5. Fund the output with sufficient satoshis.

---

## Logging and Output Indexing

During operation, the SLAP Topic Manager:

- Logs a message whenever it admits (accepts) a new valid SLAP output.
- Maintains a list of which outputs have been admitted (the manager may or may not store them, depending on your overlay's architecture).

---

## Further Reading

- **SLAPLookupService**: For how to query these records afterward.
- **SHIP**: The complementary protocol for advertising "host-based" topics (\`tm_\`).
- **BRC-101 Overlays**: The overall approach to building these modular protocols.

`
