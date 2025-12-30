/**
 * Rate limiting utility for API routes
 * Prevents brute force attacks and abuse
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
// In production, use Redis or similar distributed cache
const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the time window
   */
  maxRequests: number;

  /**
   * Time window in milliseconds
   */
  windowMs: number;

  /**
   * Optional: Custom identifier function (defaults to IP address)
   */
  keyGenerator?: (request: Request) => string;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * Default configuration for different endpoint types
 */
export const RATE_LIMIT_CONFIGS = {
  // Admin creation: 5 attempts per hour
  adminCreation: {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
  },

  // Role changes: 20 attempts per minute
  roleChange: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
  },

  // Status changes: 30 attempts per minute
  statusChange: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
  },

  // Credit operations: 10 attempts per minute
  creditOperation: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
  },

  // Permission changes: 20 attempts per minute
  permissionChange: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
  },

  // User deletion: 5 attempts per 5 minutes
  userDeletion: {
    maxRequests: 5,
    windowMs: 5 * 60 * 1000, // 5 minutes
  },

  // General admin operations: 100 requests per minute
  general: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },
} as const;

/**
 * Get client identifier from request
 */
function getClientIdentifier(request: Request): string {
  // Try to get real IP from common headers
  const headers = request.headers;
  const forwardedFor = headers.get('x-forwarded-for');
  const realIp = headers.get('x-real-ip');
  const cfConnectingIp = headers.get('cf-connecting-ip');

  const ip =
    forwardedFor?.split(',')[0].trim() ||
    realIp ||
    cfConnectingIp ||
    'unknown';

  return ip;
}

/**
 * Check rate limit for a request
 */
export function checkRateLimit(
  request: Request,
  config: RateLimitConfig
): RateLimitResult {
  const key = config.keyGenerator
    ? config.keyGenerator(request)
    : `ratelimit:${getClientIdentifier(request)}`;

  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // If no entry exists or reset time has passed, create new entry
  if (!entry || now > entry.resetTime) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, newEntry);

    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime: newEntry.resetTime,
    };
  }

  // If within rate limit, increment count
  if (entry.count < config.maxRequests) {
    entry.count += 1;
    rateLimitStore.set(key, entry);

    return {
      success: true,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  // Rate limit exceeded
  return {
    success: false,
    remaining: 0,
    resetTime: entry.resetTime,
  };
}

/**
 * Cleanup old entries periodically
 * Call this from a cron job or background task
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();

  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}

/**
 * Helper function to create rate limit response
 */
export function createRateLimitResponse(result: RateLimitResult): Response {
  const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);

  return new Response(
    JSON.stringify({
      error: 'Too many requests. Please try again later.',
      retryAfter: retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
      },
    }
  );
}
