import type { Metadata } from "next";
import { Users } from "lucide-react";
import { requireRoles } from "@/auth/session";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { MemberManager } from "@/features/admin/member-manager";
import { listMembers } from "@/modules/admin/operations";

export const metadata: Metadata = {
  title: "Thành viên & quyền",
};

export default async function Page() {
  const session = await requireRoles(["super_admin"]);
  const items = await listMembers();
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Quản lý quyền truy cập"
        title="Thành viên & quyền"
        description="Tách riêng tài khoản phụ huynh và ban quản trị, theo dõi vai trò, trạng thái và hình thức đăng nhập của từng người."
        icon={Users}
      />
      <MemberManager items={items} currentUserId={session.user.id} />
    </div>
  );
}
