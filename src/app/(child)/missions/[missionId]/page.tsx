import { notFound, redirect } from "next/navigation";
import { MissionDetailView } from "@/features/catalog/mission-detail-view";
import { getCachedMissionMap, getCachedPublishedMission } from "@/modules/catalog/catalog-cache";
import { getActiveChild } from "@/modules/family/active-child";
export default async function Page({ params }: { params: Promise<{ missionId: string }> }) {
  const active = await getActiveChild();
  if (!active) redirect("/onboarding");
  const { missionId } = await params;
  const data = await getCachedPublishedMission(missionId);
  if (!data) notFound();
  const map = await getCachedMissionMap(active.child);
  const access = map.worlds.flatMap((w) => w.missions).find((m) => m.id === data.mission.id);
  if (!access?.unlocked) redirect("/missions");
  return <MissionDetailView data={data} childId={active.child.id} />;
}
