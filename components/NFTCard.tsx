"use client";

import Image from "next/image";

interface NFTCardProps {
  tokenId: bigint;
  name?: string;
  image?: string;
  isSelected: boolean;
  onSelect: (tokenId: bigint) => void;
}

export function NFTCard({ tokenId, name, image, isSelected, onSelect }: NFTCardProps) {
  return (
    <div
      className={`console-border p-3 cursor-pointer nft-card-hover transition-all ${
        isSelected ? "nft-card-selected bg-console-hover" : ""
      }`}
      onClick={() => onSelect(tokenId)}
    >
      {image && (
        <div className="relative w-full aspect-square mb-3 bg-black/50 overflow-hidden">
          <Image
            src={image}
            alt={name || `Token #${tokenId}`}
            fill
            className={`object-contain transition-transform duration-200 ${
              isSelected ? "scale-105" : "hover:scale-103"
            }`}
            unoptimized
          />
          {isSelected && (
            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-console-accent flex items-center justify-center">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
          )}
        </div>
      )}

      <div className="space-y-1">
        <p className="text-console-text font-mono text-xs truncate">
          {name || `CAT #${tokenId.toString()}`}
        </p>
        <p className="text-console-text/40 text-xs font-mono">
          #{tokenId.toString()}
        </p>
      </div>
    </div>
  );
}
