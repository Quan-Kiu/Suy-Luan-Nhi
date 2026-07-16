"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { requestJson } from "@/lib/http";

type World = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  sortOrder: number;
  themeColor: string;
  coverUrl: string;
  status: "draft" | "published" | "archived";
};
const inputClass = "min-h-10 w-full rounded-xl border px-3 text-sm";

export function WorldManager({ initial }: { initial: World[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [newWorld, setNewWorld] = useState({
    slug: "",
    title: "",
    subtitle: "",
    description: "",
    sortOrder: initial.length + 1,
    themeColor: "green",
    coverUrl: "/assets/cards/world-card-detective-rules.png",
  });

  function update(id: string, patch: Partial<World>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl border bg-white p-4">
            <div className="flex gap-4">
              <Image
                src={item.coverUrl}
                width={130}
                height={100}
                alt=""
                className="h-24 w-32 rounded-xl object-cover"
              />
              <div className="flex-1">
                <input
                  className={`${inputClass} font-black`}
                  placeholder="Tên Mission World"
                  value={item.title}
                  onChange={(event) => update(item.id, { title: event.target.value })}
                />
                <input
                  className={`${inputClass} mt-2`}
                  placeholder="Phụ đề ngắn"
                  value={item.subtitle}
                  onChange={(event) => update(item.id, { subtitle: event.target.value })}
                />
              </div>
            </div>
            <textarea
              rows={3}
              className={`${inputClass} mt-3 py-2`}
              placeholder="Mô tả thế giới nhiệm vụ"
              value={item.description}
              onChange={(event) => update(item.id, { description: event.target.value })}
            />
            <div className="mt-3 grid grid-cols-3 gap-2">
              <input
                type="number"
                className={inputClass}
                value={item.sortOrder}
                onChange={(event) => update(item.id, { sortOrder: Number(event.target.value) })}
              />
              <select
                className={inputClass}
                value={item.themeColor}
                onChange={(event) => update(item.id, { themeColor: event.target.value })}
              >
                <option value="green">Green</option>
                <option value="blue">Blue</option>
                <option value="purple">Purple</option>
                <option value="orange">Orange</option>
              </select>
              <select
                className={inputClass}
                value={item.status}
                onChange={(event) => update(item.id, { status: event.target.value as World["status"] })}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <input
              className={`${inputClass} mt-2`}
              placeholder="/assets/cards/world-cover.png"
              value={item.coverUrl}
              onChange={(event) => update(item.id, { coverUrl: event.target.value })}
            />
            <button
              type="button"
              onClick={async () => {
                try {
                  await requestJson(`/api/admin/worlds/${item.id}`, {
                    method: "PATCH",
                    body: JSON.stringify({
                      title: item.title,
                      subtitle: item.subtitle,
                      description: item.description,
                      sortOrder: item.sortOrder,
                      themeColor: item.themeColor,
                      coverUrl: item.coverUrl,
                      status: item.status,
                    }),
                  });
                  toast.success("Đã cập nhật Mission World");
                  router.refresh();
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Không thể cập nhật");
                }
              }}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#3f392f] px-4 py-2 font-black text-white"
            >
              <Save size={16} />
              Lưu
            </button>
          </article>
        ))}
      </div>
      <article className="rounded-2xl border-2 border-dashed bg-white/70 p-5">
        <h2 className="text-xl font-black">Tạo Mission World mới</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            placeholder="slug"
            className={inputClass}
            value={newWorld.slug}
            onChange={(event) => setNewWorld({ ...newWorld, slug: event.target.value })}
          />
          <input
            placeholder="Tiêu đề"
            className={inputClass}
            value={newWorld.title}
            onChange={(event) => setNewWorld({ ...newWorld, title: event.target.value })}
          />
          <input
            placeholder="Phụ đề"
            className={inputClass}
            value={newWorld.subtitle}
            onChange={(event) => setNewWorld({ ...newWorld, subtitle: event.target.value })}
          />
          <input
            placeholder="Cover URL"
            className={inputClass}
            value={newWorld.coverUrl}
            onChange={(event) => setNewWorld({ ...newWorld, coverUrl: event.target.value })}
          />
          <textarea
            placeholder="Mô tả"
            rows={3}
            className={`${inputClass} py-2 md:col-span-2`}
            value={newWorld.description}
            onChange={(event) => setNewWorld({ ...newWorld, description: event.target.value })}
          />
        </div>
        <button
          type="button"
          onClick={async () => {
            try {
              await requestJson("/api/admin/worlds", { method: "POST", body: JSON.stringify(newWorld) });
              toast.success("Đã tạo Mission World");
              router.refresh();
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Không thể tạo");
            }
          }}
          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#e9641a] px-4 py-2 font-black text-white"
        >
          <Plus size={16} />
          Tạo thế giới
        </button>
      </article>
    </div>
  );
}
