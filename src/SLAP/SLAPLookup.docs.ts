export default `# SLAP Lookup Service

**Protocol Name**: SLAP (Service Lookup Availability Protocol)  
**Lookup Service Name**: \`SLAPLookupService\`

---

## Overview

The SLAP Lookup Service is an overlay component that answers queries about SLAP advertisements. A SLAP advertisement states that an identity key offers a service (prefixed \`ls_\`) at a given URI. By querying this service, you can find all known SLAP records that match your criteria.

---

## Purpose

- **Discovery**: Find all services that have been advertised with the \`SLAP\` protocol.
- **Filtering**: Narrow results by domain or by the \`ls_\` service name.

---

## How to Query the SLAP Lookup Service

You will typically provide a [LookupQuestion](https://www.npmjs.com/package/@bsv/overlay#lookupservice) object to the \`lookup\` method with:
- \`question.service = 'ls_slap'\`
- \`question.query\` describing the domain and/or service name you want.

### \`question.query\` Options

1. **\`"findAll"\`** (string literal): Returns every SLAP record in the database.
2. **\`SLAPQuery\` object**:
   \`\`\`ts
   interface SLAPQuery {
     domain?: string
     service?: string
   }
   \`\`\`
   - \`domain\`: Optional. If provided, only returns records whose \`advertisedURI\` matches this domain (exact or partial matching depends on your storage implementation).
   - \`service\`: Optional. Must be a string starting with \`ls_\`.

### Example Usages

1. **Find all**:
   \`\`\`js
   const question = {
     service: 'ls_slap',
     query: 'findAll'
   }
   const answers = await overlayClient.lookup(question)
   \`\`\`

2. **Find by domain**:
   \`\`\`js
   const question = {
     service: 'ls_slap',
     query: { domain: 'https://mylookup.example' }
   }
   const answers = await overlayClient.lookup(question)
   \`\`\`

3. **Find by service**:
   \`\`\`js
   const question = {
     service: 'ls_slap',
     query: { service: 'ls_treasury' }
   }
   const answers = await overlayClient.lookup(question)
   \`\`\`

4. **Find by domain & service**:
   \`\`\`js
   const question = {
     service: 'ls_slap',
     query: {
       domain: 'https://mylookup.example',
       service: 'ls_treasury'
     }
   }
   const answers = await overlayClient.lookup(question)
   \`\`\`

---

## Return Value

- Returns a **LookupAnswer** (commonly an array of records) or a **LookupFormula**.
- Each record typically includes:
  - \`txid\`
  - \`outputIndex\`
  - \`identityKey\` (in hex)
  - \`domain\` (or \`advertisedURI\`)
  - \`service\` (the \`ls_\` service name)

---

## Gotchas

- **Strict Matching**: Depending on your storage implementation, domain matching may require an exact string match. If you have a subpath or different port, be sure to store/lookup accordingly.
- **Must Start with \`ls_\`**: The \`service\` field in the original SLAP advertisement must begin with \`ls_\`. If you query for something that doesn’t match exactly, you may get zero results.
- **Record Lifecycle**: UTXOs can be spent. When spent, the record is removed (or flagged) by the manager’s \`outputSpent\` or \`outputDeleted\` handlers.

---

## Further Reading

- **SLAPTopicManager**: Learn how SLAP outputs are detected and admitted.
- **BRC-101 Overlays**: The higher-level specification for modular overlay protocols.
`