"use client";

import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { ControlledSelectField, SelectField } from "@/components/form";
import { Card } from "@/components/ui";
import { contentText, useContent } from "@/content/client";
import type { ContentVariableDefinition } from "@/domain/content-variables";
import { ContentTemplateField } from "@/features/admin/content-template-field";
import { questionTypeLabelKeys, questionTypes } from "@/features/admin/mission-editor/constants";
import { QuestionConfigurationEditor } from "@/features/admin/mission-editor/question-configuration-editor";
import type { QuestionType } from "@/features/admin/mission-editor/types";
import type { AdminMissionDraft } from "@/modules/admin/schemas";

const typeFallbacks: Record<QuestionType, string> = {
  single_choice: "Chọn một đáp án",
  pattern_sequence: "Tìm hình tiếp theo",
  drag_drop: "Kéo vào đúng chỗ",
  fill_answer: "Nhập câu trả lời",
  sorting: "Xếp theo thứ tự",
};

type Props = {
  index: number;
  total: number;
  active: boolean;
  onActivate: () => void;
  onTypeChange: (type: QuestionType) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  templateVariables: ContentVariableDefinition[];
};

export function MissionQuestionEditor({
  index,
  total,
  active,
  onActivate,
  onTypeChange,
  onMove,
  onRemove,
  templateVariables,
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
    form.setValue(`questions.${index}.hints` as const, hints, { shouldDirty: true, shouldValidate: true });
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
            label={contentText(content, "missionEditor.questionType", "Bé sẽ trả lời bằng cách nào?")}
            value={question.type}
            onValueChange={(value) => onTypeChange(value as QuestionType)}
            options={questionTypes.map((type) => ({
              value: type,
              label: contentText(content, questionTypeLabelKeys[type], typeFallbacks[type]),
            }))}
          />
          <SelectField
            label={contentText(content, "missionEditor.difficulty", "Mức độ")}
            registration={form.register(`questions.${index}.difficulty` as const, { valueAsNumber: true })}
            options={[1, 2, 3, 4, 5].map((value) => ({ value: String(value), label: `Mức ${value}` }))}
          />
          <Controller
            control={form.control}
            name={`questions.${index}.prompt` as const}
            render={({ field }) => (
              <ContentTemplateField
                id={`question-${index}-prompt`}
                label={contentText(content, "missionEditor.prompt", "Câu hỏi dành cho bé")}
                placeholder="Ví dụ: {{name}} chọn hình nào xuất hiện tiếp theo?"
                value={field.value}
                onBlur={field.onBlur}
                onValueChange={field.onChange}
                variables={templateVariables}
                error={errors?.prompt?.message}
                containerClassName="md:col-span-2"
              />
            )}
          />
          <Controller
            control={form.control}
            name={`questions.${index}.instruction` as const}
            render={({ field }) => (
              <ContentTemplateField
                id={`question-${index}-instruction`}
                label={contentText(content, "missionEditor.instruction", "Lời hướng dẫn")}
                placeholder="{{name}} hãy nhìn kỹ rồi chọn một đáp án."
                value={field.value}
                onBlur={field.onBlur}
                onValueChange={field.onChange}
                variables={templateVariables}
                error={errors?.instruction?.message}
                containerClassName="md:col-span-2"
              />
            )}
          />
          <div className="md:col-span-2">
            <QuestionConfigurationEditor
              key={question.type}
              index={index}
              templateVariables={templateVariables}
            />
          </div>
          <ContentTemplateField
            id={`question-${index}-hints`}
            label={contentText(content, "missionEditor.hints", "Các gợi ý, mỗi dòng một gợi ý")}
            value={question.hints.map((hint) => hint.text).join("\n")}
            onValueChange={updateHints}
            variables={templateVariables}
            error={errors?.hints?.message}
            multiline
            rows={4}
            containerClassName="md:col-span-2"
          />
          <Controller
            control={form.control}
            name={`questions.${index}.feedbackCorrect` as const}
            render={({ field }) => (
              <ContentTemplateField
                id={`question-${index}-correct-feedback`}
                label={contentText(content, "missionEditor.correctFeedback", "Lời khen khi bé trả lời đúng")}
                placeholder="Tuyệt vời, {{name}} đã tìm đúng manh mối rồi!"
                value={field.value}
                onBlur={field.onBlur}
                onValueChange={field.onChange}
                variables={templateVariables}
                error={errors?.feedbackCorrect?.message}
                multiline
                rows={3}
              />
            )}
          />
          <Controller
            control={form.control}
            name={`questions.${index}.feedbackIncorrect` as const}
            render={({ field }) => (
              <ContentTemplateField
                id={`question-${index}-incorrect-feedback`}
                label={contentText(
                  content,
                  "missionEditor.incorrectFeedback",
                  "Lời nhắc khi bé chưa trả lời đúng",
                )}
                placeholder="Chưa chính xác, {{name}} nhìn lại rồi thử lần nữa nhé."
                value={field.value}
                onBlur={field.onBlur}
                onValueChange={field.onChange}
                variables={templateVariables}
                error={errors?.feedbackIncorrect?.message}
                multiline
                rows={3}
              />
            )}
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
