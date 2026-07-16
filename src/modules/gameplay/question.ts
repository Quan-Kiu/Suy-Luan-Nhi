import { z } from "zod";

export const questionOptionSchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().min(1),
  asset: z.string().trim().min(1).optional(),
  altText: z.string().trim().min(1).optional(),
});

export const questionHintSchema = z.object({
  level: z.number().int().min(1).max(3),
  text: z.string().trim().min(4),
});

const commonQuestionFields = {
  id: z.string().uuid(),
  order: z.number().int().positive(),
  prompt: z.string().trim().min(4),
  instruction: z.string().trim().min(4),
  difficulty: z.number().int().min(1).max(5),
  feedbackCorrect: z.string().trim().min(4),
  feedbackIncorrect: z.string().trim().min(4),
  hints: z.array(questionHintSchema).min(1).max(3),
};

export const singleChoiceQuestionSchema = z.object({
  ...commonQuestionFields,
  type: z.literal("single_choice"),
  payload: z.object({ options: z.array(questionOptionSchema).min(2).max(8) }),
  correctAnswer: z.string().trim().min(1),
});

export const patternSequenceQuestionSchema = z.object({
  ...commonQuestionFields,
  type: z.literal("pattern_sequence"),
  payload: z.object({
    sequence: z
      .array(
        questionOptionSchema.extend({
          missing: z.boolean().optional(),
        }),
      )
      .min(3)
      .max(12),
    options: z.array(questionOptionSchema).min(2).max(8),
  }),
  correctAnswer: z.string().trim().min(1),
});

export const dragDropQuestionSchema = z.object({
  ...commonQuestionFields,
  type: z.literal("drag_drop"),
  payload: z.object({
    items: z.array(questionOptionSchema).min(1).max(10),
    slots: z
      .array(
        z.object({
          id: z.string().trim().min(1),
          label: z.string().trim().min(1),
          asset: z.string().trim().min(1).optional(),
        }),
      )
      .min(1)
      .max(10),
  }),
  correctAnswer: z.record(z.string(), z.string()),
});

export const fillAnswerQuestionSchema = z.object({
  ...commonQuestionFields,
  type: z.literal("fill_answer"),
  payload: z.object({
    placeholder: z.string().trim().min(1).optional(),
    inputMode: z.enum(["text", "numeric"]).default("text"),
  }),
  correctAnswer: z.array(z.string().trim().min(1)).min(1).max(20),
});

export const sortingQuestionSchema = z.object({
  ...commonQuestionFields,
  type: z.literal("sorting"),
  payload: z.object({ items: z.array(questionOptionSchema).min(2).max(12) }),
  correctAnswer: z.array(z.string().trim().min(1)).min(2).max(12),
});

const playableQuestionBaseSchema = z.discriminatedUnion("type", [
  singleChoiceQuestionSchema,
  patternSequenceQuestionSchema,
  dragDropQuestionSchema,
  fillAnswerQuestionSchema,
  sortingQuestionSchema,
]);

function duplicateValues(values: string[]) {
  return values.filter((value, index) => values.indexOf(value) !== index);
}

export const playableQuestionSchema = playableQuestionBaseSchema.superRefine((question, context) => {
  const hintLevels = question.hints.map((hint) => hint.level);
  if (duplicateValues(hintLevels.map(String)).length) {
    context.addIssue({
      code: "custom",
      path: ["hints"],
      message: "Mỗi cấp gợi ý chỉ được xuất hiện một lần",
    });
  }

  if (question.type === "single_choice" || question.type === "pattern_sequence") {
    const optionIds = question.payload.options.map((option) => option.id);
    if (duplicateValues(optionIds).length) {
      context.addIssue({ code: "custom", path: ["payload", "options"], message: "ID đáp án phải duy nhất" });
    }
    if (!optionIds.includes(question.correctAnswer)) {
      context.addIssue({
        code: "custom",
        path: ["correctAnswer"],
        message: "Đáp án đúng phải nằm trong danh sách lựa chọn",
      });
    }
    if (question.type === "pattern_sequence") {
      const missingCount = question.payload.sequence.filter((item) => item.missing).length;
      if (missingCount !== 1) {
        context.addIssue({
          code: "custom",
          path: ["payload", "sequence"],
          message: "Chuỗi quy luật phải có đúng một ô trống",
        });
      }
    }
    return;
  }

  if (question.type === "sorting") {
    const itemIds = question.payload.items.map((item) => item.id);
    if (duplicateValues(itemIds).length) {
      context.addIssue({
        code: "custom",
        path: ["payload", "items"],
        message: "ID mảnh sắp xếp phải duy nhất",
      });
    }
    const answerIds = question.correctAnswer;
    if (
      answerIds.length !== itemIds.length ||
      new Set(answerIds).size !== answerIds.length ||
      answerIds.some((id) => !itemIds.includes(id))
    ) {
      context.addIssue({
        code: "custom",
        path: ["correctAnswer"],
        message: "Đáp án sắp xếp phải chứa đúng mỗi mảnh một lần",
      });
    }
    return;
  }

  if (question.type === "drag_drop") {
    const itemIds = question.payload.items.map((item) => item.id);
    const slotIds = question.payload.slots.map((slot) => slot.id);
    if (duplicateValues(itemIds).length || duplicateValues(slotIds).length) {
      context.addIssue({ code: "custom", path: ["payload"], message: "ID mảnh và vị trí phải duy nhất" });
    }
    const answerSlots = Object.keys(question.correctAnswer);
    const answerItems = Object.values(question.correctAnswer);
    if (
      answerSlots.length !== slotIds.length ||
      answerSlots.some((id) => !slotIds.includes(id)) ||
      answerItems.some((id) => !itemIds.includes(id)) ||
      new Set(answerItems).size !== answerItems.length
    ) {
      context.addIssue({
        code: "custom",
        path: ["correctAnswer"],
        message: "Mỗi vị trí phải được ghép với một mảnh hợp lệ và duy nhất",
      });
    }
  }
});

export type PlayableQuestion = z.infer<typeof playableQuestionSchema>;
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
export type PublicPlayableQuestion = DistributiveOmit<PlayableQuestion, "correctAnswer">;
export type QuestionSubmission = string | string[] | Record<string, string>;

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("vi-VN")
    .replace(/\s+/g, " ");
}

export function evaluateQuestion(question: PlayableQuestion, submission: QuestionSubmission) {
  switch (question.type) {
    case "single_choice":
    case "pattern_sequence":
      return typeof submission === "string" && submission === question.correctAnswer;
    case "fill_answer":
      return (
        typeof submission === "string" &&
        question.correctAnswer.some((answer) => normalizeText(answer) === normalizeText(submission))
      );
    case "sorting":
      return (
        Array.isArray(submission) &&
        submission.length === question.correctAnswer.length &&
        submission.every((id, index) => id === question.correctAnswer[index])
      );
    case "drag_drop": {
      if (Array.isArray(submission) || typeof submission !== "object" || submission === null) return false;
      const expectedSlots = Object.keys(question.correctAnswer);
      const submittedSlots = Object.keys(submission);
      return (
        submittedSlots.length === expectedSlots.length &&
        submittedSlots.every((slotId) => expectedSlots.includes(slotId)) &&
        expectedSlots.every((slotId) => submission[slotId] === question.correctAnswer[slotId])
      );
    }
  }
}
