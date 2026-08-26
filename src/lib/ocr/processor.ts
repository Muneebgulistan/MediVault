export interface OcrResult {
  rawText: string;
  confidence: number;
}

export interface AiExtractionResult {
  medicines: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;
}

export async function processPrescriptionImage(_fileBuffer: Buffer): Promise<OcrResult> {
  return {
    rawText: "",
    confidence: 0,
  };
}

export async function extractPrescriptionInfo(_ocrText: string): Promise<AiExtractionResult> {
  return {
    medicines: [],
  };
}
