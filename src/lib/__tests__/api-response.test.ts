import { describe, expect, it } from "vitest";
import { apiJson } from "@/lib/api-response";

describe("apiJson", () => {
  it("wraps successful data with metadata and request id", async () => {
    const response = apiJson({ id: "child-1" }, { status: 201 });
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toMatchObject({ success: true, data: { id: "child-1" } });
    expect(body.meta.requestId).toBe(response.headers.get("x-request-id"));
    expect(body.meta.timestamp).toEqual(expect.any(String));
  });

  it("wraps errors with a stable code and details", async () => {
    const response = apiJson(
      { message: "Dữ liệu chưa hợp lệ", issues: { name: ["Bắt buộc"] } },
      { status: 400 },
    );
    const body = await response.json();

    expect(body).toMatchObject({
      success: false,
      error: { code: "BAD_REQUEST", message: "Dữ liệu chưa hợp lệ" },
    });
    expect(body.error.details.issues).toEqual({ name: ["Bắt buộc"] });
  });
});
