"use client";

import { useState, useEffect } from "react";
import { useChainId } from "wagmi";
import { useMarsCatsNFTs } from "@/hooks/useMarsCatsNFTs";
import { NFTCard } from "./NFTCard";
import type { SelectedNFT } from "@/lib/types";

interface NFTInventoryProps {
  onSelectionChange: (selected: SelectedNFT[]) => void;
}

export function NFTInventory({ onSelectionChange }: NFTInventoryProps) {
  const chainId = useChainId();
  const [selectedNfts, setSelectedNfts] = useState<Map<bigint, SelectedNFT>>(
    new Map()
  );

  const { nfts, isLoading, removeNfts, refetch } = useMarsCatsNFTs();

  // Expose optimistic removal to parent
  useEffect(() => {
    (window as any).__removeBridgedNFTs = (tokenIds: bigint[]) => {
      removeNfts(tokenIds);
      setTimeout(() => refetch(), 10000);
    };
  }, [removeNfts, refetch]);

  // Clear selections when chain changes
  useEffect(() => {
    setSelectedNfts(new Map());
    onSelectionChange([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId]);

  const handleSelect = (tokenId: bigint) => {
    const newSelected = new Map(selectedNfts);
    if (newSelected.has(tokenId)) {
      newSelected.delete(tokenId);
    } else {
      newSelected.set(tokenId, { tokenId });
    }
    setSelectedNfts(newSelected);
    onSelectionChange(Array.from(newSelected.values()));
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <h2 className="text-console-text font-bold">YOUR MARS CATS</h2>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="console-border p-8 text-center">
          <p className="text-console-text animate-pulse">LOADING...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && nfts.length === 0 && (
        <div className="console-border p-8 text-center">
          <p className="text-console-text/70">NO MARS CATS FOUND</p>
        </div>
      )}

      {/* NFT Grid */}
      {!isLoading && nfts.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {nfts.map((nft) => (
            <NFTCard
              key={nft.tokenId.toString()}
              tokenId={nft.tokenId}
              name={nft.metadata?.name}
              image={nft.metadata?.image}
              isSelected={selectedNfts.has(nft.tokenId)}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}

      {/* Selection Summary */}
      {selectedNfts.size > 0 && (
        <div className="console-border p-4">
          <p className="text-console-text">
            SELECTED: {selectedNfts.size} CAT{selectedNfts.size > 1 ? "S" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
