"use client";

import { useState } from "react";
import {
  useAccount,
  useWriteContract,
  useReadContract,
  usePublicClient,
} from "wagmi";
import { BEACON_ADDRESS, MARS_CATS_ADDRESS, DESTINATION_EID } from "@/lib/constants";
import { beaconAbi, erc721Abi } from "@/lib/abis";
import type { BridgeTransaction, SelectedNFT } from "@/lib/types";

export function useBridgeMarsCats() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const [bridgeState, setBridgeState] = useState<BridgeTransaction>({
    status: "idle",
  });

  const { data: isApprovedForAll, refetch: refetchApproval } = useReadContract({
    address: MARS_CATS_ADDRESS,
    abi: erc721Abi,
    functionName: "isApprovedForAll",
    args: address ? [address, BEACON_ADDRESS] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const approve = async () => {
    if (!address) throw new Error("No wallet connected");

    setBridgeState({ status: "approving" });

    try {
      const hash = await writeContractAsync({
        address: MARS_CATS_ADDRESS,
        abi: erc721Abi,
        functionName: "setApprovalForAll",
        args: [BEACON_ADDRESS, true],
      });

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      await refetchApproval();
      setBridgeState({ status: "idle" });
      return true;
    } catch (error) {
      console.error("[BRIDGE MARS-CATS] Approval error:", error);
      setBridgeState({
        status: "error",
        error: error instanceof Error ? error.message : "Approval failed",
      });
      throw error;
    }
  };

  const bridge = async (selectedNfts: SelectedNFT[]) => {
    if (!address || !publicClient) throw new Error("No wallet connected");
    if (selectedNfts.length === 0) throw new Error("No NFTs selected");

    try {
      setBridgeState({ status: "quoting" });

      const tokenIds = selectedNfts.map((nft) => nft.tokenId);

      console.log("[BRIDGE MARS-CATS] Getting quote...");
      console.log("├─ Beacon:", BEACON_ADDRESS);
      console.log("├─ Destination EID:", DESTINATION_EID);
      console.log("├─ Collection:", MARS_CATS_ADDRESS);
      console.log("└─ Token IDs:", tokenIds.map((id) => id.toString()));

      const quote = await publicClient.readContract({
        address: BEACON_ADDRESS,
        abi: beaconAbi,
        functionName: "quoteSend",
        args: [DESTINATION_EID, MARS_CATS_ADDRESS, tokenIds, 0n],
      });

      const nativeFee = quote[0];

      console.log("[BRIDGE MARS-CATS] Quote received:", nativeFee.toString());

      setBridgeState({ status: "sending" });

      const hash = await writeContractAsync({
        address: BEACON_ADDRESS,
        abi: beaconAbi,
        functionName: "send",
        args: [
          DESTINATION_EID,
          MARS_CATS_ADDRESS,
          tokenIds,
          address,
          address,
          0n,
        ],
        value: nativeFee,
      });

      setBridgeState({ status: "polling", txHash: hash });

      await publicClient.waitForTransactionReceipt({ hash });

      setBridgeState({ status: "completed", txHash: hash });

      return hash;
    } catch (error) {
      console.error("[BRIDGE MARS-CATS] Bridge error:", error);
      setBridgeState({
        status: "error",
        error: error instanceof Error ? error.message : "Bridge failed",
      });
      throw error;
    }
  };

  const resetBridgeState = () => {
    setBridgeState({ status: "idle" });
  };

  return {
    bridge,
    approve,
    isApproved: isApprovedForAll || false,
    bridgeState,
    resetBridgeState,
  };
}
