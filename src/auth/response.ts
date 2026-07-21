type RouteHandler<TArgs extends unknown[]> = (...args: TArgs) => Response | Promise<Response>;

export async function sanitizeAuthResponse(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (response.ok || !contentType.includes("application/json")) return response;

  const body = await response
    .clone()
    .json()
    .catch(() => null);
  if (!body || typeof body !== "object" || !("originalMessage" in body)) return response;

  const sanitized = { ...(body as Record<string, unknown>) };
  delete sanitized.originalMessage;
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(JSON.stringify(sanitized), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function withSanitizedAuthErrors<TArgs extends unknown[]>(handler: RouteHandler<TArgs>) {
  return async (...args: TArgs) => sanitizeAuthResponse(await handler(...args));
}
