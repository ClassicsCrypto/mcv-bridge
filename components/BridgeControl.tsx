"use client";

import React from "react";
import { useChainId } from "wagmi";
import { useBridgeMarsCats } from "@/hooks/useBridgeMarsCats";
import { useReverseBridgeMarsCats } from "@/hooks/useReverseBridgeMarsCats";
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
  const { destination } = getBridgeChainNames(chainId);

  const forwardBridge = useBridgeMarsCats();
  const reverseBridge = useReverseBridgeMarsCats();

  const bridge = bridgeDirection === "forward" ? forwardBridge : reverseBridge;
  const { isApproved, approve, bridge: executeBridge, bridgeState, resetBridgeState } = bridge;

  const canBridge = selectedNfts.length > 0;

  React.useEffect(() => {
    if (bridgeState.status === "completed" && onBridgeComplete) {
      onBridgeComplete();
    }
  }, [bridgeState.status, onBridgeComplete]);

  const handleCloseError = () => {
    if (resetBridgeState) {
      resetBridgeState();
    }
  };

  const handleApprove = async () => {
    try {
      await approve();
    } catch (error) {
      console.error("Approval failed:", error);
    }
  };

  const handleBridge = async () => {
    try {
      await executeBridge(selectedNfts);
    } catch (error) {
      console.error("Bridge failed:", error);
    }
  };

  const getStatusDetails = () => {
    switch (bridgeState.status) {
      case "approving":
        return {
          title: "STEP 1/5: APPROVING",
          message: "Waiting for wallet confirmation to approve bridge contract...",
          stage: "1/5",
        };
      case "quoting":
        return {
          title: "STEP 2/5: PREPARING TO BRIDGE",
          message: `Preparing your NFTs for cross-chain transfer to ${destination}...`,
          stage: "2/5",
        };
      case "sending":
        return {
          title: "STEP 3/5: SENDING TO BRIDGE",
          message: "Confirm transaction in your wallet to initiate cross-chain transfer...",
          stage: "3/5",
        };
      case "polling":
        return {
          title: "STEP 4/5: CONFIRMING ON SOURCE CHAIN",
          message: `Transaction submitted. Waiting for confirmation...`,
          stage: "4/5",
        };
      case "completed":
        return {
          title: "STEP 5/5: SENT!",
          message: `Your Mars Cats have been sent and will arrive on ${CONFIG.destinationChain.name} in 1-3 minutes.`,
          stage: "5/5",
        };
      case "error":
        return {
          title: "❌ BRIDGE FAILED",
          message: bridgeState.error || "An unknown error occurred",
          stage: "error",
        };
      default:
        return null;
    }
  };

  const statusDetails = getStatusDetails();
  const isLoading = ["approving", "quoting", "sending", "polling"].includes(
    bridgeState.status
  );

  return (
    <div className="console-border p-6 space-y-4">
      <h3 className="text-console-text font-bold">BRIDGE CONTROLS</h3>

      {!canBridge && (
        <p className="text-console-text/70 text-sm">SELECT MARS CATS TO BRIDGE</p>
      )}

      {canBridge && (
        <>
          {!isApproved && (
            <div className="space-y-2">
              <p className="text-console-text/70 text-sm">
                STEP 1: APPROVE BEACON CONTRACT
              </p>
              <button
                onClick={handleApprove}
                disabled={isLoading}
                className="console-button w-full"
              >
                {bridgeState.status === "approving" ? "APPROVING..." : "APPROVE"}
              </button>
            </div>
          )}

          {isApproved && (
            <div className="space-y-2">
              <p className="text-console-text/70 text-sm">
                STEP 2: BRIDGE {selectedNfts.length} CAT
                {selectedNfts.length > 1 ? "S" : ""} TO {destination.toUpperCase()}
              </p>
              <button
                onClick={handleBridge}
                disabled={isLoading || bridgeState.status === "completed"}
                className="console-button w-full"
              >
                {isLoading ? "PROCESSING..." : "BRIDGE"}
              </button>
            </div>
          )}
        </>
      )}

      {statusDetails && (
        <div
          className={`console-border p-4 space-y-3 ${
            bridgeState.status === "error"
              ? "bg-red-900/20"
              : bridgeState.status === "completed"
              ? "bg-green-900/20"
              : "bg-blue-900/10"
          }`}
        >
          {/* Progress Header */}
          <div className="flex items-center justify-between">
            <p className="text-console-text text-sm font-bold">
              {statusDetails.title}
            </p>
            <div className="flex items-center gap-2">
              {isLoading && (
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-console-text rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-console-text rounded-full animate-pulse delay-75"></div>
                  <div className="w-2 h-2 bg-console-text rounded-full animate-pulse delay-150"></div>
                </div>
              )}
              {(bridgeState.status === "error" || bridgeState.status === "completed") && (
                <button
                  onClick={handleCloseError}
                  className="text-console-text/70 hover:text-console-text text-lg leading-none"
                  title="Close"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Status Message */}
          <p className="text-console-text/80 text-xs max-h-24 overflow-y-auto break-words">
            {statusDetails.message}
          </p>

          {/* Transaction Hash */}
          {bridgeState.txHash && (
            <div className="space-y-1 pt-2 border-t border-console-text/20">
              <p className="text-console-text/70 text-xs font-bold">
                TRANSACTION HASH:
              </p>
              <p className="text-console-text/70 text-xs font-mono break-all">
                {bridgeState.txHash}
              </p>
              <a
                href={`https://etherscan.io/tx/${bridgeState.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-console-accent text-xs hover:underline inline-block mt-1"
              >
                VIEW ON EXPLORER →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
