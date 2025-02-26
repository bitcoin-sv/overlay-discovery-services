export default `# SHIP Topic Manager

**Protocol Name**: SHIP (Service Host Interconnect Protocol)  
**Manager Name**: \`SHIPTopicManager\`  

---

## Overview

The SHIP Topic Manager is responsible for identifying _admissible outputs_ in transactions that declare themselves as part of the SHIP protocol. In other words, it looks at transaction outputs (UTXOs) that embed certain metadata via a [PushDrop](https://www.npmjs.com/package/@bsv/sdk#pushdrop) locking script. This metadata must meet SHIP-specific requirements so that your node or application can recognize valid SHIP advertisements.

A **SHIP token** (in the context of BRC-101 overlays) is a UTXO containing information that advertises a node or host providing some topic-based service to the network. That topic must be prefixed with \`tm_\` — short for "topic manager."

---

## Purpose

- **Announce**: The SHIP token is used to signal that "this identity key is hosting a certain topic (prefixed with \`tm_\`)."
- **Connect**: By publishing a SHIP output, a node indicates it offers some service or is a participant in a specific overlay "topic."
- **Authorize**: The SHIP token includes a signature which binds it to an identity key, ensuring authenticity and preventing impersonation.

This allows other nodes to discover hosts by scanning the blockchain for valid SHIP tokens.

---

## Requirements for a Valid SHIP Output

1. **PushDrop Fields**: Exactly five fields must be present:
   1. \`"SHIP"\` — The protocol identifier string.
   2. \`identityKey\` — The 32-byte public key (in hex) that claims to own this UTXO.
   3. \`advertisedURI\` — A URI string describing how or where to connect (see [\`isAdvertisableURI\`](./isAdvertisableURI.js)).
   4. \`topic\` — A string that identifies the topic. Must:
      - Start with \`tm_\`
      - Pass the [\`isValidTopicOrServiceName\`](./isValidTopicOrServiceName.js) check
   5. \`signature\` — A valid signature (in raw bytes) proving that \`identityKey\` is authorizing this output.

2. **Signature Verification**:  
   - The signature in the last field must be valid for the data in the first 4 fields.
   - It must match the identity key, which in turn must match the locking public key used in the output script.  
   - See [\`isTokenSignatureCorrectlyLinked\`](./isTokenSignatureCorrectlyLinked.js) for the implementation details.

3. **Advertised URI**:  
   - Must pass [\`isAdvertisableURI\`](./isAdvertisableURI.js), which enforces certain URI formats (e.g., \`https://\`, \`wss://\`, or custom prefixed \`https+\` URIs).
   - No \`localhost\` or invalid URIs allowed.

4. **Topic Name**:  
   - Must be a valid name recognized by [\`isValidTopicOrServiceName\`](./isValidTopicOrServiceName.js).
   - Must begin with \`tm_\` for SHIP.

If any of these checks fail, the SHIP token output is _not_ admitted by the topic manager.

---

## Gotchas and Tips

- **Field Ordering**: The fields **must** appear in the exact order specified above (SHIP -> identityKey -> advertisedURI -> topic -> signature).
- **Exact Five Fields**: More or fewer fields will cause the manager to skip the output.
- **Proper Locking Script**: Ensure the output is locked with a valid [PushDrop](https://www.npmjs.com/package/@bsv/sdk#pushdrop) format. If the \`lockingScript\` can’t be decoded by \`PushDrop\`, the output is invalid.
- **Signature Data**: The signature is a raw ECDSA signature over the raw bytes of the preceding fields. The manager expects that the identity key and signature match up with the logic in \`isTokenSignatureCorrectlyLinked\`.
- **Funding**: Remember to fund your SHIP output with enough satoshis so it remains unspent if you want your advertisement to stay valid.

---

## How to Create a Valid SHIP Transaction

1. Generate or have an identity key (public/private key pair).
2. Collect the 4 data fields:
   - \`"SHIP"\`
   - \`identityKey\` in hex
   - \`advertisedURI\`
   - \`topic\` (must start with \`tm_\`)
3. Generate a signature over these 4 fields with your identity key.
4. Use \`PushDrop.encode([field1, field2, field3, field4, signature])\` to produce your locking script.
5. Include this output in your transaction with some non-zero satoshi value.
6. Broadcast the transaction. Once mined, the output is now discoverable via the SHIP topic manager.

---

## Further Reading

- **[BRC-101 Overlays](https://bitcoinschema.org/)**: For general overlay design patterns.
- **[@bsv/sdk PushDrop Docs](https://www.npmjs.com/package/@bsv/sdk#pushdrop)**: For how to encode data fields into a script.
- **[isAdvertisableURI.js](./isAdvertisableURI.js)**: For the rules on which URIs are valid.
- **[isTokenSignatureCorrectlyLinked.js](./isTokenSignatureCorrectlyLinked.js)**: For signature verification.
- **[isValidTopicOrServiceName.js](./isValidTopicOrServiceName.js)**: For topic/service name validation.

`
