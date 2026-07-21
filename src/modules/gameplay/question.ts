import { z } from "zod";

export const questionOptionSchema = z.object({
  id: z.string().trim().min(1, "Mã lựa chọn không được để trống"),
  label: z.string().trim().min(1, "Nội dung lựa chọn không được để trống"),
  asset: z.string().trim().min(1, "Đường dẫn hình minh họa không hợp lệ").optional(),
  altText: z.string().trim().min(1, "Mô tả hình minh họa không được để trống").optional(),
});

export const questionHintSchema = z.object({
  level: z
    .number("Cấp gợi ý cần là một số")
    .int("Cấp gợi ý cần là số nguyên")
    .min(1, "Cấp gợi ý thấp nhất là 1")
    .max(3, "Cấp gợi ý cao nhất là 3"),
  text: z.string().trim().min(4, "Mỗi gợi ý cần ít nhất 4 ký tự"),
});

const commonQuestionFields = {
  id: z.string().uuid("Mã câu hỏi không hợp lệ"),
  order: z
    .number("Thứ tự câu hỏi cần là một số")
    .int("Thứ tự câu hỏi cần là số nguyên")
    .positive("Thứ tự câu hỏi cần lớn hơn 0"),
  prompt: z.string().trim().min(4, "Câu hỏi cần ít nhất 4 ký tự"),
  instruction: z.string().trim().min(4, "Lời hướng dẫn cần ít nhất 4 ký tự"),
  difficulty: z
    .number("Mức độ câu hỏi cần là một số")
    .int("Mức độ câu hỏi cần là số nguyên")
    .min(1, "Mức độ câu hỏi thấp nhất là 1")
    .max(5, "Mức độ câu hỏi cao nhất là 5"),
  feedbackCorrect: z.string().trim().min(4, "Lời khen cần ít nhất 4 ký tự"),
  feedbackIncorrect: z.string().trim().min(4, "Lời nhắc cần ít nhất 4 ký tự"),
  hints: z
    .array(questionHintSchema)
    .min(1, "Hãy thêm ít nhất 1 gợi ý")
    .max(3, "Chỉ được thêm tối đa 3 gợi ý"),
};

export const singleChoiceQuestionSchema = z.object({
  ...commonQuestionFields,
  type: z.literal("single_choice"),
  payload: z.object({
    options: z
      .array(questionOptionSchema)
      .min(2, "Cần ít nhất 2 lựa chọn")
      .max(8, "Chỉ được thêm tối đa 8 lựa chọn"),
  }),
  correctAnswer: z.string().trim().min(1, "Hãy chọn đáp án đúng"),
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
      .min(3, "Chuỗi quy luật cần ít nhất 3 mảnh")
      .max(12, "Chuỗi quy luật chỉ được có tối đa 12 mảnh"),
    options: z
      .array(questionOptionSchema)
      .min(2, "Cần ít nhất 2 đáp án để bé lựa chọn")
      .max(8, "Chỉ được thêm tối đa 8 đáp án"),
  }),
  correctAnswer: z.string().trim().min(1, "Hãy chọn đáp án đúng"),
});

export const dragDropQuestionSchema = z.object({
  ...commonQuestionFields,
  type: z.literal("drag_drop"),
  payload: z.object({
    items: z
      .array(questionOptionSchema)
      .min(1, "Hãy thêm ít nhất 1 mảnh để bé kéo")
      .max(10, "Chỉ được thêm tối đa 10 mảnh"),
    slots: z
      .array(
        z.object({
          id: z.string().trim().min(1, "Mã vị trí không được để trống"),
          label: z.string().trim().min(1, "Tên vị trí không được để trống"),
          asset: z.string().trim().min(1, "Đường dẫn hình minh họa không hợp lệ").optional(),
        }),
      )
      .min(1, "Hãy thêm ít nhất 1 vị trí để thả mảnh")
      .max(10, "Chỉ được thêm tối đa 10 vị trí"),
  }),
  correctAnswer: z.record(z.string(), z.string()),
});

export const fillAnswerQuestionSchema = z.object({
  ...commonQuestionFields,
  type: z.literal("fill_answer"),
  payload: z.object({
    placeholder: z.string().trim().min(1, "Chữ gợi ý không được để trống").optional(),
    inputMode: z.enum(["text", "numeric"]).default("text"),
  }),
  correctAnswer: z
    .array(z.string().trim().min(1, "Câu trả lời đúng không được để trống"))
    .min(1, "Hãy nhập ít nhất 1 cách trả lời đúng")
    .max(20, "Chỉ được nhập tối đa 20 cách trả lời đúng"),
});

export const sortingQuestionSchema = z.object({
  ...commonQuestionFields,
  type: z.literal("sorting"),
  payload: z.object({
    items: z
      .array(questionOptionSchema)
      .min(2, "Cần ít nhất 2 bước để sắp xếp")
      .max(12, "Chỉ được thêm tối đa 12 bước"),
  }),
  correctAnswer: z
    .array(z.string().trim().min(1, "Mã bước không được để trống"))
    .min(2, "Đáp án sắp xếp cần ít nhất 2 bước")
    .max(12, "Đáp án sắp xếp chỉ được có tối đa 12 bước"),
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
