"use client";

import { Award, ChevronDown, Plus, Users } from "lucide-react";
import Image from "next/image";
import type { BadgeItem } from "@/api/admin/badges";
import { BadgeForm } from "@/features/admin/badge-form";

export function BadgeManager({
  items,
  skills,
}: {
  items: BadgeItem[];
  skills: Array<{ id: string; title: string }>;
}) {
  return (
    <div className="space-y-5">
      <section aria-labelledby="new-badge-title">
        <details className="group overflow-hidden rounded-2xl border-2 border-dashed border-[#d9c9ae] bg-[#fffaf0]">
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 marker:hidden">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[#fff0df] text-[#b9470d]">
                <Plus size={19} />
              </span>
              <div>
                <h2 id="new-badge-title" className="type-card-title">
                  Thêm huy hiệu mới
                </h2>
                <p className="type-supporting mt-0.5 text-[#6f6558]">
                  Mở biểu mẫu khi cần tạo phần thưởng mới.
                </p>
              </div>
            </div>
            <ChevronDown size={19} className="transition group-open:rotate-180" />
          </summary>
          <div className="border-t border-[#eadfc9] p-4">
            <BadgeForm
              mode="create"
              skills={skills}
              initial={{ slug: "", name: "", description: "", iconUrl: "", skillId: null, active: true }}
            />
          </div>
        </details>
      </section>

      <section>
        <div className="mb-3">
          <h2 className="type-section-title">Các huy hiệu hiện có</h2>
          <p className="type-supporting mt-1 text-[#6f6558]">
            Có {items.length} huy hiệu. Mở từng dòng để chỉnh sửa khi cần.
          </p>
        </div>
        <div className="grid gap-3 xl:grid-cols-2">
          {items.map((item) => (
            <details
              key={item.id}
              role="article"
              aria-label={`Huy hiệu: ${item.name}`}
              className={`group overflow-hidden rounded-2xl border bg-white shadow-sm ${item.active ? "" : "opacity-75"}`}
            >
              <summary className="flex min-h-20 cursor-pointer list-none items-center gap-3 px-3 py-2 marker:hidden">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border bg-[#f5f0e6]">
                  {item.iconUrl ? (
                    <Image src={item.iconUrl} fill sizes="56px" alt="" className="object-contain p-1" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="type-card-title truncate">{item.name}</h3>
                    <span
                      className={`type-caption rounded-full px-2.5 py-1 font-black ${
                        item.active ? "bg-green-100 text-green-800" : "bg-stone-200 text-stone-700"
                      }`}
                    >
                      {item.active ? "Đang dùng" : "Đã ẩn"}
                    </span>
                  </div>
                  <p className="type-supporting mt-1 truncate text-[#6f6558]">
                    {item.skillTitle || "Không gắn kỹ năng cụ thể"}
                  </p>
                  <div className="type-caption mt-1.5 flex flex-wrap gap-3 font-bold text-[#6f6558]">
                    <span className="inline-flex items-center gap-1">
                      <Award size={13} /> {item.missionCount} nhiệm vụ
                    </span>
                    <span className="inline-flex items-center gap-1 text-[#587048]">
                      <Users size={13} /> {item.earnedCount} bé đã nhận
                    </span>
                  </div>
                </div>
                <ChevronDown size={19} className="shrink-0 transition group-open:rotate-180" />
              </summary>
              <div className="border-t border-[#eadfc9] p-4">
                <BadgeForm mode="edit" skills={skills} initial={item} showUsageSummary={false} />
              </div>
            </details>
          ))}
        </div>
        {!items.length ? (
          <div className="rounded-2xl border bg-white p-8 text-center text-[#6f6558]">
            Chưa có huy hiệu nào. Hãy tạo huy hiệu đầu tiên ở phía trên.
          </div>
        ) : null}
      </section>
    </div>
  );
}
