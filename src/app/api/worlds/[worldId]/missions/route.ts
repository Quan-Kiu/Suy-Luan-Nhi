import { apiJson } from "@/lib/api-response";
import { listWorldMissions } from "@/modules/catalog/catalog";
export async function GET(request: Request, { params }: { params: Promise<{ worldId: string }> }) {
  const { worldId } = await params;
  const age = new URL(request.url).searchParams.get("ageGroup");
  const ageGroup = age === "2-3" || age === "4-5" || age === "6-8" ? age : undefined;
  return apiJson(await listWorldMissions(worldId, ageGroup));
}
