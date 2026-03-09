export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number = 500, code: string = "INTERNAL_ERROR") {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

export async function createSafeResponse<T>(
  fn: () => Promise<T>
): Promise<ActionResponse<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        success: false,
        error: error.message,
        code: error.code,
      };
    }

    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";

    return {
      success: false,
      error: message,
      code: "INTERNAL_ERROR",
    };
  }
}
