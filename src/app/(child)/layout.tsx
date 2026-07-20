import { ChildShell } from "@/components/child-shell";
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
      <ChildShell>
        <ChildHeader />
        {children}
      </ChildShell>
    </SoundEffectsProvider>
  );
}
