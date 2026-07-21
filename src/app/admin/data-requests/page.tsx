import { desc, eq } from "drizzle-orm";
import { ShieldCheck } from "lucide-react";
import { requireRoles } from "@/auth/session";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { DataRequestManager } from "@/features/admin/data-request-manager";
import { db } from "@/db/client";
import { dataRequests, parentProfiles, user } from "@/db/schema";

export default async function Page() {
  await requireRoles(["super_admin"]);
  const items = await db
    .select({
      id: dataRequests.id,
      type: dataRequests.type,
      status: dataRequests.status,
      requestedAt: dataRequests.requestedAt,
      completedAt: dataRequests.completedAt,
      parentDisplayName: parentProfiles.displayName,
      userEmail: user.email,
    })
    .from(dataRequests)
    .innerJoin(parentProfiles, eq(dataRequests.parentProfileId, parentProfiles.id))
    .innerJoin(user, eq(parentProfiles.userId, user.id))
    .orderBy(desc(dataRequests.requestedAt));
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Quyền riêng tư gia đình"
        title="Xuất và xóa dữ liệu"
        description="Theo dõi yêu cầu tải xuống hoặc xóa dữ liệu. Yêu cầu xóa cần quản trị viên xác nhận và mọi thao tác đều được ghi lại."
        icon={ShieldCheck}
      />
      <DataRequestManager items={items} />
    </div>
  );
}
