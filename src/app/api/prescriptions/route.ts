import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { ApiResponseBuilder } from "@/lib/utils/api-response";
import { handleApiError } from "@/lib/utils/error-handler";

/**
 * GET /api/prescriptions — returns prescriptions belonging to the authenticated user only.
 * The userId is resolved from the server-side session — never from a query param or body.
 */
export async function GET() {
  try {
    const userId = await requireAuth();

    const prescriptions = await prisma.prescription.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        doctorName: true,
        prescriptionDate: true,
        status: true,
        createdAt: true,
        _count: { select: { medicines: true, files: true } },
      },
    });

    return ApiResponseBuilder.success(prescriptions);
  } catch (error) {
    return handleApiError(error);
  }
}
