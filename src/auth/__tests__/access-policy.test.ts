import { describe, expect, it } from "vitest";
import {
  isActiveBan,
  isDeletedAccount,
  requiresStaffMfa,
  requiresStaffMfaChallenge,
} from "@/auth/access-policy";

describe("auth access policy", () => {
  it("recognizes accounts moved to trash", () => {
    expect(isDeletedAccount({ deletedAt: "2026-07-27T00:00:00.000Z" })).toBe(true);
    expect(isDeletedAccount({ deletedAt: null })).toBe(false);
  });

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

  it("requires MFA setup only for staff without an enabled factor", () => {
    expect(requiresStaffMfa({ role: "super_admin", twoFactorEnabled: false })).toBe(true);
    expect(requiresStaffMfa({ role: "reviewer", twoFactorEnabled: true })).toBe(false);
    expect(requiresStaffMfa({ role: "parent", twoFactorEnabled: false })).toBe(false);
  });

  it("requires a per-session MFA challenge for staff with an unverified session", () => {
    expect(
      requiresStaffMfaChallenge({ role: "super_admin", twoFactorEnabled: true }, { mfaVerifiedAt: null }),
    ).toBe(true);
    expect(
      requiresStaffMfaChallenge(
        { role: "reviewer", twoFactorEnabled: true },
        { mfaVerifiedAt: new Date("2026-07-23T09:00:00.000Z") },
      ),
    ).toBe(false);
    expect(
      requiresStaffMfaChallenge({ role: "parent", twoFactorEnabled: true }, { mfaVerifiedAt: null }),
    ).toBe(false);
  });
});
