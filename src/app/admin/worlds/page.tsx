import { asc } from "drizzle-orm";
import { Layers3 } from "lucide-react";
import { requireRoles } from "@/auth/session";
import { db } from "@/db/client";
import { missionWorlds } from "@/db/schema";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { WorldManager } from "@/features/admin/world-manager";

export default async function Page() {
  await requireRoles(["content_admin", "super_admin"]);
  const items = await db.select().from(missionWorlds).orderBy(asc(missionWorlds.sortOrder));
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Cấu trúc nội dung"
        title="Thế giới nhiệm vụ"
        description="Sắp xếp các nhóm nhiệm vụ mà trẻ nhìn thấy trên bản đồ, đồng thời quản lý tên, hình bìa và trạng thái hiển thị."
        icon={Layers3}
      />
      <WorldManager initial={items} />
    </div>
  );
}
