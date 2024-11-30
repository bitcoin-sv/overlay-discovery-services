
Links: [API](#api), [Classes](#classes), [Variables](#variables)

### Classes

#### Class: SHIPTopicManager

SHIP Topic Manager
Implements the TopicManager interface for SHIP (Service Host Interconnect Protocol) tokens.

The SHIP Topic Manager identifies admissible outputs based on SHIP protocol requirements.
SHIP tokens facilitate the advertisement of nodes hosting specific topics within the overlay network.

```ts
export class SHIPTopicManager implements TopicManager {
    async identifyAdmissibleOutputs(beef: number[], previousCoins: number[]): Promise<AdmittanceInstructions> 
    async getDocumentation(): Promise<string> 
    async getMetaData(): Promise<{
        name: string;
        shortDescription: string;
        iconURL?: string;
        version?: string;
        informationURL?: string;
    }> 
}
```

<details>

<summary>Class SHIPTopicManager Details</summary>

##### Method getDocumentation

Returns documentation specific to the SHIP topic manager.

```ts
async getDocumentation(): Promise<string> 
```

Returns

A promise that resolves to the documentation string.

##### Method getMetaData

Returns metadata associated with this topic manager.

```ts
async getMetaData(): Promise<{
    name: string;
    shortDescription: string;
    iconURL?: string;
    version?: string;
    informationURL?: string;
}> 
```

Returns

A promise that resolves to an object containing metadata.

##### Method identifyAdmissibleOutputs

Identifies admissible outputs for SHIP tokens.

```ts
async identifyAdmissibleOutputs(beef: number[], previousCoins: number[]): Promise<AdmittanceInstructions> 
```

Returns

A promise that resolves with the admittance instructions.

Argument Details

+ **beef**
  + The transaction data in BEEF format.
+ **previousCoins**
  + The previous coins to consider.

</details>

Links: [API](#api), [Classes](#classes), [Variables](#variables)

---
### Variables

| |
| --- |
| [isValidDomain](#variable-isvaliddomain) |
| [verifyToken](#variable-verifytoken) |

Links: [API](#api), [Classes](#classes), [Variables](#variables)

---

#### Variable: isValidDomain

```ts
isValidDomain = (domain: string): boolean => {
    const domainRegex = /^(https?:\/\/)?((([a-zA-Z0-9-]+)\.)+([a-zA-Z]{2,})|localhost(:[0-9]+))(\/.*)?$/;
    return domainRegex.test(domain);
}
```

Links: [API](#api), [Classes](#classes), [Variables](#variables)

---
#### Variable: verifyToken

```ts
verifyToken = (identityKey: string, lockingPublicKey: string, fields: Buffer[], signature: string): void => {
    const pubKey = PublicKey.fromString(lockingPublicKey);
    const hasValidSignature = pubKey.verify(Array.from(Buffer.concat(fields)), Signature.fromDER(signature, "hex"));
    if (!hasValidSignature)
        throw new Error("Invalid signature!");
}
```

Links: [API](#api), [Classes](#classes), [Variables](#variables)

---
