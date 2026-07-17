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
        title="Cài đặt nâng cao"
        description="Các giá trị tại đây ảnh hưởng trực tiếp đến cách hệ thống hoạt động. Chỉ thay đổi khi đã xác định rõ tác động và phương án khôi phục."
        icon={Settings}
      />
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        <strong className="block">Khu vực kỹ thuật</strong>
        Dữ liệu cấu hình vẫn dùng định dạng JSON để đảm bảo tính linh hoạt. Mọi thay đổi đều được ghi vào nhật
        ký.
      </div>
      <SystemSettingsManager items={items} />
    </div>
  );
}
