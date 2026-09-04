import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { User, Mail, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const userId = session.user.id;

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, createdAt: true },
  });

  if (!dbUser) {
    redirect("/auth/signin");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Patient Profile</h1>
        <p className="text-sm text-slate-400 mt-1">
          Identity credentials, clinical storage isolation, and account metadata.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main profile card */}
        <div className="md:col-span-2 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-xl shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 border-b border-slate-800/80 pb-6">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/20 to-blue-600/20 border border-teal-500/30 text-3xl font-bold text-teal-400 shadow-lg shadow-teal-500/10">
                {dbUser.name ? dbUser.name[0].toUpperCase() : dbUser.email[0].toUpperCase()}
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-950 border border-teal-500/40">
                <span className="h-2.5 w-2.5 rounded-full bg-teal-400 animate-pulse" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">{dbUser.name ?? "MediVault Patient"}</h3>
                <span className="rounded-full bg-teal-500/10 border border-teal-500/25 px-2.5 py-0.5 text-[10px] font-semibold text-teal-400">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">{dbUser.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-800/70 bg-slate-950/60 p-4 space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                <User className="h-4 w-4 text-teal-400" />
                <span>Full Name</span>
              </div>
              <p className="text-sm font-medium text-slate-200 pl-6">
                {dbUser.name ?? "Not configured"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800/70 bg-slate-950/60 p-4 space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                <Mail className="h-4 w-4 text-teal-400" />
                <span>Primary Email</span>
              </div>
              <p className="text-sm font-medium text-slate-200 pl-6 truncate">
                {dbUser.email}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800/70 bg-slate-950/60 p-4 space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                <Calendar className="h-4 w-4 text-teal-400" />
                <span>Account Created</span>
              </div>
              <p className="text-sm font-medium text-slate-200 pl-6">
                {new Date(dbUser.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800/70 bg-slate-950/60 p-4 space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-teal-400" />
                <span>Data Isolation ID</span>
              </div>
              <p className="text-xs font-mono text-slate-400 pl-6 truncate">
                {userId}
              </p>
            </div>
          </div>
        </div>

        {/* Security / Privacy column */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-xl shadow-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800/80 pb-3">
            Privacy & Trust Architecture
          </h3>
          <div className="space-y-3.5 text-xs">
            <div className="rounded-xl bg-slate-950/60 border border-slate-800/60 p-3.5 space-y-1">
              <p className="font-semibold text-teal-400">Strict Data Isolation</p>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                All records are strictly partitioned by cryptographic user keys. No user can view or alter prescriptions outside their account.
              </p>
            </div>

            <div className="rounded-xl bg-slate-950/60 border border-slate-800/60 p-3.5 space-y-1">
              <p className="font-semibold text-teal-400">Storage Protection</p>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Prescription files are stored in private zero-indexed volumes with randomized UUID filenames and signed access tokens.
              </p>
            </div>

            <div className="rounded-xl bg-slate-950/60 border border-slate-800/60 p-3.5 space-y-1">
              <p className="font-semibold text-teal-400">Adherence Insights</p>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Deterministic timetables ensure exact adherence logging without hallucinated dose schedules.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
