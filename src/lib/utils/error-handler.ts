import { ApiResponseBuilder } from "@/lib/utils/api-response";
import { ZodError } from "zod";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 500, code = "APP_ERROR", details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Requested resource not found") {
    super(message, 404, "NOT_FOUND");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized access") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", details?: unknown) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

export function handleApiError(error: unknown) {
  console.error("API Error caught:", error);

  if (error instanceof AppError) {
    return ApiResponseBuilder.error(error.message, error.code, error.statusCode, error.details);
  }

  if (error instanceof ZodError) {
    return ApiResponseBuilder.error(
      "Validation failed",
      "VALIDATION_ERROR",
      400,
      error.flatten().fieldErrors
    );
  }

  const message = error instanceof Error ? error.message : "An unexpected error occurred";
  return ApiResponseBuilder.error(message, "INTERNAL_SERVER_ERROR", 500);
}
