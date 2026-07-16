import { apiJson } from "@/lib/api-response";
import { listPublishedWorlds } from "@/modules/catalog/catalog";
export async function GET() {
  return apiJson(await listPublishedWorlds());
}
