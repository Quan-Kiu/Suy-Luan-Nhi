import { describe, expect, it } from "vitest";
import {
  adminParentPinResetSchema,
  adminPasswordResetSchema,
  forcedPasswordChangeSchema,
} from "@/domain/admin-account-reset";

describe("admin account reset validation", () => {
  it("accepts the two supported password reset modes", () => {
    expect(adminPasswordResetSchema.safeParse({ mode: "email_link" }).success).toBe(true);
    expect(
      adminPasswordResetSchema.safeParse({
        mode: "temporary_password",
        temporaryPassword: "Temporary-Password-2026",
      }).success,
    ).toBe(true);
  });

  it("rejects weak temporary passwords and common parent PINs", () => {
    expect(
      adminPasswordResetSchema.safeParse({ mode: "temporary_password", temporaryPassword: "short" }).success,
    ).toBe(false);
    expect(
      adminParentPinResetSchema.safeParse({ mode: "temporary_pin", temporaryPin: "123456" }).success,
    ).toBe(false);
  });

  it("requires a new password that differs from the temporary password", () => {
    const result = forcedPasswordChangeSchema.safeParse({
      currentPassword: "Temporary-Password-2026",
      newPassword: "Temporary-Password-2026",
      confirmPassword: "Temporary-Password-2026",
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues.some((issue) => issue.path[0] === "newPassword")).toBe(true);
  });
});
