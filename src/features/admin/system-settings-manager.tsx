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
    <div className="space-y-4">
      {rows.map((row) => (
        <div key={row.key} className="rounded-2xl border bg-white p-4">
          <SystemSettingForm item={row} onSaved={upsert} />
        </div>
      ))}
      <div className="rounded-2xl border-2 border-dashed bg-white/70 p-4">
        <CreateSystemSettingForm onCreated={upsert} />
      </div>
    </div>
  );
}
