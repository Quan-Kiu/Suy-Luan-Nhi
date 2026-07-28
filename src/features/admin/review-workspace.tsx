"use client";

import { useState } from "react";
import { ArrowRight, ClipboardCheck, Rocket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { contentTemplate, contentText } from "@/content/resolve";
import type { ContentDictionary } from "@/content/types";
import { AdminTabPanel, AdminTabs } from "@/features/admin/admin-tabs";

export type ReviewWorkspaceItem = {
  missionId: string;
  title: string;
  coverUrl: string;
  worldTitle: string;
  scheduledFor: string | null;
  version: {
    id: string;
    status: "in_review" | "approved";
    versionNumber: number;
    createdAt: string;
    reviewedAt: string | null;
  };
};

type ReviewTabKey = "pending" | "approved";

function ReviewCard({
  item,
  index,
  statusLabel,
  statusClassName,
  versionLabel,
  timeLabel,
  actionLabel,
}: {
  item: ReviewWorkspaceItem;
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
          {actionLabel} <ArrowRight aria-hidden="true" size={16} />
        </span>
      </div>
    </Link>
  );
}

export function ReviewWorkspace({
  items,
  content,
}: {
  items: ReviewWorkspaceItem[];
  content: ContentDictionary;
}) {
  const pendingItems = items.filter((item) => item.version.status === "in_review");
  const approvedItems = items.filter((item) => item.version.status === "approved");
  const [activeTab, setActiveTab] = useState<ReviewTabKey>(
    pendingItems.length || !approvedItems.length ? "pending" : "approved",
  );
  const visibleItems = activeTab === "pending" ? pendingItems : approvedItems;

  return (
    <div className="space-y-5">
      <AdminTabs
        idPrefix="review"
        ariaLabel="Trạng thái duyệt nội dung"
        value={activeTab}
        onValueChange={setActiveTab}
        items={[
          {
            value: "pending",
            label: contentText(content, "reviews.pendingTitle", "Chờ kiểm tra"),
            icon: ClipboardCheck,
            count: pendingItems.length,
          },
          {
            value: "approved",
            label: contentText(content, "reviews.approvedTitle", "Đã duyệt, chờ hiển thị"),
            icon: Rocket,
            count: approvedItems.length,
          },
        ]}
      />

      <AdminTabPanel idPrefix="review" value={activeTab} className="space-y-4">
        <div className="rounded-2xl border bg-[#fffdf8] px-4 py-3">
          <p className="type-supporting text-[#6f6558]">
            {activeTab === "pending"
              ? contentText(
                  content,
                  "reviews.pendingDescription",
                  "Xem nội dung như bé sẽ thấy, kiểm tra độ an toàn rồi xác nhận hoặc ghi rõ phần cần sửa.",
                )
              : contentText(
                  content,
                  "reviews.approvedDescription",
                  "Các nhiệm vụ đã đạt yêu cầu nhưng chưa được đưa đến khu vực của bé.",
                )}
          </p>
        </div>

        {visibleItems.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleItems.map((item, index) => {
              const pending = item.version.status === "in_review";
              const reviewedAt = item.version.reviewedAt ?? item.version.createdAt;
              const timeLabel = pending
                ? contentTemplate(content, "reviews.submittedAt", "Gửi lúc {time}", {
                    time: new Date(item.version.createdAt).toLocaleString("vi-VN"),
                  })
                : item.scheduledFor
                  ? contentTemplate(content, "reviews.scheduledFor", "Đã hẹn hiển thị lúc {time}", {
                      time: new Date(item.scheduledFor).toLocaleString("vi-VN"),
                    })
                  : contentTemplate(content, "reviews.reviewedAt", "Duyệt lúc {time}", {
                      time: new Date(reviewedAt).toLocaleString("vi-VN"),
                    });

              return (
                <ReviewCard
                  key={item.version.id}
                  item={item}
                  index={index}
                  statusLabel={
                    pending
                      ? contentText(content, "reviews.pendingStatus", "Chờ kiểm tra")
                      : contentText(content, "reviews.approvedStatus", "Đã duyệt")
                  }
                  statusClassName={pending ? "bg-[#fff5d8] text-[#8a5a00]" : "bg-[#edf3ff] text-[#315b9a]"}
                  versionLabel={contentTemplate(content, "reviews.version", "Lần gửi {number}", {
                    number: item.version.versionNumber,
                  })}
                  timeLabel={timeLabel}
                  actionLabel={
                    pending
                      ? contentText(content, "reviews.openReview", "Mở để kiểm tra")
                      : contentText(content, "reviews.openApproved", "Mở để hiển thị")
                  }
                />
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border bg-white p-8 text-center text-[#806d54]">
            {activeTab === "pending"
              ? contentText(content, "reviews.empty", "Hiện không có nhiệm vụ nào cần kiểm tra.")
              : contentText(
                  content,
                  "reviews.approvedEmpty",
                  "Hiện không có nhiệm vụ nào đang chờ hiển thị.",
                )}
          </div>
        )}
      </AdminTabPanel>
    </div>
  );
}
