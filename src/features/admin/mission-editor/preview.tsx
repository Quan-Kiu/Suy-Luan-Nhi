"use client";

import Image from "next/image";
import { useFormContext, useWatch } from "react-hook-form";
import { Card } from "@/components/ui";
import { contentText, useContent } from "@/content/client";
import { AdminQuestionPreview } from "@/features/admin/admin-question-preview";
import type { AdminMissionDraft } from "@/modules/admin/schemas";
import type { PlayableQuestion } from "@/modules/gameplay/question";

export function MissionEditorPreview({ activeQuestion }: { activeQuestion: number }) {
  const content = useContent("admin");
  const form = useFormContext<AdminMissionDraft>();
  const coverUrl = useWatch({ control: form.control, name: "coverUrl" });
  const questions = useWatch({ control: form.control, name: "questions" });
  const question = questions[Math.min(activeQuestion, questions.length - 1)];
  const previewQuestion = question
    ? ({
        ...question,
        id: question.id ?? "550e8400-e29b-41d4-a716-446655440000",
      } as PlayableQuestion)
    : null;

  return (
    <aside className="min-w-0">
      <div className="sticky top-20 space-y-4">
        <Card className="overflow-hidden rounded-[30px] p-3 shadow-xl">
          <div className="relative mb-3 h-32 overflow-hidden rounded-[22px]">
            <Image
              src={coverUrl || "/assets/cards/mission-thumb-footprint-detective.png"}
              fill
              alt={contentText(content, "missionEditor.previewAlt", "Preview ảnh bìa")}
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
          <p className="font-black">
            {contentText(content, "missionEditor.previewRules", "Quy tắc xuất bản")}
          </p>
          <ul className="mt-2 space-y-2 text-sm text-[#746b60]">
            <li>
              ✓{" "}
              {contentText(content, "missionEditor.ruleDraft", "Draft không ghi đè phiên bản đang publish.")}
            </li>
            <li>✓ {contentText(content, "missionEditor.ruleSnapshot", "Submit tạo snapshot bất biến.")}</li>
            <li>
              ✓{" "}
              {contentText(content, "missionEditor.ruleReview", "Reviewer duyệt hoặc trả lại với nhận xét.")}
            </li>
            <li>
              ✓{" "}
              {contentText(content, "missionEditor.rulePublish", "Chỉ phiên bản approved mới được publish.")}
            </li>
          </ul>
        </Card>
      </div>
    </aside>
  );
}
