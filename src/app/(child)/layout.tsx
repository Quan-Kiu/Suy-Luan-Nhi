import { redirect } from "next/navigation";
import { buildParentPinSetupPath } from "@/auth/navigation";
import { requireParent } from "@/auth/session";
import { ChildShell } from "@/components/child-shell";
import { ActiveChildProvider } from "@/features/child/active-child-context";
import { ChildHeader } from "@/features/child/child-header";
import { SoundEffectsProvider } from "@/features/sound/sound-effects-provider";
import { getActiveChild } from "@/modules/family/active-child";
import { getOrCreateParentProfile } from "@/modules/family/family";

export default async function ChildLayout({ children }: { children: React.ReactNode }) {
  const session = await requireParent();
  const parent = await getOrCreateParentProfile(session.user.id, session.user.name);
  if (!parent.pinHash) redirect(buildParentPinSetupPath("/profiles"));

  const active = await getActiveChild();
  const child = active
    ? {
        id: active.child.id,
        displayName: active.child.displayName,
        ageGroup: active.child.ageGroup,
      }
    : null;
  const childStateKey = child ? `${child.id}:${child.displayName}:${child.ageGroup}` : "no-active-child";
  return (
    <SoundEffectsProvider
      enabled={active?.parent.soundEnabled ?? false}
      celebrationsEnabled={active?.parent.effectsEnabled ?? false}
    >
      <ActiveChildProvider key={childStateKey} child={child}>
        <ChildShell>
          <ChildHeader />
          {children}
        </ChildShell>
      </ActiveChildProvider>
    </SoundEffectsProvider>
  );
}
