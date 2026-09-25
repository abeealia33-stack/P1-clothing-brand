import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { verifyTotpCode } from "./totp";

/**
 * One owner, one password, one authenticator app, one cookie.
 *
 * The spec calls for a single password-protected /admin with a cookie session
 * and no user accounts, so that is exactly what this is. The cookie holds an
 * expiry and an HMAC over it — it is signed, not encrypted, and carries no
 * secret. Anyone can read it; nobody can forge it without SESSION_SECRET.
 */

const COOKIE = "bilques_admin";
const MAX_AGE_SECONDS = 60 * 60 * 12; // A working day, then log in again.

/* A second, short-lived cookie marks "password checked, TOTP code pending".
   It is signed the same way as the session cookie but named and scoped
   separately so it never satisfies proxy.ts's admin check by itself. */
const PENDING_COOKIE = "bilques_admin_pending";
const PENDING_MAX_AGE_SECONDS = 5 * 60;

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

/** `payload.signature`, for values that go into a signed cookie. */
function pack(payload: string): string {
  return `${payload}.${sign(payload)}`;
}

/** Verifies and strips the signature. Returns the payload, or null if forged/malformed. */
function unpack(raw: string): string | null {
  const cut = raw.lastIndexOf(".");
  if (cut < 1) return null;
  const payload = raw.slice(0, cut);
  const signature = raw.slice(cut + 1);
  return safeEqual(signature, sign(payload)) ? payload : null;
}

export function checkPassword(attempt: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new Error("ADMIN_PASSWORD is not set. Add it to .env");
  }
  return safeEqual(attempt, expected);
}

export function checkTotpCode(code: string): boolean {
  const secret = process.env.TOTP_SECRET;
  if (!secret) {
    throw new Error("TOTP_SECRET is not set. Add it to .env");
  }
  return verifyTotpCode(secret, code);
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
  store.set(COOKIE, pack(payload), {
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
  store.delete(PENDING_COOKIE);
}

/** True when the request carries a cookie we signed that has not expired. */
export async function isSignedIn(): Promise<boolean> {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return false;

  const payload = unpack(raw);
  if (!payload) return false;

  const expires = Number(payload.split(".")[0]);
  return Number.isFinite(expires) && expires > Date.now();
}

/** Marks "password accepted" while the authenticator code is still owed. */
export async function beginTotpChallenge(): Promise<void> {
  const expires = Date.now() + PENDING_MAX_AGE_SECONDS * 1000;
  const store = await cookies();
  store.set(PENDING_COOKIE, pack(`${expires}`), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: PENDING_MAX_AGE_SECONDS,
  });
}

/** True when a password was accepted in the last five minutes and no code yet. */
export async function isPendingTotp(): Promise<boolean> {
  const store = await cookies();
  const raw = store.get(PENDING_COOKIE)?.value;
  if (!raw) return false;

  const payload = unpack(raw);
  if (!payload) return false;

  const expires = Number(payload);
  return Number.isFinite(expires) && expires > Date.now();
}

export async function clearTotpChallenge(): Promise<void> {
  const store = await cookies();
  store.delete(PENDING_COOKIE);
}

/**
 * The real gate. Proxy redirects are an optimisation for the address bar;
 * every admin page and every server action calls this, because server actions
 * are reachable by direct POST whatever the proxy says.
 */
export async function requireAdmin(): Promise<void> {
  if (!(await isSignedIn())) redirect("/admin/login");
}
