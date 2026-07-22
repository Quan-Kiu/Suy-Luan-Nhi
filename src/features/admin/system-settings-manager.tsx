"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Gauge, ShieldCheck, ToggleLeft, Wrench } from "lucide-react";
import { useState } from "react";
import type { SystemSetting } from "@/api/admin/settings";
import {
  getManagedSystemSettingDefinition,
  systemSettingGroupLabels,
  type SystemSettingGroup,
} from "@/domain/system-settings";
import { SystemSettingForm } from "@/features/admin/system-setting-form";
import { queryKeys } from "@/lib/query/keys";

const groupOrder: SystemSettingGroup[] = ["maintenance", "features", "limits", "security"];
const groupIcons = {
  maintenance: Wrench,
  features: ToggleLeft,
  limits: Gauge,
  security: ShieldCheck,
} satisfies Record<SystemSettingGroup, typeof Wrench>;

function settingValueSummary(item: SystemSetting) {
  const definition = getManagedSystemSettingDefinition(item.key);
  if (definition?.kind === "boolean") return item.value ? "Đang bật" : "Đang tắt";
  if (definition?.kind === "number")
    return `${String(item.value)}${definition.unit ? ` ${definition.unit}` : ""}`;
  return "Đã thiết lập nội dung";
}
export function SystemSettingsManager({ items }: { items: SystemSetting[] }) {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState(items);

  function upsert(saved: SystemSetting) {
    setRows((current) => current.map((item) => (item.key === saved.key ? saved : item)));
    if (saved.key === "features.feedbackEnabled" || saved.key === "limits.feedbackMaxAttachments") {
      void queryClient.invalidateQueries({ queryKey: queryKeys.feedback.uploadConfig });
    }
  }

  return (
    <div className="space-y-7">
      {groupOrder.map((group) => {
        const groupItems = rows.filter(
          (item) => getManagedSystemSettingDefinition(item.key)?.group === group,
        );
        if (!groupItems.length) return null;
        const copy = systemSettingGroupLabels[group];
        const Icon = groupIcons[group];
        return (
          <section key={group} aria-labelledby={`system-settings-${group}`} className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#342f28] text-white">
                <Icon size={21} />
              </span>
              <div>
                <h2 id={`system-settings-${group}`} className="type-section-title">
                  {copy.title}
                </h2>
                <p className="type-supporting mt-1 max-w-3xl text-[#6f6558]">{copy.description}</p>
              </div>
            </div>
            <div className="grid gap-3 xl:grid-cols-2">
              {groupItems.map((row) => {
                const definition = getManagedSystemSettingDefinition(row.key);
                return (
                  <details
                    key={row.key}
                    className={`group overflow-hidden rounded-2xl border bg-white shadow-sm ${
                      group === "maintenance" ? "border-amber-200" : "border-[#e5d8c2]"
                    }`}
                  >
                    <summary className="flex min-h-20 cursor-pointer list-none items-center gap-3 px-4 py-3 marker:hidden">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="type-card-title">{definition?.label ?? row.key}</h3>
                          <span className="type-caption rounded-full bg-[#f5f2ec] px-2.5 py-1 font-black text-[#6f6558]">
                            {settingValueSummary(row)}
                          </span>
                        </div>
                        <p className="type-supporting mt-1 line-clamp-2 text-[#6f6558]">
                          {definition?.description ?? "Mở để xem và thay đổi cấu hình."}
                        </p>
                      </div>
                      <ChevronDown size={19} className="shrink-0 transition group-open:rotate-180" />
                    </summary>
                    <div className="border-t border-[#eadfc9] p-4">
                      <SystemSettingForm item={row} onSaved={upsert} showHeader={false} />
                    </div>
                  </details>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
