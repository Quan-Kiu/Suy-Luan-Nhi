"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { CheckboxField } from "@/components/form";
import { Card, Pill } from "@/components/ui";
import { contentText, useContent } from "@/content/client";
import { safetyKeys, safetyLabelKeys } from "@/features/admin/mission-editor/constants";
import type { AdminMissionDraft } from "@/modules/admin/schemas";

const safetyFallbacks: Record<(typeof safetyKeys)[number], string> = {
  ageAppropriate: "Nội dung phù hợp nhóm tuổi đã chọn",
  hintsSupportive: "Gợi ý giúp bé tiếp tục suy nghĩ",
  feedbackPositive: "Phản hồi tích cực, không gây áp lực",
  noProhibitedClaims: "Không có nội dung khẳng định quá mức hoặc gây hiểu lầm",
  noExternalLinks: "Không dẫn trẻ ra website bên ngoài",
  languageAndImagesSafe: "Ngôn ngữ và hình ảnh an toàn cho trẻ",
};

const safetyDescriptions: Record<(typeof safetyKeys)[number], string> = {
  ageAppropriate: "Câu chữ, độ khó và hình ảnh phù hợp độ tuổi.",
  hintsSupportive: "Gợi ý không tiết lộ ngay đáp án và không chê trách.",
  feedbackPositive: "Sai được xem là cơ hội thử lại, không dùng lời phạt.",
  noProhibitedClaims: "Không hứa hẹn kết quả học tập hoặc đưa lời khuyên chuyên môn.",
  noExternalLinks: "Không có URL, quảng cáo hoặc lời kêu gọi mua hàng.",
  languageAndImagesSafe: "Không có hình ảnh đáng sợ, bạo lực hoặc dữ liệu nhạy cảm.",
};

export function MissionSafetySection() {
  const content = useContent("admin");
  const form = useFormContext<AdminMissionDraft>();
  const safety = useWatch({ control: form.control, name: "safety" });
  const completedCount = Object.values(safety).filter(Boolean).length;
  const complete = completedCount === safetyKeys.length;

  return (
    <Card className="rounded-2xl p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black">
            {contentText(content, "missionEditor.safetyTitle", "3. Kiểm tra an toàn trước khi gửi duyệt")}
          </h2>
          <p className="mt-1 text-sm text-[#6f6558]">
            Xác nhận từng mục sau khi bạn đã xem lại nội dung và phần xem trước.
          </p>
        </div>
        <Pill className={complete ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-800"}>
          {completedCount}/{safetyKeys.length} đã xác nhận
        </Pill>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {safetyKeys.map((key) => (
          <div key={key} className="rounded-xl border bg-white p-3">
            <CheckboxField
              label={contentText(content, safetyLabelKeys[key], safetyFallbacks[key])}
              registration={form.register(`safety.${key}` as const)}
            />
            <p className="mt-2 pl-6 text-xs leading-5 text-[#6f6558]">{safetyDescriptions[key]}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
