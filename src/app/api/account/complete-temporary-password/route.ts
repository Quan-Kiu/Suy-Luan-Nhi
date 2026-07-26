import { isActiveBan } from "@/auth/access-policy";
import { auth } from "@/auth/auth";
import { forcedPasswordChangeSchema } from "@/domain/admin-account-reset";
import { apiJson } from "@/lib/api-response";
import { completeForcedPasswordChange } from "@/modules/admin/account-reset";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return apiJson({ message: "Cần đăng nhập" }, { status: 401 });
  if (isActiveBan(session.user)) {
    return apiJson(
      { code: "ACCOUNT_BANNED", message: "Tài khoản đã bị tạm ngưng. Vui lòng liên hệ quản trị viên." },
      { status: 403 },
    );
  }
  if (!session.user.mustChangePassword) {
    return apiJson(
      { code: "PASSWORD_CHANGE_NOT_REQUIRED", message: "Tài khoản không cần đổi mật khẩu tạm thời" },
      { status: 409 },
    );
  }

  const parsed = forcedPasswordChangeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return apiJson({ message: parsed.error.issues[0]?.message }, { status: 400 });
  }
  try {
    const result = await completeForcedPasswordChange({
      userId: session.user.id,
      currentSessionId: session.session.id,
      currentPassword: parsed.data.currentPassword,
      newPassword: parsed.data.newPassword,
    });
    return apiJson(result);
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_CURRENT_PASSWORD") {
      return apiJson(
        { code: "INVALID_CURRENT_PASSWORD", message: "Mật khẩu tạm thời chưa đúng" },
        { status: 400 },
      );
    }
    throw error;
  }
}
