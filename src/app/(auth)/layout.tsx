import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 flex items-center justify-center px-4 py-12">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/10 blur-3xl" />
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
