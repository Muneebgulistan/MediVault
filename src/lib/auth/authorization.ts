import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { NotFoundError, UnauthorizedError } from "@/lib/utils/error-handler";

/**
 * Verifies that the authenticated user owns the given prescription.
 * Throws NotFoundError if not found, UnauthorizedError if owned by another user.
 * The userId is always resolved from the server-side session — never from client input.
 */
export async function requirePrescriptionOwnership(prescriptionId: string) {
  const userId = await requireAuth();

  const prescription = await prisma.prescription.findUnique({
    where: { id: prescriptionId },
    select: { userId: true },
  });

  if (!prescription) {
    throw new NotFoundError("Prescription not found.");
  }

  if (prescription.userId !== userId) {
    // Return same error as not-found to avoid leaking resource existence
    throw new UnauthorizedError("You do not have permission to access this prescription.");
  }

  return userId;
}

/**
 * Verifies that the authenticated user owns the given medicine schedule.
 */
export async function requireScheduleOwnership(scheduleId: string) {
  const userId = await requireAuth();

  const schedule = await prisma.medicineSchedule.findUnique({
    where: { id: scheduleId },
    select: { userId: true },
  });

  if (!schedule) {
    throw new NotFoundError("Schedule not found.");
  }

  if (schedule.userId !== userId) {
    throw new UnauthorizedError("You do not have permission to access this schedule.");
  }

  return userId;
}
