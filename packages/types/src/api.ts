/**
 * API Response Types
 *
 * Standard API response patterns for all applications
 * Based on Next.js 15 and REST best practices
 */

export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

export type ApiResponse<T, E = unknown> =
  | { success: true; data: T; error?: never }
  | {
      success: false;
      data?: never;
      error: { code: string; message: string; details?: E };
    };

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function isSuccessResponse<T, E>(
  response: ApiResponse<T, E>
): response is ApiResponse<T, E> & { success: true } {
  return response.success === true;
}
