import { apiJson } from "@/lib/api-response";
import { getCachedPublishedMission } from "@/modules/catalog/catalog-cache";
export async function GET(_: Request, { params }: { params: Promise<{ missionId: string }> }) {
  const { missionId } = await params;
  const result = await getCachedPublishedMission(missionId);
  if (!result) return apiJson({ message: "Không tìm thấy nhiệm vụ" }, { status: 404 });
  const snapshot = result.version.snapshot as Record<string, unknown>;
  return apiJson({
    ...result.mission,
    world: result.world,
    primarySkill: result.primarySkill,
    badge: result.badge,
    questionCount: Array.isArray(snapshot.questions) ? snapshot.questions.length : 0,
  });
}
