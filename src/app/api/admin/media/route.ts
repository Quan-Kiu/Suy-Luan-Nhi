import { apiJson } from "@/lib/api-response";
import { requireApiRoles } from "@/auth/api";
import { listMedia, uploadMedia } from "@/modules/media/media";
import { mediaCategories, type MediaCategory } from "@/domain/media";

export async function GET(request: Request) {
  const authResult = await requireApiRoles(request, ["content_admin", "reviewer", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  const params = new URL(request.url).searchParams;
  const type = ["image", "audio", "video"].includes(params.get("type") ?? "")
    ? (params.get("type") as "image" | "audio" | "video")
    : undefined;
  const safetyStatus = ["pending", "approved", "rejected"].includes(params.get("safetyStatus") ?? "")
    ? (params.get("safetyStatus") as "pending" | "approved" | "rejected")
    : undefined;
  const storageProvider = ["local", "s3", "cloudinary"].includes(params.get("storageProvider") ?? "")
    ? (params.get("storageProvider") as "local" | "s3" | "cloudinary")
    : undefined;
  return apiJson(
    await listMedia({
      type,
      category: params.get("category")?.trim() || undefined,
      safetyStatus,
      storageProvider,
      search: params.get("search")?.trim() || undefined,
      page: Number(params.get("page") || 1),
      pageSize: Number(params.get("pageSize") || 16),
    }),
  );
}

export async function POST(request: Request) {
  const authResult = await requireApiRoles(request, ["content_admin", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  const form = await request.formData();
  const file = form.get("file");
  const altText = form.get("altText");
  const rawCategory = form.get("category");
  const category = mediaCategories.includes(rawCategory as MediaCategory)
    ? (rawCategory as MediaCategory)
    : null;
  if (!(file instanceof File) || typeof altText !== "string" || !category) {
    return apiJson({ message: "Thiếu tệp, mô tả hoặc nhóm tư liệu" }, { status: 400 });
  }
  try {
    return apiJson(await uploadMedia(file, altText, category, authResult.session.user.id), { status: 201 });
  } catch (error) {
    return apiJson(
      { message: error instanceof Error ? error.message : "Không thể tải tệp" },
      { status: 400 },
    );
  }
}
