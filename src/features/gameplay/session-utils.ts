import type { PublicPlayableQuestion, QuestionSubmission } from "@/modules/gameplay/question";

export function initialSubmission(question: PublicPlayableQuestion): QuestionSubmission | null {
  if (question.type === "sorting") return question.payload.items.map((item) => item.id);
  if (question.type === "drag_drop") return {};
  return null;
}

export function canSubmitQuestion(
  question: PublicPlayableQuestion,
  value: QuestionSubmission | null,
): boolean {
  if (value === null) return false;
  switch (question.type) {
    case "single_choice":
    case "pattern_sequence":
    case "fill_answer":
      return typeof value === "string" && value.trim().length > 0;
    case "sorting":
      return Array.isArray(value) && value.length === question.payload.items.length;
    case "drag_drop":
      return (
        !Array.isArray(value) &&
        typeof value === "object" &&
        Object.keys(value).length === question.payload.slots.length
      );
  }
}
