import { apiJson } from "@/lib/api-response";
import { z } from "zod";
import { requireApiRoles } from "@/auth/api";
import { CONTENT_VARIABLES_SETTING_KEY, contentVariableDefinitionsSchema } from "@/domain/content-variables";
import { imageUploadPoliciesSchema, mediaUploadPolicySettingKey } from "@/domain/media-upload-policy";
import { invalidatePublishedCatalog } from "@/lib/cache/invalidation";
import { setSystemSetting } from "@/modules/admin/operations";
const schema = z.object({ key: z.string().regex(/^[a-z0-9_.-]+$/), value: z.unknown() });
export async function PATCH(request: Request) {
  const authResult = await requireApiRoles(request, ["super_admin"]);
  if ("error" in authResult) return authResult.error;
  const input = schema.safeParse(await request.json().catch(() => null));
  if (!input.success) return apiJson({ message: input.error.issues[0]?.message }, { status: 400 });
  const value =
    input.data.key === mediaUploadPolicySettingKey
      ? imageUploadPoliciesSchema.safeParse(input.data.value)
      : input.data.key === CONTENT_VARIABLES_SETTING_KEY
        ? contentVariableDefinitionsSchema.safeParse(input.data.value)
        : { success: true as const, data: input.data.value };
  if (!value.success) {
    const fallbackMessage =
      input.data.key === CONTENT_VARIABLES_SETTING_KEY
        ? "Cấu hình tag nội dung chưa hợp lệ"
        : "Giới hạn tải ảnh chưa hợp lệ";
    return apiJson({ message: value.error.issues[0]?.message ?? fallbackMessage }, { status: 400 });
  }
  const saved = await setSystemSetting(authResult.session.user.id, input.data.key, value.data);
  if (input.data.key === CONTENT_VARIABLES_SETTING_KEY) invalidatePublishedCatalog();
  return apiJson(saved);
}
