import { notFound } from "next/navigation";
import { ProductionMissionEditor } from "@/features/admin/production-mission-editor";
import { getAdminMission, getAdminTaxonomy } from "@/modules/admin/mission-admin";
export default async function Page({ params }: { params: Promise<{ missionId: string }> }) {
  const { missionId } = await params;
  const [mission, taxonomy] = await Promise.all([getAdminMission(missionId), getAdminTaxonomy()]);
  if (!mission) notFound();
  return (
    <ProductionMissionEditor
      initial={mission.draft}
      taxonomy={taxonomy}
      missionId={missionId}
      status={mission.mission.status}
    />
  );
}
