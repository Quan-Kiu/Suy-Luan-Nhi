"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { CheckboxField } from "@/components/form";
import { Card, Pill } from "@/components/ui";
import { contentText, useContent } from "@/content/client";
import { safetyKeys, safetyLabelKeys } from "@/features/admin/mission-editor/constants";
import type { AdminMissionDraft } from "@/modules/admin/schemas";

const safetyFallbacks: Record<(typeof safetyKeys)[number], string> = {
  ageAppropriate: "Độ tuổi phù hợp",
  hintsSupportive: "Gợi ý mang tính hỗ trợ",
  feedbackPositive: "Phản hồi tích cực",
  noProhibitedClaims: "Không có tuyên bố bị cấm",
  noExternalLinks: "Không có liên kết ngoài",
  languageAndImagesSafe: "Ngôn ngữ và hình ảnh an toàn",
};

export function MissionSafetySection() {
  const content = useContent("admin");
  const form = useFormContext<AdminMissionDraft>();
  const safety = useWatch({ control: form.control, name: "safety" });
  const complete = Object.values(safety).every(Boolean);

  return (
    <Card className="rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-black">
          {contentText(content, "missionEditor.safetyTitle", "3. Safety Checklist")}
        </h2>
        <Pill className={complete ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-800"}>
          {complete
            ? contentText(content, "missionEditor.safetyComplete", "Đạt 100%")
            : contentText(content, "missionEditor.safetyIncomplete", "Chưa hoàn tất")}
        </Pill>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {safetyKeys.map((key) => (
          <div key={key} className="rounded-xl border bg-white p-3">
            <CheckboxField
              label={contentText(content, safetyLabelKeys[key], safetyFallbacks[key])}
              registration={form.register(`safety.${key}` as const)}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}
