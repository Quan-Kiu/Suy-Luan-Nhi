import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui";
import { contentTemplate, contentText } from "@/content/resolve";
import type { ContentDictionary } from "@/content/types";

type RecentSession = {
  id: string;
  status: string;
  stars: number;
  missionTitle: string;
  missionCover: string;
};

function statusText(item: RecentSession, content: ContentDictionary) {
  if (item.status === "completed") {
    return contentTemplate(content, "dashboard.completed", "Hoàn thành · {stars} sao", {
      stars: item.stars,
    });
  }
  if (item.status === "in_progress") {
    return contentText(content, "dashboard.inProgress", "Đang tiếp tục");
  }
  return contentText(content, "dashboard.exited", "Đã dừng");
}

export function RecentActivityCard({
  items,
  content,
}: {
  items: RecentSession[];
  content: ContentDictionary;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h2 className="type-section-title">
          {contentText(content, "dashboard.recentTitle", "Hoạt động gần đây")}
        </h2>
        <Link href="/parent/activity" className="type-action font-bold underline">
          {contentText(content, "dashboard.viewAll", "Xem tất cả")}
        </Link>
      </div>
      <div className="mt-4 space-y-3">
        {items.length ? (
          items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-[#fff9ef] p-3">
              <Image
                src={item.missionCover}
                width={64}
                height={64}
                alt=""
                className="size-14 rounded-xl object-cover"
              />
              <div className="flex-1">
                <p className="font-black">{item.missionTitle}</p>
                <p className="type-caption text-[#786348]">{statusText(item, content)}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="type-supporting rounded-2xl bg-[#f7f1e5] p-5 text-center">
            {contentText(
              content,
              "dashboard.emptyActivity",
              "Bé chưa có hoạt động. Một nhiệm vụ ngắn là khởi đầu vừa đủ.",
            )}
          </p>
        )}
      </div>
    </Card>
  );
}
