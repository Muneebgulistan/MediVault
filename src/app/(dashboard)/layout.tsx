import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Pill, User } from "lucide-react";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Server-side session check — user ID is resolved from the JWT, never from client input
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar / Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-blue-600 shadow-lg shadow-teal-500/20">
              <Pill className="h-5 w-5 text-slate-950" />
            </div>
            <span className="font-bold tracking-tight text-white">MediVault AI</span>
          </div>

          <nav className="hidden items-center gap-6 text-sm md:flex">
            <a href="/dashboard" className="text-slate-300 transition hover:text-white">Overview</a>
            <a href="/dashboard/prescriptions" className="text-slate-300 transition hover:text-white">Prescriptions</a>
            <a href="/dashboard/medicines" className="text-slate-300 transition hover:text-white">Medicines</a>
            <a href="/dashboard/schedule" className="text-slate-300 transition hover:text-white">Schedule</a>
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5">
              <User className="h-4 w-4 text-teal-400" />
              <span className="text-sm text-slate-300 max-w-[120px] truncate">
                {session.user.name ?? session.user.email}
              </span>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
