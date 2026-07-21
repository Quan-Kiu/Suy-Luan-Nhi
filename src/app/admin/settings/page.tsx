import { Settings } from "lucide-react";
import { requireRoles } from "@/auth/session";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { ImageUploadPolicyManager } from "@/features/admin/image-upload-policy-manager";
import { SystemSettingsManager } from "@/features/admin/system-settings-manager";
import { getImageUploadPolicies } from "@/modules/media/upload-policy";
import { getManagedSystemSettingsForDashboard } from "@/modules/system-settings/runtime";

export default async function Page() {
  await requireRoles(["super_admin"]);
  const [items, imageUploadPolicies] = await Promise.all([
    getManagedSystemSettingsForDashboard(),
    getImageUploadPolicies(),
  ]);
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Chỉ dành cho quản trị viên"
        title="Cấu hình hệ thống"
        description="Quản lý chế độ bảo trì, các chức năng đang hoạt động và những giới hạn vận hành an toàn. Mỗi thay đổi đều được lưu trong lịch sử."
        icon={Settings}
      />
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        <strong className="block">
          Chỉ thay đổi khi bạn hiểu rõ cài đặt này ảnh hưởng đến phần nào của hệ thống.
        </strong>
        Chỉ thay đổi một thiết lập mỗi lần, sau đó kiểm tra màn hình liên quan. Nội dung kỹ thuật được thu gọn
        trong phần nâng cao.
      </div>
      <SystemSettingsManager items={items} />
      <ImageUploadPolicyManager initialPolicies={imageUploadPolicies} />
    </div>
  );
}
