import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { resolveEffectiveAccess } from "@/auth/effective-access";
import { requirePermission } from "@/auth/session";
import { AccessControlWorkspace } from "@/features/admin/access-control-workspace";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { listAccessRoles } from "@/modules/admin/access-roles";
import { listMembers, listTrashedMembers } from "@/modules/admin/operations";

export const metadata: Metadata = { title: "Vai trò & thành viên" };

type SearchParams = Promise<{ tab?: string | string[] }>;

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const session = await requirePermission("access_control.view");
  const params = await searchParams;
  const requestedTab = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const initialTab = requestedTab === "members" ? "members" : "roles";
  const access = await resolveEffectiveAccess(session.user);
  const canManageMembers = access.permissions.includes("members.manage");
  const [roles, items, trashedItems] = await Promise.all([
    listAccessRoles(),
    canManageMembers ? listMembers() : Promise.resolve([]),
    canManageMembers ? listTrashedMembers() : Promise.resolve([]),
  ]);
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Kiểm soát truy cập"
        title="Vai trò & thành viên"
        description="Tách riêng việc thiết kế role và quản lý tài khoản để dễ kiểm tra quyền, gán role và xử lý vòng đời thành viên."
        icon={ShieldCheck}
      />
      <AccessControlWorkspace
        initialTab={initialTab}
        roles={roles}
        members={items}
        trashedMembers={trashedItems}
        currentUserId={session.user.id}
        canManageRoles={access.permissions.includes("roles.manage")}
        canManageMembers={canManageMembers}
      />
    </div>
  );
}
