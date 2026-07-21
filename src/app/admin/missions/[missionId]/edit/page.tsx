import { notFound } from "next/navigation";
import { requireRoles } from "@/auth/session";
import { ProductionMissionEditor } from "@/features/admin/production-mission-editor";
import { getAdminMission, getAdminTaxonomy } from "@/modules/admin/mission-admin";
import { getContentVariableDefinitions } from "@/modules/content/content-variables";
export default async function Page({ params }: { params: Promise<{ missionId: string }> }) {
  await requireRoles(["content_admin", "super_admin"]);
  const { missionId } = await params;
  const [mission, taxonomy, templateVariables] = await Promise.all([
    getAdminMission(missionId),
    getAdminTaxonomy(),
    getContentVariableDefinitions(),
  ]);
  if (!mission) notFound();
  return (
    <ProductionMissionEditor
      initial={mission.draft}
      taxonomy={taxonomy}
      templateVariables={templateVariables}
      missionId={missionId}
      status={mission.mission.status}
      versions={mission.versions.map((version) => ({
        id: version.id,
        versionNumber: version.versionNumber,
        status: version.status,
        reviewComment: version.reviewComment,
        createdAt: version.createdAt.toISOString(),
        reviewedAt: version.reviewedAt?.toISOString() ?? null,
        publishedAt: version.publishedAt?.toISOString() ?? null,
      }))}
    />
  );
}
