import { apiJson } from "@/lib/api-response";
import {
  isActiveBan,
  isDeletedAccount,
  requiresStaffMfa,
  requiresStaffMfaChallenge,
} from "@/auth/access-policy";
import { auth } from "@/auth/auth";
import type { PermissionKey } from "@/auth/permissions";
import { hasEffectivePermission } from "@/auth/effective-access";
import { hasRole, type AppRole } from "@/auth/roles";
import { env } from "@/config/env";

async function readApiSession(request: Request) {
  return auth.api.getSession({ headers: request.headers });
}

type ApiSession = NonNullable<Awaited<ReturnType<typeof readApiSession>>>;

export async function getApiSession(request: Request) {
  const session = await readApiSession(request);
  return session && !isDeletedAccount(session.user) && !isActiveBan(session.user) ? session : null;
}

export async function requireApiSession(request: Request) {
  const session = await readApiSession(request);
  if (!session) return { error: apiJson({ message: "Cần đăng nhập" }, { status: 401 }) } as const;
  if (isDeletedAccount(session.user)) {
    return {
      error: apiJson(
        {
          code: "ACCOUNT_DELETED",
          message: "Tài khoản đang ở trong thùng rác. Vui lòng liên hệ quản trị viên.",
        },
        { status: 403 },
      ),
    } as const;
  }
  if (isActiveBan(session.user)) {
    return {
      error: apiJson(
        { code: "ACCOUNT_BANNED", message: "Tài khoản đã bị tạm ngưng. Vui lòng liên hệ quản trị viên." },
        { status: 403 },
      ),
    } as const;
  }
  if (session.user.mustChangePassword) {
    return {
      error: apiJson(
        { code: "PASSWORD_CHANGE_REQUIRED", message: "Cần đổi mật khẩu tạm thời trước khi tiếp tục." },
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
  if (
    env.AUTH_STAFF_MFA_REQUIRED &&
    requiresStaffMfaChallenge(authResult.session.user, authResult.session.session)
  ) {
    return {
      error: apiJson(
        {
          code: "MFA_CHALLENGE_REQUIRED",
          message: "Hãy nhập mã xác thực hai lớp để hoàn tất phiên đăng nhập này.",
        },
        { status: 403 },
      ),
    } as const;
  }
  return authResult;
}

export async function requireApiPermission(request: Request, permission: PermissionKey) {
  const authResult = await requireApiSession(request);
  if ("error" in authResult) return authResult;
  if (!(await hasEffectivePermission(authResult.session.user, permission))) {
    return {
      error: apiJson({ message: "Không có quyền thực hiện thao tác này" }, { status: 403 }),
    } as const;
  }
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
  if (
    env.AUTH_STAFF_MFA_REQUIRED &&
    requiresStaffMfaChallenge(authResult.session.user, authResult.session.session)
  ) {
    return {
      error: apiJson(
        {
          code: "MFA_CHALLENGE_REQUIRED",
          message: "Hãy nhập mã xác thực hai lớp để hoàn tất phiên đăng nhập này.",
        },
        { status: 403 },
      ),
    } as const;
  }
  return authResult;
}

export async function requireApiParentGateForAuthorizedSession(session: ApiSession) {
  const [{ getOrCreateParentProfile }, { resolveParentWorkspaceAccess }] = await Promise.all([
    import("@/modules/family/family"),
    import("@/modules/parent/access-policy"),
  ]);
  const parent = await getOrCreateParentProfile(session.user.id, session.user.name);
  const access = await resolveParentWorkspaceAccess({
    role: session.user.role,
    parentProfileId: parent.id,
    pinHash: parent.pinHash,
    sessionToken: session.session.token,
  });
  if (!access.granted) {
    return {
      granted: false,
      error: apiJson(
        {
          code: "PARENT_GATE_REQUIRED",
          message: "Cần mở Parent Gate trước khi thực hiện thao tác nhạy cảm",
        },
        { status: 403 },
      ),
    } as const;
  }
  return { granted: true, parent } as const;
}

export async function requireApiParentGate(request: Request) {
  const authResult = await requireApiRoles(request, ["parent", "super_admin"]);
  if ("error" in authResult) return authResult;
  const gateResult = await requireApiParentGateForAuthorizedSession(authResult.session);
  if (!gateResult.granted) return { error: gateResult.error } as const;
  return { ...authResult, parent: gateResult.parent } as const;
}
