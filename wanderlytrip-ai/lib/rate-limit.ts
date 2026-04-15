// Simple in-memory rate limiter — keyed by IP, resets per window.
// Good enough for a single-instance Next.js server. Swap for Redis/Upstash at scale.

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

/**
 * Returns true if the request should be allowed, false if it should be blocked.
 * @param key      Usually the client IP address.
 * @param limit    Max requests per window (default: 10).
 * @param windowMs Window length in milliseconds (default: 60 000 = 1 minute).
 */
export function rateLimit(
  key: string,
  limit = 10,
  windowMs = 60_000
): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

/** Extract the best available IP from a Next.js request. */
export function getClientIp(req: Request): string {
  return (
    (req.headers as Headers).get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown"
  );
}
