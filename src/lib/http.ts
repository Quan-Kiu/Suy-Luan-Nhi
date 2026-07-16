export async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const text = await response.text();
  let body: unknown = null;

  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      throw new Error(
        response.ok ? "Máy chủ trả về dữ liệu không hợp lệ" : `Yêu cầu thất bại (${response.status})`,
      );
    }
  }

  if (!response.ok) {
    const message =
      typeof body === "object" && body && "message" in body && typeof body.message === "string"
        ? body.message
        : "Có lỗi xảy ra";
    throw new Error(message);
  }

  return body as T;
}
