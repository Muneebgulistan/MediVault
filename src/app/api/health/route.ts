import { ApiResponseBuilder } from "@/lib/utils/api-response";
import { handleApiError } from "@/lib/utils/error-handler";

export async function GET() {
  try {
    return ApiResponseBuilder.success(
      {
        status: "healthy",
        name: "MediVault AI API",
        version: "0.1.0",
        timestamp: new Date().toISOString(),
      },
      "API health status"
    );
  } catch (error) {
    return handleApiError(error);
  }
}
