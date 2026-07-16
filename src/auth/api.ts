import { apiJson } from "@/lib/api-response";
import { auth } from "@/auth/auth";
import { hasRole, type AppRole } from "@/auth/roles";

export async function getApiSession(request: Request) {
  return auth.api.getSession({ headers: request.headers });
}

export async function requireApiSession(request: Request) {
  const session = await getApiSession(request);
  if (!session) return { error: apiJson({ message: "Cần đăng nhập" }, { status: 401 }) } as const;
  return { session } as const;
}

export async function requireApiRoles(request: Request, roles: readonly AppRole[]) {
  const authResult = await requireApiSession(request);
  if ("error" in authResult) return authResult;
  if (!hasRole(authResult.session.user.role, roles))
    return {
      error: apiJson({ message: "Không có quyền thực hiện thao tác này" }, { status: 403 }),
    } as const;
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
