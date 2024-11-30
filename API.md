# API

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Variables](#variables)

## Interfaces

| |
| --- |
| [SHIPQuery](#interface-shipquery) |
| [SHIPRecord](#interface-shiprecord) |
| [SLAPQuery](#interface-slapquery) |
| [SLAPRecord](#interface-slaprecord) |
| [UTXOReference](#interface-utxoreference) |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Variables](#variables)

---

### Interface: SHIPQuery

```ts
export interface SHIPQuery {
    domain?: string;
    topics?: string[];
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Variables](#variables)

---
### Interface: SHIPRecord

```ts
export interface SHIPRecord {
    txid: string;
    outputIndex: number;
    identityKey: string;
    domain: string;
    topic: string;
    createdAt: Date;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Variables](#variables)

---
### Interface: SLAPQuery

```ts
export interface SLAPQuery {
    domain?: string;
    service?: string;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Variables](#variables)

---
### Interface: SLAPRecord

```ts
export interface SLAPRecord {
    txid: string;
    outputIndex: number;
    identityKey: string;
    domain: string;
    service: string;
    createdAt: Date;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Variables](#variables)

---
### Interface: UTXOReference

```ts
export interface UTXOReference {
    txid: string;
    outputIndex: number;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Variables](#variables)

---
## Classes

| |
| --- |
| [LegacyNinjaAdvertiser](#class-legacyninjaadvertiser) |
| [SHIPLookupService](#class-shiplookupservice) |
| [SHIPStorage](#class-shipstorage) |
| [SHIPTopicManager](#class-shiptopicmanager) |
| [SLAPLookupService](#class-slaplookupservice) |
| [SLAPStorage](#class-slapstorage) |
| [SLAPTopicManager](#class-slaptopicmanager) |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Variables](#variables)

---

### Class: LegacyNinjaAdvertiser

Implements the Advertiser interface for managing SHIP and SLAP advertisements using a Ninja.

```ts
export class LegacyNinjaAdvertiser {
    constructor(public privateKey: string, public dojoURL: string, public hostingDomain: string) 
    setLookupEngine(engine: Engine): void 
    async createAdvertisements(adsData: AdvertisementData[]): Promise<TaggedBEEF> 
    async findAllAdvertisements(protocol: "SHIP" | "SLAP"): Promise<Advertisement[]> 
    async revokeAdvertisements(advertisements: Advertisement[]): Promise<TaggedBEEF> 
    parseAdvertisement(outputScript: Script): Advertisement 
}
```

<details>

<summary>Class LegacyNinjaAdvertiser Details</summary>

#### Constructor

Constructs a new NinjaAdvertiser instance.

```ts
constructor(public privateKey: string, public dojoURL: string, public hostingDomain: string) 
```

Argument Details

+ **privateKey**
  + The private key used for signing transactions.
+ **dojoURL**
  + The URL of the dojo server for the Ninja.
+ **hostingDomain**
  + The base server URL for the NinjaAdvertiser.

#### Method createAdvertisements

Utility function to create multiple advertisements in a single transaction.

```ts
async createAdvertisements(adsData: AdvertisementData[]): Promise<TaggedBEEF> 
```

Returns

A promise that resolves to an array of TaggedBEEF objects.

Argument Details

+ **privateKey**
  + The private key used to sign the transaction.
+ **adsData**
  + Array of advertisement details.
+ **ninja**
  + Ninja instance for transaction processing.
+ **note**
  + A note attached to the transaction.

Throws

Will throw an error if the locking key is invalid.

#### Method findAllAdvertisements

Finds all SHIP advertisements for a given topic.

```ts
async findAllAdvertisements(protocol: "SHIP" | "SLAP"): Promise<Advertisement[]> 
```

Returns

A promise that resolves to an array of SHIP advertisements.

Argument Details

+ **topic**
  + The topic name to search for.

#### Method parseAdvertisement

Parses an advertisement from the provided output script.

```ts
parseAdvertisement(outputScript: Script): Advertisement 
```

Returns

An Advertisement object if the script matches the expected format, otherwise throws an error.

Argument Details

+ **outputScript**
  + The output script to parse.

#### Method revokeAdvertisements

Revokes an existing advertisement.

```ts
async revokeAdvertisements(advertisements: Advertisement[]): Promise<TaggedBEEF> 
```

Returns

A promise that resolves to the revoked advertisement as TaggedBEEF.

Argument Details

+ **advertisements**
  + The advertisements to revoke, either SHIP or SLAP.

#### Method setLookupEngine

Sets the Engine instance to be used by this NinjaAdvertiser. This method allows for late
binding of the Engine, thus avoiding circular dependencies during instantiation. The Engine
provides necessary context with the relevant topic managers and lookup services,
as well as the lookup function used for querying advertisements.

```ts
setLookupEngine(engine: Engine): void 
```

Argument Details

+ **engine**
  + The Engine instance to be associated with this NinjaAdvertiser. The Engine should
be fully initialized before being passed to this method to ensure all functionalities are available.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Variables](#variables)

---
### Class: SHIPLookupService

Implements the SHIP lookup service

The SHIP lookup service allows querying for overlay services hosting specific topics
within the overlay network.

```ts
export class SHIPLookupService implements LookupService {
    constructor(public storage: SHIPStorage) 
    async outputAdded?(txid: string, outputIndex: number, outputScript: Script, topic: string): Promise<void> 
    async outputSpent?(txid: string, outputIndex: number, topic: string): Promise<void> 
    async outputDeleted?(txid: string, outputIndex: number, topic: string): Promise<void> 
    async lookup(question: LookupQuestion): Promise<LookupAnswer | LookupFormula> 
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

See also: [SHIPStorage](#class-shipstorage)

<details>

<summary>Class SHIPLookupService Details</summary>

#### Method getDocumentation

Returns documentation specific to this overlay lookup service.

```ts
async getDocumentation(): Promise<string> 
```

Returns

A promise that resolves to the documentation string.

#### Method getMetaData

Returns metadata associated with this lookup service.

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

#### Method lookup

Answers a lookup query.

```ts
async lookup(question: LookupQuestion): Promise<LookupAnswer | LookupFormula> 
```

Returns

A promise that resolves to a lookup answer or formula.

Argument Details

+ **question**
  + The lookup question to be answered.

#### Method outputAdded

Handles the addition of a new output to the topic.

```ts
async outputAdded?(txid: string, outputIndex: number, outputScript: Script, topic: string): Promise<void> 
```

Argument Details

+ **txid**
  + The transaction ID containing the output.
+ **outputIndex**
  + The index of the output in the transaction.
+ **outputScript**
  + The script of the output to be processed.
+ **topic**
  + The topic associated with the output.

#### Method outputDeleted

Handles the deletion of an output in the topic.

```ts
async outputDeleted?(txid: string, outputIndex: number, topic: string): Promise<void> 
```

Argument Details

+ **txid**
  + The transaction ID of the deleted output.
+ **outputIndex**
  + The index of the deleted output.
+ **topic**
  + The topic associated with the deleted output.

#### Method outputSpent

Handles the spending of an output in the topic.

```ts
async outputSpent?(txid: string, outputIndex: number, topic: string): Promise<void> 
```

Argument Details

+ **txid**
  + The transaction ID of the spent output.
+ **outputIndex**
  + The index of the spent output.
+ **topic**
  + The topic associated with the spent output.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Variables](#variables)

---
### Class: SHIPStorage

Implements a storage engine for SHIP protocol

```ts
export class SHIPStorage {
    constructor(private readonly db: Db) 
    async ensureIndexes(): Promise<void> 
    async storeSHIPRecord(txid: string, outputIndex: number, identityKey: string, domain: string, topic: string): Promise<void> 
    async deleteSHIPRecord(txid: string, outputIndex: number): Promise<void> 
    async findRecord(query: {
        domain?: string;
        topics?: string[];
    }): Promise<UTXOReference[]> 
    async findAll(): Promise<UTXOReference[]> 
}
```

See also: [UTXOReference](#interface-utxoreference)

<details>

<summary>Class SHIPStorage Details</summary>

#### Constructor

Constructs a new SHIPStorage instance

```ts
constructor(private readonly db: Db) 
```

Argument Details

+ **db**
  + connected mongo database instance

#### Method deleteSHIPRecord

Deletes a SHIP record

```ts
async deleteSHIPRecord(txid: string, outputIndex: number): Promise<void> 
```

Argument Details

+ **txid**
  + transaction id
+ **outputIndex**
  + index of the UTXO

#### Method ensureIndexes

Ensures the necessary indexes are created for the collections.

```ts
async ensureIndexes(): Promise<void> 
```

#### Method findAll

Returns all results tracked by the overlay

```ts
async findAll(): Promise<UTXOReference[]> 
```
See also: [UTXOReference](#interface-utxoreference)

Returns

returns matching UTXO references

#### Method findRecord

Finds SHIP records based on a given query object.

```ts
async findRecord(query: {
    domain?: string;
    topics?: string[];
}): Promise<UTXOReference[]> 
```
See also: [UTXOReference](#interface-utxoreference)

Returns

Returns matching UTXO references.

Argument Details

+ **query**
  + The query object which may contain properties for domain or topics.

#### Method storeSHIPRecord

Stores a SHIP record

```ts
async storeSHIPRecord(txid: string, outputIndex: number, identityKey: string, domain: string, topic: string): Promise<void> 
```

Argument Details

+ **txid**
  + transaction id
+ **outputIndex**
  + index of the UTXO
+ **identityKey**
  + identity key
+ **domain**
  + domain name
+ **topic**
  + topic name

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Variables](#variables)

---
### Class: SHIPTopicManager

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

#### Method getDocumentation

Returns documentation specific to the SHIP topic manager.

```ts
async getDocumentation(): Promise<string> 
```

Returns

A promise that resolves to the documentation string.

#### Method getMetaData

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

#### Method identifyAdmissibleOutputs

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

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Variables](#variables)

---
### Class: SLAPLookupService

Implements the SLAP lookup service

The SLAP lookup service allows querying for service availability within the
overlay network. This service listens for SLAP-related UTXOs and stores relevant
records for lookup purposes.

```ts
export class SLAPLookupService implements LookupService {
    constructor(public storage: SLAPStorage) 
    async outputAdded?(txid: string, outputIndex: number, outputScript: Script, topic: string): Promise<void> 
    async outputSpent?(txid: string, outputIndex: number, topic: string): Promise<void> 
    async outputDeleted?(txid: string, outputIndex: number, topic: string): Promise<void> 
    async lookup(question: LookupQuestion): Promise<LookupAnswer | LookupFormula> 
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

See also: [SLAPStorage](#class-slapstorage)

<details>

<summary>Class SLAPLookupService Details</summary>

#### Method getDocumentation

Returns documentation specific to this overlay lookup service.

```ts
async getDocumentation(): Promise<string> 
```

Returns

A promise that resolves to the documentation string.

#### Method getMetaData

Returns metadata associated with this lookup service.

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

#### Method lookup

Answers a lookup query.

```ts
async lookup(question: LookupQuestion): Promise<LookupAnswer | LookupFormula> 
```

Returns

A promise that resolves to a lookup answer or formula.

Argument Details

+ **question**
  + The lookup question to be answered.

#### Method outputAdded

Handles the addition of a new output to the topic.

```ts
async outputAdded?(txid: string, outputIndex: number, outputScript: Script, topic: string): Promise<void> 
```

Argument Details

+ **txid**
  + The transaction ID containing the output.
+ **outputIndex**
  + The index of the output in the transaction.
+ **outputScript**
  + The script of the output to be processed.
+ **topic**
  + The topic associated with the output.

#### Method outputDeleted

Handles the deletion of an output in the topic.

```ts
async outputDeleted?(txid: string, outputIndex: number, topic: string): Promise<void> 
```

Argument Details

+ **txid**
  + The transaction ID of the deleted output.
+ **outputIndex**
  + The index of the deleted output.
+ **topic**
  + The topic associated with the deleted output.

#### Method outputSpent

Handles the spending of an output in the topic.

```ts
async outputSpent?(txid: string, outputIndex: number, topic: string): Promise<void> 
```

Argument Details

+ **txid**
  + The transaction ID of the spent output.
+ **outputIndex**
  + The index of the spent output.
+ **topic**
  + The topic associated with the spent output.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Variables](#variables)

---
### Class: SLAPStorage

Implements a storage engine for SLAP protocol

```ts
export class SLAPStorage {
    constructor(private readonly db: Db) 
    async ensureIndexes(): Promise<void> 
    async storeSLAPRecord(txid: string, outputIndex: number, identityKey: string, domain: string, service: string): Promise<void> 
    async deleteSLAPRecord(txid: string, outputIndex: number): Promise<void> 
    async findRecord(query: {
        domain?: string;
        service?: string;
    }): Promise<UTXOReference[]> 
    async findAll(): Promise<UTXOReference[]> 
}
```

See also: [UTXOReference](#interface-utxoreference)

<details>

<summary>Class SLAPStorage Details</summary>

#### Constructor

Constructs a new SLAPStorage instance

```ts
constructor(private readonly db: Db) 
```

Argument Details

+ **db**
  + connected mongo database instance

#### Method deleteSLAPRecord

Deletes a SLAP record

```ts
async deleteSLAPRecord(txid: string, outputIndex: number): Promise<void> 
```

Argument Details

+ **txid**
  + transaction id
+ **outputIndex**
  + index of the UTXO

#### Method ensureIndexes

Ensures the necessary indexes are created for the collections.

```ts
async ensureIndexes(): Promise<void> 
```

#### Method findAll

Returns all results tracked by the overlay

```ts
async findAll(): Promise<UTXOReference[]> 
```
See also: [UTXOReference](#interface-utxoreference)

Returns

returns matching UTXO references

#### Method findRecord

Finds SLAP records based on a given query object.

```ts
async findRecord(query: {
    domain?: string;
    service?: string;
}): Promise<UTXOReference[]> 
```
See also: [UTXOReference](#interface-utxoreference)

Returns

returns matching UTXO references

Argument Details

+ **query**
  + The query object which may contain properties for domain or service.

#### Method storeSLAPRecord

Stores a SLAP record

```ts
async storeSLAPRecord(txid: string, outputIndex: number, identityKey: string, domain: string, service: string): Promise<void> 
```

Argument Details

+ **txid**
  + transaction id
+ **outputIndex**
  + index of the UTXO
+ **identityKey**
  + identity key
+ **domain**
  + domain name
+ **service**
  + service name

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Variables](#variables)

---
### Class: SLAPTopicManager

SLAP Topic Manager
Implements the TopicManager interface for SLAP (Service Lookup Availability Protocol) tokens.

The SLAP Topic Manager identifies admissible outputs based on SLAP protocol requirements.
SLAP tokens facilitate the advertisement of lookup services availability within the overlay network.

```ts
export class SLAPTopicManager implements TopicManager {
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

<summary>Class SLAPTopicManager Details</summary>

#### Method getDocumentation

Returns documentation specific to the SLAP topic manager.

```ts
async getDocumentation(): Promise<string> 
```

Returns

A promise that resolves to the documentation string.

#### Method getMetaData

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

#### Method identifyAdmissibleOutputs

Identifies admissible outputs for SLAP tokens.

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

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Variables](#variables)

---
## Variables

| |
| --- |
| [isValidDomain](#variable-isvaliddomain) |
| [isValidServiceName](#variable-isvalidservicename) |
| [verifyToken](#variable-verifytoken) |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Variables](#variables)

---

### Variable: isValidDomain

```ts
isValidDomain = (domain: string): boolean => {
    const domainRegex = /^(https?:\/\/)?((([a-zA-Z0-9-]+)\.)+([a-zA-Z]{2,})|localhost(:[0-9]+))(\/.*)?$/;
    return domainRegex.test(domain);
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Variables](#variables)

---
### Variable: isValidServiceName

```ts
isValidServiceName = (service: string): boolean => {
    const serviceRegex = /^(?!_)(?!.*__)[a-z_]{1,50}(?<!_)$/;
    return serviceRegex.test(service);
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Variables](#variables)

---
### Variable: verifyToken

```ts
verifyToken = (identityKey: string, lockingPublicKey: string, fields: Buffer[], signature: string): void => {
    const pubKey = PublicKey.fromString(lockingPublicKey);
    const hasValidSignature = pubKey.verify(Array.from(Buffer.concat(fields)), Signature.fromDER(signature, "hex"));
    if (!hasValidSignature)
        throw new Error("Invalid signature!");
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Variables](#variables)

---
