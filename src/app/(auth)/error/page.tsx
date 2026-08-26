import Link from "next/link";
import { Pill, AlertTriangle } from "lucide-react";

export default function AuthErrorPage() {
  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-blue-600 shadow-lg shadow-teal-500/20">
          <Pill className="h-8 w-8 text-slate-950" />
        </div>
      </div>

      <div className="rounded-2xl border border-red-500/30 bg-slate-900/80 p-8 text-center shadow-xl backdrop-blur-md">
        <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-red-400" />
        <h2 className="text-xl font-bold text-white">Authentication error</h2>
        <p className="mt-2 text-sm text-slate-400">
          An error occurred during authentication. Please try again.
        </p>
        <Link
          href="/auth/signin"
          className="mt-6 inline-block rounded-lg bg-teal-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-400"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
