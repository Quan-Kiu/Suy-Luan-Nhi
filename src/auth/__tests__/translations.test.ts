import { describe, expect, it } from "vitest";
import { resolveAuthLocale, viAuthTranslations } from "@/auth/translations";

describe("Better Auth translations", () => {
  it("resolves supported browser locale formats", () => {
    expect(resolveAuthLocale("vi-VN")).toBe("vi");
    expect(resolveAuthLocale("en-US,en;q=0.9")).toBe("en");
    expect(resolveAuthLocale("fr-FR")).toBeNull();
  });

  it("provides Vietnamese messages for critical authentication codes", () => {
    expect(viAuthTranslations.INVALID_EMAIL_OR_PASSWORD).toBe("Email hoặc mật khẩu chưa đúng.");
    expect(viAuthTranslations.EMAIL_NOT_VERIFIED).toBe("Email chưa được xác minh.");
  });
});
