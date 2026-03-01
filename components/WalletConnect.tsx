"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

export function WalletConnect() {
  const { isConnected } = useAccount();

  return (
    <div className={`flex flex-col items-start gap-4 ${!isConnected ? "wallet-pulse-wrapper" : ""}`}>
      <ConnectButton showBalance={false} />
    </div>
  );
}
