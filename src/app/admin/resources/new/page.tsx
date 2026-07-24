import type { Metadata } from "next";
import { BookPlus } from "lucide-react";
import { requireRoles } from "@/auth/session";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { ResourceEditorForm } from "@/features/admin/resource-editor-form";

export const metadata: Metadata = {
  title: "Viết bài cho phụ huynh",
};

export default async function Page() {
  await requireRoles(["content_admin", "super_admin"]);
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Nội dung dành cho phụ huynh"
        title="Viết bài cho phụ huynh"
        description="Viết nội dung rõ ràng, chọn nhóm tuổi phù hợp và lưu bản nháp trước khi cho phụ huynh xem."
        icon={BookPlus}
      />
      <ResourceEditorForm />
    </div>
  );
}
