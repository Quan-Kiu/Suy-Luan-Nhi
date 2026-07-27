import { apiJson } from "@/lib/api-response";
import { invalidateTaxonomyCaches } from "@/lib/cache/invalidation";
import { z } from "zod";
import { requireApiPermission } from "@/auth/api";
import { ageGroupCodes } from "@/domain/age-groups";
import {
  updateWorld,
  WorldAudienceConflictError,
  WorldPublishedMissionConflictError,
} from "@/modules/admin/operations";
const schema = z.object({
  title: z.string().min(2).optional(),
  subtitle: z.string().min(2).optional(),
  description: z.string().min(8).optional(),
  sortOrder: z.number().int().positive().optional(),
  themeColor: z.string().min(3).optional(),
  coverUrl: z.string().min(1).optional(),
  ageGroups: z.array(z.enum(ageGroupCodes)).min(1, "Hãy chọn ít nhất 1 nhóm tuổi").optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});
export async function PATCH(request: Request, { params }: { params: Promise<{ worldId: string }> }) {
  const authResult = await requireApiPermission(request, "worlds.manage");
  if ("error" in authResult) return authResult.error;
  const input = schema.safeParse(await request.json().catch(() => null));
  if (!input.success) return apiJson({ message: input.error.issues[0]?.message }, { status: 400 });
  const { worldId } = await params;
  try {
    const result = await updateWorld(authResult.session.user.id, worldId, input.data);
    if (!result) return apiJson({ message: "Không tìm thấy chủ đề" }, { status: 404 });
    invalidateTaxonomyCaches();
    return apiJson(result);
  } catch (error) {
    if (error instanceof WorldAudienceConflictError) {
      return apiJson(
        {
          code: "WORLD_AUDIENCE_CONFLICT",
          message: error.message,
          missingAgeGroups: error.missingAgeGroups,
        },
        { status: 409 },
      );
    }
    if (error instanceof WorldPublishedMissionConflictError) {
      return apiJson(
        {
          code: "WORLD_HAS_PUBLISHED_MISSIONS",
          message: error.message,
          publishedMissionCount: error.publishedMissionCount,
        },
        { status: 409 },
      );
    }
    throw error;
  }
}
