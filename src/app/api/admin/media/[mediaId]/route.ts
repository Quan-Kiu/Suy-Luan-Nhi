import { apiJson } from "@/lib/api-response";
import { requireApiPermission } from "@/auth/api";
import { approveMedia, deleteMedia } from "@/modules/media/media";
import { MediaInUseError } from "@/domain/media-deletion";
import { MediaStorageError } from "@/modules/media/storage/errors";
import { invalidateAdminMediaViews } from "@/lib/cache/invalidation";

export async function DELETE(request: Request, { params }: { params: Promise<{ mediaId: string }> }) {
  const authResult = await requireApiPermission(request, "media.manage");
  if ("error" in authResult) return authResult.error;
  const { mediaId } = await params;
  try {
    const deleted = await deleteMedia(mediaId, authResult.session.user.id);
    if (!deleted) return apiJson({ message: "Không tìm thấy tệp" }, { status: 404 });
    invalidateAdminMediaViews();
    return apiJson({ deleted: true, resource: "media" });
  } catch (error) {
    if (error instanceof MediaInUseError) {
      return apiJson(
        { code: error.code, message: error.message, references: error.references },
        { status: error.status },
      );
    }
    if (error instanceof MediaStorageError) {
      return apiJson({ code: error.code, message: error.message }, { status: error.status });
    }
    console.error("[api.admin.media.delete_failed]", error);
    return apiJson(
      { code: "MEDIA_DELETE_FAILED", message: "Không thể xóa tệp do lỗi hệ thống. Hãy thử lại." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ mediaId: string }> }) {
  const authResult = await requireApiPermission(request, "media.review");
  if ("error" in authResult) return authResult.error;
  const body = (await request.json().catch(() => null)) as { approved?: unknown } | null;
  if (typeof body?.approved !== "boolean")
    return apiJson({ message: "approved phải là boolean" }, { status: 400 });
  const { mediaId } = await params;
  const asset = await approveMedia(mediaId, authResult.session.user.id, body.approved);
  return asset ? apiJson(asset) : apiJson({ message: "Không tìm thấy media" }, { status: 404 });
}
