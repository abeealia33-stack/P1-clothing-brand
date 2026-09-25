/**
 * One-time setup: makes a fresh TOTP secret and prints a QR code to scan
 * with Google Authenticator (or any TOTP app), plus the .env line to save.
 *
 * Run once, scan once, then set TOTP_SECRET in .env (local) and in
 * Hostinger's environment variables (production) to the same value.
 * Running this again makes a *different* secret and invalidates the old one.
 */
import { Secret, TOTP } from "otpauth";
import qrcode from "qrcode";

const secret = new Secret({ size: 20 });

const totp = new TOTP({
  issuer: "Bilques Admin",
  label: "bilques.com",
  secret,
});

console.log("\nScan this with Google Authenticator:\n");
console.log(await qrcode.toString(totp.toString(), { type: "terminal", small: true }));
console.log("Add this to .env and to Hostinger's environment variables:\n");
console.log(`TOTP_SECRET="${secret.base32}"\n`);
