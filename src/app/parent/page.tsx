import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell, Clock3, MessageCircle, Trophy } from "lucide-react";
import { requireParent } from "@/auth/session";
import { Card, Pill } from "@/components/ui";
import { ParentGateForm } from "@/features/parent/parent-gate-form";
import { ParentShell } from "@/features/parent/parent-shell";
import { getActiveChild } from "@/modules/family/active-child";
import { getOrCreateParentProfile } from "@/modules/family/family";
import { hasParentGate } from "@/modules/family/parent-gate";
import { getParentDashboard, getSuggestions } from "@/modules/parent/parent-data";
export default async function Page() {
  const session = await requireParent();
  const parent = await getOrCreateParentProfile(session.user.id, session.user.name);
  if (!(await hasParentGate(parent.id)))
    return (
      <main className="paper-texture min-h-screen px-5 py-10">
        <div className="mx-auto max-w-md text-center">
          <Image
            src="/assets/props/badge-privacy-shield-lock.png"
            width={120}
            height={120}
            alt="Lá chắn Parent Gate"
            className="mx-auto size-28 object-contain"
          />
          <h1 className="mt-3 text-3xl font-black">Khu vực phụ huynh</h1>
          <p className="mt-2 text-[#806d54]">
            Xác nhận người lớn trước khi hiển thị tiến độ và cài đặt gia đình.
          </p>
        </div>
        <ParentGateForm hasPin={Boolean(parent.pinHash)} />
      </main>
    );
  const active = await getActiveChild();
  if (!active) redirect("/onboarding");
  const data = await getParentDashboard(active.child.id, parent.id);
  const suggestions = await getSuggestions(active.child.ageGroup);
  const suggestion = suggestions[0];
  return (
    <ParentShell childName={active.child.displayName} unread={data.unreadNotifications}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-[#806d54]">Xin chào, {session.user.name}</p>
          <h1 className="text-3xl font-black">Tuần của {active.child.displayName}</h1>
        </div>
        <Link href="/parent/notifications">
          <Pill>
            <Bell size={16} />
            {data.unreadNotifications} chưa đọc
          </Pill>
        </Link>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-4">
        {[
          [data.totals.missions, "Nhiệm vụ", Trophy],
          [data.totals.questions, "Câu hoàn thành", MessageCircle],
          [data.totals.minutes, "Phút khám phá", Clock3],
          [data.earnedBadges.length, "Huy hiệu", Trophy],
        ].map(([value, label, Icon]) => {
          const I = Icon as typeof Trophy;
          return (
            <Card key={String(label)} className="p-4 text-center">
              <I className="mx-auto text-[#e9641a]" />
              <p className="mt-2 text-3xl font-black">{String(value)}</p>
              <p className="text-xs font-bold text-[#806d54]">{String(label)}</p>
            </Card>
          );
        })}
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">Hoạt động gần đây</h2>
            <Link href="/parent/activity" className="text-sm font-bold underline">
              Xem tất cả
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {data.recentSessions.length ? (
              data.recentSessions.map((item) => (
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
                    <p className="text-xs text-[#806d54]">
                      {item.status === "completed"
                        ? `Hoàn thành · ${item.stars} sao`
                        : item.status === "in_progress"
                          ? "Đang tiếp tục"
                          : "Đã dừng"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-2xl bg-[#f7f1e5] p-5 text-center text-sm">
                Bé chưa có hoạt động. Một nhiệm vụ ngắn là khởi đầu vừa đủ.
              </p>
            )}
          </div>
        </Card>
        <Card className="bg-[#eaf3df] p-5">
          <p className="text-xs font-black tracking-wider text-[#608049] uppercase">Gợi ý trò chuyện</p>
          <h2 className="mt-2 text-xl font-black">{suggestion?.title ?? "Hỏi về cách bé nghĩ"}</h2>
          <p className="mt-3 font-bold">“{suggestion?.questionText ?? "Con đã thử cách nào trước?"}”</p>
          <p className="mt-2 text-sm text-[#61724f]">{suggestion?.purpose}</p>
          <Link href="/parent/suggestions" className="mt-4 inline-block text-sm font-black underline">
            Xem thêm gợi ý
          </Link>
        </Card>
      </div>
      <h2 className="mt-6 text-xl font-black">Thói quen tư duy nổi bật</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {data.skills.length ? (
          data.skills.map(([skill, count]) => (
            <Pill key={skill}>
              {skill} · {count}
            </Pill>
          ))
        ) : (
          <Pill>Chưa có đủ dữ liệu</Pill>
        )}
      </div>
    </ParentShell>
  );
}
