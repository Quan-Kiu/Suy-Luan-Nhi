import type { ApiFailure, ApiSuccess } from "@/lib/api-response";
import { ApiRequestError } from "@/lib/api/error";

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

export function isApiEnvelope<T>(value: unknown): value is ApiEnvelope<T> {
  return (
    typeof value === "object" && value !== null && "success" in value && typeof value.success === "boolean"
  );
}

export function unwrapApiEnvelope<T>(value: unknown, status?: number): T {
  if (!isApiEnvelope<T>(value)) return value as T;
  if (value.success) return value.data;

  throw new ApiRequestError(
    value.error.message,
    value.error.code,
    value.meta.requestId,
    value.error.details,
    status,
  );
}
