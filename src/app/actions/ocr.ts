"use server";

import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { researchMedicine } from "@/lib/medicines/research";
import { generateSchedule } from "@/lib/scheduling/engine";
import { AdministrationRoute, VerificationStatus } from "@prisma/client";
import { safeRevalidatePath } from "@/lib/utils/revalidate";
import { PrescriptionReviewSchema } from "@/lib/validation/prescription-schemas";

/**
 * Simulates AI/OCR extraction for an uploaded prescription.
 * Sets status to PROCESSING, waits 2s, creates mock medicines, sets to REVIEW_REQUIRED.
 */
export async function startOcrExtraction(prescriptionId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthenticated");

  // 1. Enforce ownership and check if already processed
  const rx = await prisma.prescription.findFirst({
    where: { id: prescriptionId, userId: session.user.id },
  });

  if (!rx) throw new Error("Prescription not found.");
  if (rx.status !== "UPLOADED") return { success: true, status: rx.status };

  // 2. Set to PROCESSING state
  await prisma.prescription.update({
    where: { id: prescriptionId },
    data: { status: "PROCESSING" },
  });

  // Simulate 2 seconds processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // 3. Create normalized medicines catalog items if not present
  const metformin = await prisma.medicine.upsert({
    where: { name: "Metformin" },
    update: {},
    create: {
      name: "Metformin",
      genericName: "Metformin Hydrochloride",
      brandNames: ["Glucophage"],
      category: "Antidiabetic",
      description: "Oral diabetes medicine that helps control blood sugar levels.",
    },
  });

  const amoxicillin = await prisma.medicine.upsert({
    where: { name: "Amoxicillin" },
    update: {},
    create: {
      name: "Amoxicillin",
      genericName: "Amoxicillin Trihydrate",
      brandNames: ["Amoxil"],
      category: "Antibiotic",
      description: "Penicillin antibiotic that fights bacteria.",
    },
  });

  // 4. Create mock extracted medicines with confidence indicators
  await prisma.prescriptionMedicine.createMany({
    data: [
      {
        prescriptionId,
        medicineId: metformin.id,
        dosage: "1 tablet",
        frequency: "twice daily",
        route: AdministrationRoute.ORAL,
        duration: "for 30 days",
        instructions: "after breakfast and after dinner",
        confidence: 0.95,
        verificationStatus: VerificationStatus.AI_EXTRACTED,
      },
      {
        prescriptionId,
        medicineId: amoxicillin.id,
        dosage: "1 capsule",
        frequency: "three times daily",
        route: AdministrationRoute.ORAL,
        duration: "for 7 days",
        instructions: "take with water",
        confidence: 0.88,
        verificationStatus: VerificationStatus.AI_EXTRACTED,
      },
    ],
  });

  // 5. Update status to REVIEW_REQUIRED
  await prisma.prescription.update({
    where: { id: prescriptionId },
    data: {
      status: "REVIEW_REQUIRED",
      doctorName: "Dr. Sarah Jenkins", // Mock doctor name detected
    },
  });

  safeRevalidatePath(`/dashboard/prescriptions/${prescriptionId}`);
  return { success: true, status: "REVIEW_REQUIRED" };
}

/**
 * Saves user corrections, normalizes medicines, researches information, and creates schedules inside an atomic transaction.
 */
export async function savePrescriptionReview(
  prescriptionId: string,
  medicines: Array<{
    medicineName: string;
    dosage: string;
    frequency: string;
    route: string;
    duration: string;
    instructions: string;
  }>
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthenticated");

  // Validate incoming review payload using Zod schema
  const parsed = PrescriptionReviewSchema.safeParse(medicines);
  if (!parsed.success) {
    throw new Error("Invalid review data format: " + parsed.error.message);
  }
  const validatedMedicines = parsed.data;

  // Enforce ownership
  const rx = await prisma.prescription.findFirst({
    where: { id: prescriptionId, userId: session.user.id },
  });
  if (!rx) throw new Error("Prescription not found or unauthorized.");

  // Run transaction to ensure everything is atomic (no partial/corrupt schedule states)
  await prisma.$transaction(async (tx) => {
    // 1. Delete all previous mock/extracted medicines
    await tx.prescriptionMedicine.deleteMany({
      where: { prescriptionId },
    });

    // 2. Loop and resolve/create each review item
    for (const m of validatedMedicines) {
      // Find or create medicine in the global catalog
      let med = await tx.medicine.findFirst({
        where: { name: { equals: m.medicineName.trim(), mode: "insensitive" } },
      });

      if (!med) {
        med = await tx.medicine.create({
          data: {
            name: m.medicineName.trim(),
            description: "Custom added medication.",
          },
        });
      }

      // Create prescription medicine entry
      const pm = await tx.prescriptionMedicine.create({
        data: {
          prescriptionId,
          medicineId: med.id,
          dosage: m.dosage,
          frequency: m.frequency,
          route: m.route as AdministrationRoute,
          duration: m.duration || null,
          instructions: m.instructions || null,
          confidence: 1.0, // User verified
          verificationStatus: VerificationStatus.USER_VERIFIED,
        },
      });

      // 3. Auto-generate schedule times for confirmed medications
      const sched = generateSchedule({
        dosage: pm.dosage,
        frequency: pm.frequency,
        instructions: pm.instructions,
        duration: pm.duration,
      });

      if (sched.success && !sched.needsClarification) {
        if (sched.isAsNeeded || sched.occurrences.length === 0) {
          await tx.medicineSchedule.create({
            data: {
              userId: session.user.id!,
              medicineId: med.id,
              prescriptionMedicineId: pm.id,
              scheduledTime: "As Needed",
              startDate: sched.startDate,
              endDate: sched.endDate,
              dosage: pm.dosage,
              instructions: pm.instructions || "As needed",
              isActive: true,
            },
          });
        } else {
          for (const occ of sched.occurrences) {
            await tx.medicineSchedule.create({
              data: {
                userId: session.user.id!,
                medicineId: med.id,
                prescriptionMedicineId: pm.id,
                scheduledTime: occ.scheduledTime,
                startDate: sched.startDate,
                endDate: sched.endDate,
                dosage: occ.dosage,
                instructions: occ.instructions,
                isActive: true,
              },
            });
          }
        }
      }
    }

    // 4. Mark prescription status as CONFIRMED
    await tx.prescription.update({
      where: { id: prescriptionId },
      data: { status: "CONFIRMED" },
    });
  });

  // 5. Query FDA research API separately in background to cache details
  // (We do this after transaction commits to keep transactions fast and avoid network blocks!)
  for (const m of validatedMedicines) {
    try {
      const med = await prisma.medicine.findFirst({
        where: { name: { equals: m.medicineName.trim(), mode: "insensitive" } },
      });
      if (med) {
        // Triggers openFDA query and caches values inside database
        await researchMedicine(med.id, med.name);
      }
    } catch (err) {
      console.error(`[FDA Research Background Trigger Failed] for ${m.medicineName}:`, err);
    }
  }

  safeRevalidatePath(`/dashboard/prescriptions/${prescriptionId}`);
  safeRevalidatePath("/dashboard/schedule");
  safeRevalidatePath("/dashboard/medicines");
  return { success: true };
}
