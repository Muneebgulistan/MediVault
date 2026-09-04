import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { TimetableClient } from "@/components/schedule/timetable-client";
import { EmptyState } from "@/components/ui/empty-state";
import { CalendarRange, Clock, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const userId = session.user.id;
  const todayStr = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

  // Fetch all schedules for this user (both active and paused so they can toggle them) with error safety
  let schedules: Awaited<ReturnType<typeof prisma.medicineSchedule.findMany<{
    include: {
      medicine: true;
      logs: { where: { takenDate: string } };
    };
  }>>> = [];

  try {
    schedules = await prisma.medicineSchedule.findMany({
      where: {
        userId,
      },
      include: {
        medicine: true,
        logs: {
          where: {
            takenDate: todayStr,
          },
        },
      },
    });
  } catch (error) {
    console.error("Failed to query schedules:", error);
  }

  // Map database schedules into clean serializable props for the client component
  const formattedSchedules = schedules.map((s) => ({
    id: s.id,
    scheduledTime: s.scheduledTime,
    dosage: s.dosage,
    instructions: s.instructions,
    isActive: s.isActive,
    prescriptionMedicineId: s.prescriptionMedicineId,
    medicine: {
      id: s.medicine.id,
      name: s.medicine.name,
    },
    logs: s.logs.map((l) => ({
      status: l.status as "TAKEN" | "SKIPPED",
    })),
  }));

  const weekday = new Date().toLocaleDateString(undefined, { weekday: "long" });
  const longDate = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const totalDoses = formattedSchedules.filter((s) => s.isActive).length;
  const takenCount = formattedSchedules.filter(
    (s) => s.isActive && s.logs[0]?.status === "TAKEN"
  ).length;
  const skippedCount = formattedSchedules.filter(
    (s) => s.isActive && s.logs[0]?.status === "SKIPPED"
  ).length;
  const pendingCount = Math.max(0, totalDoses - takenCount - skippedCount);

  return (
    <div className="space-y-8">
      {/* Date Header & Progress Summary */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-slate-800/80 bg-gradient-to-r from-slate-900/60 via-slate-900/30 to-teal-950/20 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-400">
            <Sparkles className="h-4 w-4" />
            <span>DAILY DOSAGE TIMELINE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
            {weekday}, {longDate}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Mark doses as taken, adjust timing intervals, or pause medications.
          </p>
        </div>

        {/* Adherence Chips */}
        {totalDoses > 0 && (
          <div className="flex items-center gap-3 self-start sm:self-center">
            <div className="flex items-center gap-2 rounded-2xl border border-teal-500/25 bg-teal-950/30 px-4 py-2 text-xs font-bold text-teal-300">
              <CheckCircle2 className="h-4 w-4 text-teal-400" />
              <span>{takenCount} of {totalDoses} Taken</span>
            </div>
            {pendingCount > 0 && (
              <div className="rounded-2xl border border-amber-500/25 bg-amber-950/30 px-3 py-2 text-xs font-bold text-amber-300">
                <span>{pendingCount} Pending</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Timetable client or Empty state */}
      {formattedSchedules.length === 0 ? (
        <div className="py-16">
          <EmptyState
            icon={CalendarRange}
            title="No medication schedules generated"
            description="Timetables are automatically constructed once doctor prescriptions are reviewed and confirmed."
            action={
              <Link
                href="/dashboard/prescriptions"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-5 py-2.5 text-xs transition shadow-lg shadow-teal-500/20"
              >
                <span>View Prescriptions</span>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-teal-400" />
              <h2 className="text-base font-bold text-white tracking-tight">Active Daily Intervals</h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Auto-Adjusts with Meal Timings
            </span>
          </div>

          <TimetableClient initialSchedules={formattedSchedules} todayStr={todayStr} />
        </div>
      )}
    </div>
  );
}
