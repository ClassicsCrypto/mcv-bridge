/**
 * In-memory rate limiter for API endpoints
 * Tracks requests by IP address and wallet address to prevent abuse
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private ipLimits: Map<string, RateLimitEntry> = new Map();
  private walletLimits: Map<string, RateLimitEntry> = new Map();

  // Configuration
  private readonly ipWindowMs = 60 * 1000; // 1 minute
  private readonly ipMaxRequests = 10; // 10 requests per minute per IP

  private readonly walletWindowMs = 60 * 1000; // 1 minute
  private readonly walletMaxRequests = 20; // 20 requests per minute per wallet

  // Cleanup old entries every 5 minutes to prevent memory leaks
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Check if a request is allowed based on IP address
   */
  checkIpLimit(ip: string): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    const entry = this.ipLimits.get(ip);

    // No existing entry or window expired
    if (!entry || now >= entry.resetAt) {
      this.ipLimits.set(ip, {
        count: 1,
        resetAt: now + this.ipWindowMs,
      });
      return { allowed: true };
    }

    // Within window, check limit
    if (entry.count >= this.ipMaxRequests) {
      return {
        allowed: false,
        retryAfter: Math.ceil((entry.resetAt - now) / 1000),
      };
    }

    // Increment count
    entry.count++;
    return { allowed: true };
  }

  /**
   * Check if a request is allowed based on wallet address
   */
  checkWalletLimit(wallet: string): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    const normalizedWallet = wallet.toLowerCase();
    const entry = this.walletLimits.get(normalizedWallet);

    // No existing entry or window expired
    if (!entry || now >= entry.resetAt) {
      this.walletLimits.set(normalizedWallet, {
        count: 1,
        resetAt: now + this.walletWindowMs,
      });
      return { allowed: true };
    }

    // Within window, check limit
    if (entry.count >= this.walletMaxRequests) {
      return {
        allowed: false,
        retryAfter: Math.ceil((entry.resetAt - now) / 1000),
      };
    }

    // Increment count
    entry.count++;
    return { allowed: true };
  }

  /**
   * Check both IP and wallet limits
   */
  checkLimits(ip: string, wallet: string): {
    allowed: boolean;
    reason?: string;
    retryAfter?: number;
  } {
    // Check IP limit first
    const ipResult = this.checkIpLimit(ip);
    if (!ipResult.allowed) {
      return {
        allowed: false,
        reason: "IP rate limit exceeded",
        retryAfter: ipResult.retryAfter,
      };
    }

    // Check wallet limit
    const walletResult = this.checkWalletLimit(wallet);
    if (!walletResult.allowed) {
      return {
        allowed: false,
        reason: "Wallet rate limit exceeded",
        retryAfter: walletResult.retryAfter,
      };
    }

    return { allowed: true };
  }

  /**
   * Clean up expired entries to prevent memory leaks
   */
  private cleanup() {
    const now = Date.now();

    // Clean IP limits
    this.ipLimits.forEach((entry, key) => {
      if (now >= entry.resetAt) {
        this.ipLimits.delete(key);
      }
    });

    // Clean wallet limits
    this.walletLimits.forEach((entry, key) => {
      if (now >= entry.resetAt) {
        this.walletLimits.delete(key);
      }
    });
  }

  /**
   * Get stats for monitoring (optional)
   */
  getStats() {
    return {
      ipEntriesCount: this.ipLimits.size,
      walletEntriesCount: this.walletLimits.size,
    };
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Extract IP address from Next.js request
 */
export function getClientIp(request: Request): string {
  // Check various headers (common in production environments)
  const headers = request.headers;

  return (
    headers.get("x-real-ip") ||
    headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    headers.get("cf-connecting-ip") || // Cloudflare
    "unknown"
  );
}
