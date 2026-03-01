import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  coinbaseWallet,
  injectedWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { CONFIG, getDestinationChain, getSourceChain } from "./config";
import { Chain } from "viem";

const sourceChain: Chain = getSourceChain();
const destinationChain: Chain = getDestinationChain();

export { sourceChain, destinationChain };

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [metaMaskWallet, coinbaseWallet, injectedWallet],
    },
  ],
  {
    appName: "Mars Cats Bridge",
    projectId: "none",
  }
);

export const config = createConfig({
  chains: [sourceChain, destinationChain],
  connectors,
  transports: {
    [sourceChain.id]: http(CONFIG.sourceChain.rpcUrl),
    [destinationChain.id]: http(CONFIG.destinationChain.rpcUrl),
  },
  ssr: true,
});
