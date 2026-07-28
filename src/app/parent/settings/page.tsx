import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountSecurityPanel } from "@/features/parent/account-security-panel";
import { SettingsForm } from "@/features/parent/settings-form";
import { getActiveChild } from "@/modules/family/active-child";
import { getAccountSecurityOverview } from "@/modules/account/session-security";
import { requireParentWorkspace } from "@/modules/parent/access";

export const metadata: Metadata = {
  title: "Cài đặt gia đình",
};

export default async function Page() {
  const [active, workspace] = await Promise.all([getActiveChild(), requireParentWorkspace()]);
  if (!active) redirect("/onboarding");
  const { parent, child } = active;
  const securityOverview = await getAccountSecurityOverview(
    workspace.session.user.id,
    workspace.session.session.id,
  );
  return (
    <>
      <h1 className="type-page-title">Cài đặt gia đình</h1>
      <p className="mt-2 mb-5 text-[#786348]">
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
      {securityOverview ? <AccountSecurityPanel initialData={securityOverview} /> : null}
    </>
  );
}
