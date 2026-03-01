export interface NFTMetadata {
  name?: string;
  image?: string;
  description?: string;
}

export interface MarsCatsNFT {
  tokenId: bigint;
  metadata?: NFTMetadata;
}

export interface SelectedNFT {
  tokenId: bigint;
}

export type BridgeStatus =
  | "idle"
  | "approving"
  | "quoting"
  | "sending"
  | "polling"
  | "completed"
  | "error";

export interface BridgeTransaction {
  status: BridgeStatus;
  txHash?: string;
  error?: string;
  guid?: string;
}
