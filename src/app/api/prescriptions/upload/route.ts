import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { storage } from "@/lib/storage/provider";
import { ApiResponseBuilder } from "@/lib/utils/api-response";
import { handleApiError, AppError } from "@/lib/utils/error-handler";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

/**
 * Validates actual file bytes using header magic number matching.
 * Returns the matching validated MIME type, or null if invalid.
 */
function validateFileSignature(buffer: Buffer): string | null {
  if (buffer.length < 4) return null;

  const hex = buffer.toString("hex", 0, 8).toUpperCase();

  // Check PDF signature (%PDF-)
  if (hex.startsWith("25504446")) {
    return "application/pdf";
  }
  // Check PNG signature
  if (hex.startsWith("89504E47")) {
    return "image/png";
  }
  // Check JPEG signature
  if (hex.startsWith("FFD8FF")) {
    return "image/jpeg";
  }
  // Check WebP signature (RIFF ... WEBP)
  if (hex.startsWith("52494646") && buffer.toString("hex", 8, 12).toUpperCase() === "57454250") {
    return "image/webp";
  }

  return null;
}

/**
 * POST /api/prescriptions/upload
 * Secure prescription upload endpoint.
 * Accepts multipart/form-data.
 */
export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const userId = await requireAuth();

    // 2. Parse request formData
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const customTitle = formData.get("title") as string | null;

    if (!file) {
      throw new AppError("No file uploaded.", 400, "MISSING_FILE");
    }

    // 3. Size validation
    if (file.size > MAX_FILE_SIZE) {
      throw new AppError("File size exceeds 10MB limit.", 400, "FILE_TOO_LARGE");
    }

    // Convert file to buffer for signature verification
    const fileBytes = await file.arrayBuffer();
    const buffer = Buffer.from(fileBytes);

    // 4. Validate MIME type by magic byte signatures
    const validatedMime = validateFileSignature(buffer);
    if (!validatedMime) {
      throw new AppError(
        "Invalid file format. Only JPG, JPEG, PNG, WEBP, and PDF are supported.",
        400,
        "INVALID_FILE_TYPE"
      );
    }

    // 5. Generate secure cryptographically random storage path key
    const fileExtension = validatedMime.split("/")[1];
    const secureFileKey = `${crypto.randomUUID()}.${fileExtension}`;

    // 6. Upload file to private storage provider
    await storage.uploadFile(buffer, secureFileKey, validatedMime);

    // 7. Write to database atomically
    const title = customTitle?.trim() || `Prescription ${new Date().toLocaleDateString()}`;

    const prescription = await prisma.prescription.create({
      data: {
        userId,
        title,
        status: "UPLOADED",
        files: {
          create: [
            {
              originalFilename: file.name || secureFileKey,
              storagePath: secureFileKey,
              mimeType: validatedMime,
              fileSize: file.size,
            },
          ],
        },
      },
      select: {
        id: true,
      },
    });

    return ApiResponseBuilder.success(
      { prescriptionId: prescription.id },
      "Prescription uploaded and created successfully.",
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
