import { Settings } from "lucide-react";
import { requireRoles } from "@/auth/session";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { SystemSettingsManager } from "@/features/admin/system-settings-manager";
import { getSystemSettings } from "@/modules/admin/operations";

export default async function Page() {
  await requireRoles(["super_admin"]);
  const items = await getSystemSettings();
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Chỉ dành cho quản trị viên"
        title="Cấu hình hệ thống"
        description="Bật, tắt hoặc điều chỉnh những thiết lập ảnh hưởng đến toàn hệ thống. Mỗi thay đổi đều được lưu trong lịch sử để có thể kiểm tra lại."
        icon={Settings}
      />
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        <strong className="block">Kiểm tra tác động trước khi lưu</strong>
        Chỉ thay đổi một thiết lập mỗi lần, sau đó kiểm tra màn hình liên quan. Nội dung kỹ thuật được thu gọn
        trong phần nâng cao.
      </div>
      <SystemSettingsManager items={items} />
    </div>
  );
}
