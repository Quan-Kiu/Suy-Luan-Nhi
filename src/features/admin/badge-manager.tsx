"use client";

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
    <div className="space-y-6">
      <section
        aria-labelledby="new-badge-title"
        className="rounded-3xl border-2 border-dashed border-[#d9c9ae] bg-[#fffaf0] p-5"
      >
        <h2 id="new-badge-title" className="text-xl font-black">
          Thêm huy hiệu mới
        </h2>
        <p className="mt-1 text-sm leading-6 text-[#6f6558]">
          Tạo phần thưởng trước, sau đó chọn huy hiệu đó trong màn hình soạn nhiệm vụ.
        </p>
        <div className="mt-5">
          <BadgeForm
            mode="create"
            skills={skills}
            initial={{ slug: "", name: "", description: "", iconUrl: "", skillId: null, active: true }}
          />
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-black">Các huy hiệu hiện có</h2>
          <p className="mt-1 text-sm text-[#6f6558]">
            Có {items.length} huy hiệu. Huy hiệu ngừng dùng vẫn được giữ để bảo toàn lịch sử của bé.
          </p>
        </div>
        <div className="grid gap-4 2xl:grid-cols-2">
          {items.map((item) => (
            <article
              key={item.id}
              aria-label={`Huy hiệu: ${item.name}`}
              className={`rounded-3xl border bg-white p-5 ${item.active ? "" : "opacity-75"}`}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black">{item.name}</h3>
                  <p className="text-xs font-bold text-[#6f6558]">
                    {item.active ? "Đang có thể sử dụng" : "Đã ngừng dùng cho nội dung mới"}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-black ${item.active ? "bg-green-100 text-green-800" : "bg-stone-200 text-stone-700"}`}
                >
                  {item.active ? "Đang dùng" : "Đã ẩn"}
                </span>
              </div>
              <BadgeForm mode="edit" skills={skills} initial={item} />
            </article>
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
