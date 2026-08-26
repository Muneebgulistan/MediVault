import { requirePrescriptionOwnership } from "@/lib/auth/authorization";
import { prisma } from "@/lib/db/prisma";
import { ApiResponseBuilder } from "@/lib/utils/api-response";
import { handleApiError } from "@/lib/utils/error-handler";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/prescriptions/[id] — returns a specific prescription only if it belongs to the authenticated user.
 */
export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    // This verifies ownership from the session — throws if unauthorized
    await requirePrescriptionOwnership(id);

    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: {
        files: true,
        medicines: { include: { medicine: true } },
      },
    });

    return ApiResponseBuilder.success(prescription);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/prescriptions/[id] — deletes a prescription only if it belongs to the authenticated user.
 */
export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    await requirePrescriptionOwnership(id);

    await prisma.prescription.delete({ where: { id } });

    return ApiResponseBuilder.success(null, "Prescription deleted.");
  } catch (error) {
    return handleApiError(error);
  }
}
