"use client";

import { useState } from "react";
import type { SystemSetting } from "@/api/admin/settings";
import { CreateSystemSettingForm } from "@/features/admin/create-system-setting-form";
import { SystemSettingForm } from "@/features/admin/system-setting-form";

export function SystemSettingsManager({ items }: { items: SystemSetting[] }) {
  const [rows, setRows] = useState(items);

  function upsert(saved: SystemSetting) {
    setRows((current) => {
      const exists = current.some((item) => item.key === saved.key);
      const next = exists
        ? current.map((item) => (item.key === saved.key ? saved : item))
        : [...current, saved];
      return next.sort((left, right) => left.key.localeCompare(right.key));
    });
  }

  return (
    <div className="space-y-5">
      {rows.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {rows.map((row) => (
            <article
              key={row.key}
              className="rounded-3xl border border-[#e5d8c2] bg-white p-5 shadow-[0_8px_24px_rgba(76,55,31,0.05)]"
            >
              <SystemSettingForm item={row} onSaved={upsert} />
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-[#d9c9ae] bg-white p-8 text-center">
          <p className="text-lg font-black text-[#342f28]">Chưa có cài đặt nào được thay đổi</p>
          <p className="mt-2 text-sm leading-6 text-[#6f6558]">
            Hệ thống đang dùng các giá trị mặc định trong mã nguồn. Chỉ thêm cấu hình khi có nhu cầu vận hành
            rõ ràng.
          </p>
        </div>
      )}
      <div className="rounded-3xl border-2 border-dashed border-[#d9c9ae] bg-[#fffaf0] p-5">
        <CreateSystemSettingForm onCreated={upsert} />
      </div>
    </div>
  );
}
