import { prisma } from "@/lib/db/prisma";

export interface MedicineResearchResult {
  identified: boolean;
  medicineName: string;
  genericName?: string | null;
  brandNames: string[];
  category?: string | null;
  description?: string | null;
  indications?: string | null;
  sideEffects?: string | null;
  warnings?: string | null;
  interactions?: string | null;
  storageInfo?: string | null;
  sourceName?: string | null;
  sourceUrl?: string | null;
  retrievedAt?: Date | null;
}

const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 Days Cache TTL

function extractField(field: unknown): string | null {
  if (!field) return null;
  if (Array.isArray(field)) {
    return field.join("\n");
  }
  return String(field);
}

interface OpenFdaLabelResult {
  openfda?: {
    generic_name?: string[];
    brand_name?: string[];
    route?: string[];
  };
  description?: string[];
  information_for_patients?: string[];
  indications_and_usage?: string[];
  adverse_reactions?: string[];
  warnings?: string[];
  warnings_and_cautions?: string[];
  drug_interactions?: string[];
  storage_and_handling?: string[];
  how_supplied?: string[];
}

/**
 * Researches a medicine using openFDA API with caching in the local database.
 * Enforces rate limiting fallbacks and handles errors gracefully.
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

    // Return cached results if valid and identified previously
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

  // 2. Fetch from openFDA label endpoint
  const query = encodeURIComponent(medicineName);
  const url = `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${query}"+OR+openfda.brand_name:"${query}"&limit=1`;

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000), // 10s API timeout
    });

    if (response.status === 404) {
      // Medicine not found in openFDA
      return {
        identified: false,
        medicineName,
        brandNames: [],
      };
    }

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = (await response.json()) as { results?: OpenFdaLabelResult[] };
    const result = data?.results?.[0];

    if (!result) {
      return {
        identified: false,
        medicineName,
        brandNames: [],
      };
    }

    // 3. Extract and sanitize fields
    const genericName = extractField(result.openfda?.generic_name) || medicineName;
    const brandNames = Array.isArray(result.openfda?.brand_name)
      ? (result.openfda.brand_name as string[])
      : [];
    const category = extractField(result.openfda?.route) || "Medication";
    const description =
      extractField(result.description) ||
      extractField(result.information_for_patients) ||
      "No description available.";
    const indications = extractField(result.indications_and_usage);
    const sideEffects = extractField(result.adverse_reactions);
    const warnings = extractField(result.warnings) || extractField(result.warnings_and_cautions);
    const interactions = extractField(result.drug_interactions);
    const storageInfo = extractField(result.storage_and_handling) || extractField(result.how_supplied);

    const sourceName = "openFDA";
    const sourceUrl = "https://open.fda.gov";
    const retrievedAt = new Date();

    // 4. Cache in the database
    await prisma.medicine.update({
      where: { id: medicineId },
      data: {
        genericName,
        brandNames,
        category,
        description,
        sideEffects,
        interactions,
        warnings,
        indications,
        storageInfo,
        sourceName,
        sourceUrl,
        retrievedAt,
      },
    });

    return {
      identified: true,
      medicineName,
      genericName,
      brandNames,
      category,
      description,
      indications,
      sideEffects,
      warnings,
      interactions,
      storageInfo,
      sourceName,
      sourceUrl,
      retrievedAt,
    };
  } catch (error) {
    console.error(`[openFDA API Error] Failed researching ${medicineName}:`, error);
    
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

    // Otherwise, return identified: false to trigger fallback advice
    return {
      identified: false,
      medicineName,
      brandNames: [],
    };
  }
}
