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
      className={`console-border p-3 cursor-pointer nft-card-hover transition-all relative ${
        isSelected ? "nft-card-selected bg-console-hover" : ""
      }`}
      onClick={() => onSelect(tokenId)}
    >
      {/* Checkmark badge — outside image overflow */}
      {isSelected && (
        <div className="absolute top-1 right-1 z-10 w-6 h-6 rounded-full bg-console-accent flex items-center justify-center shadow-lg">
          <span className="text-white text-xs font-bold leading-none">✓</span>
        </div>
      )}
      {image && (
        <div className="relative w-full aspect-square mb-3 bg-black/50 overflow-hidden">
          <Image
            src={image}
            alt={name || `Token #${tokenId}`}
            fill
            className={`object-contain transition-transform duration-200 ${isSelected ? "scale-105" : ""}`}
            unoptimized
          />
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
