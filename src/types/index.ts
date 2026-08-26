export interface User {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Prescription {
  id: string;
  userId: string;
  title: string;
  doctorName?: string | null;
  imageUrl?: string | null;
  extractedText?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Medicine {
  id: string;
  prescriptionId?: string | null;
  userId: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
