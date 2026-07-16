import { notFound, redirect } from "next/navigation";
import { BrandHeader } from "@/components/brand-header";
import { ChildShell } from "@/components/child-shell";
import { MissionDetailView } from "@/features/catalog/mission-detail-view";
import { getMissionMap, getPublishedMission } from "@/modules/catalog/catalog";
import { getActiveChild } from "@/modules/family/active-child";
export default async function Page({ params }: { params: Promise<{ missionId: string }> }) {
  const active = await getActiveChild();
  if (!active) redirect("/onboarding");
  const { missionId } = await params;
  const data = await getPublishedMission(missionId);
  if (!data) notFound();
  const map = await getMissionMap(active.child);
  const access = map.worlds.flatMap((w) => w.missions).find((m) => m.id === data.mission.id);
  if (!access?.unlocked) redirect("/missions");
  return (
    <ChildShell>
      <BrandHeader backHref="/missions" />
      <MissionDetailView data={data} childId={active.child.id} />
    </ChildShell>
  );
}
