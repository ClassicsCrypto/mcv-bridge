import { NextRequest, NextResponse } from "next/server";
import { rateLimiter, getClientIp } from "@/lib/rate-limiter";

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

// Whitelist of allowed contract addresses (lowercase for comparison)
const ALLOWED_CONTRACTS = new Set([
  "0xdd467a6c8ae2b39825a452e06b4fa82f73d4253d", // Mars Cats (Ethereum)
  "0xca76944acbc4675f566d062d658bfadf6f469ca7", // Mars Cats Shadow (ApeChain)
]);

// Cache for NFT responses (5 minutes)
const CACHE_TTL_MS = 5 * 60 * 1000;
interface CacheEntry {
  data: any;
  timestamp: number;
}
const responseCache = new Map<string, CacheEntry>();

// Cleanup cache every 10 minutes
setInterval(() => {
  const now = Date.now();
  responseCache.forEach((entry, key) => {
    if (now - entry.timestamp > CACHE_TTL_MS) {
      responseCache.delete(key);
    }
  });
}, 10 * 60 * 1000);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const owner = searchParams.get("owner");
  const contractAddress = searchParams.get("contract");
  const network = searchParams.get("network") || "eth-mainnet";

  if (!owner || !contractAddress) {
    return NextResponse.json(
      { error: "Missing owner or contract address" },
      { status: 400 }
    );
  }

  // Validate contract address is in whitelist
  const normalizedContract = contractAddress.toLowerCase();
  if (!ALLOWED_CONTRACTS.has(normalizedContract)) {
    return NextResponse.json(
      {
        error: "Contract not allowed",
        message: "This API only supports Mars Cats NFTs",
      },
      { status: 403 }
    );
  }

  // Rate limiting: Check both IP and wallet address
  const clientIp = getClientIp(request);
  const rateLimitResult = rateLimiter.checkLimits(clientIp, owner);

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error: rateLimitResult.reason || "Rate limit exceeded",
        retryAfter: rateLimitResult.retryAfter,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimitResult.retryAfter || 60),
          "X-RateLimit-Limit": "10 per minute (IP), 20 per minute (wallet)",
        },
      }
    );
  }

  // Check cache first
  const cacheKey = `${owner}-${contractAddress}-${network}`;
  const cachedEntry = responseCache.get(cacheKey);
  if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cachedEntry.data, {
      headers: {
        "X-Cache": "HIT",
        "Cache-Control": "private, max-age=300",
      },
    });
  }

  if (!ALCHEMY_API_KEY) {
    return NextResponse.json(
      { error: "Alchemy API key not configured" },
      { status: 500 }
    );
  }

  try {
    // Fetch NFTs for owner
    const nftsUrl = `https://${network}.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getNFTsForOwner`;
    const nftsParams = new URLSearchParams({
      owner,
      "contractAddresses[]": contractAddress,
      withMetadata: "true",
    });

    const nftsResponse = await fetch(`${nftsUrl}?${nftsParams.toString()}`);

    if (!nftsResponse.ok) {
      throw new Error(`Alchemy API error: ${nftsResponse.status}`);
    }

    const nftsData = await nftsResponse.json();

    // Fetch contract metadata
    const metadataUrl = `https://${network}.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getContractMetadata`;
    const metadataParams = new URLSearchParams({
      contractAddress,
    });

    let collectionName = "";
    try {
      const metadataResponse = await fetch(
        `${metadataUrl}?${metadataParams.toString()}`
      );
      if (metadataResponse.ok) {
        const metadata = await metadataResponse.json();
        collectionName = metadata.name || "";
      }
    } catch (err) {
      console.warn("Could not fetch contract metadata:", err);
    }

    const responseData = {
      nfts: nftsData.ownedNfts,
      totalCount: nftsData.totalCount,
      collectionName,
    };

    // Store in cache
    responseCache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now(),
    });

    return NextResponse.json(responseData, {
      headers: {
        "X-Cache": "MISS",
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (error) {
    console.error("Error fetching NFTs:", error);
    return NextResponse.json(
      { error: "Failed to fetch NFTs" },
      { status: 500 }
    );
  }
}
