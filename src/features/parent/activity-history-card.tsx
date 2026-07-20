import Image from "next/image";
import { Card, Pill } from "@/components/ui";
import { contentTemplate, contentText } from "@/content/resolve";
import type { ContentDictionary } from "@/content/types";
import { formatVietnamDateTime } from "@/lib/date-format";
import type { getActivityHistory } from "@/modules/parent/parent-data";

type ActivityItem = Awaited<ReturnType<typeof getActivityHistory>>[number];

function statusPresentation(status: ActivityItem["status"], content: ContentDictionary) {
  if (status === "completed") {
    return {
      label: contentText(content, "activity.completed", "Đã hoàn thành"),
      className: "border-[#b9d7aa] bg-[#edf6e8] text-[#426534]",
    };
  }
  if (status === "in_progress") {
    return {
      label: contentText(content, "activity.inProgress", "Đang tiếp tục"),
      className: "border-[#efd49b] bg-[#fff7df] text-[#8a641f]",
    };
  }
  return {
    label: contentText(content, "activity.exited", "Đã dừng"),
    className: "border-[#d8d2c8] bg-[#f4f1ec] text-[#6c6257]",
  };
}

export function ActivityHistoryCard({ item, content }: { item: ActivityItem; content: ContentDictionary }) {
  const status = statusPresentation(item.status, content);
  const metricClassName = "min-w-0 justify-center px-2 text-center text-xs leading-4 sm:px-3 sm:text-sm";

  return (
    <Card data-activity-card className="p-4 sm:p-5">
      <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-x-3 gap-y-2 sm:grid-cols-[80px_minmax(0,1fr)_auto] sm:items-center sm:gap-x-4">
        <Image
          src={item.missionCover}
          width={84}
          height={84}
          alt=""
          className="row-span-2 size-[72px] rounded-2xl object-cover sm:row-span-1 sm:size-20"
        />
        <div className="min-w-0 self-center">
          <h2 className="text-lg leading-tight font-black break-words">{item.missionTitle}</h2>
          <p data-activity-time className="mt-1 text-sm font-medium text-[#786348] tabular-nums">
            {formatVietnamDateTime(item.startedAt)}
          </p>
        </div>
        <Pill className={`col-start-2 w-fit self-start sm:col-start-3 sm:row-start-1 ${status.className}`}>
          {status.label}
        </Pill>
      </div>
      <div data-activity-metrics className="mt-4 grid grid-cols-3 gap-2 sm:ml-24 sm:flex sm:flex-wrap">
        <Pill className={metricClassName}>
          {contentTemplate(content, "activity.questions", "{correct}/{total} câu", {
            correct: item.correctCount,
            total: item.totalQuestions,
          })}
        </Pill>
        <Pill className={metricClassName}>
          {contentTemplate(content, "activity.hints", "{count} gợi ý", {
            count: item.hints,
          })}
        </Pill>
        <Pill className={metricClassName}>
          {contentTemplate(content, "activity.retries", "{count} lần thử lại", {
            count: item.retries,
          })}
        </Pill>
      </div>
    </Card>
  );
}
