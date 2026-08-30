import { requirePrescriptionOwnership } from "@/lib/auth/authorization";
import { prisma } from "@/lib/db/prisma";
import { storage } from "@/lib/storage/provider";
import { ApiResponseBuilder } from "@/lib/utils/api-response";
import { handleApiError } from "@/lib/utils/error-handler";

interface RouteContext {
  params: Promise<{
    prescriptionId: string;
    fileId: string;
  }>;
}

export const dynamic = "force-dynamic";

/**
 * GET /api/files/[prescriptionId]/[fileId]
 * Serves a prescription document securely.
 * Checks session authentication and verifies that the authenticated user owns the prescription.
 * Leaks no information if unauthorized or if file doesn't exist.
 */
export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const { prescriptionId, fileId } = await params;

    // 1. Enforce user isolation & authorization check (throws if not owned by the session user)
    await requirePrescriptionOwnership(prescriptionId);

    // 2. Fetch the file metadata from database
    const fileRecord = await prisma.prescriptionFile.findFirst({
      where: {
        id: fileId,
        prescriptionId: prescriptionId,
      },
      select: {
        storagePath: true,
        mimeType: true,
      },
    });

    if (!fileRecord) {
      return ApiResponseBuilder.error("File not found", "NOT_FOUND", 404);
    }

    // 3. Retrieve raw buffer from private storage provider
    const fileBuffer = await storage.getFileBuffer(fileRecord.storagePath);

    // 4. Return secure binary response with correct MIME headers
    return new Response(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": fileRecord.mimeType,
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
