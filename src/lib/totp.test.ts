import { describe, expect, it } from "vitest";
import { Secret, TOTP } from "otpauth";
import { verifyTotpCode } from "./totp";

function currentCode(secret: string): string {
  return new TOTP({
    secret: Secret.fromBase32(secret),
    digits: 6,
    period: 30,
    algorithm: "SHA1",
  }).generate();
}

describe("verifyTotpCode", () => {
  const secret = new Secret({ size: 20 }).base32;

  it("accepts the current code", () => {
    expect(verifyTotpCode(secret, currentCode(secret))).toBe(true);
  });

  it("rejects a wrong code", () => {
    const wrong = currentCode(secret) === "000000" ? "111111" : "000000";
    expect(verifyTotpCode(secret, wrong)).toBe(false);
  });

  it("rejects a code from the wrong secret", () => {
    const otherSecret = new Secret({ size: 20 }).base32;
    expect(verifyTotpCode(secret, currentCode(otherSecret))).toBe(false);
  });

  it("rejects input that is not six digits", () => {
    expect(verifyTotpCode(secret, "12345")).toBe(false);
    expect(verifyTotpCode(secret, "1234567")).toBe(false);
    expect(verifyTotpCode(secret, "abcdef")).toBe(false);
    expect(verifyTotpCode(secret, "")).toBe(false);
  });
});
