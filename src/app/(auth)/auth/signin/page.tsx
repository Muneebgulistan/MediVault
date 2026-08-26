import Link from "next/link";
import { Pill } from "lucide-react";
import { SignInForm } from "@/components/auth/sign-in-form";

export default function SignInPage() {
  return (
    <div className="w-full max-w-md space-y-8">
      {/* Logo */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-blue-600 shadow-lg shadow-teal-500/20">
          <Pill className="h-8 w-8 text-slate-950" />
        </div>
        <h1 className="text-2xl font-bold text-white">Sign in to MediVault AI</h1>
        <p className="mt-2 text-sm text-slate-400">Your prescriptions, organized intelligently.</p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl backdrop-blur-md">
        <SignInForm />

        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="font-medium text-teal-400 hover:text-teal-300 transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
