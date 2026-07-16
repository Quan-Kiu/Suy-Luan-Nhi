import { desc, eq } from "drizzle-orm";
import { requireRoles } from "@/auth/session";
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
    <div>
      <h1 className="text-3xl font-black">Data requests</h1>
      <p className="mt-2 mb-5 text-[#806d54]">
        Xuất dữ liệu được hoàn thành ngay; xóa dữ liệu cần super admin xác nhận và được audit.
      </p>
      <DataRequestManager items={items} />
    </div>
  );
}
