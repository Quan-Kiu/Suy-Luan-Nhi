import { apiJson } from "@/lib/api-response";
import { requireApiRoles } from "@/auth/api";
import { listMedia, uploadMedia } from "@/modules/media/media";

export async function GET(request: Request) {
  const authResult = await requireApiRoles(request, ["content_admin", "reviewer", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  return apiJson(await listMedia());
}

export async function POST(request: Request) {
  const authResult = await requireApiRoles(request, ["content_admin", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  const form = await request.formData();
  const file = form.get("file");
  const altText = form.get("altText");
  if (!(file instanceof File) || typeof altText !== "string") {
    return apiJson({ message: "Thiếu tệp hoặc alt text" }, { status: 400 });
  }
  try {
    return apiJson(await uploadMedia(file, altText, authResult.session.user.id), { status: 201 });
  } catch (error) {
    return apiJson(
      { message: error instanceof Error ? error.message : "Không thể tải tệp" },
      { status: 400 },
    );
  }
}
