import { describe, expect, it } from "vitest";
import { evaluateQuestion, type PlayableQuestion } from "@/modules/gameplay/question";

const base = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  order: 1,
  prompt: "Câu hỏi",
  instruction: "Hãy chọn",
  feedbackCorrect: "Tuyệt vời",
  feedbackIncorrect: "Thử lại nhé",
  difficulty: 1,
  hints: [{ level: 1, text: "Nhìn kỹ nhé" }],
};

describe("evaluateQuestion", () => {
  it("evaluates single choice and pattern by option id", () => {
    const question: PlayableQuestion = {
      ...base,
      type: "single_choice",
      payload: {
        options: [
          { id: "a", label: "A" },
          { id: "b", label: "B" },
        ],
      },
      correctAnswer: "b",
    };
    expect(evaluateQuestion(question, "b")).toBe(true);
    expect(evaluateQuestion(question, "a")).toBe(false);
  });

  it("normalizes Vietnamese fill answers", () => {
    const question: PlayableQuestion = {
      ...base,
      type: "fill_answer",
      payload: { inputMode: "text" },
      correctAnswer: ["Mặt trăng", "trăng"],
    };
    expect(evaluateQuestion(question, "  MẶT   TRĂNG ")).toBe(true);
  });

  it("requires the exact sorting order", () => {
    const question: PlayableQuestion = {
      ...base,
      type: "sorting",
      payload: {
        items: [
          { id: "first", label: "Trước" },
          { id: "second", label: "Sau" },
        ],
      },
      correctAnswer: ["first", "second"],
    };
    expect(evaluateQuestion(question, ["first", "second"])).toBe(true);
    expect(evaluateQuestion(question, ["second", "first"])).toBe(false);
  });

  it("requires every drag/drop slot and rejects extras", () => {
    const question: PlayableQuestion = {
      ...base,
      type: "drag_drop",
      payload: {
        items: [
          { id: "seed", label: "Hạt" },
          { id: "tree", label: "Cây" },
        ],
        slots: [
          { id: "before", label: "Trước" },
          { id: "after", label: "Sau" },
        ],
      },
      correctAnswer: { before: "seed", after: "tree" },
    };
    expect(evaluateQuestion(question, { before: "seed", after: "tree" })).toBe(true);
    expect(evaluateQuestion(question, { before: "seed", after: "tree", extra: "seed" })).toBe(false);
  });
});
