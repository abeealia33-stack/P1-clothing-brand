"use client";

import { useActionState } from "react";
import { signInAction, type SignInState } from "@/app/admin/actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState<SignInState, FormData>(
    signInAction,
    {}
  );
  const stage = state.stage ?? "password";

  return (
    <form action={action} className="mt-8">
      {stage === "password" ? (
        <>
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            autoFocus
            required
            className="field mt-2"
            aria-describedby={state.error ? "signin-error" : undefined}
            aria-invalid={state.error ? true : undefined}
            style={state.error ? { borderColor: "var(--color-alert)" } : undefined}
          />
        </>
      ) : (
        <>
          <label htmlFor="code" className="block text-sm font-medium">
            Authenticator code
          </label>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            autoComplete="one-time-code"
            autoFocus
            required
            className="field mt-2"
            aria-describedby={state.error ? "signin-error" : undefined}
            aria-invalid={state.error ? true : undefined}
            style={state.error ? { borderColor: "var(--color-alert)" } : undefined}
          />
        </>
      )}

      {state.error && (
        <p
          id="signin-error"
          role="alert"
          className="mt-2 text-sm"
          style={{ color: "var(--color-alert)" }}
        >
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-ink mt-5 w-full">
        {pending
          ? stage === "password"
            ? "Checking"
            : "Verifying"
          : stage === "password"
            ? "Continue"
            : "Verify"}
      </button>

      <p className="mt-6 text-sm" style={{ color: "var(--color-ink-soft)" }}>
        {stage === "password"
          ? "Forgotten it? The password lives in the site’s settings file on Hostinger, under ADMIN_PASSWORD."
          : "Open Google Authenticator and enter the 6-digit code showing for this site."}
      </p>
    </form>
  );
}
