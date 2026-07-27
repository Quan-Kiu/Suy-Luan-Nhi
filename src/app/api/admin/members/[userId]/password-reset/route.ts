import { requireApiPermission } from "@/auth/api";
import { adminPasswordResetSchema } from "@/domain/admin-account-reset";
import { apiJson } from "@/lib/api-response";
import {
  AdminAccountResetError,
  auditAdminAccountResetFailure,
  resetMemberPassword,
} from "@/modules/admin/account-reset";

function requestContext(request: Request) {
  return {
    requestId: request.headers.get("x-request-id") ?? crypto.randomUUID(),
    idempotencyKey: request.headers.get("idempotency-key")?.trim() ?? "",
  };
}

function errorStatus(error: AdminAccountResetError) {
  if (error.code === "TARGET_NOT_FOUND") return 404;
  if (error.code === "RATE_LIMITED") return 429;
  return 409;
}

export async function POST(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const authResult = await requireApiPermission(request, "members.manage");
  if ("error" in authResult) return authResult.error;

  const context = requestContext(request);
  if (context.idempotencyKey.length < 8 || context.idempotencyKey.length > 200) {
    return apiJson(
      { code: "INVALID_IDEMPOTENCY_KEY", message: "Thiếu mã chống gửi lặp hợp lệ" },
      { status: 400, headers: { "x-request-id": context.requestId } },
    );
  }
  const parsed = adminPasswordResetSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return apiJson(
      { message: parsed.error.issues[0]?.message ?? "Dữ liệu đặt lại mật khẩu không hợp lệ" },
      { status: 400, headers: { "x-request-id": context.requestId } },
    );
  }

  const { userId } = await params;
  const action =
    parsed.data.mode === "email_link" ? "ADMIN_PASSWORD_RESET_REQUESTED" : "ADMIN_TEMP_PASSWORD_SET";
  try {
    const result = await resetMemberPassword({
      actorId: authResult.session.user.id,
      targetUserId: userId,
      requestId: context.requestId,
      idempotencyKey: context.idempotencyKey,
      requestHeaders: request.headers,
      reset: parsed.data,
    });
    return apiJson(result, { headers: { "x-request-id": context.requestId } });
  } catch (error) {
    const code = error instanceof AdminAccountResetError ? error.code : "PASSWORD_RESET_FAILED";
    await auditAdminAccountResetFailure({
      actorId: authResult.session.user.id,
      targetUserId: userId,
      action,
      requestId: context.requestId,
      code,
    }).catch(() => undefined);
    if (error instanceof AdminAccountResetError) {
      return apiJson(
        { code: error.code, message: error.message },
        { status: errorStatus(error), headers: { "x-request-id": context.requestId } },
      );
    }
    if (parsed.data.mode === "email_link") {
      return apiJson(
        {
          code: "PASSWORD_RESET_EMAIL_FAILED",
          message: "Chưa thể gửi email đặt lại mật khẩu. Hãy dùng phương án mật khẩu tạm thời.",
        },
        { status: 503, headers: { "x-request-id": context.requestId } },
      );
    }
    throw error;
  }
}
