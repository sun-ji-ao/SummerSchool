"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const callbackUrl =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("callbackUrl") ?? "/admin"
        : "/admin";
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });
    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }
    router.push(result?.url ?? callbackUrl);
    router.refresh();
  }

  return (
    <form className="mt-6 grid gap-4 rounded-xl border border-slate-200 p-6" onSubmit={handleSubmit}>
      <input
        className="rounded border border-slate-300 px-3 py-2"
        placeholder="Email"
        type="email"
        name="email"
        required
      />
      <input
        className="rounded border border-slate-300 px-3 py-2"
        placeholder="Password"
        type="password"
        name="password"
        required
      />
      <button className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50" type="submit" disabled={loading}>
        {loading ? "Signing in..." : "Login"}
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
