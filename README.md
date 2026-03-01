# MCV Bridge

Bridge your Mars Cats NFTs between Ethereum and ApeChain using LayerZero's cross-chain protocol.

## Overview

Mars Cats Voyage Bridge enables seamless, bidirectional NFT bridging:
- **Ethereum → ApeChain**: Transfer your Mars Cats to ApeChain and enjoy the gaming ecosystem
- **ApeChain → Ethereum**: Bridge them back to the source chain anytime

## Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- Ethereum wallet with Mars Cats NFTs (MetaMask, Coinbase Wallet, or WalletConnect)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ClassicsCrypto/mcv-bridge.git
cd mcv-bridge
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```bash
cp .env.example .env.local
```

4. Configure environment variables:
```
NEXT_PUBLIC_BRIDGE_ENV=production
NEXT_PUBLIC_ETHEREUM_RPC_URL=<your_ethereum_mainnet_rpc_url>
NEXT_PUBLIC_APECHAIN_RPC_URL=https://apechain.calderachain.xyz/http
ALCHEMY_API_KEY=<your_alchemy_api_key>
```

Get an Alchemy API key at [alchemy.com](https://alchemy.com)

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Build for production:
```bash
npm run build
npm run start
```

## Smart Contracts

### Ethereum Mainnet
- **Mars Cats NFT (ERC-721)**: `0xdd467a6c8ae2b39825a452e06b4fa82f73d4253d`
- **Beacon (Bridge Entry Point)**: `0x00000000000087c6dbaDC090d39BC10316f20658`

### ApeChain
- **Mars Cats Shadow (NFTShadow)**: `0xCa76944aCBc4675F566D062D658BfaDF6f469Ca7`
- **Beacon (same address as Ethereum)**: `0x00000000000087c6dbaDC090d39BC10316f20658`

## Technology Stack

- **Framework**: Next.js 14
- **Wallet Connection**: RainbowKit + Wagmi
- **Blockchain Interaction**: Viem
- **Styling**: Tailwind CSS v4 with Space Grotesk font
- **State Management**: TanStack React Query
- **API**: Next.js Server Actions + Alchemy NFT API

## Architecture

### Components
- **WalletConnect**: RainbowKit integration for wallet connection
- **NFTInventory**: Displays user's Mars Cats on current chain
- **BridgeControl**: Handles approval and bridging logic with 5-step progress
- **NFTCard**: Individual NFT display with selection

### Hooks
- **useBridgeMarsCats**: Forward bridge (Ethereum → ApeChain)
- **useReverseBridgeMarsCats**: Reverse bridge (ApeChain → Ethereum)
- **useMarsCatsNFTs**: Fetches and manages NFT inventory

### API
- **`/api/nfts`**: Server-side NFT fetching via Alchemy API with rate limiting and caching

## Key Features

✅ **Bidirectional Bridging**: Bridge to ApeChain or back to Ethereum  
✅ **Live Progress Tracking**: 5-step status updates during bridge  
✅ **Wallet Support**: MetaMask, Coinbase Wallet, WalletConnect  
✅ **Rate Limiting**: IP + wallet-based rate limits on API  
✅ **Caching**: 5-minute response caching to reduce Alchemy API usage  
✅ **Responsive Design**: Works on desktop, tablet, and mobile  
✅ **Dark Theme**: Console-inspired UI matching Mars Cats aesthetic  

## Deployment

Designed for Vercel, but works on any Node.js host.

### Vercel Deployment

1. Push to GitHub
2. Connect repo to Vercel at [vercel.com](https://vercel.com)
3. Set environment variables in Vercel dashboard
4. Deploy

## Troubleshooting

### "No Mars Cats found"
- Ensure you're connected to Ethereum or ApeChain (supported networks only)
- Check that your wallet has Mars Cats NFTs on the connected chain
- Verify Alchemy API key is configured

### "Rate limit exceeded"
- API rate limits: 10 requests/minute per IP, 20 per minute per wallet
- Wait 60 seconds before retrying

### "Wrong network"
- The bridge supports Ethereum and ApeChain only
- Ensure your wallet is switched to one of these networks

## License

ISC

## Support

For issues or questions, reach out to the Mars Cats Voyage team on Discord.
