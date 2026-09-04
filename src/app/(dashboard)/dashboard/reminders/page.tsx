import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { EmptyState } from "@/components/ui/empty-state";
import { Bell } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function RemindersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const userId = session.user.id;

  // Reminders are computed based on active schedules with error safety
  let activeSchedules: Awaited<ReturnType<typeof prisma.medicineSchedule.findMany<{
    include: { medicine: true };
  }>>> = [];

  try {
    activeSchedules = await prisma.medicineSchedule.findMany({
      where: { userId, isActive: true },
      include: { medicine: true },
      orderBy: { scheduledTime: "asc" },
    });
  } catch (error) {
    console.error("Failed to query reminders:", error);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Medication Reminders</h1>
          <p className="text-sm text-slate-400 mt-1">
            Automated alerts synchronized with your active prescription schedules.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/5 px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
          <span className="text-xs font-semibold text-teal-400">Scheduler Daemon Active</span>
        </div>
      </div>

      {activeSchedules.length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon={Bell}
            title="No active reminders configured"
            description="Medication reminders are automatically synchronized when you generate a timetable from your prescriptions."
            action={
              <Link
                href="/dashboard/schedule"
                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold px-4 py-2.5 text-xs transition shadow-lg shadow-teal-500/10"
              >
                Go to Schedule Timetable
              </Link>
            }
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Active Dose Notifications
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeSchedules.length} daily {activeSchedules.length === 1 ? "trigger" : "triggers"} currently active
              </p>
            </div>
            <Link
              href="/dashboard/schedule"
              className="text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors"
            >
              Adjust Times →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            {activeSchedules.map((sched) => (
              <div
                key={sched.id}
                className="flex items-center justify-between border border-slate-800/80 bg-slate-950/60 rounded-xl p-4 transition-all hover:border-teal-500/30 hover:bg-slate-950/80 shadow-inner group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 group-hover:scale-105 transition-transform">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-100 truncate">
                      {sched.medicine.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <span className="font-mono text-teal-400 font-semibold">{sched.scheduledTime}</span>
                      <span className="text-slate-600">•</span>
                      <span>Daily Dose</span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                    Armed
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">In-App Alert</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
