import { z } from "zod";
import { requireApiRoles } from "@/auth/api";
import { CONTENT_VARIABLES_SETTING_KEY, contentVariableDefinitionsSchema } from "@/domain/content-variables";
import { imageUploadPoliciesSchema, mediaUploadPolicySettingKey } from "@/domain/media-upload-policy";
import { getManagedSystemSettingDefinition, parseManagedSystemSetting } from "@/domain/system-settings";
import { apiJson } from "@/lib/api-response";
import { invalidatePublishedCatalog, invalidateSystemSettingsViews } from "@/lib/cache/invalidation";
import { setSystemSetting } from "@/modules/admin/operations";

const schema = z.object({ key: z.string().regex(/^[A-Za-z0-9_.-]+$/), value: z.unknown() });

export async function PATCH(request: Request) {
  const authResult = await requireApiRoles(request, ["super_admin"]);
  if ("error" in authResult) return authResult.error;

  const input = schema.safeParse(await request.json().catch(() => null));
  if (!input.success) return apiJson({ message: input.error.issues[0]?.message }, { status: 400 });

  let parsedValue: unknown;
  if (input.data.key === mediaUploadPolicySettingKey) {
    const parsed = imageUploadPoliciesSchema.safeParse(input.data.value);
    if (!parsed.success) {
      return apiJson(
        { message: parsed.error.issues[0]?.message ?? "Giới hạn tải ảnh chưa hợp lệ" },
        { status: 400 },
      );
    }
    parsedValue = parsed.data;
  } else if (input.data.key === CONTENT_VARIABLES_SETTING_KEY) {
    const parsed = contentVariableDefinitionsSchema.safeParse(input.data.value);
    if (!parsed.success) {
      return apiJson(
        { message: parsed.error.issues[0]?.message ?? "Cấu hình tag nội dung chưa hợp lệ" },
        { status: 400 },
      );
    }
    parsedValue = parsed.data;
  } else {
    const parsed = parseManagedSystemSetting(input.data.key, input.data.value);
    if (!parsed) return apiJson({ message: "Cài đặt này chưa được hệ thống hỗ trợ" }, { status: 400 });
    if (!parsed.success) {
      const definition = getManagedSystemSettingDefinition(input.data.key);
      return apiJson({ message: `${definition?.label ?? "Giá trị cài đặt"} chưa hợp lệ` }, { status: 400 });
    }
    parsedValue = parsed.data;
  }

  const saved = await setSystemSetting(authResult.session.user.id, input.data.key, parsedValue);
  if (input.data.key === CONTENT_VARIABLES_SETTING_KEY) invalidatePublishedCatalog();
  invalidateSystemSettingsViews();
  return apiJson({ ...saved, source: "saved" as const });
}
