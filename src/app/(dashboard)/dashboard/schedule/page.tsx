import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { EmptyState } from "@/components/ui/empty-state";
import { Calendar, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const userId = session.user.id;

  // Retrieve user's schedules (data isolation)
  const schedules = await prisma.medicineSchedule.findMany({
    where: { userId },
    include: { medicine: true },
    orderBy: [{ isActive: "desc" }, { scheduledTime: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Medication Schedule</h1>
          <p className="text-sm text-slate-400 mt-1">
            Keep track of your active intakes, scheduled hours, and instruction guidelines.
          </p>
        </div>
      </div>

      {schedules.length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon={Calendar}
            title="No scheduled medicines"
            description="Create schedules to receive reminders and generate your personalized intake timeline."
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
          <h3 className="mb-4 text-base font-semibold text-slate-100">Intake Timeline</h3>
          <div className="space-y-4">
            {schedules.map((sched) => (
              <div
                key={sched.id}
                className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-800 bg-slate-950/40 p-4 transition hover:border-slate-800"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-400 font-semibold shrink-0">
                    <Clock className="h-4 w-4 text-teal-400" />
                    <span className="text-[10px] mt-0.5">{sched.scheduledTime}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-100 text-sm">
                        {sched.medicine.name}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase ${
                          sched.isActive
                            ? "bg-teal-500/10 text-teal-400 border border-teal-500/15"
                            : "bg-slate-800 text-slate-500 border border-slate-700/50"
                        }`}
                      >
                        {sched.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Dosage: {sched.dosage}
                      {sched.instructions && ` • ${sched.instructions}`}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Period: {new Date(sched.startDate).toLocaleDateString()}
                      {sched.endDate && ` to ${new Date(sched.endDate).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
