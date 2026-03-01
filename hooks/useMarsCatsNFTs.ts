"use client";

import { useAccount, useChainId } from "wagmi";
import { MARS_CATS_ADDRESS } from "@/lib/constants";
import { useState, useEffect, useRef, useCallback } from "react";
import { CONFIG } from "@/lib/config";
import { getBridgeDirection } from "@/lib/bridge-utils";
import type { MarsCatsNFT } from "@/lib/types";

interface AlchemyNFT {
  tokenId: string;
  name?: string;
  image?: {
    cachedUrl?: string;
    thumbnailUrl?: string;
    originalUrl?: string;
  };
  raw?: {
    metadata?: {
      name?: string;
      image?: string;
    };
  };
}

interface AlchemyNFTResponse {
  ownedNfts: AlchemyNFT[];
  totalCount: number;
}

export function useMarsCatsNFTs() {
  const { address } = useAccount();
  const chainId = useChainId();
  const [nfts, setNfts] = useState<MarsCatsNFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState<bigint>(0n);
  const lastFetchKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!address || !chainId) {
      setNfts([]);
      setBalance(0n);
      setIsLoading(false);
      lastFetchKeyRef.current = null;
      return;
    }

    const direction = getBridgeDirection(chainId);
    const network = direction === "forward" ? "eth-mainnet" : "apechain-mainnet";
    const contractAddress =
      direction === "forward"
        ? MARS_CATS_ADDRESS
        : CONFIG.apechainContracts?.marsCats;

    if (!contractAddress) {
      setNfts([]);
      setBalance(0n);
      setIsLoading(false);
      return;
    }

    const fetchKey = `${address}-${chainId}-${network}`;

    if (lastFetchKeyRef.current === fetchKey) {
      return;
    }

    lastFetchKeyRef.current = fetchKey;
    setIsLoading(true);

    const fetchNFTs = async () => {
      try {
        const params = new URLSearchParams({
          owner: address,
          contract: contractAddress,
          network,
        });

        const response = await fetch(`/api/nfts?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data: AlchemyNFTResponse = await response.json();

        console.log(`[useMarsCatsNFTs] Found ${data.totalCount} NFTs`);

        const nftData: MarsCatsNFT[] = data.ownedNfts.map((nft: AlchemyNFT) => ({
          tokenId: BigInt(nft.tokenId),
          metadata: {
            name: nft.name || nft.raw?.metadata?.name,
            image:
              nft.image?.cachedUrl ||
              nft.image?.originalUrl ||
              nft.raw?.metadata?.image,
          },
        }));

        setNfts(nftData);
        setBalance(BigInt(data.totalCount));
        setIsLoading(false);
      } catch (error) {
        console.error("[useMarsCatsNFTs] Error fetching NFTs:", error);
        setNfts([]);
        setBalance(0n);
        setIsLoading(false);
        lastFetchKeyRef.current = null;
      }
    };

    fetchNFTs();
  }, [address, chainId]);

  const removeNfts = useCallback((tokenIds: bigint[]) => {
    setNfts((prev) =>
      prev.filter((nft) => !tokenIds.includes(nft.tokenId))
    );
    setBalance((prev) => prev - BigInt(tokenIds.length));
  }, []);

  const refetch = useCallback(() => {
    lastFetchKeyRef.current = null;
  }, []);

  return { nfts, isLoading, balance, removeNfts, refetch };
}
