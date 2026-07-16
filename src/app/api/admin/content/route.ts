import { z } from "zod";
import type { ContentValue } from "@/content/types";
import { requireApiRoles } from "@/auth/api";
import { apiJson } from "@/lib/api-response";
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
  const locale = new URL(request.url).searchParams.get("locale")?.trim() || "vi";
  return apiJson(await listContentEntries(locale));
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
  return apiJson(await upsertContentEntry(authResult.session.user.id, input.data));
}
