import { Languages } from "lucide-react";
import { requireRoles } from "@/auth/session";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { ContentManager } from "@/features/admin/content-manager";
import { listContentEntries } from "@/modules/content/content";

export default async function Page() {
  const session = await requireRoles(["content_admin", "reviewer", "super_admin"]);
  const items = await listContentEntries("vi");
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Câu chữ trong sản phẩm"
        title="Nội dung giao diện"
        description="Chỉnh sửa tiêu đề, nút bấm và thông báo mà người dùng nhìn thấy. Các mã kỹ thuật được giữ lại để hệ thống nhận đúng vị trí hiển thị."
        icon={Languages}
      />
      <ContentManager
        items={items}
        canEdit={session.user.role === "content_admin" || session.user.role === "super_admin"}
      />
    </div>
  );
}
