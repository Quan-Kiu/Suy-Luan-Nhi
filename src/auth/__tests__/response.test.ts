import { describe, expect, it } from "vitest";
import { sanitizeAuthResponse } from "@/auth/response";

describe("auth response sanitization", () => {
  it("removes the untranslated internal message from localized errors", async () => {
    const response = new Response(
      JSON.stringify({
        code: "INVALID_EMAIL_OR_PASSWORD",
        message: "Email hoặc mật khẩu chưa đúng.",
        originalMessage: "Invalid email or password",
      }),
      { status: 401, headers: { "content-type": "application/json" } },
    );

    const sanitized = await sanitizeAuthResponse(response);
    expect(await sanitized.json()).toEqual({
      code: "INVALID_EMAIL_OR_PASSWORD",
      message: "Email hoặc mật khẩu chưa đúng.",
    });
  });

  it("leaves successful and non-json responses untouched", async () => {
    const success = new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
    const redirect = new Response(null, { status: 302, headers: { location: "/profiles" } });
    expect(await sanitizeAuthResponse(success)).toBe(success);
    expect(await sanitizeAuthResponse(redirect)).toBe(redirect);
  });
});
