import { redirect } from "next/navigation";
import { SettingsForm } from "@/features/parent/settings-form";
import { ParentShell } from "@/features/parent/parent-shell";
import { getActiveChild } from "@/modules/family/active-child";
import { requireParentWorkspace } from "@/modules/parent/access";
import { getParentDashboard } from "@/modules/parent/parent-data";
export default async function Page() {
  const { parent } = await requireParentWorkspace();
  const active = await getActiveChild();
  if (!active) redirect("/onboarding");
  const dashboard = await getParentDashboard(active.child.id, parent.id);
  return (
    <ParentShell childName={active.child.displayName} unread={dashboard.unreadNotifications}>
      <h1 className="text-3xl font-black">Cài đặt gia đình</h1>
      <p className="mt-2 mb-5 text-[#806d54]">
        Âm thanh, thông báo, Parent PIN và quyền dữ liệu được lưu theo tài khoản phụ huynh.
      </p>
      <SettingsForm
        childId={active.child.id}
        initial={{
          soundEnabled: parent.soundEnabled,
          effectsEnabled: parent.effectsEnabled,
          notificationSettings: parent.notificationSettings,
          privacySettings: parent.privacySettings,
        }}
      />
    </ParentShell>
  );
}
