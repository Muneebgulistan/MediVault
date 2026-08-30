"use server";

import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { requirePrescriptionOwnership } from "@/lib/auth/authorization";
import { safeRevalidatePath } from "@/lib/utils/revalidate";
import { redirect } from "next/navigation";

/**
 * Permanently deletes a prescription and cascades deletion to files, medicines, and schedules.
 * Enforces ownership controls.
 */
export async function deletePrescription(prescriptionId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthenticated");
  }

  // 1. Enforce ownership (throws if unauthorized or not found)
  await requirePrescriptionOwnership(prescriptionId);

  // 2. Perform deletion (cascades to PrescriptionFile, PrescriptionMedicine, schedules, logs)
  await prisma.prescription.delete({
    where: { id: prescriptionId },
  });

  // 3. Revalidate paths and redirect
  safeRevalidatePath("/dashboard/prescriptions");
  safeRevalidatePath("/dashboard/schedule");
  redirect("/dashboard/prescriptions");
}
