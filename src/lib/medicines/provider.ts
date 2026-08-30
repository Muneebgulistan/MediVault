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

/**
 * Standard interface for medicine information providers.
 * Allows multiple sources (e.g. openFDA, PubChem) to be integrated modularly.
 */
export interface MedicineInfoProvider {
  readonly name: string;
  readonly url: string;

  /**
   * Researches medicine information by name.
   * Returns a partial MedicineResearchResult if found, or null if not found.
   */
  research(medicineName: string): Promise<Partial<MedicineResearchResult> | null>;
}
