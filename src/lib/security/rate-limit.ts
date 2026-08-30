interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitCache = new Map<string, RateLimitRecord>();

/**
 * Checks if a key (e.g. IP + route identifier) exceeds the maximum allowed hits in windowMs.
 * Returns true if rate limited, false if request is allowed.
 */
export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitCache.get(key);

  if (!record) {
    rateLimitCache.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return false;
  }

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    return false;
  }

  record.count += 1;
  return record.count > limit;
}

/**
 * Helper to extract client IP address from request headers.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "127.0.0.1";
}
