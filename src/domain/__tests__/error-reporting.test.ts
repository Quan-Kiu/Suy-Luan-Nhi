import { describe, expect, it } from "vitest";
import {
  automaticErrorReportSchema,
  normalizeUnknownError,
  redactErrorText,
  sanitizeRoutePath,
} from "@/domain/error-reporting";

describe("automatic error reporting privacy", () => {
  it("redacts identifiers, contact details, tokens, and URL query values", () => {
    const text = redactErrorText(
      "User child@example.com failed at https://example.test/path?token=secret#section with 123456789 and 550e8400-e29b-41d4-a716-446655440000 Bearer abc.def.ghi",
    );

    expect(text).not.toContain("child@example.com");
    expect(text).not.toContain("token=secret");
    expect(text).not.toContain("123456789");
    expect(text).not.toContain("550e8400-e29b-41d4-a716-446655440000");
    expect(text).not.toContain("abc.def.ghi");
    expect(text).toContain("[redacted-email]");
    expect(text).toContain("https://example.test/path");
  });

  it("removes query strings and redacts dynamic identifiers in route paths", () => {
    expect(
      sanitizeRoutePath(
        "https://example.test/child/550e8400-e29b-41d4-a716-446655440000/mission?answer=private",
      ),
    ).toBe("/child/:id/mission");
  });

  it("normalizes unknown errors without serializing arbitrary objects", () => {
    expect(normalizeUnknownError({ privateValue: "secret" })).toEqual({
      name: "Error",
      message: "Đã xảy ra lỗi không xác định",
    });
  });

  it("accepts a bounded privacy-safe automatic report", () => {
    const parsed = automaticErrorReportSchema.safeParse({
      source: "api_failure",
      pagePath: "/parent/settings",
      error: {
        name: "Error",
        message: "API PATCH /api/parent/settings thất bại",
        details: { status: 500, requestId: "request-redacted" },
      },
      breadcrumbs: [
        {
          timestamp: new Date().toISOString(),
          category: "interaction",
          action: "form.submit",
          data: { method: "POST" },
        },
      ],
      viewportWidth: 1280,
      viewportHeight: 720,
      devicePixelRatio: 1,
    });

    expect(parsed.success).toBe(true);
  });
});
