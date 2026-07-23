import { apiJson } from "@/lib/api-response";
import { isActiveBan, requiresStaffMfa } from "@/auth/access-policy";
import { auth } from "@/auth/auth";
import { hasRole, type AppRole } from "@/auth/roles";
import { env } from "@/config/env";

async function readApiSession(request: Request) {
  return auth.api.getSession({ headers: request.headers });
}

export async function getApiSession(request: Request) {
  const session = await readApiSession(request);
  return session && !isActiveBan(session.user) ? session : null;
}

export async function requireApiSession(request: Request) {
  const session = await readApiSession(request);
  if (!session) return { error: apiJson({ message: "Cần đăng nhập" }, { status: 401 }) } as const;
  if (isActiveBan(session.user)) {
    return {
      error: apiJson(
        { code: "ACCOUNT_BANNED", message: "Tài khoản đã bị tạm ngưng. Vui lòng liên hệ quản trị viên." },
        { status: 403 },
      ),
    } as const;
  }
  return { session } as const;
}

export async function requireApiRoles(request: Request, roles: readonly AppRole[]) {
  const authResult = await requireApiSession(request);
  if ("error" in authResult) return authResult;
  if (!hasRole(authResult.session.user.role, roles))
    return {
      error: apiJson({ message: "Không có quyền thực hiện thao tác này" }, { status: 403 }),
    } as const;
  if (env.AUTH_STAFF_MFA_REQUIRED && requiresStaffMfa(authResult.session.user)) {
    return {
      error: apiJson(
        {
          code: "MFA_SETUP_REQUIRED",
          message: "Tài khoản nhân sự cần bật xác thực hai lớp trước khi tiếp tục.",
        },
        { status: 403 },
      ),
    } as const;
  }
  return authResult;
}

export async function requireApiParentGate(request: Request) {
  const authResult = await requireApiRoles(request, ["parent", "super_admin"]);
  if ("error" in authResult) return authResult;
  const { getOrCreateParentProfile } = await import("@/modules/family/family");
  const { hasParentGate } = await import("@/modules/family/parent-gate");
  const parent = await getOrCreateParentProfile(authResult.session.user.id, authResult.session.user.name);
  if (!(await hasParentGate(parent.id))) {
    return {
      error: apiJson(
        { message: "Cần mở Parent Gate trước khi thực hiện thao tác nhạy cảm" },
        { status: 403 },
      ),
    } as const;
  }
  return { ...authResult, parent } as const;
}
