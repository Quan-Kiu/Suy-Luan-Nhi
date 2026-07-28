import type { Metadata } from "next";
import { ImageIcon } from "lucide-react";
import { hasEffectivePermission } from "@/auth/effective-access";
import { requirePermission } from "@/auth/session";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { MediaLibrary } from "@/features/admin/media-library";
import { listMedia } from "@/modules/media/media";

export const metadata: Metadata = {
  title: "Hình ảnh, âm thanh và video",
};

export default async function Page() {
  const session = await requirePermission("media.view");
  const [result, canReview, canManage] = await Promise.all([
    listMedia({ page: 1, pageSize: 16 }),
    hasEffectivePermission(session.user, "media.review"),
    hasEffectivePermission(session.user, "media.manage"),
  ]);
  const initialData = {
    ...result,
    items: result.items.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() })),
  };
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Thư viện dùng trong nhiệm vụ"
        title="Hình ảnh, âm thanh và video"
        description="Thêm, xem lại và xác nhận hình ảnh, âm thanh hoặc video phù hợp trước khi cho bé sử dụng."
        icon={ImageIcon}
      />
      <MediaLibrary
        initialData={initialData}
        canReview={canReview}
        canUpload={canManage}
        canDelete={canManage}
      />
    </div>
  );
}
