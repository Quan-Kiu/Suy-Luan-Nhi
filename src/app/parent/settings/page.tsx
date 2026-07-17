import { redirect } from "next/navigation";
import { SettingsForm } from "@/features/parent/settings-form";
import { getActiveChild } from "@/modules/family/active-child";

export default async function Page() {
  const active = await getActiveChild();
  if (!active) redirect("/onboarding");
  const { parent, child } = active;
  return (
    <>
      <h1 className="text-3xl font-black">Cài đặt gia đình</h1>
      <p className="mt-2 mb-5 text-[#806d54]">
        Âm thanh, thông báo, Parent PIN và quyền dữ liệu được lưu theo tài khoản phụ huynh.
      </p>
      <SettingsForm
        childId={child.id}
        initial={{
          soundEnabled: parent.soundEnabled,
          effectsEnabled: parent.effectsEnabled,
          notificationSettings: parent.notificationSettings,
          privacySettings: parent.privacySettings,
        }}
      />
    </>
  );
}
