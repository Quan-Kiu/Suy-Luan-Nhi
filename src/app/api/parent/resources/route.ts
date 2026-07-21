import { requireApiParentGate } from "@/auth/api";
import { apiJson } from "@/lib/api-response";
import {
  parentResourceCategories,
  parentResourceTypes,
  type ParentResourceCategory,
  type ParentResourceType,
} from "@/domain/parent-resources";
import { getActiveChild } from "@/modules/family/active-child";
import { getResources } from "@/modules/parent/parent-data";
import { getOperationalSystemSettings } from "@/modules/system-settings/runtime";

export async function GET(request: Request) {
  const authResult = await requireApiParentGate(request);
  if ("error" in authResult) return authResult.error;
  const systemSettings = await getOperationalSystemSettings();
  if (!systemSettings.features.parentResourcesEnabled) {
    return apiJson({ code: "FEATURE_DISABLED", message: "Thư viện tài nguyên đang tạm ẩn" }, { status: 404 });
  }
  const active = await getActiveChild();
  if (!active) {
    return apiJson({ code: "ACTIVE_CHILD_REQUIRED", message: "Hãy chọn hồ sơ bé trước" }, { status: 409 });
  }
  const params = new URL(request.url).searchParams;
  const rawType = params.get("resourceType");
  const rawCategory = params.get("category");
  return apiJson(
    await getResources({
      ageGroup: active.child.ageGroup,
      resourceType: parentResourceTypes.includes(rawType as ParentResourceType)
        ? (rawType as ParentResourceType)
        : undefined,
      category: parentResourceCategories.includes(rawCategory as ParentResourceCategory)
        ? (rawCategory as ParentResourceCategory)
        : undefined,
      search: params.get("search")?.trim() || undefined,
      page: Number(params.get("page") || 1),
      pageSize: Number(params.get("pageSize") || 9),
    }),
  );
}
