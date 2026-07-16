import type { ApiFailure, ApiSuccess } from "@/lib/api-response";

type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

function isEnvelope<T>(value: unknown): value is ApiEnvelope<T> {
  return (
    typeof value === "object" && value !== null && "success" in value && typeof value.success === "boolean"
  );
}

export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly code = "API_ERROR",
    readonly requestId?: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}
export async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!(init?.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(url, { ...init, headers });
  const text = await response.text();
  let body: unknown = null;

  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      throw new ApiRequestError(
        response.ok ? "Máy chủ trả về dữ liệu không hợp lệ" : `Yêu cầu thất bại (${response.status})`,
        "INVALID_RESPONSE",
        response.headers.get("x-request-id") ?? undefined,
      );
    }
  }
  if (isEnvelope<T>(body)) {
    if (body.success) return body.data;
    throw new ApiRequestError(body.error.message, body.error.code, body.meta.requestId, body.error.details);
  }

  if (!response.ok) {
    const source = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
    throw new ApiRequestError(
      typeof source.message === "string" ? source.message : "Có lỗi xảy ra",
      typeof source.code === "string" ? source.code : "API_ERROR",
      response.headers.get("x-request-id") ?? undefined,
      source,
    );
  }

  return body as T;
}
