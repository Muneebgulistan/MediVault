import Module from "module";

// Mock next/cache before any Next.js actions are imported to prevent revalidatePath errors in CLI
// @ts-ignore
const originalRequire = Module.prototype.require;
// @ts-ignore
Module.prototype.require = function (id: string) {
  if (id === "next/cache") {
    return { revalidatePath: () => {} };
  }
  return originalRequire.apply(this, arguments as any);
};

import { startOcrExtraction, savePrescriptionReview } from "../src/app/actions/ocr";
import { prisma } from "../src/lib/db/prisma";

// In-memory mock database state
const mockDb: Record<string, any> = {
  prescriptions: {},
  medicines: {},
  prescriptionMedicines: [],
  schedules: [],
};

// 1. Mock auth() session via environment flag
process.env.MOCK_AUTH = "true";

// Save original prisma methods to restore them later
const originalRxFindFirst = prisma.prescription.findFirst;
const originalRxUpdate = prisma.prescription.update;
const originalRxMedCreateMany = prisma.prescriptionMedicine.createMany;
const originalRxMedDeleteMany = prisma.prescriptionMedicine.deleteMany;
const originalRxMedCreate = prisma.prescriptionMedicine.create;
const originalMedUpsert = prisma.medicine.upsert;
const originalMedFindFirst = prisma.medicine.findFirst;
const originalMedCreate = prisma.medicine.create;
const originalSchedCreate = prisma.medicineSchedule.create;
const originalSchedDeleteMany = prisma.medicineSchedule.deleteMany;
const originalTransaction = prisma.$transaction;

// 2. Mock prisma database clients
// @ts-ignore
prisma.prescription.findFirst = async ({ where }: any) => {
  return mockDb.prescriptions[where.id] || null;
};

// @ts-ignore
prisma.prescription.update = async ({ where, data }: any) => {
  const rx = mockDb.prescriptions[where.id];
  if (rx) {
    Object.assign(rx, data);
  }
  return rx;
};

// @ts-ignore
prisma.prescriptionMedicine.createMany = async ({ data }: any) => {
  mockDb.prescriptionMedicines.push(...data);
  return { count: data.length };
};

// @ts-ignore
prisma.prescriptionMedicine.deleteMany = async ({ where }: any) => {
  mockDb.prescriptionMedicines = mockDb.prescriptionMedicines.filter(
    (pm: any) => pm.prescriptionId !== where.prescriptionId
  );
  return { count: 0 };
};

// @ts-ignore
prisma.prescriptionMedicine.create = async ({ data }: any) => {
  const entry = { id: `pm-${Math.random()}`, ...data };
  mockDb.prescriptionMedicines.push(entry);
  return entry;
};

// @ts-ignore
prisma.medicine.upsert = async ({ where, create }: any) => {
  const name = where.name;
  let med = (Object.values(mockDb.medicines) as any[]).find((m: any) => m.name === name);
  if (!med) {
    med = { id: `med-${name.toLowerCase()}`, name, ...create };
    mockDb.medicines[med.id] = med;
  }
  return med;
};

// @ts-ignore
prisma.medicine.findFirst = async ({ where }: any) => {
  const name = where.name.equals.toLowerCase();
  return Object.values(mockDb.medicines).find((m: any) => m.name.toLowerCase() === name) || null;
};

// @ts-ignore
prisma.medicine.create = async ({ data }: any) => {
  const entry = { id: `med-${Math.random()}`, ...data };
  mockDb.medicines[entry.id] = entry;
  return entry;
};

// @ts-ignore
prisma.medicineSchedule.create = async ({ data }: any) => {
  const entry = { id: `sched-${Math.random()}`, ...data };
  mockDb.schedules.push(entry);
  return entry;
};

// @ts-ignore
prisma.medicineSchedule.deleteMany = async () => {
  mockDb.schedules = [];
  return { count: 0 };
};

// @ts-ignore
prisma.$transaction = async (cb: any) => {
  // Pass the prisma client itself since we mocked the root methods directly!
  return cb(prisma);
};

// Mock global fetch to avoid calling remote openFDA during test runs
const originalFetch = global.fetch;
global.fetch = async () => new Response(JSON.stringify({ results: [] }));

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${msg}`);
  }
}

async function runIntegrationWorkflow() {
  console.log("🧪 Starting Connected Prescription Management Workflow Integration Tests...\n");

  const rxId = "test-rx-uuid";
  
  // Step 1 & 2: Prescription is uploaded
  console.log("Step 1 & 2: Prescription uploaded & stored privately");
  mockDb.prescriptions[rxId] = {
    id: rxId,
    userId: "test-user-id",
    title: "Prescription 2026-08-30",
    status: "UPLOADED",
  };
  assert(mockDb.prescriptions[rxId].status === "UPLOADED", "Initial status should be UPLOADED");
  console.log("✅ PASS");

  // Step 3 & 4: OCR Extraction simulated
  console.log("\nStep 3 & 4: OCR Extraction simulated & confidence indicators mapped");
  const ocrRes = await startOcrExtraction(rxId);
  assert(ocrRes.success, "OCR should succeed");
  assert(mockDb.prescriptions[rxId].status === "REVIEW_REQUIRED", "Status should transition to REVIEW_REQUIRED");
  assert(mockDb.prescriptionMedicines.length === 2, "Should extract 2 medications (Metformin and Amoxicillin)");
  assert(mockDb.prescriptionMedicines[0].confidence === 0.95, "Should have Metformin confidence indicator");
  console.log("✅ PASS");

  // Step 5 & 6: User corrects name/dosage and confirms review inside transaction
  console.log("\nStep 5 & 6: User corrects name/dosage and confirms review inside transaction");
  
  // Simulated corrected values from user review form
  const correctedMedicines = [
    {
      medicineName: "Metformin Gly", // user corrected from Metformin
      dosage: "1 tablet",
      frequency: "twice daily",
      route: "ORAL",
      duration: "for 30 days",
      instructions: "after breakfast and after dinner",
    },
    {
      medicineName: "Amoxicillin",
      dosage: "1 capsule",
      frequency: "three times daily",
      route: "ORAL",
      duration: "for 7 days",
      instructions: "take with water",
    }
  ];

  // Run review saving action (triggers atomic database updates & schedule generation)
  const saveRes = await savePrescriptionReview(rxId, correctedMedicines);
  assert(saveRes.success, "Saving review should succeed");
  assert(mockDb.prescriptions[rxId].status === "CONFIRMED", "Prescription status must transition to CONFIRMED");
  assert(mockDb.prescriptionMedicines.length === 2, "Should save 2 finalized medicines");
  
  // Find Metformin in db to verify correction
  const metforminEntry = mockDb.prescriptionMedicines.find((pm: any) => pm.dosage === "1 tablet");
  const linkedMed = mockDb.medicines[metforminEntry.medicineId];
  assert(linkedMed.name === "Metformin Gly", "Metformin name should reflect user correction");
  console.log("✅ PASS");

  // Step 7: Timetable schedule verification
  console.log("\nStep 7: Timetable schedules generated from confirmed instructions");
  assert(mockDb.schedules.length === 5, "Should generate 5 time occurrence slots (2 for Metformin twice-daily, 3 for Amoxicillin three times daily)");
  
  // Verify times and offsets
  const metforminSchedules = mockDb.schedules.filter((s: any) => s.prescriptionMedicineId === metforminEntry.id);
  assert(metforminSchedules[0].scheduledTime === "08:30", "Metformin should apply food delay to 08:30");
  assert(metforminSchedules[1].scheduledTime === "20:30", "Metformin should apply food delay to 20:30");
  console.log("✅ PASS");

  // Restore original mock overrides
  delete process.env.MOCK_AUTH;
  prisma.prescription.findFirst = originalRxFindFirst;
  prisma.prescription.update = originalRxUpdate;
  prisma.prescriptionMedicine.createMany = originalRxMedCreateMany;
  prisma.prescriptionMedicine.deleteMany = originalRxMedDeleteMany;
  prisma.prescriptionMedicine.create = originalRxMedCreate;
  prisma.medicine.upsert = originalMedUpsert;
  prisma.medicine.findFirst = originalMedFindFirst;
  prisma.medicine.create = originalMedCreate;
  prisma.medicineSchedule.create = originalSchedCreate;
  prisma.medicineSchedule.deleteMany = originalSchedDeleteMany;
  prisma.$transaction = originalTransaction;
  global.fetch = originalFetch;

  console.log("\n🎉 Connected Prescription Management Workflow Integration Tests passed successfully!");
}

runIntegrationWorkflow().catch((err) => {
  console.error("❌ Integration tests failed:", err);
  process.exit(1);
});
