import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireApiRoles: vi.fn(),
  requireParentGate: vi.fn(),
  updateParentSettings: vi.fn(),
  grantParentGate: vi.fn(),
}));

vi.mock("@/auth/api", () => ({
  requireApiRoles: mocks.requireApiRoles,
  requireApiParentGateForAuthorizedSession: mocks.requireParentGate,
}));
vi.mock("@/modules/family/family", () => ({ updateParentSettings: mocks.updateParentSettings }));
vi.mock("@/modules/family/parent-gate", () => ({ grantParentGate: mocks.grantParentGate }));

import { PATCH } from "@/app/api/parent/settings/route";

const session = {
  user: { id: "parent-user", name: "Ba mẹ", role: "parent" },
  session: { token: "session-token" },
};

function request(body: Record<string, unknown>) {
  return new Request("https://example.test/api/parent/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireApiRoles.mockResolvedValue({ session });
  mocks.requireParentGate.mockResolvedValue({ granted: true, parent: { id: "parent-profile" } });
  mocks.updateParentSettings.mockResolvedValue({ id: "parent-profile", pinHash: null });
});

describe("PATCH /api/parent/settings", () => {
  it("saves routine preferences without requiring an active Parent Gate", async () => {
    const response = await PATCH(request({ privacySettings: { errorReporting: true } }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual({ updated: true });
    expect(mocks.requireApiRoles).toHaveBeenCalledWith(expect.any(Request), ["parent", "super_admin"]);
    expect(mocks.requireParentGate).not.toHaveBeenCalled();
    expect(mocks.updateParentSettings).toHaveBeenCalledWith("parent-user", "Ba mẹ", {
      privacySettings: { errorReporting: true },
    });
  });

  it("keeps PIN changes protected by the Parent Gate", async () => {
    const forbidden = Response.json(
      {
        success: false,
        error: { code: "PARENT_GATE_REQUIRED", message: "Cần mở Parent Gate" },
      },
      { status: 403 },
    );
    mocks.requireParentGate.mockResolvedValue({ granted: false, error: forbidden });

    const response = await PATCH(request({ pin: "135790" }));

    expect(response.status).toBe(403);
    expect(mocks.requireParentGate).toHaveBeenCalledWith(session);
    expect(mocks.updateParentSettings).not.toHaveBeenCalled();
    expect(mocks.grantParentGate).not.toHaveBeenCalled();
  });

  it("rotates the gate token after an authorized PIN change", async () => {
    mocks.updateParentSettings.mockResolvedValue({
      id: "parent-profile",
      pinHash: "new-pin-hash",
    });

    const response = await PATCH(request({ pin: "135790" }));

    expect(response.status).toBe(200);
    expect(mocks.requireParentGate).toHaveBeenCalledWith(session);
    expect(mocks.grantParentGate).toHaveBeenCalledWith("parent-profile", "new-pin-hash");
  });
});
