import { apiJson } from "@/lib/api-response";
import { isAgeGroup } from "@/domain/age-groups";
import { listWorldMissions } from "@/modules/catalog/catalog";
export async function GET(request: Request, { params }: { params: Promise<{ worldId: string }> }) {
  const { worldId } = await params;
  const age = new URL(request.url).searchParams.get("ageGroup");
  const ageGroup = isAgeGroup(age) ? age : undefined;
  return apiJson(await listWorldMissions(worldId, ageGroup));
}
