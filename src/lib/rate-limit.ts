/**
 * A small fixed-window counter, held in this process.
 *
 * The same weight as the login lockout in auth.ts and for the same reason: it
 * slows a script down without adding another moving part to run. It resets on
 * restart and is per-instance, which is the honest trade for a single-server
 * shop — it is a speed bump, not a guarantee.
 */

type Window = { count: number; resetAt: number };

export type RateLimit = {
  /** Records a hit. False once the caller has spent its allowance. */
  take: (key: string) => boolean;
  /** Seconds until the caller may try again. Zero when it may try now. */
  retryAfter: (key: string) => number;
};

export function createRateLimit(limit: number, windowMs: number): RateLimit {
  const windows = new Map<string, Window>();

  /* Without this a long-running server accumulates a row per visitor. Cleaning
     on write keeps it to the callers actually inside the current window. */
  function sweep(now: number) {
    for (const [key, window] of windows) {
      if (window.resetAt <= now) windows.delete(key);
    }
  }

  return {
    take(key) {
      const now = Date.now();
      const window = windows.get(key);

      if (!window || window.resetAt <= now) {
        if (windows.size > 500) sweep(now);
        windows.set(key, { count: 1, resetAt: now + windowMs });
        return true;
      }

      if (window.count >= limit) return false;
      window.count += 1;
      return true;
    },

    retryAfter(key) {
      const window = windows.get(key);
      if (!window) return 0;
      const left = window.resetAt - Date.now();
      return left > 0 ? Math.ceil(left / 1000) : 0;
    },
  };
}
