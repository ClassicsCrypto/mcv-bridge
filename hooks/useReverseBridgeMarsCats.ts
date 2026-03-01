"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useReadContract, usePublicClient } from "wagmi";
import { CONFIG } from "@/lib/config";
import { beaconAbi, erc721Abi, marsCatsOnftAbi } from "@/lib/abis";
import type { BridgeTransaction, SelectedNFT } from "@/lib/types";

export function useReverseBridgeMarsCats() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const [bridgeState, setBridgeState] = useState<BridgeTransaction>({
    status: "idle",
  });

  const marsCatsShadowAddress =
    CONFIG.apechainContracts?.marsCats as `0x${string}`;
  const beaconAddress = "0x00000000000087c6dbaDC090d39BC10316f20658" as `0x${string}`;
  const ethereumEid = CONFIG.ethereumEid;

  const { data: isApprovedForAll, refetch: refetchApproval } = useReadContract({
    address: marsCatsShadowAddress,
    abi: erc721Abi,
    functionName: "isApprovedForAll",
    args: address ? [address, beaconAddress] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const approve = async () => {
    if (!address) throw new Error("No wallet connected");

    console.log("[REVERSE BRIDGE MARS-CATS] Starting approval...");
    setBridgeState({ status: "approving" });

    try {
      const hash = await writeContractAsync({
        address: marsCatsShadowAddress,
        abi: erc721Abi,
        functionName: "setApprovalForAll",
        args: [beaconAddress, true],
      });

      console.log("[REVERSE BRIDGE MARS-CATS] Approval transaction sent!");

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      await refetchApproval();
      setBridgeState({ status: "idle" });
      return true;
    } catch (error) {
      console.error("[REVERSE BRIDGE MARS-CATS] Approval error:", error);
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

    console.log("[REVERSE BRIDGE MARS-CATS] Starting bridge from ApeChain to Ethereum...");

    try {
      setBridgeState({ status: "quoting" });

      const tokenIds = selectedNfts.map((nft) => nft.tokenId);

      console.log("[REVERSE BRIDGE MARS-CATS] Requesting quote...");
      console.log("├─ Token IDs:", tokenIds.map((id) => id.toString()).join(", "));
      console.log("├─ Destination EID:", ethereumEid);
      console.log("├─ Shadow Contract:", marsCatsShadowAddress);
      console.log("├─ Beacon Contract:", beaconAddress);

      const quote = (await publicClient.readContract({
        address: beaconAddress,
        abi: beaconAbi,
        functionName: "quoteSend",
        args: [ethereumEid, marsCatsShadowAddress, tokenIds, 0n],
      })) as readonly [bigint, bigint];

      const [nativeFee, lzTokenFee] = quote;

      console.log("[REVERSE BRIDGE MARS-CATS] Quote received!");
      console.log("├─ Native Fee:", (Number(nativeFee) / 1e18).toFixed(6), "APE");
      console.log("└─ LZ Token Fee:", lzTokenFee.toString());

      setBridgeState({ status: "sending" });

      console.log("[REVERSE BRIDGE MARS-CATS] Sending bridge transaction...");

      const hash = await writeContractAsync({
        address: marsCatsShadowAddress,
        abi: marsCatsOnftAbi,
        functionName: "send",
        args: [ethereumEid, tokenIds, address, address, 0n],
        value: nativeFee,
      });

      console.log("[REVERSE BRIDGE MARS-CATS] Bridge transaction sent!");
      console.log("├─ TX Hash:", hash);

      setBridgeState({ status: "polling", txHash: hash });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      console.log("[REVERSE BRIDGE MARS-CATS] Transaction confirmed!");
      console.log("├─ Block Number:", receipt.blockNumber.toString());
      console.log("├─ Gas Used:", receipt.gasUsed.toString());

      setBridgeState({ status: "completed", txHash: hash });

      console.log("[REVERSE BRIDGE MARS-CATS] Bridge operation complete!");

      return hash;
    } catch (error) {
      console.error("[REVERSE BRIDGE MARS-CATS] Bridge error:", error);
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
