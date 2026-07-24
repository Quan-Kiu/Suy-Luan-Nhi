"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ChildBadgeCollectionItem } from "@/api/child-badges";
import { CalendarDays, Check, LockKeyhole, Map, Sparkles, Trophy, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { contentTemplate, contentText, useContent } from "@/content/client";
import { cn } from "@/lib/utils";

export type BadgeCollectionItem = ChildBadgeCollectionItem;

type Filter = "all" | "earned" | "locked";

const filters: Array<{ value: Filter; key: string; fallback: string }> = [
  { value: "all", key: "badges.filterAll", fallback: "Tất cả" },
  { value: "earned", key: "badges.filterEarned", fallback: "Đã nhận" },
  { value: "locked", key: "badges.filterLocked", fallback: "Chưa mở" },
];

function formatEarnedDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
    new Date(value),
  );
}

function isNewBadge(value: string | null) {
  if (!value) return false;
  return Date.now() - new Date(value).getTime() <= 7 * 24 * 60 * 60 * 1000;
}

export function BadgeCollection({
  childName,
  childAvatarUrl,
  items,
}: {
  childName: string;
  childAvatarUrl: string;
  items: BadgeCollectionItem[];
}) {
  const content = useContent("child");
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<BadgeCollectionItem | null>(null);
  const earnedCount = items.filter((item) => item.earned).length;
  const latestBadge = items.find((item) => item.earned) ?? null;
  const progress = items.length ? Math.round((earnedCount / items.length) * 100) : 0;
  const visibleItems = useMemo(
    () =>
      items.filter((item) => {
        if (filter === "earned") return item.earned;
        if (filter === "locked") return !item.earned;
        return true;
      }),
    [filter, items],
  );

  useEffect(() => {
    if (!selected) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setSelected(null);
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [selected]);

  return (
    <>
      <section className="mx-auto max-w-5xl">
        <div className="rounded-[30px] border border-[#eadfc9] bg-[linear-gradient(135deg,#fff7e8_0%,#fffdf8_58%,#eef8df_100%)] p-5 shadow-[0_18px_45px_rgba(92,62,26,0.10)] sm:p-7">
          <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-center">
            <div>
              <div className="flex items-center gap-3">
                <Image
                  src={childAvatarUrl}
                  width={64}
                  height={64}
                  alt={contentTemplate(content, "badges.avatarAlt", "Avatar của {childName}", {
                    childName,
                  })}
                  className="size-14 rounded-full bg-white object-contain ring-4 ring-white sm:size-16"
                />
                <div>
                  <p className="type-label font-black text-[#b9470d]">
                    {contentText(content, "badges.eyebrow", "Bộ sưu tập thành tích")}
                  </p>
                  <h1 className="type-child-page-title mt-1 text-[#3f321f]">
                    {contentTemplate(content, "badges.title", "Huy hiệu của {childName}", { childName })}
                  </h1>
                </div>
              </div>
              <p className="mt-3 max-w-2xl text-[#6f604b]">
                {contentText(
                  content,
                  "badges.description",
                  "Mỗi huy hiệu lưu lại một điều con đã quan sát, suy nghĩ hoặc kiên trì làm được.",
                )}
              </p>
              <div
                className="mt-5"
                aria-label={contentText(content, "badges.progressLabel", "Tiến độ bộ sưu tập")}
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="type-label font-black text-[#5b472e]">
                    {contentTemplate(content, "badges.progress", "Đã nhận {earned}/{total} huy hiệu", {
                      earned: earnedCount,
                      total: items.length,
                    })}
                  </span>
                  <span className="type-label font-black text-[#2f6e38]">{progress}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white ring-1 ring-[#e4d7bf]">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#e9641a,#f2b53f,#75a844)] transition-[width] duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/90 bg-white/80 p-4 text-center shadow-sm">
              {latestBadge ? (
                <button
                  type="button"
                  onClick={() => setSelected(latestBadge)}
                  className="group w-full rounded-2xl outline-none focus-visible:ring-4 focus-visible:ring-[#f2b53f]/45"
                  aria-label={contentTemplate(
                    content,
                    "badges.openLatest",
                    "Xem huy hiệu mới nhất: {badgeName}",
                    { badgeName: latestBadge.name },
                  )}
                >
                  <div className="relative mx-auto size-28">
                    <div className="absolute inset-3 rounded-full bg-[#fff3c9] blur-md transition group-hover:scale-110" />
                    <Image
                      src={latestBadge.iconUrl}
                      fill
                      priority
                      sizes="112px"
                      alt=""
                      className="relative object-contain drop-shadow-[0_10px_12px_rgba(101,67,20,0.22)] transition group-hover:-translate-y-1 group-hover:scale-105"
                    />
                  </div>
                  <p className="type-caption mt-2 font-black tracking-wide text-[#b9470d] uppercase">
                    {contentText(content, "badges.latest", "Mới nhận gần đây")}
                  </p>
                  <p className="type-card-title mt-1 text-[#3f321f]">{latestBadge.name}</p>
                </button>
              ) : (
                <div className="py-2">
                  <div className="mx-auto grid size-24 place-items-center rounded-full bg-[#fff3d9] text-[#b9470d]">
                    <Trophy size={44} aria-hidden="true" />
                  </div>
                  <p className="type-card-title mt-3 text-[#3f321f]">
                    {contentText(content, "badges.emptyTitle", "Huy hiệu đầu tiên đang chờ con")}
                  </p>
                  <Link
                    href="/missions"
                    className="type-action mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#b9470d] px-4 py-2.5 text-white"
                  >
                    <Map size={18} />
                    {contentText(content, "badges.exploreMissions", "Khám phá nhiệm vụ")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="type-child-section-title text-[#3f321f]">
              {contentText(content, "badges.collectionTitle", "Tủ huy hiệu")}
            </h2>
            <p className="type-supporting mt-1 text-[#806d54]">
              {contentText(
                content,
                "badges.collectionDescription",
                "Chạm vào một huy hiệu để xem câu chuyện của nó.",
              )}
            </p>
          </div>
          <div className="flex rounded-2xl border border-[#e0d2b8] bg-white/80 p-1" aria-label="Lọc huy hiệu">
            {filters.map((item) => (
              <button
                key={item.value}
                type="button"
                aria-pressed={filter === item.value}
                onClick={() => setFilter(item.value)}
                className={cn(
                  "type-label min-h-10 rounded-xl px-3 font-black transition",
                  filter === item.value ? "bg-[#b9470d] text-white" : "text-[#6a573e] hover:bg-[#fff3df]",
                )}
              >
                {contentText(content, item.key, item.fallback)}
              </button>
            ))}
          </div>
        </div>

        {visibleItems.length ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {visibleItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelected(item)}
                className={cn(
                  "group relative min-h-[230px] overflow-hidden rounded-[24px] border p-4 text-left shadow-[0_12px_30px_rgba(92,62,26,0.08)] transition hover:-translate-y-1 focus-visible:ring-4 focus-visible:ring-[#f2b53f]/45 focus-visible:outline-none",
                  item.earned
                    ? "border-[#ead5aa] bg-white"
                    : "border-[#ded7cb] bg-[linear-gradient(145deg,#f5f2eb,#ebe7df)]",
                )}
                aria-label={contentTemplate(
                  content,
                  item.earned ? "badges.openEarned" : "badges.openLocked",
                  item.earned ? "Xem huy hiệu {badgeName}" : "Xem cách mở huy hiệu {badgeName}",
                  { badgeName: item.name },
                )}
              >
                <div className="relative mx-auto size-28 sm:size-32">
                  {item.earned ? (
                    <div className="absolute inset-4 rounded-full bg-[#fff1bc] blur-lg" />
                  ) : null}
                  <Image
                    src={item.iconUrl}
                    fill
                    sizes="128px"
                    alt=""
                    className={cn(
                      "relative object-contain transition group-hover:scale-105",
                      item.earned
                        ? "drop-shadow-[0_9px_10px_rgba(88,58,20,0.20)]"
                        : "opacity-38 grayscale-[0.9]",
                    )}
                  />
                  <span
                    className={cn(
                      "absolute right-0 bottom-0 grid size-9 place-items-center rounded-full border-2 border-white text-white shadow-md",
                      item.earned ? "bg-[#4f8a43]" : "bg-[#7d7569]",
                    )}
                  >
                    {item.earned ? <Check size={18} strokeWidth={3} /> : <LockKeyhole size={16} />}
                  </span>
                </div>
                <p className="type-card-title mt-3 line-clamp-2 text-center text-[#3f321f]">{item.name}</p>
                <p className="type-caption mt-1 text-center font-bold text-[#806d54]">
                  {item.earned
                    ? contentText(content, "badges.earned", "Đã nhận")
                    : contentText(content, "badges.locked", "Chưa mở")}
                </p>
                {item.earned && isNewBadge(item.unlockedAt) ? (
                  <span className="type-caption absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-[#fff0c2] px-2 py-1 font-black text-[#9f4d0b]">
                    <Sparkles size={13} /> {contentText(content, "badges.new", "Mới")}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-[24px] border border-dashed border-[#d9c9ae] bg-white/65 p-8 text-center">
            <p className="type-card-title text-[#3f321f]">
              {filter === "earned"
                ? contentText(content, "badges.noEarnedInFilter", "Con chưa nhận huy hiệu nào.")
                : contentText(content, "badges.noLockedInFilter", "Con đã mở tất cả huy hiệu rồi!")}
            </p>
          </div>
        )}
      </section>

      <AnimatePresence>
        {selected ? (
          <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-5">
            <motion.button
              type="button"
              aria-label={contentText(content, "badges.closeDetails", "Đóng chi tiết huy hiệu")}
              className="absolute inset-0 bg-[#2e2418]/55 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
            />
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="badge-detail-title"
              className="relative max-h-[88vh] w-full overflow-y-auto rounded-t-[30px] border border-[#eadfc9] bg-[#fffaf0] p-5 shadow-2xl sm:max-w-lg sm:rounded-[30px] sm:p-7"
              initial={{ opacity: 0, y: 36, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.18 }}
            >
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 grid size-11 place-items-center rounded-full border border-[#e2d5bd] bg-white text-[#5d4e3b]"
                aria-label={contentText(content, "badges.closeDetails", "Đóng chi tiết huy hiệu")}
              >
                <X size={20} />
              </button>
              <div className="mx-auto mt-2 grid size-40 place-items-center rounded-full bg-white shadow-inner">
                <div className="relative size-32">
                  <Image
                    src={selected.iconUrl}
                    fill
                    sizes="128px"
                    alt=""
                    className={cn(
                      "object-contain",
                      selected.earned
                        ? "drop-shadow-[0_12px_12px_rgba(88,58,20,0.22)]"
                        : "opacity-45 grayscale",
                    )}
                  />
                </div>
              </div>
              <div className="mt-5 text-center">
                <p
                  className={cn(
                    "type-label inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-black",
                    selected.earned ? "bg-[#e7f4df] text-[#39733c]" : "bg-[#ece7df] text-[#6d655b]",
                  )}
                >
                  {selected.earned ? <Check size={16} /> : <LockKeyhole size={16} />}
                  {selected.earned
                    ? contentText(content, "badges.earned", "Đã nhận")
                    : contentText(content, "badges.locked", "Chưa mở")}
                </p>
                <h2 id="badge-detail-title" className="type-child-section-title mt-3 text-[#3f321f]">
                  {selected.name}
                </h2>
                <p className="mt-2 text-[#6f604b]">{selected.description}</p>
              </div>

              <div className="mt-5 space-y-3 rounded-[22px] border border-[#eadfc9] bg-white/80 p-4">
                {selected.earned && selected.unlockedAt ? (
                  <p className="type-supporting flex items-start gap-3 text-[#5f503d]">
                    <CalendarDays size={19} className="mt-0.5 shrink-0 text-[#b9470d]" />
                    <span>
                      {contentTemplate(content, "badges.earnedDate", "Nhận ngày {date}", {
                        date: formatEarnedDate(selected.unlockedAt),
                      })}
                    </span>
                  </p>
                ) : null}
                {selected.sourceMissionTitle ? (
                  <p className="type-supporting flex items-start gap-3 text-[#5f503d]">
                    <Map size={19} className="mt-0.5 shrink-0 text-[#b9470d]" />
                    <span>
                      {contentTemplate(content, "badges.fromMission", "Từ nhiệm vụ: {missionName}", {
                        missionName: selected.sourceMissionTitle,
                      })}
                    </span>
                  </p>
                ) : null}
                {selected.skillTitle ? (
                  <p className="type-supporting flex items-start gap-3 text-[#5f503d]">
                    <Sparkles size={19} className="mt-0.5 shrink-0 text-[#b9470d]" />
                    <span>
                      {contentTemplate(content, "badges.skill", "Con đã luyện: {skillName}", {
                        skillName: selected.skillTitle,
                      })}
                    </span>
                  </p>
                ) : null}
              </div>

              {!selected.earned ? (
                <Link
                  href="/missions"
                  onClick={() => setSelected(null)}
                  className="type-action mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#b9470d] px-5 py-3 text-white shadow-[0_7px_0_#7f2e05]"
                >
                  <Map size={19} />
                  {contentText(content, "badges.exploreToUnlock", "Khám phá nhiệm vụ để mở")}
                </Link>
              ) : null}
            </motion.section>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
