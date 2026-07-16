"use client";
import { useState } from "react";
import { toast } from "sonner";
import { requestJson } from "@/lib/http";
type Setting = { key: string; value: unknown; updatedAt: Date | string };
export function SystemSettingsManager({ items }: { items: Setting[] }) {
  const [rows, setRows] = useState(
    items.map((item) => ({ ...item, text: JSON.stringify(item.value, null, 2) })),
  );
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("true");
  async function save(key: string, text: string) {
    try {
      const value = JSON.parse(text);
      const saved = await requestJson<Setting>("/api/admin/settings", {
        method: "PATCH",
        body: JSON.stringify({ key, value }),
      });
      const textValue = JSON.stringify(saved.value, null, 2);
      setRows((current) => {
        const existing = current.some((item) => item.key === saved.key);
        if (existing) {
          return current.map((item) => (item.key === saved.key ? { ...saved, text: textValue } : item));
        }
        return [...current, { ...saved, text: textValue }].sort((a, b) => a.key.localeCompare(b.key));
      });
      if (key === newKey) {
        setNewKey("");
        setNewValue("true");
      }
      toast.success("Đã lưu system setting");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "JSON hoặc dữ liệu chưa hợp lệ");
    }
  }
  return (
    <div className="space-y-4">
      {rows.map((row, index) => (
        <div key={row.key} className="rounded-2xl border bg-white p-4">
          <strong>{row.key}</strong>
          <textarea
            rows={4}
            className="mt-2 w-full rounded-xl border p-3 font-mono text-xs"
            placeholder="Nhập JSON hợp lệ"
            value={row.text}
            onChange={(event) =>
              setRows((current) =>
                current.map((item, itemIndex) =>
                  itemIndex === index ? { ...item, text: event.target.value } : item,
                ),
              )
            }
          />
          <button
            type="button"
            onClick={() => save(row.key, row.text)}
            className="mt-2 rounded-xl bg-[#3f392f] px-4 py-2 font-black text-white"
          >
            Lưu
          </button>
        </div>
      ))}
      <div className="rounded-2xl border-2 border-dashed bg-white/70 p-4">
        <h2 className="font-black">Thêm setting</h2>
        <input
          value={newKey}
          onChange={(event) => setNewKey(event.target.value)}
          placeholder="key.ví_dụ"
          className="mt-3 min-h-11 w-full rounded-xl border px-3"
        />
        <textarea
          value={newValue}
          onChange={(event) => setNewValue(event.target.value)}
          rows={4}
          className="mt-2 w-full rounded-xl border p-3 font-mono text-xs"
        />
        <button
          type="button"
          onClick={() => save(newKey, newValue)}
          className="mt-2 rounded-xl bg-[#e9641a] px-4 py-2 font-black text-white"
        >
          Thêm setting
        </button>
      </div>
    </div>
  );
}
