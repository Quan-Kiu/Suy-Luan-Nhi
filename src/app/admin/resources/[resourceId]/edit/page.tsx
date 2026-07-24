import type { Metadata } from "next";
import { FilePenLine } from "lucide-react";
import { notFound } from "next/navigation";
import { requireRoles } from "@/auth/session";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { ResourceEditorForm } from "@/features/admin/resource-editor-form";
import { getAdminResource } from "@/modules/admin/resource-admin";

export const metadata: Metadata = {
  title: "Chỉnh sửa bài viết",
};

export default async function Page({ params }: { params: Promise<{ resourceId: string }> }) {
  await requireRoles(["content_admin", "super_admin"]);
  const { resourceId } = await params;
  const resource = await getAdminResource(resourceId);
  if (!resource) notFound();
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Tài nguyên cho phụ huynh"
        title={`Chỉnh sửa: ${resource.title}`}
        description="Cập nhật nội dung và phân loại. Thay đổi được ghi lại trong nhật ký quản trị."
        icon={FilePenLine}
      />
      <ResourceEditorForm resource={resource} />
    </div>
  );
}
