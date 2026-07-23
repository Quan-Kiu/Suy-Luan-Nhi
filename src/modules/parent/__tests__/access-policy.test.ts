import { beforeEach, describe, expect, it, vi } from "vitest";
import { hasAdminParentGate, hasParentGate } from "@/modules/family/parent-gate";
import { resolveParentWorkspaceAccess } from "@/modules/parent/access-policy";

vi.mock("@/modules/family/parent-gate", () => ({
  hasAdminParentGate: vi.fn(),
  hasParentGate: vi.fn(),
}));

const baseInput = {
  parentProfileId: "parent-1",
  pinHash: null,
  sessionToken: "session-token",
};

describe("resolveParentWorkspaceAccess", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hasAdminParentGate).mockResolvedValue(false);
    vi.mocked(hasParentGate).mockResolvedValue(false);
  });

  it("accepts a protected Super Admin bridge even when no parent PIN exists", async () => {
    vi.mocked(hasAdminParentGate).mockResolvedValue(true);

    await expect(resolveParentWorkspaceAccess({ ...baseInput, role: "super_admin" })).resolves.toEqual({
      granted: true,
      source: "admin",
    });
    expect(hasAdminParentGate).toHaveBeenCalledWith("parent-1", "session-token");
    expect(hasParentGate).not.toHaveBeenCalled();
  });

  it("does not let a direct Super Admin visit bypass a missing PIN", async () => {
    await expect(resolveParentWorkspaceAccess({ ...baseInput, role: "super_admin" })).resolves.toEqual({
      granted: false,
      reason: "pin_not_set",
    });
  });

  it("accepts the normal PIN gate for parent accounts", async () => {
    vi.mocked(hasParentGate).mockResolvedValue(true);

    await expect(
      resolveParentWorkspaceAccess({ ...baseInput, role: "parent", pinHash: "pin-hash" }),
    ).resolves.toEqual({ granted: true, source: "pin" });
  });

  it("keeps the workspace locked when neither gate is valid", async () => {
    await expect(
      resolveParentWorkspaceAccess({ ...baseInput, role: "parent", pinHash: "pin-hash" }),
    ).resolves.toEqual({ granted: false, reason: "locked" });
  });
});
