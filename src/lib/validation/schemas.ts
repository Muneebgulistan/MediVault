import { z } from "zod";

export const PrescriptionUploadSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  doctorName: z.string().optional(),
  notes: z.string().optional(),
});

export const MedicineSchema = z.object({
  name: z.string().min(1, "Medicine name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  durationDays: z.number().int().positive().optional(),
});

export type PrescriptionUploadInput = z.infer<typeof PrescriptionUploadSchema>;
export type MedicineInput = z.infer<typeof MedicineSchema>;
