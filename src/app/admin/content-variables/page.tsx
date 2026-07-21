import { Braces } from "lucide-react";
import { requireRoles } from "@/auth/session";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { ContentVariableManager } from "@/features/admin/content-variable-manager";
import { getContentVariableDefinitions } from "@/modules/content/content-variables";

export default async function Page() {
  await requireRoles(["super_admin"]);
  const variables = await getContentVariableDefinitions();
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Chỉ dành cho Super Admin"
        title="Biến trong nội dung"
        description="Quản lý các tag người soạn có thể chèn vào nhiệm vụ, ví dụ {{name}}. Hệ thống sẽ thay tag bằng dữ liệu của bé đang sử dụng."
        icon={Braces}
      />
      <ContentVariableManager initial={variables} />
    </div>
  );
}
