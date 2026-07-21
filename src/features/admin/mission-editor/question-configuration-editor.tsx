"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { ControlledSelectField, ControlledTextareaField } from "@/components/form";
import { formControlClass } from "@/components/form/text-field";
import type { ContentVariableDefinition } from "@/domain/content-variables";
import { ContentTemplateField } from "@/features/admin/content-template-field";
import { QuestionOptionList, type EditorOption } from "@/features/admin/mission-editor/question-option-list";
import type { DraftQuestion } from "@/features/admin/mission-editor/types";
import type { AdminMissionDraft } from "@/modules/admin/schemas";

function normalizeOptions(items: EditorOption[]) {
  return items.map(({ missing, ...item }) => ({
    ...item,
    asset: item.asset || undefined,
    altText: item.asset ? item.altText || item.label : undefined,
    ...(missing ? { missing: true } : {}),
  }));
}

export function QuestionConfigurationEditor({
  index,
  templateVariables,
}: {
  index: number;
  templateVariables: ContentVariableDefinition[];
}) {
  const form = useFormContext<AdminMissionDraft>();
  const question = useWatch({ control: form.control, name: `questions.${index}` as const });

  function replace(next: DraftQuestion) {
    form.setValue(`questions.${index}` as const, next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }
  if (question.type === "single_choice") {
    return (
      <QuestionOptionList
        title="Các lựa chọn"
        templateVariables={templateVariables}
        items={question.payload.options}
        minItems={2}
        addLabel="Thêm lựa chọn"
        correctId={question.correctAnswer}
        onCorrectChange={(correctAnswer) => replace({ ...question, correctAnswer })}
        onChange={(options) =>
          replace({
            ...question,
            payload: { options: normalizeOptions(options) },
            correctAnswer: options.some((item) => item.id === question.correctAnswer)
              ? question.correctAnswer
              : (options[0]?.id ?? ""),
          })
        }
      />
    );
  }

  if (question.type === "pattern_sequence") {
    const missingId = question.payload.sequence.find((item) => item.missing)?.id;
    return (
      <div className="space-y-4">
        <QuestionOptionList
          title="Các hình theo thứ tự"
          templateVariables={templateVariables}
          items={question.payload.sequence}
          minItems={3}
          addLabel="Thêm mảnh"
          missingId={missingId}
          reorderable
          onMissingChange={(id) =>
            replace({
              ...question,
              payload: {
                ...question.payload,
                sequence: question.payload.sequence.map((item) => ({ ...item, missing: item.id === id })),
              },
            })
          }
          onChange={(sequence) => {
            const normalized = normalizeOptions(sequence);
            const hasMissing = normalized.some((item) => item.missing);
            replace({
              ...question,
              payload: {
                ...question.payload,
                sequence: normalized.map((item, itemIndex) => ({
                  ...item,
                  missing: item.missing || (!hasMissing && itemIndex === normalized.length - 1),
                })),
              },
            });
          }}
        />
        <QuestionOptionList
          title="Các hình bé có thể chọn"
          templateVariables={templateVariables}
          items={question.payload.options}
          minItems={2}
          addLabel="Thêm đáp án"
          correctId={question.correctAnswer}
          onCorrectChange={(correctAnswer) => replace({ ...question, correctAnswer })}
          onChange={(options) =>
            replace({
              ...question,
              payload: { ...question.payload, options: normalizeOptions(options) },
              correctAnswer: options.some((item) => item.id === question.correctAnswer)
                ? question.correctAnswer
                : (options[0]?.id ?? ""),
            })
          }
        />
      </div>
    );
  }

  if (question.type === "fill_answer") {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <ContentTemplateField
          label="Chữ gợi ý trong ô trả lời"
          value={question.payload.placeholder ?? ""}
          onValueChange={(value) =>
            replace({
              ...question,
              payload: { ...question.payload, placeholder: value || undefined },
            })
          }
          variables={templateVariables}
          placeholder="Ví dụ: {{name}} nhập tên đồ vật"
          showHint={false}
        />
        <ControlledSelectField
          label="Bé sẽ nhập"
          value={question.payload.inputMode}
          onValueChange={(inputMode) =>
            replace({
              ...question,
              payload: { ...question.payload, inputMode: inputMode as "text" | "numeric" },
            })
          }
          options={[
            { value: "text", label: "Chữ hoặc từ" },
            { value: "numeric", label: "Số" },
          ]}
        />
        <ControlledTextareaField
          label="Những cách trả lời được tính là đúng"
          description="Mỗi dòng là một cách trả lời đúng, ví dụ: ô / cái ô / chiếc ô."
          rows={5}
          value={question.correctAnswer.join("\n")}
          onValueChange={(value) =>
            replace({
              ...question,
              correctAnswer: value
                .split("\n")
                .map((answer) => answer.trim())
                .filter(Boolean),
            })
          }
          containerClassName="md:col-span-2"
        />
      </div>
    );
  }
  if (question.type === "sorting") {
    return (
      <QuestionOptionList
        title="Các bước theo thứ tự đúng"
        templateVariables={templateVariables}
        items={question.payload.items}
        minItems={2}
        addLabel="Thêm bước"
        reorderable
        onChange={(items) => {
          const normalized = normalizeOptions(items);
          replace({
            ...question,
            payload: { items: normalized },
            correctAnswer: normalized.map((item) => item.id),
          });
        }}
      />
    );
  }

  if (question.type === "drag_drop") {
    const items = question.payload.items;
    const slots = question.payload.slots;
    return (
      <div className="space-y-4">
        <QuestionOptionList
          title="Các mảnh bé sẽ kéo"
          templateVariables={templateVariables}
          items={items}
          minItems={1}
          addLabel="Thêm mảnh"
          onChange={(nextItems) => {
            const normalizedItems = normalizeOptions(nextItems);
            const validIds = new Set(normalizedItems.map((item) => item.id));
            const nextAnswer = Object.fromEntries(
              Object.entries(question.correctAnswer).filter(([, itemId]) => validIds.has(itemId)),
            );
            replace({
              ...question,
              payload: { ...question.payload, items: normalizedItems },
              correctAnswer: nextAnswer,
            });
          }}
        />
        <QuestionOptionList
          title="Các chỗ bé sẽ thả mảnh"
          templateVariables={templateVariables}
          items={slots}
          minItems={1}
          addLabel="Thêm vị trí"
          onChange={(nextSlots) => {
            const normalizedSlots = nextSlots.map((slot) => ({
              id: slot.id,
              label: slot.label,
              asset: slot.asset || undefined,
            }));
            const slotIds = new Set(normalizedSlots.map((slot) => slot.id));
            const assigned = new Set<string>();
            const nextAnswer: Record<string, string> = {};
            for (const slot of normalizedSlots) {
              const current = question.correctAnswer[slot.id];
              const fallback = items.find((item) => !assigned.has(item.id))?.id;
              const selected = current && !assigned.has(current) ? current : fallback;
              if (selected) {
                nextAnswer[slot.id] = selected;
                assigned.add(selected);
              }
            }
            for (const key of Object.keys(nextAnswer)) {
              if (!slotIds.has(key)) delete nextAnswer[key];
            }
            replace({
              ...question,
              payload: { ...question.payload, slots: normalizedSlots },
              correctAnswer: nextAnswer,
            });
          }}
        />
        <fieldset className="rounded-2xl border bg-[#fffdf8] p-4">
          <legend className="px-1 text-sm font-black">Chọn mảnh đúng cho từng chỗ</legend>
          <p className="mt-1 text-sm text-[#6f6558]">Chọn mảnh cần đặt vào từng chỗ.</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {slots.map((slot) => (
              <label key={slot.id} className="space-y-2 text-sm font-bold">
                <span>{slot.label}</span>
                <select
                  value={question.correctAnswer[slot.id] ?? ""}
                  onChange={(event) =>
                    replace({
                      ...question,
                      correctAnswer: {
                        ...question.correctAnswer,
                        [slot.id]: event.target.value,
                      },
                    })
                  }
                  className={formControlClass}
                >
                  <option value="">Chọn mảnh đúng</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    );
  }

  return null;
}
