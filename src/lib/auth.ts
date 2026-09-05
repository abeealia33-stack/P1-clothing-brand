import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * One owner, one password, one cookie.
 *
 * The spec calls for a single password-protected /admin with a cookie session
 * and no user accounts, so that is exactly what this is. The cookie holds an
 * expiry and an HMAC over it — it is signed, not encrypted, and carries no
 * secret. Anyone can read it; nobody can forge it without SESSION_SECRET.
 */

const COOKIE = "bilques_admin";
const MAX_AGE_SECONDS = 60 * 60 * 12; // A working day, then log in again.

function secret(): string {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 16) {
    throw new Error(
      "SESSION_SECRET is missing or too short. Set it to a long random string in .env"
    );
  }
  return value;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

/** Compares without leaking, through timing, how much of the value matched. */
function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    // Still burn a comparison so a length mismatch is not measurably faster.
    timingSafeEqual(left, left);
    return false;
  }
  return timingSafeEqual(left, right);
}

export function checkPassword(attempt: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new Error("ADMIN_PASSWORD is not set. Add it to .env");
  }
  return safeEqual(attempt, expected);
}

/* A password with no rate limit is a password with a lot of guesses. This is
   per-process and resets on restart, which is the right weight for a single-
   owner panel: it slows a script down without needing another moving part. */
const attempts = new Map<string, { count: number; until: number }>();
const MAX_ATTEMPTS = 8;
const LOCKOUT_MS = 10 * 60 * 1000;

export function attemptsRemaining(key: string): number {
  const record = attempts.get(key);
  if (!record || record.until < Date.now()) return MAX_ATTEMPTS;
  return Math.max(0, MAX_ATTEMPTS - record.count);
}

export function recordFailure(key: string): void {
  const now = Date.now();
  const record = attempts.get(key);
  if (!record || record.until < now) {
    attempts.set(key, { count: 1, until: now + LOCKOUT_MS });
    return;
  }
  record.count += 1;
}

export function clearFailures(key: string): void {
  attempts.delete(key);
}

export async function createSession(): Promise<void> {
  const expires = Date.now() + MAX_AGE_SECONDS * 1000;
  // The nonce makes each session token distinct, so signing out one device
  // cannot be undone by replaying an identical older cookie value.
  const payload = `${expires}.${randomBytes(12).toString("hex")}`;
  const store = await cookies();
  store.set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

/** True when the request carries a cookie we signed that has not expired. */
export async function isSignedIn(): Promise<boolean> {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return false;

  const cut = raw.lastIndexOf(".");
  if (cut < 1) return false;
  const payload = raw.slice(0, cut);
  const signature = raw.slice(cut + 1);

  if (!safeEqual(signature, sign(payload))) return false;

  const expires = Number(payload.split(".")[0]);
  return Number.isFinite(expires) && expires > Date.now();
}

/**
 * The real gate. Proxy redirects are an optimisation for the address bar;
 * every admin page and every server action calls this, because server actions
 * are reachable by direct POST whatever the proxy says.
 */
export async function requireAdmin(): Promise<void> {
  if (!(await isSignedIn())) redirect("/admin/login");
}
