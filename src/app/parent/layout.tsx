import { redirect } from "next/navigation";
import { hasRole, staffRoles } from "@/auth/roles";
import { buildParentPinSetupPath } from "@/auth/navigation";
import { requireParent } from "@/auth/session";
import { ParentGateView } from "@/features/parent/parent-gate-view";
import { ParentShell } from "@/features/parent/parent-shell";
import { getContentNamespace } from "@/modules/content/content";
import { getActiveChild } from "@/modules/family/active-child";
import { getOrCreateParentProfile } from "@/modules/family/family";
import { resolveParentWorkspaceAccess } from "@/modules/parent/access-policy";
import { getUnreadNotificationCount } from "@/modules/parent/parent-data";
import { getOperationalSystemSettings } from "@/modules/system-settings/runtime";

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const [session, content, systemSettings] = await Promise.all([
    requireParent(),
    getContentNamespace("parent"),
    getOperationalSystemSettings(),
  ]);
  const parent = await getOrCreateParentProfile(session.user.id, session.user.name);
  const access = await resolveParentWorkspaceAccess({
    role: session.user.role,
    parentProfileId: parent.id,
    pinHash: parent.pinHash,
    sessionToken: session.session.token,
  });
  if (!access.granted && access.reason === "pin_not_set") {
    redirect(buildParentPinSetupPath("/parent"));
  }
  if (!access.granted) return <ParentGateView content={content} />;

  const active = await getActiveChild();
  if (!active) redirect("/onboarding");
  const unread = await getUnreadNotificationCount(parent.id);

  return (
    <ParentShell
      childName={active.child.displayName}
      unread={unread}
      content={content}
      resourcesEnabled={systemSettings.features.parentResourcesEnabled}
      canAccessAdmin={hasRole(session.user.role, staffRoles)}
    >
      {children}
    </ParentShell>
  );
}
