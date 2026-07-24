import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ClipboardCheck } from "lucide-react";
import { requireRoles } from "@/auth/session";
import { contentTemplate, contentText } from "@/content/resolve";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { getReviewWorkspaceItems } from "@/modules/admin/mission-admin";
import { getContentNamespace } from "@/modules/content/content";

export const metadata: Metadata = {
  title: "Duyệt và hiển thị nội dung",
};

type ReviewItem = Awaited<ReturnType<typeof getReviewWorkspaceItems>>[number];

function ReviewCard({
  item,
  index,
  statusLabel,
  statusClassName,
  versionLabel,
  timeLabel,
  actionLabel,
}: {
  item: ReviewItem;
  index: number;
  statusLabel: string;
  statusClassName: string;
  versionLabel: string;
  timeLabel: string;
  actionLabel: string;
}) {
  return (
    <Link
      href={`/admin/reviews/${item.version.id}`}
      className="overflow-hidden rounded-2xl border bg-white transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative h-44 w-full overflow-hidden">
        <Image
          src={item.coverUrl}
          fill
          sizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1279px) 50vw, 33vw"
          loading={index === 0 ? "eager" : "lazy"}
          alt=""
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`type-caption rounded-full px-3 py-1 font-black ${statusClassName}`}>
            {statusLabel}
          </span>
          <span className="type-caption rounded-full bg-[#f5f2ec] px-3 py-1 font-black text-[#6f6558]">
            {versionLabel}
          </span>
        </div>
        <h3 className="type-section-title mt-3">{item.title}</h3>
        <p className="type-supporting text-[#806d54]">{item.worldTitle}</p>
        <p className="type-caption mt-3 text-[#806d54]">{timeLabel}</p>
        <span className="type-label mt-4 inline-flex items-center gap-1 font-black text-[#bd4910]">
          {actionLabel} <ArrowRight size={16} />
        </span>
      </div>
    </Link>
  );
}

export default async function Page() {
  await requireRoles(["reviewer", "super_admin"]);
  const [items, content] = await Promise.all([getReviewWorkspaceItems(), getContentNamespace("admin")]);
  const pendingItems = items.filter((item) => item.version.status === "in_review");
  const approvedItems = items.filter((item) => item.version.status === "approved");

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

      <section aria-labelledby="pending-reviews-heading" className="space-y-4">
        <div>
          <h2 id="pending-reviews-heading" className="type-section-title">
            {contentText(content, "reviews.pendingTitle", "Chờ kiểm tra")}
          </h2>
          <p className="type-supporting mt-1 text-[#6f6558]">
            {contentText(
              content,
              "reviews.pendingDescription",
              "Xem nội dung như bé sẽ thấy, kiểm tra độ an toàn rồi xác nhận hoặc ghi rõ phần cần sửa.",
            )}
          </p>
        </div>
        {pendingItems.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pendingItems.map((item, index) => (
              <ReviewCard
                key={item.version.id}
                item={item}
                index={index}
                statusLabel={contentText(content, "reviews.pendingStatus", "Chờ kiểm tra")}
                statusClassName="bg-[#fff5d8] text-[#8a5a00]"
                versionLabel={contentTemplate(content, "reviews.version", "Lần gửi {number}", {
                  number: item.version.versionNumber,
                })}
                timeLabel={contentTemplate(content, "reviews.submittedAt", "Gửi lúc {time}", {
                  time: item.version.createdAt.toLocaleString("vi-VN"),
                })}
                actionLabel={contentText(content, "reviews.openReview", "Mở để kiểm tra")}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border bg-white p-8 text-center text-[#806d54]">
            {contentText(content, "reviews.empty", "Hiện không có nhiệm vụ nào cần kiểm tra.")}
          </div>
        )}
      </section>

      <section aria-labelledby="approved-reviews-heading" className="space-y-4">
        <div>
          <h2 id="approved-reviews-heading" className="type-section-title">
            {contentText(content, "reviews.approvedTitle", "Đã duyệt, chờ hiển thị")}
          </h2>
          <p className="type-supporting mt-1 text-[#6f6558]">
            {contentText(
              content,
              "reviews.approvedDescription",
              "Các nhiệm vụ đã đạt yêu cầu nhưng chưa được đưa đến khu vực của bé.",
            )}
          </p>
        </div>
        {approvedItems.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {approvedItems.map((item, index) => {
              const reviewedAt = item.version.reviewedAt ?? item.version.createdAt;
              const timeLabel = item.scheduledFor
                ? contentTemplate(content, "reviews.scheduledFor", "Đã hẹn hiển thị lúc {time}", {
                    time: item.scheduledFor.toLocaleString("vi-VN"),
                  })
                : contentTemplate(content, "reviews.reviewedAt", "Duyệt lúc {time}", {
                    time: reviewedAt.toLocaleString("vi-VN"),
                  });
              return (
                <ReviewCard
                  key={item.version.id}
                  item={item}
                  index={index}
                  statusLabel={contentText(content, "reviews.approvedStatus", "Đã duyệt")}
                  statusClassName="bg-[#edf3ff] text-[#315b9a]"
                  versionLabel={contentTemplate(content, "reviews.version", "Lần gửi {number}", {
                    number: item.version.versionNumber,
                  })}
                  timeLabel={timeLabel}
                  actionLabel={contentText(content, "reviews.openApproved", "Mở để hiển thị")}
                />
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border bg-white p-8 text-center text-[#806d54]">
            {contentText(content, "reviews.approvedEmpty", "Hiện không có nhiệm vụ nào đang chờ hiển thị.")}
          </div>
        )}
      </section>
    </div>
  );
}
