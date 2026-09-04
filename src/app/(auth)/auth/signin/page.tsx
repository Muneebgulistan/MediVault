import Link from "next/link";
import { Pill } from "lucide-react";
import { SignInForm } from "@/components/auth/sign-in-form";

export default function SignInPage() {
  return (
    <div className="relative w-full max-w-md space-y-7">
      {/* Ambient background glow */}
      <div className="absolute -top-16 -left-16 h-56 w-56 rounded-full bg-[var(--accent)]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-[var(--accent)]/5 blur-3xl pointer-events-none" />

      {/* Logo and header */}
      <div className="text-center relative">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)] text-[var(--ink-0)] shadow-xl shadow-[var(--accent)]/20 ring-1 ring-[var(--border-strong)]">
          <Pill className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Sign in to MediVault AI</h1>
        <p className="mt-1.5 text-xs text-[var(--text-secondary)] max-w-xs mx-auto leading-relaxed">
          Intelligent clinical prescription organizer & deterministic medication schedule
        </p>
      </div>

      {/* Glassmorphic Form Card */}
      <div className="relative rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-7 shadow-2xl backdrop-blur-xl">
        <SignInForm />

        <div className="mt-6 border-t border-[var(--border-default)] pt-5 text-center text-xs text-[var(--text-secondary)]">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">
            Create account
          </Link>
        </div>
      </div>

      {/* Trust pill */}
      <p className="text-center text-[10px] text-[var(--text-muted)] flex items-center justify-center gap-1.5 font-medium">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
        Protected by End-to-End Encryption & Zero-Knowledge Isolation
      </p>
    </div>
  );
}
