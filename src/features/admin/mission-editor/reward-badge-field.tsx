"use client";

import { Award, Check, Settings2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useFormContext, useWatch } from "react-hook-form";
import { contentText, useContent } from "@/content/client";
import type { MissionEditorTaxonomy } from "@/features/admin/mission-editor/types";
import { cn } from "@/lib/utils";
import type { AdminMissionDraft } from "@/modules/admin/schemas";

type BadgeOption = MissionEditorTaxonomy["badges"][number];

export function MissionRewardBadgeField({ badges }: { badges: BadgeOption[] }) {
  const content = useContent("admin");
  const form = useFormContext<AdminMissionDraft>();
  const selectedBadgeId = useWatch({ control: form.control, name: "rewardBadgeId" });
  const selectableBadges = badges.filter((badge) => badge.active || badge.id === selectedBadgeId);
  const error = form.formState.errors.rewardBadgeId?.message;

  function selectBadge(badgeId: string | null) {
    form.setValue("rewardBadgeId", badgeId, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
  }

  return (
    <section
      aria-labelledby="mission-reward-badge-title"
      className="rounded-2xl border border-[#dfd5c5] bg-[#fbf8f2] p-4 sm:p-5 md:col-span-2"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 id="mission-reward-badge-title" className="flex items-center gap-2 text-base font-black">
            <Award aria-hidden="true" size={20} className="text-[#a65420]" />
            {contentText(content, "missionEditor.rewardSectionTitle", "Huy hiệu khi hoàn thành")}
          </h3>
          <p id="mission-reward-badge-description" className="mt-1 max-w-2xl text-sm text-[#6f6558]">
            {contentText(
              content,
              "missionEditor.rewardSectionDescription",
              "Chọn huy hiệu bé sẽ nhận sau khi hoàn thành nhiệm vụ. Mỗi nhiệm vụ có thể trao một huy hiệu.",
            )}
          </p>
        </div>
        <Link
          href="/admin/badges"
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm font-black text-[#51483d] hover:bg-[#f4eee4] focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <Settings2 aria-hidden="true" size={16} />
          {contentText(content, "missionEditor.manageBadges", "Quản lý huy hiệu")}
        </Link>
      </div>

      <fieldset aria-describedby="mission-reward-badge-description" className="mt-4">
        <legend className="sr-only">
          {contentText(content, "missionEditor.reward", "Huy hiệu nhận được")}
        </legend>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <label
            className={cn(
              "relative flex min-h-24 cursor-pointer items-center gap-3 rounded-2xl border-2 bg-white p-3 transition-colors",
              "focus-within:outline-2 focus-within:outline-offset-2",
              selectedBadgeId === null
                ? "border-[#517d3f] bg-[#f3f8ef]"
                : "border-[#e2d9ca] hover:border-[#bda98d]",
            )}
          >
            <input
              type="radio"
              name="rewardBadgeId"
              value=""
              checked={selectedBadgeId === null}
              onChange={() => selectBadge(null)}
              className="sr-only"
            />
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#f1ebe1] text-[#8c7658]">
              <Award aria-hidden="true" size={28} />
            </span>
            <span className="min-w-0">
              <span className="block font-black">
                {contentText(content, "missionEditor.noRewardTitle", "Không trao huy hiệu")}
              </span>
              <span className="mt-1 block text-xs text-[#6f6558]">
                {contentText(
                  content,
                  "missionEditor.noRewardDescription",
                  "Bé vẫn hoàn thành nhiệm vụ nhưng không nhận huy hiệu mới.",
                )}
              </span>
            </span>
            {selectedBadgeId === null ? (
              <Check aria-hidden="true" size={18} className="absolute top-3 right-3 text-[#517d3f]" />
            ) : null}
          </label>

          {selectableBadges.map((badge) => {
            const selected = selectedBadgeId === badge.id;
            return (
              <label
                key={badge.id}
                className={cn(
                  "relative flex min-h-24 cursor-pointer items-center gap-3 rounded-2xl border-2 bg-white p-3 transition-colors",
                  "focus-within:outline-2 focus-within:outline-offset-2",
                  selected ? "border-[#517d3f] bg-[#f3f8ef]" : "border-[#e2d9ca] hover:border-[#bda98d]",
                )}
              >
                <input
                  type="radio"
                  name="rewardBadgeId"
                  value={badge.id}
                  checked={selected}
                  onChange={() => selectBadge(badge.id)}
                  className="sr-only"
                />
                <span className="relative size-14 shrink-0 overflow-hidden rounded-2xl border bg-white">
                  <Image src={badge.iconUrl} alt="" fill sizes="56px" className="object-contain p-1" />
                </span>
                <span className="min-w-0">
                  <span className="block font-black">{badge.name}</span>
                  <span className="mt-1 block text-xs text-[#6f6558]">
                    {badge.active
                      ? contentText(content, "missionEditor.badgeAvailable", "Sẵn sàng trao cho bé")
                      : contentText(
                          content,
                          "missionEditor.badgeInactive",
                          "Đã ngừng dùng — đang được nhiệm vụ này chọn",
                        )}
                  </span>
                </span>
                {selected ? (
                  <Check aria-hidden="true" size={18} className="absolute top-3 right-3 text-[#517d3f]" />
                ) : null}
              </label>
            );
          })}
        </div>
      </fieldset>

      {selectableBadges.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed bg-white px-3 py-2 text-sm text-[#6f6558]">
          {contentText(
            content,
            "missionEditor.noBadgesAvailable",
            "Chưa có huy hiệu đang hoạt động. Bạn có thể tạo huy hiệu mới từ trang Quản lý huy hiệu.",
          )}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-2 text-sm font-bold text-red-700">
          {error}
        </p>
      ) : null}
    </section>
  );
}
