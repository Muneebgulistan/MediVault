"use server";

import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { generateSchedule } from "@/lib/scheduling/engine";
import { safeRevalidatePath } from "@/lib/utils/revalidate";
import { LogStatus } from "@prisma/client";

/**
 * Enforces ownership of a MedicineSchedule record.
 * Throws an error if the user is unauthenticated or does not own the record.
 */
async function checkScheduleOwnership(scheduleId: string): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthenticated");
  }

  const schedule = await prisma.medicineSchedule.findUnique({
    where: { id: scheduleId },
    select: { userId: true },
  });

  if (!schedule || schedule.userId !== session.user.id) {
    throw new Error("Unauthorized access to medication schedule.");
  }

  return session.user.id;
}

/**
 * Action: Generates and saves schedule records for all medicines in a confirmed prescription.
 */
export async function generatePrescriptionSchedules(prescriptionId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthenticated");
  }

  // 1. Fetch prescription and verify user owns it
  const prescription = await prisma.prescription.findFirst({
    where: { id: prescriptionId, userId: session.user.id },
    include: {
      medicines: {
        include: {
          medicine: true,
        },
      },
    },
  });

  if (!prescription) {
    throw new Error("Prescription not found or unauthorized.");
  }

  // 2. Loop through each medicine in the prescription
  for (const pm of prescription.medicines) {
    // Generate dates and occurrences deterministically
    const result = generateSchedule({
      dosage: pm.dosage,
      frequency: pm.frequency,
      instructions: pm.instructions,
      duration: pm.duration,
    });

    if (result.success && !result.needsClarification) {
      // Clean existing schedule slots for this prescription-medicine to avoid duplicates
      await prisma.medicineSchedule.deleteMany({
        where: {
          userId: session.user.id,
          prescriptionMedicineId: pm.id,
        },
      });

      // Save each generated time slot
      if (result.isAsNeeded || result.occurrences.length === 0) {
        // For PRN/As Needed, we create a single inactive or log-only schedule slot
        await prisma.medicineSchedule.create({
          data: {
            userId: session.user.id,
            medicineId: pm.medicineId,
            prescriptionMedicineId: pm.id,
            scheduledTime: "As Needed",
            startDate: result.startDate,
            endDate: result.endDate,
            dosage: pm.dosage,
            instructions: pm.instructions || "As needed",
            isActive: true,
          },
        });
      } else {
        for (const occ of result.occurrences) {
          await prisma.medicineSchedule.create({
            data: {
              userId: session.user.id,
              medicineId: pm.medicineId,
              prescriptionMedicineId: pm.id,
              scheduledTime: occ.scheduledTime,
              startDate: result.startDate,
              endDate: result.endDate,
              dosage: occ.dosage,
              instructions: occ.instructions,
              isActive: true,
            },
          });
        }
      }
    }
  }

  // 3. Mark prescription status as VERIFIED/CONFIRMED
  await prisma.prescription.update({
    where: { id: prescriptionId },
    data: { status: "CONFIRMED" },
  });

  safeRevalidatePath("/dashboard/schedule");
  safeRevalidatePath("/dashboard/prescriptions");

}

/**
 * Action: Marks a specific time slot log as TAKEN or SKIPPED for a calendar date.
 */
export async function logMedicationTake(
  scheduleId: string,
  date: string, // YYYY-MM-DD
  status: "TAKEN" | "SKIPPED"
) {
  // Enforce security check
  await checkScheduleOwnership(scheduleId);

  // Upsert the log for this specific date and time slot
  const existingLog = await prisma.medicineLog.findFirst({
    where: {
      scheduleId,
      takenDate: date,
    },
  });

  if (existingLog) {
    await prisma.medicineLog.update({
      where: { id: existingLog.id },
      data: {
        status: status as LogStatus,
        loggedAt: new Date(),
      },
    });
  } else {
    await prisma.medicineLog.create({
      data: {
        scheduleId,
        status: status as LogStatus,
        takenDate: date,
      },
    });
  }

  safeRevalidatePath("/dashboard/schedule");
  return { success: true };
}

/**
 * Action: Pauses or resumes a schedule time slot.
 */
export async function toggleScheduleActive(scheduleId: string, isActive: boolean) {
  await checkScheduleOwnership(scheduleId);

  await prisma.medicineSchedule.update({
    where: { id: scheduleId },
    data: { isActive },
  });

  safeRevalidatePath("/dashboard/schedule");
  return { success: true };
}

/**
 * Action: Modifies the scheduled hour/minute of a medication occurrence.
 */
export async function updateScheduleTime(scheduleId: string, newTime: string) {
  await checkScheduleOwnership(scheduleId);

  // Time format regex check (e.g. "08:30" or "As Needed")
  const isTimeValid = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(newTime) || newTime === "As Needed";
  if (!isTimeValid) {
    throw new Error("Invalid time format. Please use HH:MM.");
  }

  await prisma.medicineSchedule.update({
    where: { id: scheduleId },
    data: { scheduledTime: newTime },
  });

  safeRevalidatePath("/dashboard/schedule");
  return { success: true };
}

/**
 * Action: Add a custom manual medicine schedule slot.
 */
export async function addCustomSchedule(data: {
  medicineId: string;
  scheduledTime: string;
  dosage: string;
  instructions?: string;
  durationDays?: number;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthenticated");
  }

  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  let endDate: Date | null = null;
  if (data.durationDays && data.durationDays > 0) {
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + data.durationDays - 1);
  }

  await prisma.medicineSchedule.create({
    data: {
      userId: session.user.id,
      medicineId: data.medicineId,
      scheduledTime: data.scheduledTime,
      startDate,
      endDate,
      dosage: data.dosage,
      instructions: data.instructions || null,
      isActive: true,
    },
  });

  safeRevalidatePath("/dashboard/schedule");
  return { success: true };
}
