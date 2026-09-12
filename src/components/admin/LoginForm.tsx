"use client";

import { useActionState } from "react";
import { signInAction, type SignInState } from "@/app/admin/actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState<SignInState, FormData>(
    signInAction,
    {}
  );

  return (
    <form action={action} className="mt-8">
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
        aria-describedby={state.error ? "password-error" : undefined}
        aria-invalid={state.error ? true : undefined}
        style={state.error ? { borderColor: "var(--color-alert)" } : undefined}
      />

      {state.error && (
        <p
          id="password-error"
          role="alert"
          className="mt-2 text-sm"
          style={{ color: "var(--color-alert)" }}
        >
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-ink mt-5 w-full">
        {pending ? "Signing in" : "Sign in"}
      </button>

      <p className="mt-6 text-sm" style={{ color: "var(--color-ink-soft)" }}>
        Forgotten it? The password lives in the site&rsquo;s settings file on
        Hostinger, under ADMIN_PASSWORD.
      </p>
    </form>
  );
}
