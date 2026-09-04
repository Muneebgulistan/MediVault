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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Medication Reminders</h1>
        <p className="text-sm text-slate-400 mt-1">
          Stay on track with system-generated notifications and reminder logs.
        </p>
      </div>

      {activeSchedules.length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon={Bell}
            title="No active reminders"
            description="Reminders are automatically generated based on your schedules. Add medication schedules to activate reminders."
            action={
              <Link
                href="/dashboard/schedule"
                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold px-4 py-2 text-xs transition"
              >
                Go to Schedules
              </Link>
            }
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 space-y-4">
          <h3 className="text-base font-semibold text-slate-100 mb-2">Enabled Alerts</h3>
          <div className="space-y-3">
            {activeSchedules.map((sched) => (
              <div
                key={sched.id}
                className="flex items-center justify-between border border-slate-800 bg-slate-950/20 rounded-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">
                      Alert for {sched.medicine.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Trigger: Every day at {sched.scheduledTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
                  <span className="text-xs text-slate-400">Enabled</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
