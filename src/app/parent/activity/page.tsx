import Image from "next/image";
import { redirect } from "next/navigation";
import { Card, Pill } from "@/components/ui";
import { ParentShell } from "@/features/parent/parent-shell";
import { getActiveChild } from "@/modules/family/active-child";
import { requireParentWorkspace } from "@/modules/parent/access";
import { getActivityHistory, getParentDashboard } from "@/modules/parent/parent-data";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; from?: string; to?: string }>;
}) {
  const { parent } = await requireParentWorkspace();
  const active = await getActiveChild();
  if (!active) redirect("/onboarding");
  const filters = await searchParams;
  const [items, dashboard] = await Promise.all([
    getActivityHistory(active.child.id, filters),
    getParentDashboard(active.child.id, parent.id),
  ]);
  return (
    <ParentShell childName={active.child.displayName} unread={dashboard.unreadNotifications}>
      <h1 className="text-3xl font-black">Lịch sử hoạt động</h1>
      <p className="mt-2 text-[#806d54]">Theo dõi hành trình của riêng bé, không so sánh với trẻ khác.</p>
      <form className="mt-5 grid gap-3 rounded-2xl border bg-white p-4 sm:grid-cols-4">
        <select name="status" defaultValue={filters.status ?? ""} className="min-h-11 rounded-xl border px-3">
          <option value="">Tất cả trạng thái</option>
          <option value="completed">Đã hoàn thành</option>
          <option value="in_progress">Đang tiếp tục</option>
          <option value="exited">Đã dừng</option>
        </select>
        <input
          type="date"
          name="from"
          defaultValue={filters.from}
          className="min-h-11 rounded-xl border px-3"
        />
        <input type="date" name="to" defaultValue={filters.to} className="min-h-11 rounded-xl border px-3" />
        <button className="rounded-xl bg-[#e9641a] px-4 font-black text-white">Lọc hoạt động</button>
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
              <p className="text-sm text-[#806d54]">{new Date(item.startedAt).toLocaleString("vi-VN")}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Pill>
                  {item.correctCount}/{item.totalQuestions} câu
                </Pill>
                <Pill>{item.hints} gợi ý</Pill>
                <Pill>{item.retries} lần thử lại</Pill>
              </div>
            </div>
            <Pill>
              {item.status === "completed"
                ? "Hoàn thành"
                : item.status === "in_progress"
                  ? "Đang tiếp tục"
                  : "Đã dừng"}
            </Pill>
          </Card>
        ))}
        {!items.length ? <Card className="p-8 text-center">Không có hoạt động phù hợp bộ lọc.</Card> : null}
      </div>
    </ParentShell>
  );
}
