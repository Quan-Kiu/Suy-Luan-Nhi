"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Gauge, ShieldCheck, ToggleLeft, Wrench } from "lucide-react";
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
    <div className="space-y-8">
      {groupOrder.map((group) => {
        const groupItems = rows.filter(
          (item) => getManagedSystemSettingDefinition(item.key)?.group === group,
        );
        if (!groupItems.length) return null;
        const copy = systemSettingGroupLabels[group];
        const Icon = groupIcons[group];
        return (
          <section key={group} aria-labelledby={`system-settings-${group}`} className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#342f28] text-white">
                <Icon size={21} />
              </span>
              <div>
                <h2 id={`system-settings-${group}`} className="text-xl font-black text-[#342f28]">
                  {copy.title}
                </h2>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-[#6f6558]">{copy.description}</p>
              </div>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {groupItems.map((row) => (
                <article
                  key={row.key}
                  className={
                    group === "maintenance"
                      ? "rounded-3xl border border-amber-200 bg-white p-5 shadow-[0_8px_24px_rgba(76,55,31,0.06)]"
                      : "rounded-3xl border border-[#e5d8c2] bg-white p-5 shadow-[0_8px_24px_rgba(76,55,31,0.05)]"
                  }
                >
                  <SystemSettingForm item={row} onSaved={upsert} />
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
