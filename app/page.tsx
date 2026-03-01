"use client";

import { useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { WalletConnect } from "@/components/WalletConnect";
import { NFTInventory } from "@/components/NFTInventory";
import { BridgeControl } from "@/components/BridgeControl";
import { CONFIG, IS_DEV } from "@/lib/config";
import {
  getBridgeChainNames,
  isOnCorrectNetwork,
} from "@/lib/bridge-utils";
import type { SelectedNFT } from "@/lib/types";

export default function Home() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const [selectedNfts, setSelectedNfts] = useState<SelectedNFT[]>([]);

  const { source, destination } = getBridgeChainNames(chainId);
  const onCorrectNetwork = isOnCorrectNetwork(chainId);

  const handleSelectionChange = (nfts: SelectedNFT[]) => {
    setSelectedNfts(nfts);
  };

  const handleBridgeComplete = () => {
    if (typeof window !== "undefined" && (window as any).__removeBridgedNFTs) {
      (window as any).__removeBridgedNFTs(
        selectedNfts.map((nft) => nft.tokenId)
      );
    }
    setSelectedNfts([]);
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {IS_DEV && (
          <div className="console-border p-3 mb-4 bg-yellow-900/20">
            <p className="text-console-text text-sm font-bold">
              🧪 TESTNET MODE
            </p>
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-console-text">
              MARS CATS BRIDGE
            </h1>
            <p className="text-sm text-console-text/70">
              {source.toUpperCase()} ↔ {destination.toUpperCase()}
            </p>
          </div>
          <WalletConnect />
        </div>

        {/* Wrong Network Warning */}
        {isConnected && !onCorrectNetwork && (
          <div className="console-border p-4 mb-6 bg-red-900/20">
            <p className="text-console-text font-bold">⚠️ WRONG NETWORK</p>
            <p className="text-console-text/70 text-sm mt-1">
              Please switch to {CONFIG.sourceChain.name} or{" "}
              {CONFIG.destinationChain.name}
            </p>
          </div>
        )}

        {!isConnected ? (
          <div className="console-border p-6 mb-8">
            <p className="text-console-text">
              CONNECT WALLET TO BEGIN BRIDGING
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* NFT Inventory */}
            <div>
              <NFTInventory onSelectionChange={handleSelectionChange} />
            </div>

            {/* Bridge Controls */}
            <div className="max-w-2xl mx-auto">
              <BridgeControl
                selectedNfts={selectedNfts}
                onBridgeComplete={handleBridgeComplete}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
