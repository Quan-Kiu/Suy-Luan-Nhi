"use client";

import { ChevronDown, Plus } from "lucide-react";
import Image from "next/image";
import { contentText, useContent } from "@/content/client";
import { WorldForm, type WorldItem } from "@/features/admin/world-form";

const statusLabels = {
  draft: "Bản nháp",
  published: "Đang hiển thị",
  archived: "Đã lưu trữ",
} as const;

export function WorldManager({ initial }: { initial: WorldItem[] }) {
  const content = useContent("admin");
  return (
    <div className="space-y-4">
      <div className="grid gap-3 xl:grid-cols-2">
        {initial.map((item) => (
          <details
            key={item.id}
            role="article"
            aria-label={`Chủ đề nhiệm vụ: ${item.title}`}
            className="group overflow-hidden rounded-2xl border bg-white shadow-sm"
          >
            <summary className="flex min-h-24 cursor-pointer list-none items-center gap-3 p-3 marker:hidden">
              <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-xl border bg-[#f5f0e6]">
                <Image src={item.coverUrl} fill sizes="112px" alt="" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="type-card-title truncate">{item.title}</h2>
                  <span className="type-caption rounded-full bg-[#edf4df] px-2.5 py-1 font-black text-[#587048]">
                    {statusLabels[item.status]}
                  </span>
                </div>
                <p className="type-supporting mt-1 truncate font-bold text-[#6f6558]">{item.subtitle}</p>
                <p className="type-caption mt-1 text-[#806d54]">
                  Vị trí {item.sortOrder} · {item.ageGroups.join(", ")} tuổi
                </p>
              </div>
              <ChevronDown size={19} className="shrink-0 transition group-open:rotate-180" />
            </summary>
            <div className="border-t border-[#eadfc9] p-4">
              <WorldForm mode="edit" initial={item} showPreview={false} />
            </div>
          </details>
        ))}
      </div>

      <article>
        <details className="group overflow-hidden rounded-2xl border-2 border-dashed bg-white/70">
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 marker:hidden">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[#fff0df] text-[#b9470d]">
                <Plus size={19} />
              </span>
              <div>
                <h2 className="type-card-title">
                  {contentText(content, "world.createTitle", "Thêm chủ đề nhiệm vụ")}
                </h2>
                <p className="type-supporting mt-0.5 text-[#6f6558]">
                  Mở biểu mẫu khi cần tạo thêm một chủ đề.
                </p>
              </div>
            </div>
            <ChevronDown size={19} className="transition group-open:rotate-180" />
          </summary>
          <div className="border-t border-[#eadfc9] p-4">
            <WorldForm
              mode="create"
              initial={{
                slug: "",
                title: "",
                subtitle: "",
                description: "",
                sortOrder: initial.length + 1,
                themeColor: "green",
                coverUrl: "/assets/cards/world-card-detective-rules.png",
                ageGroups: ["6-8", "9-10", "11-12"],
                status: "draft",
              }}
            />
          </div>
        </details>
      </article>
    </div>
  );
}
