"use client";

import { useMemo, useState } from "react";
import { Save, Search } from "lucide-react";
import { toast } from "sonner";
import { requestJson } from "@/lib/http";
import type { ContentValue } from "@/content/types";

type Item = {
  namespace: string;
  key: string;
  locale: string;
  value: ContentValue;
  description: string;
  active: boolean;
  source: "default" | "database";
};

type EditableItem = Item & { text: string };

export function ContentManager({ items, canEdit }: { items: Item[]; canEdit: boolean }) {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<EditableItem[]>(
    items.map((item) => ({ ...item, text: JSON.stringify(item.value, null, 2) })),
  );
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("vi");
    if (!needle) return rows;
    return rows.filter((item) =>
      `${item.namespace} ${item.key} ${item.description}`.toLocaleLowerCase("vi").includes(needle),
    );
  }, [query, rows]);
  async function save(row: EditableItem) {
    try {
      const value = JSON.parse(row.text) as ContentValue;
      await requestJson("/api/admin/content", {
        method: "PATCH",
        body: JSON.stringify({
          namespace: row.namespace,
          key: row.key,
          locale: row.locale,
          value,
          description: row.description,
          active: row.active,
        }),
      });
      setRows((current) =>
        current.map((item) =>
          item.namespace === row.namespace && item.key === row.key
            ? { ...item, value, source: "database" }
            : item,
        ),
      );
      toast.success(`Đã lưu ${row.namespace}.${row.key}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể lưu nội dung");
    }
  }
  return (
    <div className="space-y-4">
      <label className="relative block max-w-xl">
        <Search className="absolute top-3 left-3 text-[#887b6c]" size={18} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Tìm namespace, key hoặc mô tả nội dung"
          className="min-h-11 w-full rounded-xl border bg-white py-2 pr-3 pl-10"
        />
      </label>
      <div className="grid gap-4 xl:grid-cols-2">
        {filtered.map((row) => (
          <article
            key={`${row.namespace}:${row.key}:${row.locale}`}
            className="rounded-2xl border bg-white p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black tracking-wider text-[#d95812] uppercase">
                  {row.namespace} · {row.locale}
                </p>
                <h2 className="mt-1 font-mono text-sm font-black">{row.key}</h2>
                <p className="mt-1 text-xs text-[#806d54]">{row.description}</p>
              </div>
              <span className="rounded-full bg-[#f5f2ec] px-3 py-1 text-xs font-black">
                {row.source === "database" ? "DB override" : "Default"}
              </span>
            </div>
            <textarea
              rows={6}
              value={row.text}
              disabled={!canEdit}
              placeholder="Nhập chuỗi hoặc JSON hợp lệ"
              onChange={(event) =>
                setRows((current) =>
                  current.map((item) =>
                    item.namespace === row.namespace && item.key === row.key
                      ? { ...item, text: event.target.value }
                      : item,
                  ),
                )
              }
              className="mt-4 w-full rounded-xl border p-3 font-mono text-sm disabled:bg-[#f7f3eb]"
            />
            <label className="mt-3 flex items-center gap-2 text-sm font-bold">
              <input
                type="checkbox"
                checked={row.active}
                disabled={!canEdit}
                onChange={(event) =>
                  setRows((current) =>
                    current.map((item) =>
                      item.namespace === row.namespace && item.key === row.key
                        ? { ...item, active: event.target.checked }
                        : item,
                    ),
                  )
                }
              />
              Đang sử dụng
            </label>
            {canEdit ? (
              <button
                type="button"
                onClick={() => save(row)}
                className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#3f392f] px-4 font-black text-white"
              >
                <Save size={16} />
                Lưu nội dung
              </button>
            ) : null}
          </article>
        ))}
      </div>
      {!filtered.length ? (
        <div className="rounded-2xl border bg-white p-8 text-center text-[#806d54]">
          Không tìm thấy nội dung phù hợp.
        </div>
      ) : null}
    </div>
  );
}
