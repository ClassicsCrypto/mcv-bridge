"use client";

import { useEffect, useState } from "react";
import { usePublicClient, useChainId } from "wagmi";
import { beaconAbi } from "@/lib/abis";
import { CONFIG } from "@/lib/config";
import { getBridgeDirection } from "@/lib/bridge-utils";
import type { SelectedNFT } from "@/lib/types";

const BEACON_ADDRESS = "0x00000000000087c6dbaDC090d39BC10316f20658" as `0x${string}`;

export function useBridgeFeeQuote(selectedNfts: SelectedNFT[]) {
  const publicClient = usePublicClient();
  const chainId = useChainId();
  const [fee, setFee] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!publicClient || selectedNfts.length === 0) {
      setFee(null);
      return;
    }

    const direction = getBridgeDirection(chainId);
    const tokenIds = selectedNfts.map((n) => n.tokenId);

    const dstEid = direction === "forward" ? CONFIG.destinationEid : CONFIG.ethereumEid;
    const collectionAddress =
      direction === "forward"
        ? CONFIG.contracts.marsCats
        : (CONFIG.apechainContracts?.marsCats as `0x${string}`);

    setIsLoading(true);

    publicClient
      .readContract({
        address: BEACON_ADDRESS,
        abi: beaconAbi,
        functionName: "quoteSend",
        args: [dstEid, collectionAddress, tokenIds, 0n],
      })
      .then((result) => {
        const quote = result as readonly [bigint, bigint];
        setFee(quote[0]);
      })
      .catch(() => setFee(null))
      .finally(() => setIsLoading(false));
  }, [selectedNfts.length, chainId, publicClient]);

  const feeFormatted =
    fee !== null
      ? `${(Number(fee) / 1e18).toFixed(5)} ${getBridgeDirection(chainId) === "forward" ? "ETH" : "APE"}`
      : null;

  return { fee, feeFormatted, isLoading };
}
