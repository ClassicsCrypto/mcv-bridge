/**
 * Environment-based configuration for MCV Bridge
 * Set NEXT_PUBLIC_BRIDGE_ENV=production for Ethereum Mainnet → ApeChain
 */

import { Chain } from "viem";

export type Environment = "development" | "production";

export const ENV: Environment =
  (process.env.NEXT_PUBLIC_BRIDGE_ENV as Environment) || "production";

export const IS_DEV = ENV === "development";
export const IS_PROD = ENV === "production";

const MAINNET_CONFIG = {
  sourceChain: {
    id: 1,
    name: "Ethereum",
    rpcUrl: process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || "",
  },
  destinationChain: {
    id: 33139,
    name: "ApeChain",
    rpcUrl: process.env.NEXT_PUBLIC_APECHAIN_RPC_URL || "https://apechain.calderachain.xyz/http",
    nativeCurrency: {
      decimals: 18,
      name: "ApeCoin",
      symbol: "APE",
    },
    blockExplorer: { name: "ApeScan", url: "https://apescan.io" },
  },
  destinationEid: 30312, // ApeChain LayerZero EID
  ethereumEid: 30101,   // Ethereum Mainnet LayerZero EID
  contracts: {
    marsCats: "0xdd467a6c8ae2b39825a452e06b4fa82f73d4253d" as const,
    beacon: "0x00000000000087c6dbaDC090d39BC10316f20658" as const,
  },
  apechainContracts: {
    marsCats: "0xCa76944aCBc4675F566D062D658BfaDF6f469Ca7" as const,
  },
} as const;

// For future testnet support
const TESTNET_CONFIG = {
  ...MAINNET_CONFIG,
} as const;

export const CONFIG = IS_PROD ? MAINNET_CONFIG : TESTNET_CONFIG;

export const COLLECTION_NAME = IS_PROD ? "Mars Cats" : "Test Mars Cats";

export function getSourceChain(): Chain {
  return {
    id: 1,
    name: "Ethereum",
    nativeCurrency: { decimals: 18, name: "Ether", symbol: "ETH" },
    rpcUrls: {
      default: { http: [CONFIG.sourceChain.rpcUrl] },
    },
    blockExplorers: {
      default: { name: "Etherscan", url: "https://etherscan.io" },
    },
  } as Chain;
}

export function getDestinationChain(): Chain {
  const dest = CONFIG.destinationChain;
  return {
    id: dest.id,
    name: dest.name,
    nativeCurrency: dest.nativeCurrency,
    rpcUrls: {
      default: { http: [dest.rpcUrl] },
    },
    blockExplorers: dest.blockExplorer
      ? { default: dest.blockExplorer }
      : undefined,
  } as Chain;
}

if (typeof window !== "undefined") {
  console.log(`[MCV Bridge] Running in ${ENV} mode`);
  console.log(`[MCV Bridge] Source: ${CONFIG.sourceChain.name}`);
  console.log(`[MCV Bridge] Destination: ${CONFIG.destinationChain.name}`);
}
