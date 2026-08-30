import { prisma } from "../src/lib/db/prisma";

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing seed data
  await prisma.medicineSchedule.deleteMany();
  await prisma.prescriptionMedicine.deleteMany();
  await prisma.prescriptionFile.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.user.deleteMany();

  // Create sample user
  const user = await prisma.user.create({
    data: {
      email: "demo@medivault.ai",
      name: "Jane Doe",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    },
  });

  // Create normalized medicines catalog
  const amoxicillin = await prisma.medicine.create({
    data: {
      name: "Amoxicillin",
      genericName: "Amoxicillin Trihydrate",
      brandNames: ["Amoxil", "Moxatag"],
      category: "Antibiotic",
      description: "Penicillin-class antibiotic used to treat bacterial infections.",
      sideEffects: "Nausea, rash, diarrhea",
    },
  });

  const atorvastatin = await prisma.medicine.create({
    data: {
      name: "Atorvastatin",
      genericName: "Atorvastatin Calcium",
      brandNames: ["Lipitor"],
      category: "Statin",
      description: "HMG-CoA reductase inhibitor used to lower cholesterol and reduce cardiovascular risk.",
      sideEffects: "Muscle pain, weakness",
    },
  });

  const metformin = await prisma.medicine.create({
    data: {
      name: "Metformin",
      genericName: "Metformin Hydrochloride",
      brandNames: ["Glucophage", "Fortamet"],
      category: "Antidiabetic",
      description: "Biguanide medication used to treat type 2 diabetes.",
      sideEffects: "Stomach upset, metallic taste",
    },
  });

  // Create sample prescription
  const prescription = await prisma.prescription.create({
    data: {
      userId: user.id,
      title: "General Health & Infection Treatment",
      doctorName: "Dr. Sarah Jenkins, MD",
      prescriptionDate: new Date(),
      notes: "Take antibiotic with food and complete full 7-day course.",
      status: "CONFIRMED",
      files: {
        create: [
          {
            originalFilename: "prescription_scan_jan2026.pdf",
            storagePath: "/uploads/prescriptions/sample_scan.pdf",
            mimeType: "application/pdf",
            fileSize: 1048576,
          },
        ],
      },
      medicines: {
        create: [
          {
            medicineId: amoxicillin.id,
            dosage: "500mg",
            frequency: "Twice daily",
            route: "ORAL",
            duration: "7 days",
            instructions: "Take with food every 12 hours.",
            quantity: 14,
            confidence: 0.98,
            verificationStatus: "USER_VERIFIED",
          },
          {
            medicineId: atorvastatin.id,
            dosage: "20mg",
            frequency: "Once daily at bedtime",
            route: "ORAL",
            duration: "30 days",
            instructions: "Take at night before sleep.",
            quantity: 30,
            confidence: 0.95,
            verificationStatus: "PHYSICIAN_VERIFIED",
          },
          {
            medicineId: metformin.id,
            dosage: "850mg",
            frequency: "Twice daily",
            route: "ORAL",
            duration: "30 days",
            instructions: "Take with breakfast and dinner.",
            quantity: 60,
            confidence: 0.89,
            verificationStatus: "AI_EXTRACTED",
          },
        ],
      },
    },
    include: {
      medicines: true,
    },
  });

  // Create schedules for verified medicines
  const amoxPrescriptionMed = prescription.medicines.find(
    (m: { medicineId: string; id: string }) => m.medicineId === amoxicillin.id
  );

  if (amoxPrescriptionMed) {
    await prisma.medicineSchedule.create({
      data: {
        userId: user.id,
        medicineId: amoxicillin.id,
        prescriptionMedicineId: amoxPrescriptionMed.id,
        scheduledTime: "08:00",
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        dosage: "500mg",
        instructions: "Take with breakfast",
        isActive: true,
      },
    });

    await prisma.medicineSchedule.create({
      data: {
        userId: user.id,
        medicineId: amoxicillin.id,
        prescriptionMedicineId: amoxPrescriptionMed.id,
        scheduledTime: "20:00",
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        dosage: "500mg",
        instructions: "Take after dinner",
        isActive: true,
      },
    });
  }

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
