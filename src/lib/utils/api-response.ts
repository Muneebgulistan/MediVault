import { NextResponse } from "next/server";

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export class ApiResponseBuilder {
  static success<T>(
    data: T,
    message?: string,
    status = 200,
    meta?: Record<string, unknown>
  ): NextResponse<ApiSuccessResponse<T>> {
    return NextResponse.json(
      {
        success: true,
        data,
        ...(message && { message }),
        ...(meta && { meta }),
      },
      { status }
    );
  }

  static error(
    message: string,
    code = "INTERNAL_SERVER_ERROR",
    status = 500,
    details?: unknown
  ): NextResponse<ApiErrorResponse> {
    return NextResponse.json(
      {
        success: false,
        error: {
          code,
          message,
          ...(details !== undefined && { details }),
        },
      },
      { status }
    );
  }
}
