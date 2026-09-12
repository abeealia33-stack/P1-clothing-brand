"use server";

import { redirect } from "next/navigation";
import {
  attemptsRemaining,
  checkPassword,
  clearFailures,
  createSession,
  destroySession,
  recordFailure,
} from "@/lib/auth";
import { clientKey } from "@/lib/rate-limit";

export type SignInState = { error?: string };

export async function signInAction(
  _previous: SignInState,
  formData: FormData
): Promise<SignInState> {
  const key = await clientKey();

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
  await createSession();
  redirect("/admin");
}

export async function signOutAction() {
  await destroySession();
  redirect("/admin/login");
}
