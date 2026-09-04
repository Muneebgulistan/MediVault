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
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Medication Reminders</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Automated alerts synchronized with your active prescription schedules.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface-alt)] px-3 py-1.5 font-mono">
          <span className="h-2 w-2 rounded-full bg-[var(--accent)] animate-pulse" />
          <span className="text-xs font-medium text-[var(--text-secondary)]">Scheduler Daemon Active</span>
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
                className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--ink-0)] font-semibold px-4 py-2.5 text-xs transition shadow-sm"
              >
                Go to Schedule Timetable
              </Link>
            }
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Active Dose Notifications
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {activeSchedules.length} daily {activeSchedules.length === 1 ? "trigger" : "triggers"} currently active
              </p>
            </div>
            <Link
              href="/dashboard/schedule"
              className="text-xs font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
            >
              Adjust Times →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            {activeSchedules.map((sched) => (
              <div
                key={sched.id}
                className="flex items-center justify-between border border-[var(--border-default)] bg-[var(--bg-surface-alt)] rounded-xl p-4 transition-all hover:border-[var(--border-strong)] shadow-sm group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-surface)] text-[var(--accent)] border border-[var(--border-default)] group-hover:border-[var(--border-strong)] transition-colors">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                      {sched.medicine.name}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5 flex items-center gap-1.5">
                      <span className="font-mono text-[var(--accent)] font-semibold">{sched.scheduledTime}</span>
                      <span className="text-[var(--text-muted)]">•</span>
                      <span>Daily Dose</span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
                  <span className="rounded-full bg-[var(--success-bg)] border border-[var(--success-fg)]/25 px-2 py-0.5 text-[10px] font-mono font-medium text-[var(--success-fg)]">
                    Armed
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono font-medium">In-App Alert</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
