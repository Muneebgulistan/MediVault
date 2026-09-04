import Link from "next/link";
import { Pill } from "lucide-react";
import { SignUpForm } from "@/components/auth/sign-up-form";

export default function SignUpPage() {
  return (
    <div className="relative w-full max-w-md space-y-7">
      {/* Ambient background glow */}
      <div className="absolute -top-16 -left-16 h-56 w-56 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      {/* Logo & title */}
      <div className="text-center relative">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-blue-600 shadow-xl shadow-teal-500/20 ring-1 ring-white/20">
          <Pill className="h-7 w-7 text-slate-950" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Create your account</h1>
        <p className="mt-1.5 text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
          Begin managing prescriptions, medications, and schedules securely.
        </p>
      </div>

      {/* Card */}
      <div className="relative rounded-2xl border border-slate-800/80 bg-slate-900/60 p-7 shadow-2xl backdrop-blur-xl">
        <SignUpForm />

        <div className="mt-6 border-t border-slate-800/80 pt-5 text-center text-xs text-slate-400">
          Already have an account?{" "}
          <Link href="/auth/signin" className="font-semibold text-teal-400 hover:text-teal-300 transition-colors">
            Sign in
          </Link>
        </div>
      </div>

      {/* Trust notice */}
      <p className="text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5 font-medium">
        <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
        Zero-Knowledge Data Segregation & Cryptographic Privacy Guaranteed
      </p>
    </div>
  );
}
