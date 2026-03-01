"use client";

import React from "react";
import { useChainId } from "wagmi";
import { useBridgeMarsCats } from "@/hooks/useBridgeMarsCats";
import { useReverseBridgeMarsCats } from "@/hooks/useReverseBridgeMarsCats";
import { useBridgeFeeQuote } from "@/hooks/useBridgeFeeQuote";
import { useBridgeHistory } from "@/hooks/useBridgeHistory";
import { CONFIG } from "@/lib/config";
import { getBridgeDirection, getBridgeChainNames } from "@/lib/bridge-utils";
import type { SelectedNFT } from "@/lib/types";

interface BridgeControlProps {
  selectedNfts: SelectedNFT[];
  onBridgeComplete?: () => void;
}

export function BridgeControl({ selectedNfts, onBridgeComplete }: BridgeControlProps) {
  const chainId = useChainId();
  const bridgeDirection = getBridgeDirection(chainId);
  const { source, destination } = getBridgeChainNames(chainId);

  const forwardBridge = useBridgeMarsCats();
  const reverseBridge = useReverseBridgeMarsCats();
  const { feeFormatted, isLoading: isFeeLoading, error: feeError } = useBridgeFeeQuote(selectedNfts);
  const { addEntry } = useBridgeHistory();

  const bridge = bridgeDirection === "forward" ? forwardBridge : reverseBridge;
  const { isApproved, approve, bridge: executeBridge, bridgeState, resetBridgeState } = bridge;

  const canBridge = selectedNfts.length > 0;

  React.useEffect(() => {
    if (bridgeState.status === "completed" && bridgeState.txHash && onBridgeComplete) {
      addEntry({
        txHash: bridgeState.txHash,
        tokenIds: selectedNfts.map((n) => n.tokenId.toString()),
        fromChain: source,
        toChain: destination,
        timestamp: Date.now(),
        status: "completed",
      });
      onBridgeComplete();
    }
  }, [bridgeState.status, bridgeState.txHash, onBridgeComplete]);

  const handleApprove = async () => {
    try { await approve(); } catch {}
  };

  const handleBridge = async () => {
    try { await executeBridge(selectedNfts); } catch {}
  };

  const getStatusDetails = () => {
    switch (bridgeState.status) {
      case "approving":
        return { title: "STEP 1/5: APPROVING", message: "Waiting for wallet confirmation to approve bridge contract...", stage: "1/5" };
      case "quoting":
        return { title: "STEP 2/5: PREPARING TO BRIDGE", message: `Preparing your NFTs for cross-chain transfer to ${destination}...`, stage: "2/5" };
      case "sending":
        return { title: "STEP 3/5: SENDING TO BRIDGE", message: "Confirm transaction in your wallet to initiate cross-chain transfer...", stage: "3/5" };
      case "polling":
        return { title: "STEP 4/5: CONFIRMING", message: "Transaction submitted. Waiting for confirmation on-chain...", stage: "4/5" };
      case "completed":
        return { title: "✅ STEP 5/5: SENT!", message: `Your Mars Cats have been sent and will arrive on ${CONFIG.destinationChain.name} in 1–3 minutes.`, stage: "5/5" };
      case "error":
        return { title: "❌ BRIDGE FAILED", message: bridgeState.error || "An unknown error occurred", stage: "error" };
      default:
        return null;
    }
  };

  const statusDetails = getStatusDetails();
  const isLoading = ["approving", "quoting", "sending", "polling"].includes(bridgeState.status);
  const explorerBase = bridgeDirection === "forward" ? "https://etherscan.io" : "https://apescan.io";

  return (
    <div className="console-border p-6 space-y-4">
      <h3 className="text-console-text font-bold">BRIDGE CONTROLS</h3>

      {!canBridge && (
        <p className="text-console-text/50 text-sm">SELECT MARS CATS ABOVE TO BRIDGE</p>
      )}

      {canBridge && (
        <>
          {/* Fee Preview */}
          <div className="console-border p-3 flex items-center justify-between" style={{background: "rgba(255,69,0,0.04)"}}>
            <span className="text-console-text/70 text-xs font-bold">ESTIMATED BRIDGE FEE</span>
            <span className="text-sm font-bold font-mono">
              {isFeeLoading ? (
                <span className="text-console-text/50 animate-pulse text-xs">calculating...</span>
              ) : feeFormatted ? (
                <span className="text-console-accent">{feeFormatted}</span>
              ) : (
                <span className="text-console-text/50 text-xs">shown at confirmation</span>
              )}
            </span>
          </div>

          {!isApproved && (
            <div className="space-y-2">
              <p className="text-console-text/60 text-xs">STEP 1: APPROVE BEACON CONTRACT</p>
              <button onClick={handleApprove} disabled={isLoading} className="console-button w-full">
                {bridgeState.status === "approving" ? "APPROVING..." : "APPROVE"}
              </button>
            </div>
          )}

          {isApproved && (
            <div className="space-y-2">
              <p className="text-console-text/60 text-xs">
                STEP 2: BRIDGE {selectedNfts.length} CAT{selectedNfts.length > 1 ? "S" : ""} TO {destination.toUpperCase()}
              </p>
              <button
                onClick={handleBridge}
                disabled={isLoading || bridgeState.status === "completed"}
                className="bridge-button console-button w-full"
              >
                {isLoading ? "PROCESSING..." : (
                  <span className="flex items-center justify-center gap-2">
                    <img
                      src="https://cdn.discordapp.com/emojis/883749621204123698.png"
                      alt=""
                      width={18}
                      height={18}
                      className="inline-block"
                    />
                    BRIDGE
                  </span>
                )}
              </button>
            </div>
          )}
        </>
      )}

      {statusDetails && (
        <div className={`console-border p-4 space-y-3 ${
          bridgeState.status === "error" ? "bg-red-900/20" :
          bridgeState.status === "completed" ? "bg-green-900/10" : "bg-blue-900/10"
        }`}>
          <div className="flex items-center justify-between">
            <p className="text-console-text text-sm font-bold">{statusDetails.title}</p>
            <div className="flex items-center gap-2">
              {isLoading && (
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-console-text rounded-full animate-pulse"></div>
                  <div className="w-1.5 h-1.5 bg-console-text rounded-full animate-pulse delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-console-text rounded-full animate-pulse delay-150"></div>
                </div>
              )}
              {(bridgeState.status === "error" || bridgeState.status === "completed") && (
                <button onClick={resetBridgeState} className="text-console-text/50 hover:text-console-text text-lg leading-none">×</button>
              )}
            </div>
          </div>
          <p className="text-console-text/70 text-xs break-words">{statusDetails.message}</p>
          {bridgeState.txHash && (
            <div className="space-y-1 pt-2 border-t border-console-text/10">
              <p className="text-console-text/50 text-xs font-bold">TX HASH:</p>
              <p className="text-console-text/50 text-xs font-mono break-all">{bridgeState.txHash}</p>
              <a href={`${explorerBase}/tx/${bridgeState.txHash}`} target="_blank" rel="noopener noreferrer"
                className="text-console-accent text-xs hover:underline inline-block mt-1">
                VIEW ON EXPLORER →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
