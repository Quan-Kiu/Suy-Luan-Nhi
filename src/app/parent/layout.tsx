import { redirect } from "next/navigation";
import { hasRole, staffRoles } from "@/auth/roles";
import { requireParent } from "@/auth/session";
import { ParentGateView } from "@/features/parent/parent-gate-view";
import { ParentShell } from "@/features/parent/parent-shell";
import { getContentNamespace } from "@/modules/content/content";
import { getActiveChild } from "@/modules/family/active-child";
import { getOrCreateParentProfile } from "@/modules/family/family";
import { createParentMathChallenge } from "@/modules/family/parent-challenge";
import { hasParentGate } from "@/modules/family/parent-gate";
import { getUnreadNotificationCount } from "@/modules/parent/parent-data";
import { getOperationalSystemSettings } from "@/modules/system-settings/runtime";

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const [session, content, systemSettings] = await Promise.all([
    requireParent(),
    getContentNamespace("parent"),
    getOperationalSystemSettings(),
  ]);
  const parent = await getOrCreateParentProfile(session.user.id, session.user.name);
  const unlocked = await hasParentGate(parent.id);

  if (!unlocked) {
    return (
      <ParentGateView
        hasPin={Boolean(parent.pinHash)}
        challenge={createParentMathChallenge()}
        content={content}
      />
    );
  }

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
