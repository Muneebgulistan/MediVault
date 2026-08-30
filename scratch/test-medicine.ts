import { researchMedicine, OpenFdaProvider } from "../src/lib/medicines/research";
import { prisma } from "../src/lib/db/prisma";

// Mock database store
const mockDb: Record<string, any> = {
  "test-rx-med-metformin": {
    id: "test-rx-med-metformin",
    name: "Metformin",
    genericName: null,
    brandNames: [],
    category: null,
    description: null,
    sideEffects: null,
    interactions: null,
    warnings: null,
    indications: null,
    storageInfo: null,
    sourceName: null,
    sourceUrl: null,
    retrievedAt: null,
  },
  "test-rx-med-fakemed": {
    id: "test-rx-med-fakemed",
    name: "SuperFakeMedXZY123",
    genericName: null,
    brandNames: [],
    category: null,
    description: null,
    sideEffects: null,
    interactions: null,
    warnings: null,
    indications: null,
    storageInfo: null,
    sourceName: null,
    sourceUrl: null,
    retrievedAt: null,
  },
  "test-rx-med-failure": {
    id: "test-rx-med-failure",
    name: "Ibuprofen",
    genericName: null,
    brandNames: [],
    category: null,
    description: null,
    sideEffects: null,
    interactions: null,
    warnings: null,
    indications: null,
    storageInfo: null,
    sourceName: null,
    sourceUrl: null,
    retrievedAt: null,
  },
};

// Override Prisma methods for offline unit testing isolation
prisma.medicine.findUnique = (async (args: any) => {
  const id = args.where.id;
  return mockDb[id] || null;
}) as any;

prisma.medicine.update = (async (args: any) => {
  const id = args.where.id;
  if (mockDb[id]) {
    mockDb[id] = {
      ...mockDb[id],
      ...args.data,
    };
    return mockDb[id];
  }
  throw new Error(`Record ${id} not found in mock database`);
}) as any;

prisma.medicine.deleteMany = (async () => {
  return { count: 0 };
}) as any;

prisma.medicine.createMany = (async () => {
  return { count: 3 };
}) as any;

async function runMedicineTests() {
  console.log("🧪 Starting Medicine Research & Verification Layer Tests (Mocked DB)...\n");

  const testMetforminId = "test-rx-med-metformin";
  const testFakeMedId = "test-rx-med-fakemed";
  const testFailureMedId = "test-rx-med-failure";

  // Test 1: Successful Lookup (openFDA api match)
  console.log("🧪 Test 1: Successful Lookup (openFDA match)");
  const res1 = await researchMedicine(testMetforminId, "Metformin");
  console.log(`- Identified: ${res1.identified}`);
  console.log(`- Generic Name: ${res1.genericName}`);
  console.log(`- Source: ${res1.sourceName} (${res1.sourceUrl})`);
  if (!res1.identified || res1.sourceName !== "openFDA" || !res1.genericName) {
    throw new Error("Test 1 failed: Metformin was not successfully researched via openFDA");
  }
  console.log("✅ PASS");

  // Test 2: Cached Result verification
  console.log("\n🧪 Test 2: Cached Result Verification");
  // Temporarily corrupt/hijack the global fetch to throw if called
  const originalFetch = global.fetch;
  global.fetch = async () => {
    throw new Error("API was called when it should have hit the cache!");
  };

  try {
    const res2 = await researchMedicine(testMetforminId, "Metformin");
    console.log(`- Loaded from Cache. Identified: ${res2.identified}`);
    console.log(`- Cached Generic Name: ${res2.genericName}`);
    console.log(`- Source Name: ${res2.sourceName}`);
    if (!res2.identified || res2.sourceName !== "openFDA") {
      throw new Error("Test 2 failed: Cache load returned invalid data");
    }
    console.log("✅ PASS");
  } finally {
    // Restore original fetch
    global.fetch = originalFetch;
  }

  // Test 3: Ambiguous Medicine Lookup (should return identified: false cleanly)
  console.log("\n🧪 Test 3: Ambiguous Medicine Lookup (No match)");
  const res3 = await researchMedicine(testFakeMedId, "SuperFakeMedXZY123");
  console.log(`- Identified: ${res3.identified}`);
  if (res3.identified) {
    throw new Error("Test 3 failed: Fake medicine was incorrectly identified!");
  }
  console.log("✅ PASS");

  // Test 4: API Failure / Service Unavailable handling
  console.log("\n🧪 Test 4: API Failure Handling");
  global.fetch = async () => {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  };

  try {
    const res4 = await researchMedicine(testFailureMedId, "Ibuprofen");
    console.log(`- Identified status during API failure: ${res4.identified}`);
    if (res4.identified) {
      throw new Error("Test 4 failed: API error should have resulted in unidentified state");
    }
    console.log("✅ PASS");
  } finally {
    global.fetch = originalFetch;
  }

  // Test 5: Provider Abstraction Instantiation
  console.log("\n🧪 Test 5: Provider Abstraction Instantiation");
  const fdaProvider = new OpenFdaProvider();
  console.log(`- Provider Name: ${fdaProvider.name}`);
  console.log(`- Provider URL: ${fdaProvider.url}`);
  const fdaInfo = await fdaProvider.research("Metformin");
  console.log(`- Provider Research Found: ${!!fdaInfo}`);
  if (fdaProvider.name !== "openFDA" || !fdaInfo) {
    throw new Error("Test 5 failed: OpenFdaProvider failed direct lookup test");
  }
  console.log("✅ PASS");

  console.log("\n🎉 All Mocked Medicine Research & Verification layer tests passed successfully!");
}

runMedicineTests().catch((err) => {
  console.error("❌ Tests failed:", err);
  process.exit(1);
});
