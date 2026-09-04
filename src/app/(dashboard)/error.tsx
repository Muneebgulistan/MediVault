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
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 max-w-md w-full shadow-2xl backdrop-blur-md space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">Something went wrong</h2>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed">
            {error.message || "An unexpected error occurred while loading this section."}
          </p>
          {error.digest && (
            <p className="mt-1 text-[11px] font-mono text-slate-500">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold px-4 py-2.5 text-sm transition shadow-lg shadow-teal-500/20"
          >
            <RotateCw className="h-4 w-4" /> Try Again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-medium px-4 py-2.5 text-sm transition"
          >
            Go to Overview
          </Link>
        </div>
      </div>
    </div>
  );
}
