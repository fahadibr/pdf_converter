import { RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from "@/lib/server/config";

type Bucket = { count: number; resetAt: number };
declare global {
  // One in-memory bucket store per Node.js process. Keep conversion behind the
  // included single-instance Nginx setup or use a shared store when scaling out.
  // eslint-disable-next-line no-var
  var pdfForgeRateBuckets: Map<string, Bucket> | undefined;
}

const buckets = globalThis.pdfForgeRateBuckets ?? new Map<string, Bucket>();
globalThis.pdfForgeRateBuckets = buckets;

export function consumeRateLimit(key: string, now = Date.now()) {
  let bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    if (buckets.size >= 10_000 && !buckets.has(key)) {
      for (const [entryKey, entry] of buckets) {
        if (entry.resetAt <= now) buckets.delete(entryKey);
      }
      if (buckets.size >= 10_000) {
        return { allowed: false, remaining: 0, retryAfterSeconds: 60 };
      }
    }
    bucket = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    buckets.set(key, bucket);
  }
  bucket.count += 1;

  return {
    allowed: bucket.count <= RATE_LIMIT_MAX,
    remaining: Math.max(0, RATE_LIMIT_MAX - bucket.count),
    retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  };
}
