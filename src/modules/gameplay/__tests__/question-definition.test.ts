import { describe, expect, it } from "vitest";
import { playableQuestionSchema } from "@/modules/gameplay/question";

const common = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  order: 1,
  prompt: "Chọn đáp án đúng",
  instruction: "Hãy quan sát thật kỹ",
  difficulty: 1,
  feedbackCorrect: "Tuyệt vời",
  feedbackIncorrect: "Thử lại nhé",
  hints: [{ level: 1, text: "Nhìn kỹ lựa chọn đầu tiên" }],
};

describe("playableQuestionSchema invariants", () => {
  it("rejects a choice answer that is not in options", () => {
    const result = playableQuestionSchema.safeParse({
      ...common,
      type: "single_choice",
      payload: {
        options: [
          { id: "a", label: "A" },
          { id: "b", label: "B" },
        ],
      },
      correctAnswer: "missing",
    });
    expect(result.success).toBe(false);
  });

  it("requires a sorting answer to include each item exactly once", () => {
    const result = playableQuestionSchema.safeParse({
      ...common,
      type: "sorting",
      payload: {
        items: [
          { id: "a", label: "A" },
          { id: "b", label: "B" },
        ],
      },
      correctAnswer: ["a", "a"],
    });
    expect(result.success).toBe(false);
  });

  it("requires exactly one missing item in a pattern sequence", () => {
    const result = playableQuestionSchema.safeParse({
      ...common,
      type: "pattern_sequence",
      payload: {
        sequence: [
          { id: "a", label: "A" },
          { id: "b", label: "B" },
          { id: "c", label: "C" },
        ],
        options: [
          { id: "a", label: "A" },
          { id: "b", label: "B" },
        ],
      },
      correctAnswer: "a",
    });
    expect(result.success).toBe(false);
  });
});
