import { z } from "zod";
import type { ContentValue } from "@/content/types";
import { contentValueTypes, type ContentValueType } from "@/domain/content-classification";
import { requireApiRoles } from "@/auth/api";
import { apiJson } from "@/lib/api-response";
import { invalidateContentCache } from "@/lib/cache/invalidation";
import { listContentEntries, upsertContentEntry } from "@/modules/content/content";

const contentValueSchema: z.ZodType<ContentValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(contentValueSchema),
    z.record(z.string(), contentValueSchema),
  ]),
);

const updateSchema = z.object({
  namespace: z.string().trim().min(1).max(80),
  key: z.string().trim().min(1).max(160),
  locale: z.string().trim().min(2).max(12).default("vi"),
  value: contentValueSchema,
  description: z.string().trim().max(500).optional(),
  active: z.boolean().default(true),
});
export async function GET(request: Request) {
  const authResult = await requireApiRoles(request, ["content_admin", "reviewer", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  const params = new URL(request.url).searchParams;
  const rawValueType = params.get("valueType")?.trim();
  const valueType = contentValueTypes.includes(rawValueType as ContentValueType)
    ? (rawValueType as ContentValueType)
    : undefined;
  return apiJson(
    await listContentEntries({
      locale: params.get("locale")?.trim() || "vi",
      namespace: params.get("namespace")?.trim() || undefined,
      category: params.get("category")?.trim() || undefined,
      valueType,
      search: params.get("search")?.trim() || undefined,
      page: Number(params.get("page") || 1),
      pageSize: Number(params.get("pageSize") || 12),
    }),
  );
}

export async function PATCH(request: Request) {
  const authResult = await requireApiRoles(request, ["content_admin", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  const input = updateSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) {
    return apiJson(
      {
        code: "CONTENT_VALIDATION_FAILED",
        message: input.error.issues[0]?.message ?? "Nội dung chưa hợp lệ",
        issues: input.error.flatten(),
      },
      { status: 400 },
    );
  }
  const entry = await upsertContentEntry(authResult.session.user.id, input.data);
  invalidateContentCache();
  return apiJson(entry);
}
