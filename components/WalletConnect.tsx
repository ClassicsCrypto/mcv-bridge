"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function WalletConnect() {
  return (
    <div className="flex flex-col items-start gap-4">
      <ConnectButton showBalance={false} />
    </div>
  );
}
