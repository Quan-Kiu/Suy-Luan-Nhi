import { BookPlus } from "lucide-react";
import { requireRoles } from "@/auth/session";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { ResourceEditorForm } from "@/features/admin/resource-editor-form";

export default async function Page() {
  await requireRoles(["content_admin", "super_admin"]);
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Tài nguyên cho phụ huynh"
        title="Tạo tài nguyên mới"
        description="Soạn nội dung, chọn loại, chủ đề, nhóm tuổi và trạng thái hiển thị. Có thể lưu nháp trước khi xuất bản."
        icon={BookPlus}
      />
      <ResourceEditorForm />
    </div>
  );
}
