import { prisma } from "@/lib/db/prisma";
import { MedicineResearchResult } from "./provider";
import { OpenFdaProvider } from "./openfda-provider";

const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 Days Cache TTL
const primaryProvider = new OpenFdaProvider();

/**
 * Researches a medicine using the OpenFdaProvider with database caching.
 * Resolves cache matches, API errors, and rate limits.
 */
export async function researchMedicine(
  medicineId: string,
  medicineName: string
): Promise<MedicineResearchResult> {
  // 1. Check local database cache
  const medicine = await prisma.medicine.findUnique({
    where: { id: medicineId },
  });

  if (medicine) {
    const hasValidCache =
      medicine.retrievedAt &&
      Date.now() - medicine.retrievedAt.getTime() < CACHE_TTL_MS;

    if (hasValidCache && medicine.sourceName) {
      return {
        identified: true,
        medicineName: medicine.name,
        genericName: medicine.genericName,
        brandNames: medicine.brandNames,
        category: medicine.category,
        description: medicine.description,
        sideEffects: medicine.sideEffects,
        interactions: medicine.interactions,
        warnings: medicine.warnings,
        indications: medicine.indications,
        storageInfo: medicine.storageInfo,
        sourceName: medicine.sourceName,
        sourceUrl: medicine.sourceUrl,
        retrievedAt: medicine.retrievedAt,
      };
    }
  }

  // 2. Query the primary provider
  try {
    const info = await primaryProvider.research(medicineName);

    if (!info) {
      // Medicine not identified by provider
      return {
        identified: false,
        medicineName,
        brandNames: [],
      };
    }

    const sourceName = primaryProvider.name;
    const sourceUrl = primaryProvider.url;
    const retrievedAt = new Date();

    // 3. Save cache to database
    await prisma.medicine.update({
      where: { id: medicineId },
      data: {
        genericName: info.genericName,
        brandNames: info.brandNames || [],
        category: info.category,
        description: info.description,
        sideEffects: info.sideEffects,
        interactions: info.interactions,
        warnings: info.warnings,
        indications: info.indications,
        storageInfo: info.storageInfo,
        sourceName,
        sourceUrl,
        retrievedAt,
      },
    });

    return {
      identified: true,
      medicineName,
      genericName: info.genericName,
      brandNames: info.brandNames || [],
      category: info.category,
      description: info.description,
      indications: info.indications,
      sideEffects: info.sideEffects,
      warnings: info.warnings,
      interactions: info.interactions,
      storageInfo: info.storageInfo,
      sourceName,
      sourceUrl,
      retrievedAt,
    };
  } catch (error) {
    console.error(`[Medicine Research Error] Failed to research "${medicineName}":`, error);

    // Fall back to database values if available, even if cache is expired
    if (medicine && medicine.sourceName) {
      return {
        identified: true,
        medicineName: medicine.name,
        genericName: medicine.genericName,
        brandNames: medicine.brandNames,
        category: medicine.category,
        description: medicine.description,
        sideEffects: medicine.sideEffects,
        interactions: medicine.interactions,
        warnings: medicine.warnings,
        indications: medicine.indications,
        storageInfo: medicine.storageInfo,
        sourceName: medicine.sourceName,
        sourceUrl: medicine.sourceUrl,
        retrievedAt: medicine.retrievedAt,
      };
    }

    // Otherwise, return identified: false to trigger user-facing verification warning
    return {
      identified: false,
      medicineName,
      brandNames: [],
    };
  }
}
export { OpenFdaProvider };
