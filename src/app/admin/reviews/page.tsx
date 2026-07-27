import type { Metadata } from "next";
import { ClipboardCheck } from "lucide-react";
import { requirePermission } from "@/auth/session";
import { contentText } from "@/content/resolve";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { ReviewWorkspace, type ReviewWorkspaceItem } from "@/features/admin/review-workspace";
import { getReviewWorkspaceItems } from "@/modules/admin/mission-admin";
import { getContentNamespace } from "@/modules/content/content";

export const metadata: Metadata = {
  title: "Duyệt và hiển thị nội dung",
};

export default async function Page() {
  await requirePermission("missions.review");
  const [items, content] = await Promise.all([getReviewWorkspaceItems(), getContentNamespace("admin")]);
  const workspaceItems: ReviewWorkspaceItem[] = items.map((item) => ({
    missionId: item.missionId,
    title: item.title,
    coverUrl: item.coverUrl,
    worldTitle: item.worldTitle,
    scheduledFor: item.scheduledFor?.toISOString() ?? null,
    version: {
      id: item.version.id,
      status: item.version.status as ReviewWorkspaceItem["version"]["status"],
      versionNumber: item.version.versionNumber,
      createdAt: item.version.createdAt.toISOString(),
      reviewedAt: item.version.reviewedAt?.toISOString() ?? null,
    },
  }));

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow={contentText(content, "reviews.eyebrow", "Kiểm tra nội dung")}
        title={contentText(content, "reviews.title", "Duyệt và hiển thị nội dung")}
        description={contentText(
          content,
          "reviews.description",
          "Kiểm tra nội dung mới gửi, sau đó tiếp tục đưa các nhiệm vụ đã đạt yêu cầu đến với bé.",
        )}
        icon={ClipboardCheck}
      />

      <ReviewWorkspace items={workspaceItems} content={content} />
    </div>
  );
}
