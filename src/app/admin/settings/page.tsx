import { requireRoles } from "@/auth/session";
import { SystemSettingsManager } from "@/features/admin/system-settings-manager";
import { getSystemSettings } from "@/modules/admin/operations";
export default async function Page() {
  await requireRoles(["super_admin"]);
  const items = await getSystemSettings();
  return (
    <div>
      <h1 className="text-3xl font-black">System settings</h1>
      <p className="mt-2 mb-5 text-[#806d54]">Cấu hình động dạng JSON. Mọi thay đổi đều được audit.</p>
      <SystemSettingsManager items={items} />
    </div>
  );
}
