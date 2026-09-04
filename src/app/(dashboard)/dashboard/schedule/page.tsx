import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { TimetableClient } from "@/components/schedule/timetable-client";
import { EmptyState } from "@/components/ui/empty-state";
import { CalendarRange } from "lucide-react";

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Medication Schedule</h1>
        <p className="text-sm text-slate-400 mt-1">
          Your daily treatment timetable for <strong className="text-slate-200">{weekday}</strong>, {longDate}.
        </p>
      </div>

      {formattedSchedules.length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon={CalendarRange}
            title="No scheduled medicines"
            description="Go to Prescriptions to confirm your verified prescription items and auto-generate your timetable, or add custom schedules manually."
          />
        </div>
      ) : (
        <TimetableClient initialSchedules={formattedSchedules} todayStr={todayStr} />
      )}
    </div>
  );
}
