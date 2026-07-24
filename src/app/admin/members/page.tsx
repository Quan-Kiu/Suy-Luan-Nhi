import type { Metadata } from "next";
import { Users } from "lucide-react";
import { requireRoles } from "@/auth/session";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { MemberManager } from "@/features/admin/member-manager";
import { listMembers } from "@/modules/admin/operations";

export const metadata: Metadata = {
  title: "Tài khoản quản trị",
};

export default async function Page() {
  const session = await requireRoles(["super_admin"]);
  const items = await listMembers();
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Quản lý quyền truy cập"
        title="Tài khoản quản trị"
        description="Xem tài khoản quản trị, giao đúng vai trò và tạm ngưng quyền truy cập khi cần. Mọi thay đổi đều được ghi lại."
        icon={Users}
      />
      <MemberManager items={items} currentUserId={session.user.id} />
    </div>
  );
}
