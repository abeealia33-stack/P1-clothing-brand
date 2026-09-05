import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import { isSignedIn } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await isSignedIn()) redirect("/admin");

  return (
    <div className="mx-auto flex min-h-screen max-w-sm items-center px-1">
      <div className="w-full py-16">
        <p className="urdu text-2xl" style={{ color: "var(--color-sage-deep)" }}>
          آرام سے تیار
        </p>
        <h1 className="mt-1 text-5xl">Bilques</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--color-ink-soft)" }}>
          Sign in to manage your orders and pieces.
        </p>

        <LoginForm />
      </div>
    </div>
  );
}
