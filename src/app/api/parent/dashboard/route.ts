import { requireApiParentGate } from "@/auth/api";
import { apiJson } from "@/lib/api-response";
import { getActiveChild } from "@/modules/family/active-child";
import { getParentDashboard, getSuggestions } from "@/modules/parent/parent-data";

export async function GET(request: Request) {
  const authResult = await requireApiParentGate(request);
  if ("error" in authResult) return authResult.error;
  if (!("parent" in authResult)) {
    return apiJson(
      { code: "PARENT_PROFILE_REQUIRED", message: "Không tìm thấy hồ sơ phụ huynh" },
      { status: 403 },
    );
  }

  const active = await getActiveChild();
  if (!active) {
    return apiJson({ code: "ACTIVE_CHILD_REQUIRED", message: "Hãy chọn hồ sơ bé trước" }, { status: 409 });
  }

  const [dashboard, suggestions] = await Promise.all([
    getParentDashboard(active.child.id, authResult.parent.id),
    getSuggestions(active.child.ageGroup),
  ]);
  return apiJson({ child: active.child, dashboard, suggestions });
}
