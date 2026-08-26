"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { SignInSchema } from "@/lib/validation/auth-schemas";

type FieldErrors = Partial<Record<"email" | "password" | "root", string>>;

export function SignInForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const raw = { email: formData.get("email"), password: formData.get("password") };

    const parsed = SignInSchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const [key, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
        fieldErrors[key as keyof FieldErrors] = msgs?.[0];
      }
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setErrors({ root: "Invalid email or password." });
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errors.root && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {errors.root}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-medium text-slate-300">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-slate-100 placeholder-slate-500 transition focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          placeholder="you@example.com"
        />
        {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium text-slate-300">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-slate-100 placeholder-slate-500 transition focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          placeholder="••••••••"
        />
        {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-teal-500 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

// Re-export z for form use
export { z };
