import "@/lib/validation/zod-locale";

export type ApiMeta = {
  requestId: string;
  timestamp: string;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta: ApiMeta;
};

export type ApiFailure = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: ApiMeta;
};
const errorCodes: Record<number, string> = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  422: "UNPROCESSABLE_ENTITY",
  428: "PRECONDITION_REQUIRED",
  429: "RATE_LIMITED",
  500: "INTERNAL_ERROR",
  503: "SERVICE_UNAVAILABLE",
};

function responseMeta(requestId = crypto.randomUUID()): ApiMeta {
  return { requestId, timestamp: new Date().toISOString() };
}

function withRequestId(init: ResponseInit | undefined, requestId: string): ResponseInit {
  const headers = new Headers(init?.headers);
  headers.set("x-request-id", requestId);
  return { ...init, headers };
}
export function apiJson<T>(body: T, init?: ResponseInit): Response {
  const status = init?.status ?? 200;
  const requestId = new Headers(init?.headers).get("x-request-id") ?? crypto.randomUUID();
  if (status >= 400) {
    const source = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
    const message = typeof source.message === "string" ? source.message : "Có lỗi xảy ra";
    const code = typeof source.code === "string" ? source.code : (errorCodes[status] ?? "API_ERROR");
    const details = Object.fromEntries(
      Object.entries(source).filter(([key]) => key !== "message" && key !== "code"),
    );
    const payload: ApiFailure = {
      success: false,
      error: { code, message, ...(Object.keys(details).length ? { details } : {}) },
      meta: responseMeta(requestId),
    };
    return Response.json(payload, withRequestId(init, requestId));
  }
  const payload: ApiSuccess<T> = { success: true, data: body, meta: responseMeta(requestId) };
  return Response.json(payload, withRequestId(init, requestId));
}
