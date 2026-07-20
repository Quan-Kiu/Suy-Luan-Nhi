import { BookPlus } from "lucide-react";
import { requireRoles } from "@/auth/session";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { ResourceEditorForm } from "@/features/admin/resource-editor-form";

export default async function Page() {
  await requireRoles(["content_admin", "super_admin"]);
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Gợi ý cho phụ huynh"
        title="Viết nội dung cho phụ huynh"
        description="Viết bài, hướng dẫn hoặc hoạt động bằng ngôn ngữ thực tế; chọn nhóm tuổi phù hợp và lưu nháp trước khi xuất bản."
        icon={BookPlus}
      />
      <ResourceEditorForm />
    </div>
  );
}
