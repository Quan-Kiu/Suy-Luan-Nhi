import { apiJson } from "@/lib/api-response";
import { getPublishedMission } from "@/modules/catalog/catalog";
export async function GET(_: Request, { params }: { params: Promise<{ missionId: string }> }) {
  const { missionId } = await params;
  const result = await getPublishedMission(missionId);
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
