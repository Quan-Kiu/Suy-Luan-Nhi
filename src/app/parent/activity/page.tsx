import Image from "next/image";
import { redirect } from "next/navigation";
import { Button, Card, Pill } from "@/components/ui";
import { contentTemplate, contentText } from "@/content/resolve";
import { getContentNamespace } from "@/modules/content/content";
import { getActiveChild } from "@/modules/family/active-child";
import { getActivityHistory } from "@/modules/parent/parent-data";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; from?: string; to?: string }>;
}) {
  const active = await getActiveChild();
  if (!active) redirect("/onboarding");
  const filters = await searchParams;
  const [items, content] = await Promise.all([
    getActivityHistory(active.child.id, filters),
    getContentNamespace("parent"),
  ]);

  return (
    <>
      <h1 className="text-3xl font-black">{contentText(content, "activity.title", "Lịch sử hoạt động")}</h1>
      <p className="mt-2 text-[#786348]">
        {contentText(
          content,
          "activity.description",
          "Theo dõi hành trình của riêng bé, không so sánh với trẻ khác.",
        )}
      </p>
      <form className="mt-5 grid gap-3 rounded-2xl border bg-white p-4 sm:grid-cols-4">
        <label>
          <span className="sr-only">Trạng thái hoạt động</span>
          <select
            name="status"
            defaultValue={filters.status ?? ""}
            className="min-h-11 w-full rounded-xl border px-3"
          >
            <option value="">{contentText(content, "activity.allStatuses", "Tất cả trạng thái")}</option>
            <option value="completed">{contentText(content, "activity.completed", "Đã hoàn thành")}</option>
            <option value="in_progress">
              {contentText(content, "activity.inProgress", "Đang tiếp tục")}
            </option>
            <option value="exited">{contentText(content, "activity.exited", "Đã dừng")}</option>
          </select>
        </label>
        <label>
          <span className="sr-only">Từ ngày</span>
          <input
            type="date"
            name="from"
            defaultValue={filters.from}
            className="min-h-11 w-full rounded-xl border px-3"
          />
        </label>
        <label>
          <span className="sr-only">Đến ngày</span>
          <input
            type="date"
            name="to"
            defaultValue={filters.to}
            className="min-h-11 w-full rounded-xl border px-3"
          />
        </label>
        <Button type="submit" className="min-h-11 rounded-xl px-4 py-2">
          {contentText(content, "activity.filter", "Lọc hoạt động")}
        </Button>
      </form>
      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <Card key={item.id} className="flex items-center gap-4 p-4">
            <Image
              src={item.missionCover}
              width={84}
              height={84}
              alt=""
              className="size-20 rounded-2xl object-cover"
            />
            <div className="flex-1">
              <h2 className="font-black">{item.missionTitle}</h2>
              <p className="text-sm text-[#786348]">{new Date(item.startedAt).toLocaleString("vi-VN")}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Pill>
                  {contentTemplate(content, "activity.questions", "{correct}/{total} câu", {
                    correct: item.correctCount,
                    total: item.totalQuestions,
                  })}
                </Pill>
                <Pill>
                  {contentTemplate(content, "activity.hints", "{count} gợi ý", { count: item.hints })}
                </Pill>
                <Pill>
                  {contentTemplate(content, "activity.retries", "{count} lần thử lại", {
                    count: item.retries,
                  })}
                </Pill>
              </div>
            </div>
            <Pill>
              {item.status === "completed"
                ? contentText(content, "activity.completed", "Hoàn thành")
                : item.status === "in_progress"
                  ? contentText(content, "activity.inProgress", "Đang tiếp tục")
                  : contentText(content, "activity.exited", "Đã dừng")}
            </Pill>
          </Card>
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
