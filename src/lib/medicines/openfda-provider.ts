import { MedicineInfoProvider, MedicineResearchResult } from "./provider";

export interface OpenFdaLabelResult {
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

function extractField(field: unknown): string | null {
  if (!field) return null;
  if (Array.isArray(field)) {
    return field.join("\n");
  }
  return String(field);
}

/**
 * Concrete implementation of MedicineInfoProvider using the public openFDA Drug Label API.
 */
export class OpenFdaProvider implements MedicineInfoProvider {
  readonly name = "openFDA";
  readonly url = "https://open.fda.gov";

  async research(medicineName: string): Promise<Partial<MedicineResearchResult> | null> {
    const query = encodeURIComponent(medicineName);
    const url = `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${query}"+OR+openfda.brand_name:"${query}"&limit=1`;

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(10000), // 10s timeout
      });

      if (response.status === 404) {
        return null; // Not found
      }

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = (await response.json()) as { results?: OpenFdaLabelResult[] };
      const result = data?.results?.[0];

      if (!result) {
        return null;
      }

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
      const storageInfo =
        extractField(result.storage_and_handling) || extractField(result.how_supplied);

      return {
        genericName,
        brandNames,
        category,
        description,
        indications,
        sideEffects,
        warnings,
        interactions,
        storageInfo,
      };
    } catch (error) {
      console.error(`[openFDA API Error] Failed researching ${medicineName}:`, error);
      throw error; // Let orchestrator handle error/cache fallback
    }
  }
}
