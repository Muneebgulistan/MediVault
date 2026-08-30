import { z } from "zod";
import { AdministrationRoute } from "@prisma/client";

export const PrescriptionMedicineReviewSchema = z.object({
  medicineName: z.string().min(1, "Medicine name is required").max(100),
  dosage: z.string().min(1, "Dosage is required").max(50),
  frequency: z.string().min(1, "Frequency is required").max(100),
  route: z.nativeEnum(AdministrationRoute),
  duration: z.string().max(50).optional().transform(val => val || ""),
  instructions: z.string().max(250).optional().transform(val => val || ""),
});

export const PrescriptionReviewSchema = z.array(PrescriptionMedicineReviewSchema);
