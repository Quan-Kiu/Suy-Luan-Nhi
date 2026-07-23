import { describe, expect, it } from "vitest";
import { isActiveBan, requiresStaffMfa } from "@/auth/access-policy";

describe("auth access policy", () => {
  it("treats permanent and future bans as active", () => {
    expect(isActiveBan({ banned: true, banExpires: null })).toBe(true);
    expect(
      isActiveBan(
        { banned: true, banExpires: "2026-08-01T00:00:00.000Z" },
        new Date("2026-07-22T00:00:00.000Z"),
      ),
    ).toBe(true);
  });

  it("allows an expired temporary ban", () => {
    expect(
      isActiveBan(
        { banned: true, banExpires: "2026-07-01T00:00:00.000Z" },
        new Date("2026-07-22T00:00:00.000Z"),
      ),
    ).toBe(false);
  });

  it("requires MFA only for staff without an enabled factor", () => {
    expect(requiresStaffMfa({ role: "super_admin", twoFactorEnabled: false })).toBe(true);
    expect(requiresStaffMfa({ role: "reviewer", twoFactorEnabled: true })).toBe(false);
    expect(requiresStaffMfa({ role: "parent", twoFactorEnabled: false })).toBe(false);
  });
});
