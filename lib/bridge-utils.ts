import { CONFIG } from "./config";

export type BridgeDirection = "forward" | "reverse";

export function getBridgeDirection(chainId: number | undefined): BridgeDirection {
  if (!chainId) return "forward";
  if (chainId === CONFIG.sourceChain.id) return "forward";
  if (chainId === CONFIG.destinationChain.id) return "reverse";
  return "forward";
}

export function getBridgeChainNames(chainId: number | undefined): {
  source: string;
  destination: string;
} {
  const direction = getBridgeDirection(chainId);
  if (direction === "forward") {
    return {
      source: CONFIG.sourceChain.name,
      destination: CONFIG.destinationChain.name,
    };
  }
  return {
    source: CONFIG.destinationChain.name,
    destination: CONFIG.sourceChain.name,
  };
}

export function isOnCorrectNetwork(chainId: number | undefined): boolean {
  if (!chainId) return false;
  return (
    chainId === CONFIG.sourceChain.id || chainId === CONFIG.destinationChain.id
  );
}
