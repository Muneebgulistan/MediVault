"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard caught error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-8 max-w-md w-full shadow-2xl backdrop-blur-md space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--danger-bg)] text-[var(--danger-fg)] border border-[var(--danger-fg)]/25">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Something went wrong</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
            {error.message || "An unexpected error occurred while loading this section."}
          </p>
          {error.digest && (
            <p className="mt-1 text-[11px] font-mono text-[var(--text-muted)]">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--ink-0)] font-semibold px-4 py-2.5 text-sm transition shadow-lg shadow-[var(--accent)]/15"
          >
            <RotateCw className="h-4 w-4" /> Try Again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface-alt)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] font-medium px-4 py-2.5 text-sm transition"
          >
            Go to Overview
          </Link>
        </div>
      </div>
    </div>
  );
}
