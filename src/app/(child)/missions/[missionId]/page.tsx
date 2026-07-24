import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { MissionDetailView } from "@/features/catalog/mission-detail-view";
import { getCachedMissionMap, getCachedPublishedMission } from "@/modules/catalog/catalog-cache";
import { getContentVariableDefinitions } from "@/modules/content/content-variables";
import { getActiveChild } from "@/modules/family/active-child";

export const metadata: Metadata = {
  title: "Chi tiết nhiệm vụ",
};

export default async function Page({ params }: { params: Promise<{ missionId: string }> }) {
  const active = await getActiveChild();
  if (!active) redirect("/onboarding");
  const { missionId } = await params;
  const [data, map, templateVariables] = await Promise.all([
    getCachedPublishedMission(missionId),
    getCachedMissionMap(active.child),
    getContentVariableDefinitions(),
  ]);
  if (!data) notFound();
  const access = map.worlds
    .flatMap((world) => world.missions)
    .find((mission) => mission.id === data.mission.id);
  if (!access?.unlocked) redirect("/missions");
  return <MissionDetailView data={data} child={active.child} templateVariables={templateVariables} />;
}
