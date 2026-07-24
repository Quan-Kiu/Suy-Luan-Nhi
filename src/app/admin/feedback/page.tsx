import type { Metadata } from "next";
import { MessageSquareText } from "lucide-react";
import { requireStaff } from "@/auth/session";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { SystemFeedbackManager } from "@/features/admin/system-feedback-manager";
import { listSystemFeedback } from "@/modules/system-feedback/system-feedback";

export const metadata: Metadata = {
  title: "Góp ý hệ thống",
};

export default async function Page() {
  await requireStaff();
  const result = await listSystemFeedback({ page: 1, pageSize: 100 });
  const initialData = {
    ...result,
    items: result.items.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      handledAt: item.handledAt?.toISOString() ?? null,
    })),
  };
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Phản hồi từ người dùng"
        title="Góp ý hệ thống"
        description="Xem nội dung, ảnh chụp màn hình và trang phát sinh góp ý; cập nhật trạng thái để đội ngũ biết việc nào đang được xử lý."
        icon={MessageSquareText}
      />
      <SystemFeedbackManager initialData={initialData} />
    </div>
  );
}
