import { Secret, TOTP } from "otpauth";

/**
 * Pure TOTP check: given the shared secret and a submitted code, is it
 * current? Kept separate from env/cookie plumbing so it is trivial to test.
 * window: 1 accepts the previous and next 30s step, absorbing clock drift
 * between this server and the phone without widening the guessable window
 * past 90 seconds.
 */
export function verifyTotpCode(secret: string, code: string): boolean {
  if (!/^\d{6}$/.test(code)) return false;

  const totp = new TOTP({
    secret: Secret.fromBase32(secret),
    digits: 6,
    period: 30,
    algorithm: "SHA1",
  });

  return totp.validate({ token: code, window: 1 }) !== null;
}
