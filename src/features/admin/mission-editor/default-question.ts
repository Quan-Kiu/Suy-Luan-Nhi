import type { DraftQuestion, QuestionType } from "@/features/admin/mission-editor/types";

export function createDefaultQuestion(type: QuestionType, order: number): DraftQuestion {
  const common = {
    order,
    prompt: "Câu hỏi mới",
    instruction: "Hãy quan sát và trả lời nhé!",
    difficulty: 1,
    feedbackCorrect: "Tuyệt vời! Con đã tìm ra manh mối.",
    feedbackIncorrect: "Chưa chính xác. Con thử nhìn lại nhé.",
    hints: [{ level: 1, text: "Con thử nhìn từng phần một nhé." }],
  };
  switch (type) {
    case "single_choice":
      return {
        ...common,
        type,
        payload: {
          options: [
            { id: "a", label: "Đáp án A" },
            { id: "b", label: "Đáp án B" },
          ],
        },
        correctAnswer: "a",
      };
    case "pattern_sequence":
      return {
        ...common,
        type,
        payload: {
          sequence: [
            { id: "item-1", label: "Mảnh 1" },
            { id: "item-2", label: "Mảnh 2" },
            { id: "missing", label: "Ô trống", missing: true },
          ],
          options: [
            { id: "a", label: "Đáp án A" },
            { id: "b", label: "Đáp án B" },
          ],
        },
        correctAnswer: "a",
      };
    case "drag_drop":
      return {
        ...common,
        type,
        payload: {
          items: [
            { id: "item-1", label: "Mảnh 1" },
            { id: "item-2", label: "Mảnh 2" },
          ],
          slots: [
            { id: "slot-1", label: "Vị trí 1" },
            { id: "slot-2", label: "Vị trí 2" },
          ],
        },
        correctAnswer: { "slot-1": "item-1", "slot-2": "item-2" },
      };
    case "fill_answer":
      return {
        ...common,
        type,
        payload: { placeholder: "Nhập đáp án", inputMode: "text" },
        correctAnswer: ["đáp án"],
      };
    case "sorting":
      return {
        ...common,
        type,
        payload: {
          items: [
            { id: "first", label: "Bước 1" },
            { id: "second", label: "Bước 2" },
          ],
        },
        correctAnswer: ["first", "second"],
      };
  }
}
