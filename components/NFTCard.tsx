"use client";

import Image from "next/image";

interface NFTCardProps {
  tokenId: bigint;
  name?: string;
  image?: string;
  isSelected: boolean;
  onSelect: (tokenId: bigint) => void;
}

export function NFTCard({
  tokenId,
  name,
  image,
  isSelected,
  onSelect,
}: NFTCardProps) {
  return (
    <div
      className={`console-border p-4 cursor-pointer transition-all ${
        isSelected ? "bg-console-hover border-2" : "hover:bg-console-hover/50"
      }`}
      onClick={() => onSelect(tokenId)}
    >
      {image && (
        <div className="relative w-full aspect-square mb-3 bg-black">
          <Image
            src={image}
            alt={name || `Token #${tokenId}`}
            fill
            className="object-contain"
            unoptimized
          />
        </div>
      )}

      <div className="space-y-1">
        <p className="text-console-text font-mono text-sm">
          {name || `CAT #${tokenId.toString()}`}
        </p>
        <p className="text-console-text/70 text-xs font-mono">
          ID: {tokenId.toString()}
        </p>

        {isSelected && (
          <div className="mt-2">
            <span className="text-console-text text-xs">✓ SELECTED</span>
          </div>
        )}
      </div>
    </div>
  );
}
