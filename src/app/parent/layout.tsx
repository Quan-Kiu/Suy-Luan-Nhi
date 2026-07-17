import { redirect } from "next/navigation";
import { requireParent } from "@/auth/session";
import { ParentGateView } from "@/features/parent/parent-gate-view";
import { ParentShell } from "@/features/parent/parent-shell";
import { getContentNamespace } from "@/modules/content/content";
import { getActiveChild } from "@/modules/family/active-child";
import { getOrCreateParentProfile } from "@/modules/family/family";
import { hasParentGate } from "@/modules/family/parent-gate";
import { getUnreadNotificationCount } from "@/modules/parent/parent-data";

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const [session, content] = await Promise.all([requireParent(), getContentNamespace("parent")]);
  const parent = await getOrCreateParentProfile(session.user.id, session.user.name);
  const unlocked = await hasParentGate(parent.id);

  if (!unlocked) {
    return <ParentGateView hasPin={Boolean(parent.pinHash)} content={content} />;
  }

  const active = await getActiveChild();
  if (!active) redirect("/onboarding");
  const unread = await getUnreadNotificationCount(parent.id);

  return (
    <ParentShell childName={active.child.displayName} unread={unread} content={content}>
      {children}
    </ParentShell>
  );
}
