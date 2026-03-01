"use client";

import { useState } from "react";
import { useAccount, useChainId } from "wagmi";
import Image from "next/image";
import { WalletConnect } from "@/components/WalletConnect";
import { NFTInventory } from "@/components/NFTInventory";
import { BridgeControl } from "@/components/BridgeControl";
import { CONFIG, IS_DEV } from "@/lib/config";
import { getBridgeChainNames, isOnCorrectNetwork } from "@/lib/bridge-utils";
import type { SelectedNFT } from "@/lib/types";

// Inline SVG chain icons
function EthereumIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 256 417" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M127.961 0L125.078 9.53V285.168L127.961 288.042L255.923 212.881L127.961 0Z" fill="white" fillOpacity="0.9"/>
      <path d="M127.962 0L0 212.881L127.962 288.042V154.467V0Z" fill="white" fillOpacity="0.6"/>
      <path d="M127.961 312.187L126.328 314.173V412.196L127.961 416.879L255.999 237.03L127.961 312.187Z" fill="white" fillOpacity="0.9"/>
      <path d="M127.962 416.879V312.187L0 237.03L127.962 416.879Z" fill="white" fillOpacity="0.6"/>
      <path d="M127.961 288.042L255.922 212.881L127.961 154.467V288.042Z" fill="white" fillOpacity="0.4"/>
      <path d="M0 212.881L127.962 288.042V154.467L0 212.881Z" fill="white" fillOpacity="0.2"/>
    </svg>
  );
}

function ApeChainIcon() {
  return (
    <Image
      src="/apechain-logo.jpg"
      alt="ApeChain"
      width={18}
      height={18}
      className="rounded-sm"
      unoptimized
    />
  );
}

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
      (window as any).__removeBridgedNFTs(selectedNfts.map((nft) => nft.tokenId));
    }
    setSelectedNfts([]);
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {IS_DEV && (
          <div className="console-border p-3 mb-4 bg-yellow-900/20">
            <p className="text-console-text text-sm font-bold">🧪 TESTNET MODE</p>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Image
              src="/logo.png"
              alt="Mars Cats Voyage"
              width={52}
              height={52}
              className="opacity-90"
            />
            <div>
              <h1 className="text-3xl font-bold text-console-text tracking-wide">
                MARS CATS BRIDGE
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <EthereumIcon />
                <span className="text-xs text-console-text/60 font-mono">
                  {source.toUpperCase()}
                </span>
                <span className="text-console-accent text-sm">↔</span>
                <ApeChainIcon />
                <span className="text-xs text-console-text/60 font-mono">
                  {destination.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          <WalletConnect />
        </div>

        {/* Wrong Network Warning */}
        {isConnected && !onCorrectNetwork && (
          <div className="console-border p-4 mb-6 bg-red-900/20">
            <p className="text-console-text font-bold">⚠️ WRONG NETWORK</p>
            <p className="text-console-text/70 text-sm mt-1">
              Please switch to {CONFIG.sourceChain.name} or {CONFIG.destinationChain.name}
            </p>
          </div>
        )}

        {!isConnected ? (
          <div className="space-y-4">
            <div className="console-border p-6">
              <p className="text-console-text text-lg mb-1">CONNECT WALLET TO BEGIN BRIDGING</p>
              <p className="text-console-text/50 text-sm">Connect your wallet to view your Mars Cats and bridge them cross-chain.</p>
            </div>
            {/* Info box */}
            <div className="console-border p-5 bg-white/[0.02]">
              <p className="text-console-text font-bold text-sm mb-3">HOW IT WORKS</p>
              <div className="space-y-2 text-console-text/60 text-sm">
                <div className="flex gap-3">
                  <span className="text-console-accent font-bold">01</span>
                  <span>Connect your wallet and select the Mars Cats you want to bridge</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-console-accent font-bold">02</span>
                  <span>Approve the bridge contract, then confirm the bridge transaction</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-console-accent font-bold">03</span>
                  <span>Your cats arrive on the destination chain in ~1–3 minutes via LayerZero</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Info bar */}
            <div className="console-border p-4 bg-white/[0.02] flex items-center justify-between">
              <p className="text-console-text/50 text-xs">
                Bridge transfers take ~1–3 minutes via LayerZero. Switch networks to bridge in either direction.
              </p>
              {selectedNfts.length > 0 && (
                <span className="text-console-accent text-sm font-bold animate-pulse">
                  🐱 {selectedNfts.length} selected
                </span>
              )}
            </div>

            {/* NFT Inventory */}
            <NFTInventory onSelectionChange={handleSelectionChange} />

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
