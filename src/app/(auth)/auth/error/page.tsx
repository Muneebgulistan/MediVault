import Link from "next/link";
import { Pill, AlertTriangle } from "lucide-react";

export default function AuthErrorPage() {
  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)] text-[var(--ink-0)] shadow-lg shadow-[var(--accent)]/20">
          <Pill className="h-8 w-8" />
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--danger-fg)]/30 bg-[var(--bg-surface)] p-8 text-center shadow-xl backdrop-blur-md">
        <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-[var(--danger-fg)]" />
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Authentication error</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          An error occurred during authentication. Please try again.
        </p>
        <Link
          href="/auth/signin"
          className="mt-6 inline-block rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--ink-0)] transition hover:bg-[var(--accent-hover)]"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
