"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { SignInSchema } from "@/lib/validation/auth-schemas";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";

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
      setErrors({ root: "Invalid email or password. Please verify credentials." });
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.root && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300">
          {errors.root}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-xs font-semibold text-slate-300">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 transition-all focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            placeholder="patient@example.com"
          />
        </div>
        {errors.email && <p className="text-[11px] text-rose-400 pl-1">{errors.email}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-xs font-semibold text-slate-300">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 transition-all focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            placeholder="••••••••••••"
          />
        </div>
        {errors.password && <p className="text-[11px] text-rose-400 pl-1">{errors.password}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 px-4 py-2.5 text-xs font-bold transition shadow-lg shadow-teal-500/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Authenticating...
          </>
        ) : (
          <>
            Sign In to Account <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}

// Re-export z for form use
export { z };
