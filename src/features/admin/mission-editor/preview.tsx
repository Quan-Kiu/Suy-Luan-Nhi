"use client";

import Image from "next/image";
import { useFormContext, useWatch } from "react-hook-form";
import { Card } from "@/components/ui";
import { contentText, useContent } from "@/content/client";
import type { ContentVariableDefinition } from "@/domain/content-variables";
import { renderQuestionTemplate } from "@/lib/content/render-question-template";
import { AdminQuestionPreview } from "@/features/admin/admin-question-preview";
import type { AdminMissionDraft } from "@/modules/admin/schemas";
import type { PlayableQuestion } from "@/modules/gameplay/question";

export function MissionEditorPreview({
  activeQuestion,
  templateVariables,
}: {
  activeQuestion: number;
  templateVariables: ContentVariableDefinition[];
}) {
  const content = useContent("admin");
  const form = useFormContext<AdminMissionDraft>();
  const coverUrl = useWatch({ control: form.control, name: "coverUrl" });
  const questions = useWatch({ control: form.control, name: "questions" });
  const question = questions[Math.min(activeQuestion, questions.length - 1)];
  const previewQuestion = question
    ? renderQuestionTemplate(
        {
          ...question,
          id: question.id ?? "550e8400-e29b-41d4-a716-446655440000",
        } as PlayableQuestion,
        templateVariables.map((variable) => ({ ...variable, fallback: variable.example })),
        { child: null },
      )
    : null;

  return (
    <aside
      data-testid="mission-editor-preview-scroll-region"
      aria-label={contentText(content, "missionEditor.previewRegion", "Bản xem trước nhiệm vụ")}
      tabIndex={0}
      className="min-w-0 outline-none focus-visible:ring-2 focus-visible:ring-[#d86a24] focus-visible:ring-inset xl:min-h-0 xl:scrollbar-thin xl:overflow-y-auto xl:overscroll-contain xl:pr-2 xl:pb-2"
    >
      <div className="space-y-4">
        <Card className="overflow-hidden rounded-[30px] p-3 shadow-xl">
          <div className="relative mb-3 h-32 overflow-hidden rounded-[22px]">
            <Image
              src={coverUrl || "/assets/cards/mission-thumb-footprint-detective.png"}
              fill
              sizes="(min-width: 1280px) 360px, 100vw"
              loading="eager"
              alt={contentText(content, "missionEditor.previewAlt", "Ảnh bìa nhiệm vụ")}
              className="object-cover"
            />
          </div>
          {previewQuestion ? (
            <AdminQuestionPreview
              key={`${previewQuestion.id}-${activeQuestion}`}
              question={previewQuestion}
            />
          ) : null}
        </Card>
        <Card className="p-4">
          <p className="font-black">Tag trong bản xem trước</p>
          <p className="type-supporting mt-2 text-[#746b60]">
            Bản xem trước dùng dữ liệu mẫu do Super Admin cấu hình. Khi bé sử dụng, hệ thống mới thay bằng dữ
            liệu trong hồ sơ đang chọn.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {templateVariables
              .filter((item) => item.enabled)
              .map((item) => (
                <span
                  key={item.key}
                  className="type-caption rounded-full bg-[#fff0df] px-3 py-1 font-black text-[#9b5615]"
                >
                  {`{{${item.key}}}`} → {item.example}
                </span>
              ))}
          </div>
        </Card>
      </div>
    </aside>
  );
}
