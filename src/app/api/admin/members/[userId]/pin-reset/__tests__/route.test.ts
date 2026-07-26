import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireApiRoles } from "@/auth/api";
import {
  AdminAccountResetError,
  auditAdminAccountResetFailure,
  resetMemberParentPin,
} from "@/modules/admin/account-reset";
import { POST } from "../route";

vi.mock("@/auth/api", () => ({ requireApiRoles: vi.fn() }));
vi.mock("@/modules/admin/account-reset", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/modules/admin/account-reset")>();
  return {
    ...actual,
    resetMemberParentPin: vi.fn(),
    auditAdminAccountResetFailure: vi.fn(),
  };
});

const userId = "parent-user";
function request(body: unknown) {
  return new Request(`http://localhost/api/admin/members/${userId}/pin-reset`, {
    method: "POST",
    headers: { "content-type": "application/json", "idempotency-key": "parent-pin-reset-key" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/admin/members/[userId]/pin-reset", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auditAdminAccountResetFailure).mockResolvedValue(undefined);
    vi.mocked(requireApiRoles).mockResolvedValue({
      session: { user: { id: "actor-user" } },
    } as Awaited<ReturnType<typeof requireApiRoles>>);
    vi.mocked(resetMemberParentPin).mockResolvedValue({ accepted: true, duplicate: false, mode: "clear" });
  });

  it("accepts a clear request", async () => {
    const response = (await POST(request({ mode: "clear" }), { params: Promise.resolve({ userId }) }))!;
    expect(response.status).toBe(200);
    expect(resetMemberParentPin).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: "actor-user",
        targetUserId: userId,
        reset: { mode: "clear" },
      }),
    );
  });

  it("validates the temporary PIN with the current parent PIN rules", async () => {
    const response = (await POST(request({ mode: "temporary_pin", temporaryPin: "123456" }), {
      params: Promise.resolve({ userId }),
    }))!;
    expect(response.status).toBe(400);
    expect(resetMemberParentPin).not.toHaveBeenCalled();
  });

  it("returns a safe parent-profile conflict without auditing the PIN", async () => {
    vi.mocked(resetMemberParentPin).mockRejectedValue(
      new AdminAccountResetError("PARENT_PROFILE_REQUIRED", "Chỉ tài khoản phụ huynh có hồ sơ"),
    );
    const response = (await POST(request({ mode: "temporary_pin", temporaryPin: "246824" }), {
      params: Promise.resolve({ userId }),
    }))!;
    expect(response.status).toBe(409);
    expect(auditAdminAccountResetFailure).toHaveBeenCalledWith(
      expect.objectContaining({ action: "ADMIN_PARENT_PIN_RESET", code: "PARENT_PROFILE_REQUIRED" }),
    );
    expect(JSON.stringify(vi.mocked(auditAdminAccountResetFailure).mock.calls)).not.toContain("246824");
  });
});
