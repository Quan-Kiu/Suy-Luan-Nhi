import { ChildShell } from "@/components/child-shell";
import { GameplayScreen } from "@/features/gameplay/gameplay-screen";
export default function PlayPage() {
  return (
    <ChildShell>
      <GameplayScreen />
    </ChildShell>
  );
}
