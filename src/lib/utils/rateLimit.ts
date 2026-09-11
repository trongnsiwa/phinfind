/**
 * In-memory rate limiter stopgap.
 * 
 * NOTE: This in-memory implementation is a temporary stopgap because OPS-03 
 * (Upstash Redis rate limiting) has not yet shipped. It is stateful per Node.js 
 * runtime instance and is not distributed across serverless workers.
 * Once OPS-03 is deployed, replace this module with Upstash Redis rate limiting.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up stale entries every 10 minutes to prevent memory leak
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupStaleEntries(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, record] of rateLimitStore.entries()) {
    const validTimestamps = record.timestamps.filter((ts) => now - ts < windowMs);
    if (validTimestamps.length === 0) {
      rateLimitStore.delete(key);
    } else {
      record.timestamps = validTimestamps;
    }
  }
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Seconds until the oldest timestamp in window expires
}

/**
 * Check and record a rate limit attempt using a sliding window algorithm.
 * 
 * @param key Unique key for the rate limit subject (e.g. `suggest_edit:${userId}`)
 * @param limit Maximum allowed requests within the window (default: 3)
 * @param windowMs Time window in milliseconds (default: 24 hours)
 */
export function checkRateLimit(
  key: string,
  limit: number = 3,
  windowMs: number = 24 * 60 * 60 * 1000
): RateLimitResult {
  const now = Date.now();
  cleanupStaleEntries(windowMs);

  let record = rateLimitStore.get(key);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(key, record);
  }

  // Filter timestamps within sliding window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= limit) {
    const oldestTimestamp = record.timestamps[0];
    const resetMs = Math.max(0, windowMs - (now - oldestTimestamp));
    const resetSec = Math.ceil(resetMs / 1000);

    return {
      success: false,
      limit,
      remaining: 0,
      reset: resetSec,
    };
  }

  // Record current timestamp
  record.timestamps.push(now);

  const resetSec = Math.ceil(windowMs / 1000);

  return {
    success: true,
    limit,
    remaining: Math.max(0, limit - record.timestamps.length),
    reset: resetSec,
  };
}
