import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  getOrCreateParentProfile: vi.fn(),
  resolveParentWorkspaceAccess: vi.fn(),
}));

vi.mock("@/auth/auth", () => ({ auth: { api: { getSession: mocks.getSession } } }));
vi.mock("@/modules/family/family", () => ({
  getOrCreateParentProfile: mocks.getOrCreateParentProfile,
}));
vi.mock("@/modules/parent/access-policy", () => ({
  resolveParentWorkspaceAccess: mocks.resolveParentWorkspaceAccess,
}));

import { requireApiParentGate } from "@/auth/api";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getSession.mockResolvedValue({
    user: {
      id: "parent-user",
      name: "Ba mẹ",
      role: "parent",
      banned: false,
      twoFactorEnabled: false,
    },
    session: { token: "session-token", mfaVerifiedAt: null },
  });
  mocks.getOrCreateParentProfile.mockResolvedValue({
    id: "parent-profile",
    pinHash: "pin-hash",
  });
});

describe("requireApiParentGate", () => {
  it("returns a stable code when the gate is no longer active", async () => {
    mocks.resolveParentWorkspaceAccess.mockResolvedValue({ granted: false, reason: "locked" });

    const result = await requireApiParentGate(new Request("https://example.test/api/parent/export-data"));
    expect("error" in result).toBe(true);
    if (!("error" in result)) return;

    const error = result.error!;
    const body = await error.json();
    expect(error.status).toBe(403);
    expect(body.error).toMatchObject({
      code: "PARENT_GATE_REQUIRED",
      message: "Cần mở Parent Gate trước khi thực hiện thao tác nhạy cảm",
    });
  });
});
