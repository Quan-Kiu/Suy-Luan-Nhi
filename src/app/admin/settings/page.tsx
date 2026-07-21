import { Settings } from "lucide-react";
import { requireRoles } from "@/auth/session";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { ImageUploadPolicyManager } from "@/features/admin/image-upload-policy-manager";
import { SystemSettingsManager } from "@/features/admin/system-settings-manager";
import { mediaUploadPolicySettingKey } from "@/domain/media-upload-policy";
import { getSystemSettings } from "@/modules/admin/operations";
import { getImageUploadPolicies } from "@/modules/media/upload-policy";

export default async function Page() {
  await requireRoles(["super_admin"]);
  const [items, imageUploadPolicies] = await Promise.all([getSystemSettings(), getImageUploadPolicies()]);
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Chỉ dành cho quản trị viên"
        title="Cài đặt nâng cao"
        description="Bật, tắt hoặc điều chỉnh những thiết lập ảnh hưởng đến toàn hệ thống. Mỗi thay đổi đều được lưu trong lịch sử để có thể kiểm tra lại."
        icon={Settings}
      />
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        <strong className="block">
          Chỉ thay đổi khi bạn hiểu rõ cài đặt này ảnh hưởng đến phần nào của hệ thống.
        </strong>
        Chỉ thay đổi một thiết lập mỗi lần, sau đó kiểm tra màn hình liên quan. Nội dung kỹ thuật được thu gọn
        trong phần nâng cao.
      </div>
      <ImageUploadPolicyManager initialPolicies={imageUploadPolicies} />
      <SystemSettingsManager items={items.filter((item) => item.key !== mediaUploadPolicySettingKey)} />
    </div>
  );
}
