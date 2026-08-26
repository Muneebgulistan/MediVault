"use client";

import { signOut } from "next-auth/react";

interface SignOutButtonProps {
  className?: string;
}

export function SignOutButton({ className }: SignOutButtonProps) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className={
        className ??
        "rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
      }
    >
      Sign out
    </button>
  );
}
