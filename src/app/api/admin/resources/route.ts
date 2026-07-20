import { apiJson } from "@/lib/api-response";
import { requireApiRoles } from "@/auth/api";
import { ageGroupCodes, type AgeGroup } from "@/domain/age-groups";
import {
  parentResourceCategories,
  parentResourceTypes,
  type ParentResourceCategory,
  type ParentResourceType,
} from "@/domain/parent-resources";
import { invalidateParentResources } from "@/lib/cache/invalidation";
import { adminResourceSchema, createAdminResource, listAdminResources } from "@/modules/admin/resource-admin";

export async function GET(request: Request) {
  const authResult = await requireApiRoles(request, ["content_admin", "reviewer", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  const params = new URL(request.url).searchParams;
  const rawType = params.get("resourceType");
  const rawCategory = params.get("category");
  const rawAgeGroup = params.get("ageGroup");
  return apiJson(
    await listAdminResources({
      search: params.get("search")?.trim() || undefined,
      status: params.get("status")?.trim() || undefined,
      resourceType: parentResourceTypes.includes(rawType as ParentResourceType)
        ? (rawType as ParentResourceType)
        : undefined,
      category: parentResourceCategories.includes(rawCategory as ParentResourceCategory)
        ? (rawCategory as ParentResourceCategory)
        : undefined,
      ageGroup: ageGroupCodes.includes(rawAgeGroup as AgeGroup) ? (rawAgeGroup as AgeGroup) : undefined,
      page: Number(params.get("page") || 1),
      pageSize: Number(params.get("pageSize") || 10),
    }),
  );
}
export async function POST(request: Request) {
  const authResult = await requireApiRoles(request, ["content_admin", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  const input = adminResourceSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) {
    return apiJson(
      {
        code: "RESOURCE_VALIDATION_FAILED",
        message: input.error.issues[0]?.message ?? "Tài nguyên chưa hợp lệ",
        issues: input.error.flatten(),
      },
      { status: 400 },
    );
  }
  try {
    const resource = await createAdminResource(input.data, authResult.session.user.id);
    invalidateParentResources();
    return apiJson(resource, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("unique")) {
      return apiJson({ message: "Mã đường dẫn tài nguyên đã tồn tại" }, { status: 409 });
    }
    throw error;
  }
}
