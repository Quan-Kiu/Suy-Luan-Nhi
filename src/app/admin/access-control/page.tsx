import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { requirePermission } from "@/auth/session";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { MemberManager } from "@/features/admin/member-manager";
import { RoleAccessOverview } from "@/features/admin/role-access-overview";
import { listMembers, listTrashedMembers } from "@/modules/admin/operations";

export const metadata: Metadata = { title: "Vai trò & thành viên" };

export default async function Page() {
  const session = await requirePermission("access_control.view");
  const [items, trashedItems] = await Promise.all([listMembers(), listTrashedMembers()]);
  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Kiểm soát truy cập"
        title="Vai trò & thành viên"
        description="Kiểm chứng quyền của từng vai trò, gán vai trò cho tài khoản và quản lý vòng đời thành viên trong một khu vực."
        icon={ShieldCheck}
      />
      <RoleAccessOverview />
      <section id="members" aria-labelledby="members-title" className="scroll-mt-6 space-y-4">
        <div className="rounded-2xl border border-[#e4d8c5] bg-white p-4 sm:p-5">
          <h2 id="members-title" className="type-section-title">
            Thành viên và phân vai trò
          </h2>
          <p className="type-supporting mt-1 text-[#6f6558]">
            Phụ huynh và nhân sự đều có thể được đưa vào thùng rác. Tài khoản trong thùng rác bị thu hồi phiên
            đăng nhập nhưng vẫn có thể khôi phục trước khi xóa vĩnh viễn.
          </p>
        </div>
        <MemberManager items={items} trashedItems={trashedItems} currentUserId={session.user.id} />
      </section>
    </div>
  );
}
