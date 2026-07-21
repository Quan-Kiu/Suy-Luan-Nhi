import { findUnavailableContentVariableKeys } from "@/domain/content-variables";
import type { AdminMissionDraft } from "@/modules/admin/schemas";
import { getContentVariableDefinitions } from "@/modules/content/content-variables";

export type MissionTemplateVariableIssue = {
  path: string;
  keys: string[];
};

function missionTemplateFields(draft: AdminMissionDraft) {
  const fields: Array<{ path: string; value: string }> = [
    { path: "Tên nhiệm vụ", value: draft.title },
    { path: "Câu giới thiệu ngắn", value: draft.subtitle },
    { path: "Mô tả trên thẻ", value: draft.shortDescription },
    { path: "Câu chuyện mở đầu", value: draft.storyIntro },
  ];
  draft.questions.forEach((question, index) => {
    fields.push(
      { path: `Câu ${index + 1} · Câu hỏi`, value: question.prompt },
      { path: `Câu ${index + 1} · Lời hướng dẫn`, value: question.instruction },
      { path: `Câu ${index + 1} · Phản hồi đúng`, value: question.feedbackCorrect },
      { path: `Câu ${index + 1} · Phản hồi chưa đúng`, value: question.feedbackIncorrect },
    );
    question.hints.forEach((hint, hintIndex) => {
      fields.push({ path: `Câu ${index + 1} · Gợi ý ${hintIndex + 1}`, value: hint.text });
    });

    const addOptions = (label: string, options: Array<{ label: string; altText?: string }>) => {
      options.forEach((option, optionIndex) => {
        fields.push({
          path: `Câu ${index + 1} · ${label} ${optionIndex + 1}`,
          value: option.label,
        });
        if (option.altText) {
          fields.push({
            path: `Câu ${index + 1} · Mô tả hình ${label.toLowerCase()} ${optionIndex + 1}`,
            value: option.altText,
          });
        }
      });
    };

    if (question.type === "single_choice") {
      addOptions("Lựa chọn", question.payload.options);
    } else if (question.type === "pattern_sequence") {
      addOptions("Mảnh quy luật", question.payload.sequence);
      addOptions("Đáp án", question.payload.options);
    } else if (question.type === "sorting") {
      addOptions("Bước sắp xếp", question.payload.items);
    } else if (question.type === "drag_drop") {
      addOptions("Mảnh kéo", question.payload.items);
      question.payload.slots.forEach((slot, slotIndex) => {
        fields.push({
          path: `Câu ${index + 1} · Vị trí thả ${slotIndex + 1}`,
          value: slot.label,
        });
      });
    } else if (question.payload.placeholder) {
      fields.push({
        path: `Câu ${index + 1} · Chữ gợi ý trong ô trả lời`,
        value: question.payload.placeholder,
      });
    }
  });
  return fields;
}

export async function validateMissionTemplateVariables(draft: AdminMissionDraft) {
  const definitions = await getContentVariableDefinitions();
  const issues = missionTemplateFields(draft).flatMap((field) => {
    const keys = findUnavailableContentVariableKeys(field.value, definitions);
    return keys.length ? [{ path: field.path, keys }] : [];
  });
  return { definitions, issues };
}

export function missionTemplateIssueMessage(issues: MissionTemplateVariableIssue[]) {
  const tags = [...new Set(issues.flatMap((issue) => issue.keys))].map((key) => `{{${key}}}`).join(", ");
  return `Có tag chưa được Super Admin bật hoặc không tồn tại: ${tags}`;
}
