import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui";
import { contentText } from "@/content/resolve";
import { ActivityFilters } from "@/features/parent/activity-filters";
import { ActivityHistoryCard } from "@/features/parent/activity-history-card";
import { normalizeDateQuery } from "@/lib/date-format";
import { getContentNamespace } from "@/modules/content/content";
import { getActiveChild } from "@/modules/family/active-child";
import { getActivityHistory } from "@/modules/parent/parent-data";

export const metadata: Metadata = {
  title: "Lịch sử hoạt động",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; from?: string; to?: string }>;
}) {
  const active = await getActiveChild();
  if (!active) redirect("/onboarding");
  const rawFilters = await searchParams;
  const filters = {
    status: rawFilters.status,
    from: normalizeDateQuery(rawFilters.from),
    to: normalizeDateQuery(rawFilters.to),
  };
  const [items, content] = await Promise.all([
    getActivityHistory(active.child.id, filters),
    getContentNamespace("parent"),
  ]);

  return (
    <>
      <h1 className="type-page-title">{contentText(content, "activity.title", "Lịch sử hoạt động")}</h1>
      <p className="mt-2 text-[#786348]">
        {contentText(
          content,
          "activity.description",
          "Theo dõi hành trình của riêng bé, không so sánh với trẻ khác.",
        )}
      </p>
      <ActivityFilters
        initialStatus={filters.status}
        initialFrom={filters.from}
        initialTo={filters.to}
        labels={{
          all: contentText(content, "activity.allStatuses", "Tất cả trạng thái"),
          completed: contentText(content, "activity.completed", "Đã hoàn thành"),
          inProgress: contentText(content, "activity.inProgress", "Đang tiếp tục"),
          exited: contentText(content, "activity.exited", "Đã dừng"),
          submit: contentText(content, "activity.filter", "Lọc hoạt động"),
        }}
      />
      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <ActivityHistoryCard key={item.id} item={item} content={content} />
        ))}
        {!items.length ? (
          <Card className="p-8 text-center">
            {contentText(content, "activity.empty", "Không có hoạt động phù hợp bộ lọc.")}
          </Card>
        ) : null}
      </div>
    </>
  );
}
