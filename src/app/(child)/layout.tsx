import { ChildShell } from "@/components/child-shell";
import { ActiveChildProvider } from "@/features/child/active-child-context";
import { ChildHeader } from "@/features/child/child-header";
import { SoundEffectsProvider } from "@/features/sound/sound-effects-provider";
import { getActiveChild } from "@/modules/family/active-child";

export default async function ChildLayout({ children }: { children: React.ReactNode }) {
  const active = await getActiveChild();
  return (
    <SoundEffectsProvider
      enabled={active?.parent.soundEnabled ?? false}
      celebrationsEnabled={active?.parent.effectsEnabled ?? false}
    >
      <ActiveChildProvider
        child={
          active
            ? {
                id: active.child.id,
                displayName: active.child.displayName,
                ageGroup: active.child.ageGroup,
              }
            : null
        }
      >
        <ChildShell>
          <ChildHeader />
          {children}
        </ChildShell>
      </ActiveChildProvider>
    </SoundEffectsProvider>
  );
}
