"use client";

import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import {
  ControlledSelectField,
  ControlledTextareaField,
  SelectField,
  TextareaField,
  TextField,
} from "@/components/form";
import { Card } from "@/components/ui";
import { contentText, useContent } from "@/content/client";
import { questionTypeLabelKeys, questionTypes } from "@/features/admin/mission-editor/constants";
import { QuestionConfigurationEditor } from "@/features/admin/mission-editor/question-configuration-editor";
import type { QuestionType } from "@/features/admin/mission-editor/types";
import type { AdminMissionDraft } from "@/modules/admin/schemas";

const typeFallbacks: Record<QuestionType, string> = {
  single_choice: "Chọn một đáp án",
  pattern_sequence: "Chuỗi quy luật",
  drag_drop: "Kéo/thả vào vị trí",
  fill_answer: "Điền đáp án",
  sorting: "Sắp xếp thứ tự",
};

type Props = {
  index: number;
  total: number;
  active: boolean;
  onActivate: () => void;
  onTypeChange: (type: QuestionType) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
};

export function MissionQuestionEditor({
  index,
  total,
  active,
  onActivate,
  onTypeChange,
  onMove,
  onRemove,
}: Props) {
  const content = useContent("admin");
  const form = useFormContext<AdminMissionDraft>();
  const question = useWatch({ control: form.control, name: `questions.${index}` as const });
  const errors = form.formState.errors.questions?.[index];

  function updateHints(text: string) {
    const hints = text
      .split("\n")
      .filter(Boolean)
      .slice(0, 3)
      .map((hintText, hintIndex) => ({ level: hintIndex + 1, text: hintText }));
    form.setValue(`questions.${index}.hints` as const, hints, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  return (
    <Card className={`rounded-2xl p-4 shadow-sm ${active ? "ring-2 ring-[#e9641a]" : ""}`}>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={onActivate} className="mr-auto text-left">
          <p className="text-xs font-bold text-[#806d54]">
            {contentText(content, "missionEditor.question", "Câu")} {index + 1}
          </p>
          <h3 className="font-black">
            {contentText(content, questionTypeLabelKeys[question.type], typeFallbacks[question.type])}
          </h3>
        </button>
        <button
          type="button"
          aria-label="Đưa câu hỏi lên"
          disabled={index === 0}
          onClick={() => onMove(-1)}
          className="rounded-lg border p-2 disabled:opacity-30"
        >
          <ArrowUp size={16} />
        </button>
        <button
          type="button"
          aria-label="Đưa câu hỏi xuống"
          disabled={index === total - 1}
          onClick={() => onMove(1)}
          className="rounded-lg border p-2 disabled:opacity-30"
        >
          <ArrowDown size={16} />
        </button>
        <button
          type="button"
          aria-label="Xóa câu hỏi"
          disabled={total === 1}
          onClick={onRemove}
          className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-700 disabled:opacity-30"
        >
          <Trash2 size={16} />
        </button>
      </div>
      {active ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <ControlledSelectField
            label={contentText(content, "missionEditor.questionType", "Loại câu hỏi")}
            value={question.type}
            onValueChange={(value) => onTypeChange(value as QuestionType)}
            options={questionTypes.map((type) => ({
              value: type,
              label: contentText(content, questionTypeLabelKeys[type], typeFallbacks[type]),
            }))}
          />
          <SelectField
            label={contentText(content, "missionEditor.difficulty", "Độ khó")}
            registration={form.register(`questions.${index}.difficulty` as const, { valueAsNumber: true })}
            options={[1, 2, 3, 4, 5].map((value) => ({ value: String(value), label: `Mức ${value}` }))}
          />
          <TextField
            label={contentText(content, "missionEditor.prompt", "Câu hỏi")}
            placeholder="Ví dụ: Hình nào xuất hiện tiếp theo?"
            registration={form.register(`questions.${index}.prompt` as const)}
            error={errors?.prompt?.message}
            containerClassName="md:col-span-2"
          />
          <TextField
            label={contentText(content, "missionEditor.instruction", "Hướng dẫn")}
            placeholder="Hướng dẫn ngắn, rõ và phù hợp độ tuổi"
            registration={form.register(`questions.${index}.instruction` as const)}
            error={errors?.instruction?.message}
            containerClassName="md:col-span-2"
          />
          <div className="md:col-span-2">
            <QuestionConfigurationEditor key={question.type} index={index} />
          </div>
          <ControlledTextareaField
            label={contentText(content, "missionEditor.hints", "Gợi ý, mỗi dòng là một cấp")}
            rows={4}
            value={question.hints.map((hint) => hint.text).join("\n")}
            onValueChange={updateHints}
            error={errors?.hints?.message}
            containerClassName="md:col-span-2"
          />
          <TextareaField
            label={contentText(content, "missionEditor.correctFeedback", "Phản hồi đúng")}
            rows={3}
            placeholder="Phản hồi tích cực khi bé trả lời đúng"
            registration={form.register(`questions.${index}.feedbackCorrect` as const)}
            error={errors?.feedbackCorrect?.message}
          />
          <TextareaField
            label={contentText(content, "missionEditor.incorrectFeedback", "Phản hồi chưa đúng")}
            rows={3}
            placeholder="Khuyến khích bé thử lại, không tạo áp lực"
            registration={form.register(`questions.${index}.feedbackIncorrect` as const)}
            error={errors?.feedbackIncorrect?.message}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={onActivate}
          className="mt-3 w-full rounded-xl bg-[#f7f3eb] p-3 text-left text-sm text-[#6f6558]"
        >
          <strong className="block text-[#342f28]">{question.prompt}</strong>
          Chọn để mở và chỉnh sửa câu hỏi này.
        </button>
      )}
    </Card>
  );
}
