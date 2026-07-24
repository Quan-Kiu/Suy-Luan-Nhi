import type { Metadata } from "next";
import { MessageSquareText } from "lucide-react";
import type { SystemFeedbackColumnsInitialData, SystemFeedbackPage } from "@/api/admin/feedback";
import { requireStaff } from "@/auth/session";
import { systemFeedbackColumnPageSize, systemFeedbackStatuses } from "@/domain/system-feedback";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { SystemFeedbackManager } from "@/features/admin/system-feedback-manager";
import { listSystemFeedback } from "@/modules/system-feedback/system-feedback";

export const metadata: Metadata = {
  title: "Góp ý hệ thống",
};

function serializeFeedbackPage(result: Awaited<ReturnType<typeof listSystemFeedback>>): SystemFeedbackPage {
  return {
    ...result,
    items: result.items.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      handledAt: item.handledAt?.toISOString() ?? null,
    })),
  };
}

export default async function Page() {
  await requireStaff();
  const results = await Promise.all(
    systemFeedbackStatuses.map((status) =>
      listSystemFeedback({ status, page: 1, pageSize: systemFeedbackColumnPageSize }),
    ),
  );
  const initialData = Object.fromEntries(
    systemFeedbackStatuses.map((status, index) => [status, serializeFeedbackPage(results[index])]),
  ) as SystemFeedbackColumnsInitialData;

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
