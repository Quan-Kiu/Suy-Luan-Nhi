export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly code = "API_ERROR",
    readonly requestId?: string,
    readonly details?: unknown,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export function getErrorMessage(error: unknown, fallback = "Có lỗi xảy ra. Vui lòng thử lại.") {
  return error instanceof Error && error.message.trim() ? error.message : fallback;
}
