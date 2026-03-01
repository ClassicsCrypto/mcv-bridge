"use client";

import { useState } from "react";
import { useBridgeHistory } from "@/hooks/useBridgeHistory";
import { useChainId } from "wagmi";
import { getBridgeDirection } from "@/lib/bridge-utils";

export function BridgeHistory() {
  const { history } = useBridgeHistory();
  const chainId = useChainId();
  const [isOpen, setIsOpen] = useState(false);

  if (history.length === 0) return null;

  return (
    <div className="console-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between hover:bg-console-hover/30 transition-colors"
      >
        <span className="text-console-text text-sm font-bold">
          RECENT BRIDGES
          <span className="ml-2 text-console-accent text-xs font-mono">({history.length})</span>
        </span>
        <span className="text-console-text/50 text-sm">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="border-t border-console-border divide-y divide-console-border/30">
          {history.map((entry, i) => {
            const date = new Date(entry.timestamp);
            const explorerBase = entry.fromChain.toLowerCase().includes("ape")
              ? "https://apescan.io"
              : "https://etherscan.io";
            return (
              <div key={i} className="p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-console-text text-xs font-mono">
                    {entry.fromChain} → {entry.toChain}
                  </span>
                  <span className="text-console-text/40 text-xs">
                    {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-console-text/50 text-xs font-mono">
                  Cats: #{entry.tokenIds.join(", #")}
                </p>
                <a
                  href={`${explorerBase}/tx/${entry.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-console-accent text-xs hover:underline font-mono"
                >
                  {entry.txHash.slice(0, 10)}...{entry.txHash.slice(-8)} ↗
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
