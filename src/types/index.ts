export type PrescriptionStatus =
  | "DRAFT"
  | "PROCESSING"
  | "EXTRACTED"
  | "REVIEW_REQUIRED"
  | "VERIFIED"
  | "ARCHIVED";

export type VerificationStatus =
  | "AI_EXTRACTED"
  | "USER_EDITED"
  | "USER_VERIFIED"
  | "PHYSICIAN_VERIFIED";

export type AdministrationRoute =
  | "ORAL"
  | "TOPICAL"
  | "INHALATION"
  | "INJECTION"
  | "OPHTHALMIC"
  | "OTIC"
  | "NASAL"
  | "OTHER";

export interface User {
  id: string;
  name?: string | null;
  email: string;
  emailVerified?: Date | null;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrescriptionFile {
  id: string;
  prescriptionId: string;
  originalFilename: string;
  storagePath: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: Date;
}

export interface Prescription {
  id: string;
  userId: string;
  title: string;
  doctorName?: string | null;
  prescriptionDate?: Date | null;
  notes?: string | null;
  status: PrescriptionStatus;
  createdAt: Date;
  updatedAt: Date;
  files?: PrescriptionFile[];
  medicines?: PrescriptionMedicine[];
}

export interface Medicine {
  id: string;
  name: string;
  genericName?: string | null;
  brandNames: string[];
  category?: string | null;
  description?: string | null;
  sideEffects?: string | null;
  interactions?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrescriptionMedicine {
  id: string;
  prescriptionId: string;
  medicineId: string;
  medicine?: Medicine;
  dosage: string;
  frequency: string;
  route: AdministrationRoute;
  duration?: string | null;
  instructions?: string | null;
  quantity?: number | null;
  confidence?: number | null;
  verificationStatus: VerificationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicineSchedule {
  id: string;
  userId: string;
  medicineId: string;
  medicine?: Medicine;
  prescriptionMedicineId?: string | null;
  scheduledTime: string;
  startDate: Date;
  endDate?: Date | null;
  dosage: string;
  instructions?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
