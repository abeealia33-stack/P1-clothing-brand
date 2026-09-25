"use server";

import { redirect } from "next/navigation";
import {
  attemptsRemaining,
  beginTotpChallenge,
  checkPassword,
  checkTotpCode,
  clearFailures,
  clearTotpChallenge,
  createSession,
  destroySession,
  isPendingTotp,
  recordFailure,
} from "@/lib/auth";
import { clientKey } from "@/lib/rate-limit";

export type SignInState = { stage?: "password" | "code"; error?: string };

export async function signInAction(
  previous: SignInState,
  formData: FormData
): Promise<SignInState> {
  const key = await clientKey();

  if (previous.stage === "code") {
    return verifyCodeStep(key, formData);
  }
  return verifyPasswordStep(key, formData);
}

async function verifyPasswordStep(
  key: string,
  formData: FormData
): Promise<SignInState> {
  if (attemptsRemaining(key) <= 0) {
    return {
      error: "Too many tries. Wait ten minutes and try again.",
    };
  }

  const password = String(formData.get("password") ?? "");
  if (!password) return { error: "Enter your password." };

  let ok = false;
  try {
    ok = checkPassword(password);
  } catch {
    // A missing ADMIN_PASSWORD is a setup problem, not a wrong password —
    // say so plainly rather than letting anyone guess their way in.
    return {
      error:
        "The admin password is not set up yet. Add ADMIN_PASSWORD to your .env file.",
    };
  }

  if (!ok) {
    recordFailure(key);
    const left = attemptsRemaining(key);
    return {
      error:
        left > 0
          ? `That password is not right. ${left} ${left === 1 ? "try" : "tries"} left.`
          : "Too many tries. Wait ten minutes and try again.",
    };
  }

  clearFailures(key);
  await beginTotpChallenge();
  return { stage: "code" };
}

async function verifyCodeStep(
  key: string,
  formData: FormData
): Promise<SignInState> {
  if (!(await isPendingTotp())) {
    return {
      stage: "password",
      error: "That took too long. Enter your password again.",
    };
  }

  const totpKey = `${key}:totp`;
  if (attemptsRemaining(totpKey) <= 0) {
    return {
      stage: "code",
      error: "Too many tries. Wait ten minutes and try again.",
    };
  }

  const code = String(formData.get("code") ?? "");

  let ok = false;
  try {
    ok = checkTotpCode(code);
  } catch {
    return {
      stage: "code",
      error:
        "The authenticator app is not set up yet. Add TOTP_SECRET to your .env file.",
    };
  }

  if (!ok) {
    recordFailure(totpKey);
    const left = attemptsRemaining(totpKey);
    return {
      stage: "code",
      error:
        left > 0
          ? `That code is not right. ${left} ${left === 1 ? "try" : "tries"} left.`
          : "Too many tries. Wait ten minutes and try again.",
    };
  }

  clearFailures(totpKey);
  await clearTotpChallenge();
  await createSession();
  redirect("/admin");
}

export async function signOutAction() {
  await destroySession();
  redirect("/admin/login");
}
