import type { Metadata } from "next";
import { Braces } from "lucide-react";
import { requireRoles } from "@/auth/session";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { ContentVariableManager } from "@/features/admin/content-variable-manager";
import { getContentVariableDefinitions } from "@/modules/content/content-variables";

export const metadata: Metadata = {
  title: "Từ điển",
};

export default async function Page() {
  await requireRoles(["super_admin"]);
  const variables = await getContentVariableDefinitions();
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Chỉ dành cho Super Admin"
        title="Từ điển"
        description="Quản lý những thông tin hệ thống có thể tự điền vào nội dung, chẳng hạn tên bé. Ví dụ: {{name}} sẽ được thay bằng tên của bé đang sử dụng."
        icon={Braces}
      />
      <ContentVariableManager initial={variables} />
    </div>
  );
}
