"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { contentText, useContent } from "@/content/client";
import type { ContentValue } from "@/content/types";
import { ContentEntryForm, type ContentEntryItem } from "@/features/admin/content-entry-form";
import { useHydrated } from "@/hooks/use-hydrated";

export function ContentManager({ items, canEdit }: { items: ContentEntryItem[]; canEdit: boolean }) {
  const content = useContent("admin");
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState(items);
  const interactive = useHydrated();

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("vi");
    if (!needle) return rows;
    return rows.filter((item) =>
      `${item.namespace} ${item.key} ${item.description}`.toLocaleLowerCase("vi").includes(needle),
    );
  }, [query, rows]);

  function updateRow(identity: ContentEntryItem, value: ContentValue, active: boolean) {
    setRows((current) =>
      current.map((item) =>
        item.namespace === identity.namespace && item.key === identity.key && item.locale === identity.locale
          ? { ...item, value, active, source: "database" }
          : item,
      ),
    );
  }

  return (
    <div className="space-y-4">
      <label className="relative block max-w-xl">
        <span className="sr-only">Tìm nội dung</span>
        <Search className="absolute top-3 left-3 text-[#887b6c]" size={18} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={contentText(
            content,
            "content.searchPlaceholder",
            "Tìm namespace, key hoặc mô tả nội dung",
          )}
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
                <p className="mt-1 text-xs text-[#806d54]">{row.description}</p>
              </div>
              <span className="rounded-full bg-[#f5f2ec] px-3 py-1 text-xs font-black">
                {row.source === "database" ? "DB override" : "Default"}
              </span>
            </div>
            <ContentEntryForm
              item={row}
              canEdit={canEdit}
              interactive={interactive}
              onSaved={(value, active) => updateRow(row, value, active)}
            />
          </article>
        ))}
      </div>
      {!filtered.length ? (
        <div className="rounded-2xl border bg-white p-8 text-center text-[#806d54]">
          {contentText(content, "content.empty", "Không tìm thấy nội dung phù hợp.")}
        </div>
      ) : null}
    </div>
  );
}
