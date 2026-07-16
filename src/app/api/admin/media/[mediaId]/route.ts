import { apiJson } from "@/lib/api-response";
import { requireApiRoles } from "@/auth/api";
import { approveMedia, deleteMedia } from "@/modules/media/media";

export async function DELETE(request: Request, { params }: { params: Promise<{ mediaId: string }> }) {
  const authResult = await requireApiRoles(request, ["content_admin", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  const { mediaId } = await params;
  return (await deleteMedia(mediaId, authResult.session.user.id))
    ? apiJson({ deleted: true, resource: "media" })
    : apiJson({ message: "Không tìm thấy media" }, { status: 404 });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ mediaId: string }> }) {
  const authResult = await requireApiRoles(request, ["reviewer", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  const body = (await request.json().catch(() => null)) as { approved?: unknown } | null;
  if (typeof body?.approved !== "boolean")
    return apiJson({ message: "approved phải là boolean" }, { status: 400 });
  const { mediaId } = await params;
  const asset = await approveMedia(mediaId, authResult.session.user.id, body.approved);
  return asset ? apiJson(asset) : apiJson({ message: "Không tìm thấy media" }, { status: 404 });
}
