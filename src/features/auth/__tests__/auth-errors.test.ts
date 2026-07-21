import { describe, expect, it } from "vitest";
import {
  getAuthErrorCode,
  getAuthErrorMessage,
  isAuthError,
  toAuthFlowError,
} from "@/features/auth/auth-errors";

describe("auth error normalization", () => {
  it("uses the stable server code instead of exposing the raw library message", () => {
    const error = toAuthFlowError(
      { code: "INVALID_EMAIL_OR_PASSWORD", message: "Invalid email or password", status: 401 },
      "SIGN_IN_FAILED",
    );
    expect(getAuthErrorMessage({}, error, "SIGN_IN_FAILED")).toBe("Email hoặc mật khẩu chưa đúng.");
    expect(getAuthErrorMessage({}, error, "SIGN_IN_FAILED")).not.toContain("Invalid");
  });

  it("lets the content registry override localized copy", () => {
    const content = { "errors.invalidCredentials": "Thông tin đăng nhập chưa chính xác." };
    expect(getAuthErrorMessage(content, { code: "INVALID_EMAIL_OR_PASSWORD" }, "SIGN_IN_FAILED")).toBe(
      "Thông tin đăng nhập chưa chính xác.",
    );
  });

  it("normalizes verification and rate-limit failures", () => {
    expect(isAuthError({ code: "EMAIL_NOT_VERIFIED" }, "EMAIL_NOT_VERIFIED")).toBe(true);
    expect(getAuthErrorCode({ status: 429 }, "SIGN_IN_FAILED")).toBe("TOO_MANY_REQUESTS");
  });
});
