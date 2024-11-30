export interface UTXOReference {
  txid: string
  outputIndex: number
}

export interface SHIPRecord {
  txid: string
  outputIndex: number
  identityKey: string
  domain: string
  topic: string
  createdAt: Date
}

export interface SLAPRecord {
  txid: string
  outputIndex: number
  identityKey: string
  domain: string
  service: string
  createdAt: Date
}

export interface SHIPQuery {
  domain?: string
  topics?: string[]
}

export interface SLAPQuery {
  domain?: string
  service?: string
}