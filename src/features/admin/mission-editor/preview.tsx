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
              sizes="(min-width: 1280px) 360px, 100vw"
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
          <p className="font-black">
            {contentText(content, "missionEditor.previewRules", "Điều gì xảy ra sau khi soạn?")}
          </p>
          <ol className="mt-3 space-y-3 text-sm text-[#746b60]">
            <li>
              <strong className="text-[#342f28]">1. Lưu bản nháp:</strong> Bạn có thể quay lại chỉnh sửa bất
              cứ lúc nào.
            </li>
            <li>
              <strong className="text-[#342f28]">2. Gửi kiểm duyệt:</strong> Một người khác sẽ kiểm tra nội
              dung và an toàn.
            </li>
            <li>
              <strong className="text-[#342f28]">3. Chỉnh sửa nếu cần:</strong> Nhận xét sẽ nêu rõ phần cần
              thay đổi.
            </li>
            <li>
              <strong className="text-[#342f28]">4. Hiển thị cho trẻ:</strong> Chỉ nội dung đã được duyệt mới
              được xuất bản.
            </li>
          </ol>
        </Card>
      </div>
    </aside>
  );
}
