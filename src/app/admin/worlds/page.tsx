import { Layers3 } from "lucide-react";
import { requireRoles } from "@/auth/session";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { WorldManager } from "@/features/admin/world-manager";
import { listAdminWorlds } from "@/modules/admin/operations";

export default async function Page() {
  await requireRoles(["content_admin", "super_admin"]);
  const items = await listAdminWorlds();
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Nhóm nhiệm vụ trên bản đồ"
        title="Chủ đề nhiệm vụ"
        description="Sắp xếp các chủ đề mà bé nhìn thấy trên bản đồ, đồng thời quản lý tên, ảnh bìa và trạng thái hiển thị."
        icon={Layers3}
      />
      <WorldManager initial={items} />
    </div>
  );
}
