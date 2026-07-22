"use client";

import { Plus } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { contentText, useContent } from "@/content/client";
import { createDefaultQuestion } from "@/features/admin/mission-editor/default-question";
import { MissionQuestionEditor } from "@/features/admin/mission-editor/question-editor";
import type { QuestionType } from "@/features/admin/mission-editor/types";
import type { AdminMissionDraft } from "@/modules/admin/schemas";
import type { ContentVariableDefinition } from "@/domain/content-variables";

export function MissionQuestionsSection({
  activeQuestion,
  onActiveQuestionChange,
  templateVariables,
}: {
  activeQuestion: number;
  onActiveQuestionChange: (index: number) => void;
  templateVariables: ContentVariableDefinition[];
}) {
  const content = useContent("admin");
  const form = useFormContext<AdminMissionDraft>();
  const fieldArray = useFieldArray({ control: form.control, name: "questions" });

  function normalizeOrders() {
    const questions = form.getValues("questions");
    questions.forEach((_, index) => {
      form.setValue(`questions.${index}.order`, index + 1, { shouldDirty: true });
    });
  }

  function moveQuestion(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= fieldArray.fields.length) return;
    fieldArray.move(index, target);
    normalizeOrders();
    onActiveQuestionChange(target);
  }

  function removeQuestion(index: number) {
    if (fieldArray.fields.length === 1) return;
    fieldArray.remove(index);
    normalizeOrders();
    onActiveQuestionChange(Math.max(0, index - 1));
  }

  function replaceQuestion(index: number, type: QuestionType) {
    fieldArray.update(index, createDefaultQuestion(type, index + 1));
    onActiveQuestionChange(index);
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="type-section-title">
            {contentText(content, "missionEditor.questionsTitle", "2. Câu hỏi trong nhiệm vụ")} (
            {fieldArray.fields.length})
          </h2>
          <p className="type-supporting mt-1 text-[#6f6558]">
            Chọn loại câu hỏi, nhập nội dung và đánh dấu đáp án đúng bằng các trường bên dưới.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            fieldArray.append(createDefaultQuestion("single_choice", fieldArray.fields.length + 1));
            onActiveQuestionChange(fieldArray.fields.length);
          }}
          className="inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 font-black"
        >
          <Plus size={17} />
          {contentText(content, "missionEditor.addQuestion", "Thêm câu hỏi")}
        </button>
      </div>
      {fieldArray.fields.map((field, index) => (
        <MissionQuestionEditor
          key={field.id}
          index={index}
          total={fieldArray.fields.length}
          active={index === activeQuestion}
          onActivate={() => onActiveQuestionChange(index)}
          onTypeChange={(type) => replaceQuestion(index, type)}
          onMove={(direction) => moveQuestion(index, direction)}
          onRemove={() => removeQuestion(index)}
          templateVariables={templateVariables}
        />
      ))}
    </section>
  );
}
