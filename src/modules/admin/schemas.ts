import { z } from "zod";
import { ageGroupCodes } from "@/domain/age-groups";
import {
  dragDropQuestionSchema,
  fillAnswerQuestionSchema,
  patternSequenceQuestionSchema,
  singleChoiceQuestionSchema,
  sortingQuestionSchema,
  playableQuestionSchema,
} from "@/modules/gameplay/question";

export const safetyKeys = [
  "ageAppropriate",
  "hintsSupportive",
  "feedbackPositive",
  "noProhibitedClaims",
  "noExternalLinks",
  "languageAndImagesSafe",
] as const;

const draftHintSchema = z.object({
  level: z.number().int("Cấp gợi ý cần là số nguyên").min(1).max(3),
  text: z.string().trim().min(4, "Mỗi gợi ý cần ít nhất 4 ký tự"),
});
const draftQuestionFields = {
  id: z.string().uuid("Mã câu hỏi không hợp lệ").optional(),
  hints: z.array(draftHintSchema).min(1, "Hãy thêm ít nhất 1 gợi ý").max(3, "Chỉ được thêm tối đa 3 gợi ý"),
};

const draftQuestionSchema = z.discriminatedUnion("type", [
  singleChoiceQuestionSchema.omit({ id: true, hints: true }).extend(draftQuestionFields),
  patternSequenceQuestionSchema.omit({ id: true, hints: true }).extend(draftQuestionFields),
  dragDropQuestionSchema.omit({ id: true, hints: true }).extend(draftQuestionFields),
  fillAnswerQuestionSchema.omit({ id: true, hints: true }).extend(draftQuestionFields),
  sortingQuestionSchema.omit({ id: true, hints: true }).extend(draftQuestionFields),
]);

const adminMissionDraftBaseSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(3, "Mã đường dẫn cần ít nhất 3 ký tự")
    .max(100, "Mã đường dẫn không được dài quá 100 ký tự")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Mã đường dẫn chỉ gồm chữ thường, số và dấu gạch ngang"),
  worldId: z.string().uuid("Hãy chọn một chủ đề nhiệm vụ"),
  title: z
    .string()
    .trim()
    .min(3, "Tên nhiệm vụ cần ít nhất 3 ký tự")
    .max(120, "Tên nhiệm vụ không được dài quá 120 ký tự"),
  subtitle: z
    .string()
    .trim()
    .min(3, "Câu giới thiệu cần ít nhất 3 ký tự")
    .max(180, "Câu giới thiệu không được dài quá 180 ký tự"),
  shortDescription: z
    .string()
    .trim()
    .min(10, "Mô tả trên thẻ cần ít nhất 10 ký tự")
    .max(300, "Mô tả trên thẻ không được dài quá 300 ký tự"),
  storyIntro: z
    .string()
    .trim()
    .min(20, "Câu chuyện mở đầu cần ít nhất 20 ký tự")
    .max(1800, "Câu chuyện mở đầu không được dài quá 1.800 ký tự"),
  estimatedMinutes: z
    .number("Thời gian dự kiến cần là một số")
    .int("Thời gian dự kiến cần là số nguyên")
    .min(1, "Thời gian dự kiến cần ít nhất 1 phút")
    .max(30, "Thời gian dự kiến không được quá 30 phút"),
  primarySkillId: z.string().uuid("Hãy chọn kỹ năng chính"),
  secondarySkillIds: z
    .array(z.string().uuid("Kỹ năng đi kèm đã chọn không hợp lệ"))
    .max(8, "Chỉ được chọn tối đa 8 kỹ năng đi kèm"),
  rewardBadgeId: z.string().uuid("Huy hiệu đã chọn không hợp lệ").nullable(),
  coverUrl: z.string().trim().min(1, "Hãy chọn ảnh bìa nhiệm vụ"),
  ageGroups: z.array(z.enum(ageGroupCodes)).min(1, "Hãy chọn ít nhất 1 nhóm tuổi"),
  difficulty: z
    .number("Mức độ cần là một số")
    .int("Mức độ cần là số nguyên")
    .min(1, "Mức độ thấp nhất là 1")
    .max(5, "Mức độ cao nhất là 5"),
  allowReplay: z.boolean("Hãy chọn có cho phép chơi lại hay không"),
  randomizeAnswers: z.boolean("Hãy chọn có đổi thứ tự đáp án hay không"),
  questions: z
    .array(draftQuestionSchema)
    .min(1, "Hãy thêm ít nhất 1 câu hỏi")
    .max(30, "Mỗi nhiệm vụ chỉ được có tối đa 30 câu hỏi"),
  safety: z.object(
    Object.fromEntries(safetyKeys.map((key) => [key, z.boolean("Hãy xác nhận mục an toàn này")])) as Record<
      (typeof safetyKeys)[number],
      z.ZodBoolean
    >,
  ),
});

export const adminMissionDraftSchema = adminMissionDraftBaseSchema.superRefine((draft, context) => {
  draft.questions.forEach((question, index) => {
    const result = playableQuestionSchema.safeParse({
      ...question,
      id: question.id ?? "550e8400-e29b-41d4-a716-446655440000",
      order: index + 1,
    });
    if (!result.success) {
      for (const issue of result.error.issues) {
        context.addIssue({
          code: "custom",
          path: ["questions", index, ...issue.path],
          message: issue.message,
        });
      }
    }
  });
});

export const reviewApprovalSchema = z.object({
  comment: z.string().trim().max(2000, "Nhận xét không được dài quá 2.000 ký tự").optional().default(""),
});

export const reviewRejectionSchema = z.object({
  comment: z
    .string()
    .trim()
    .min(4, "Vui lòng ghi nhận xét ít nhất 4 ký tự")
    .max(2000, "Nhận xét không được dài quá 2.000 ký tự"),
});

export const updateRoleSchema = z.object({
  role: z.enum(["parent", "content_admin", "reviewer", "super_admin"]),
});

export type AdminMissionDraft = z.infer<typeof adminMissionDraftSchema>;
