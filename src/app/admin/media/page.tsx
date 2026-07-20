import { ImageIcon } from "lucide-react";
import { hasRole } from "@/auth/roles";
import { requireStaff } from "@/auth/session";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { MediaLibrary } from "@/features/admin/media-library";
import { listMedia } from "@/modules/media/media";

export default async function Page() {
  const session = await requireStaff();
  const result = await listMedia({ page: 1, pageSize: 16 });
  const initialData = {
    ...result,
    items: result.items.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() })),
  };
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Tư liệu dùng trong nhiệm vụ"
        title="Hình ảnh & âm thanh"
        description="Tải lên, xem lại và xác nhận tư liệu phù hợp trước khi dùng trong nội dung dành cho trẻ."
        icon={ImageIcon}
      />
      <MediaLibrary
        initialData={initialData}
        canReview={hasRole(session.user.role, ["reviewer", "super_admin"])}
        canUpload={hasRole(session.user.role, ["content_admin", "super_admin"])}
        canDelete={hasRole(session.user.role, ["content_admin", "super_admin"])}
      />
    </div>
  );
}
