import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireApiPermission } from "@/auth/api";
import {
  AdminAccountResetError,
  auditAdminAccountResetFailure,
  resetMemberPassword,
} from "@/modules/admin/account-reset";
import { POST } from "../route";

vi.mock("@/auth/api", () => ({ requireApiPermission: vi.fn() }));
vi.mock("@/modules/admin/account-reset", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/modules/admin/account-reset")>();
  return {
    ...actual,
    resetMemberPassword: vi.fn(),
    auditAdminAccountResetFailure: vi.fn(),
  };
});

const userId = "target-user";
function request(body: unknown, idempotencyKey = "password-reset-key") {
  return new Request(`http://localhost/api/admin/members/${userId}/password-reset`, {
    method: "POST",
    headers: { "content-type": "application/json", "idempotency-key": idempotencyKey },
    body: JSON.stringify(body),
  });
}

describe("POST /api/admin/members/[userId]/password-reset", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auditAdminAccountResetFailure).mockResolvedValue(undefined);
    vi.mocked(requireApiPermission).mockResolvedValue({
      session: { user: { id: "actor-user" } },
    } as Awaited<ReturnType<typeof requireApiPermission>>);
    vi.mocked(resetMemberPassword).mockResolvedValue({
      accepted: true,
      duplicate: false,
      mode: "email_link",
    });
  });

  it("requires an idempotency key", async () => {
    const response = (await POST(request({ mode: "email_link" }, ""), {
      params: Promise.resolve({ userId }),
    }))!;
    expect(response.status).toBe(400);
    expect(resetMemberPassword).not.toHaveBeenCalled();
  });

  it("passes the authenticated actor and validated request to the service", async () => {
    const response = (await POST(request({ mode: "email_link" }), {
      params: Promise.resolve({ userId }),
    }))!;
    expect(response.status).toBe(200);
    expect(resetMemberPassword).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: "actor-user",
        targetUserId: userId,
        idempotencyKey: "password-reset-key",
        reset: { mode: "email_link" },
        requestId: expect.any(String),
      }),
    );
  });

  it("returns a safe conflict and audits a rejected self-reset", async () => {
    vi.mocked(resetMemberPassword).mockRejectedValue(
      new AdminAccountResetError("SELF_RESET_NOT_ALLOWED", "Không thể tự đặt lại"),
    );
    const response = (await POST(
      request({ mode: "temporary_password", temporaryPassword: "Safe-Temp-2026" }),
      {
        params: Promise.resolve({ userId }),
      },
    ))!;
    const body = await response.json();
    expect(response.status).toBe(409);
    expect(body.error).toMatchObject({ code: "SELF_RESET_NOT_ALLOWED", message: "Không thể tự đặt lại" });
    expect(auditAdminAccountResetFailure).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: "actor-user",
        targetUserId: userId,
        action: "ADMIN_TEMP_PASSWORD_SET",
        code: "SELF_RESET_NOT_ALLOWED",
      }),
    );
    expect(JSON.stringify(vi.mocked(auditAdminAccountResetFailure).mock.calls)).not.toContain(
      "Safe-Temp-2026",
    );
  });

  it("offers the temporary-password fallback when email delivery fails", async () => {
    vi.mocked(resetMemberPassword).mockRejectedValue(new Error("SMTP unavailable"));
    const response = (await POST(request({ mode: "email_link" }), {
      params: Promise.resolve({ userId }),
    }))!;
    const body = await response.json();
    expect(response.status).toBe(503);
    expect(body.error.code).toBe("PASSWORD_RESET_EMAIL_FAILED");
    expect(body.error.message).toContain("mật khẩu tạm thời");
  });
});
