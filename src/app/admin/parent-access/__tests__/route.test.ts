import { beforeEach, describe, expect, it, vi } from "vitest";
import { requirePermission } from "@/auth/session";
import { getOrCreateParentProfile } from "@/modules/family/family";
import { grantAdminParentGate } from "@/modules/family/parent-gate";
import { GET } from "../route";

const { redirect } = vi.hoisted(() => ({
  redirect: vi.fn((path: string): never => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/auth/session", () => ({ requirePermission: vi.fn() }));
vi.mock("@/modules/family/family", () => ({ getOrCreateParentProfile: vi.fn() }));
vi.mock("@/modules/family/parent-gate", () => ({ grantAdminParentGate: vi.fn() }));

describe("GET /admin/parent-access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requirePermission).mockResolvedValue({
      user: { id: "admin-1", name: "Super Admin" },
      session: { token: "session-token" },
    } as Awaited<ReturnType<typeof requirePermission>>);
    vi.mocked(getOrCreateParentProfile).mockResolvedValue({
      id: "parent-1",
      pinHash: null,
    } as Awaited<ReturnType<typeof getOrCreateParentProfile>>);
  });

  it("grants session-bound admin access before redirecting", async () => {
    await expect(GET()).rejects.toThrow("REDIRECT:/parent");

    expect(requirePermission).toHaveBeenCalledWith("parent_access.use");
    expect(grantAdminParentGate).toHaveBeenCalledWith("parent-1", "session-token");
  });
});
