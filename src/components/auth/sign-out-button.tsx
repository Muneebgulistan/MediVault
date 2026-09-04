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
        "rounded-lg border border-[var(--border-default)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)]"
      }
    >
      Sign out
    </button>
  );
}
