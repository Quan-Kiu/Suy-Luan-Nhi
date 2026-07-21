import { apiJson } from "@/lib/api-response";
import { env } from "@/config/env";
import { invalidateAdminMissionViews, invalidatePublishedCatalog } from "@/lib/cache/invalidation";
import { publishDueScheduledMissions } from "@/modules/admin/mission-admin";
export async function POST(request: Request) {
  if (!env.CRON_SECRET) return apiJson({ message: "CRON_SECRET chưa được cấu hình" }, { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`) {
    return apiJson({ message: "Không có quyền" }, { status: 401 });
  }
  const published = await publishDueScheduledMissions();
  if (published.length > 0) {
    invalidatePublishedCatalog();
    invalidateAdminMissionViews();
  }
  return apiJson({ published, count: published.length });
}
