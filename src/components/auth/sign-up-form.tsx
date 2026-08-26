"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SignUpSchema } from "@/lib/validation/auth-schemas";
import { signIn } from "next-auth/react";

type FieldErrors = Partial<Record<"name" | "email" | "password" | "confirmPassword" | "root", string>>;

export function SignUpForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const raw = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    };

    const parsed = SignUpSchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const [key, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
        fieldErrors[key as keyof FieldErrors] = msgs?.[0];
      }
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    const data = (await res.json()) as { success: boolean; error?: { message: string } };

    if (!data.success) {
      setErrors({ root: data.error?.message ?? "Registration failed." });
      setLoading(false);
      return;
    }

    // Auto sign in after registration
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });

    setLoading(false);
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

      {(["name", "email", "password", "confirmPassword"] as const).map((field) => (
        <div key={field} className="space-y-1.5">
          <label htmlFor={field} className="block text-sm font-medium text-slate-300">
            {field === "confirmPassword" ? "Confirm password" : field.charAt(0).toUpperCase() + field.slice(1)}
          </label>
          <input
            id={field}
            name={field}
            type={field.toLowerCase().includes("password") ? "password" : field === "email" ? "email" : "text"}
            autoComplete={field === "email" ? "email" : field === "name" ? "name" : "new-password"}
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-slate-100 placeholder-slate-500 transition focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
          {errors[field] && <p className="text-xs text-red-400">{errors[field]}</p>}
        </div>
      ))}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-teal-500 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
