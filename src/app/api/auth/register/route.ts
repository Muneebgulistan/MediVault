import { prisma } from "@/lib/db/prisma";
import { SignUpSchema } from "@/lib/validation/auth-schemas";
import { ApiResponseBuilder } from "@/lib/utils/api-response";
import { handleApiError, AppError } from "@/lib/utils/error-handler";
import { hashPassword } from "@/lib/auth/password";
import { isRateLimited, getClientIp } from "@/lib/security/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    if (isRateLimited(`register:${ip}`, 5, 15 * 60 * 1000)) {
      return ApiResponseBuilder.error(
        "Too many registration attempts. Please try again in 15 minutes.",
        "RATE_LIMIT_EXCEEDED",
        429
      );
    }

    const body = await req.json();
    const parsed = SignUpSchema.safeParse(body);

    if (!parsed.success) {
      return ApiResponseBuilder.error(
        "Validation failed",
        "VALIDATION_ERROR",
        400,
        parsed.error.flatten().fieldErrors
      );
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError("An account with this email already exists.", 409, "EMAIL_TAKEN");
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    return ApiResponseBuilder.success(user, "Account created successfully.", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
