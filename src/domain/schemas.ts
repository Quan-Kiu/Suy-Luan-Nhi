import { z } from "zod";
import { ageGroupCodes, type AgeGroup } from "@/domain/age-groups";

export const ageGroupSchema = z.enum(ageGroupCodes);
export type { AgeGroup };

export const childDisplayNameSchema = z
  .string()
  .trim()
  .min(2, "Tên hồ sơ của bé cần ít nhất 2 ký tự")
  .max(20, "Tên tối đa 20 ký tự");

export const childProfileSchema = z.object({
  id: z.string().min(1),
  displayName: childDisplayNameSchema,
  ageGroup: ageGroupSchema,
  avatar: z.string().min(1),
  mascot: z.string().min(1),
  currentRank: z.string().min(1),
  createdAt: z.string().datetime(),
});
export type ChildProfile = z.infer<typeof childProfileSchema>;

export const createChildProfileSchema = z.object({
  displayName: childProfileSchema.shape.displayName,
  ageGroup: ageGroupSchema,
  avatarAssetId: z.string().uuid("Hãy chọn avatar cho bé"),
});
export type CreateChildProfileInput = z.infer<typeof createChildProfileSchema>;

export const answerOptionSchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().min(1, "Tên đáp án không được để trống"),
  asset: z.string().trim().min(1, "Đáp án cần có hình ảnh"),
});
export type AnswerOption = z.infer<typeof answerOptionSchema>;

export const patternItemSchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().min(1, "Tên mảnh ghép không được để trống"),
  asset: z.string().trim().min(1).nullable(),
});
export type PatternItem = z.infer<typeof patternItemSchema>;

const questionBaseSchema = z.object({
  id: z.string().min(1),
  type: z.literal("pattern_sequence"),
  prompt: z.string().trim().min(1),
  instruction: z.string().trim().min(1),
  sequence: z.array(patternItemSchema).min(3),
  options: z.array(answerOptionSchema).min(2),
  correctAnswer: z.string().trim().min(1),
  hints: z.array(z.string().trim().min(4)).min(1),
  feedbackCorrect: z.string().trim().min(1),
  feedbackIncorrect: z.string().trim().min(1),
});

function addCorrectAnswerIssue(
  value: { options: Array<{ id: string }>; correctAnswer: string },
  context: z.RefinementCtx,
) {
  if (!value.options.some((option) => option.id === value.correctAnswer)) {
    context.addIssue({
      code: "custom",
      path: ["correctAnswer"],
      message: "Đáp án đúng phải nằm trong danh sách lựa chọn",
    });
  }
}

export const questionSchema = questionBaseSchema.superRefine(addCorrectAnswerIssue);
export type Question = z.infer<typeof questionSchema>;

export const safetyChecklistSchema = z.object({
  ageAppropriate: z.boolean(),
  hintsSupportive: z.boolean(),
  feedbackPositive: z.boolean(),
  noProhibitedClaims: z.boolean(),
  noExternalLinks: z.boolean(),
  languageAndImagesSafe: z.boolean(),
});
export type SafetyChecklist = z.infer<typeof safetyChecklistSchema>;

export function isSafetyChecklistComplete(checklist: SafetyChecklist) {
  return Object.values(checklist).every(Boolean);
}

const missionBaseSchema = z.object({
  id: z.string(),
  worldId: z.string(),
  title: z.string().trim().min(3),
  subtitle: z.string().trim().min(3),
  shortDescription: z.string().trim().min(10),
  storyIntro: z.string().trim().min(10),
  estimatedMinutes: z.number().int().min(1).max(30),
  targetAgeGroups: z.array(ageGroupSchema).min(1),
  primarySkill: z.string().trim().min(1),
  secondarySkills: z.array(z.string().trim().min(1)),
  reward: z.object({ name: z.string().trim().min(1), asset: z.string().trim().min(1) }),
  coverImage: z.string().trim().min(1),
  status: z.enum(["draft", "in_review", "approved", "published", "archived"]),
  questions: z.array(questionSchema).min(1),
  safety: safetyChecklistSchema,
});

export const missionSchema = missionBaseSchema.superRefine((mission, context) => {
  if (mission.status === "published" && !isSafetyChecklistComplete(mission.safety)) {
    context.addIssue({
      code: "custom",
      path: ["safety"],
      message: "Nhiệm vụ xuất bản phải hoàn tất Checklist an toàn",
    });
  }
});
export type Mission = z.infer<typeof missionSchema>;

export const missionWorldSchema = z.object({
  id: z.string(),
  order: z.number().int().positive(),
  title: z.string(),
  subtitle: z.string(),
  description: z.string(),
  coverImage: z.string(),
  theme: z.enum(["green", "blue", "purple", "orange"]),
  status: z.enum(["available", "recommended", "locked", "completed"]),
});
export type MissionWorld = z.infer<typeof missionWorldSchema>;

const editorPatternItemSchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().min(1, "Tên mảnh ghép không được để trống"),
  asset: z.string(),
});

const editorHintSchema = z.object({
  text: z.string().trim().min(4, "Gợi ý cần ít nhất 4 ký tự"),
});

export const missionEditorSchema = z
  .object({
    title: z.string().trim().min(3, "Tiêu đề cần ít nhất 3 ký tự"),
    subtitle: z.string().trim().min(3, "Phụ đề cần ít nhất 3 ký tự"),
    shortDescription: z.string().trim().min(10, "Mô tả cần ít nhất 10 ký tự"),
    storyIntro: z.string().trim().min(10, "Câu chuyện cần ít nhất 10 ký tự"),
    estimatedMinutes: z.number().int().min(1).max(30),
    primarySkill: z.string().trim().min(1, "Hãy chọn kỹ năng chính"),
    ageGroup: ageGroupSchema,
    coverImage: z.string().trim().min(1, "Nhiệm vụ cần ảnh bìa"),
    rewardName: z.string().trim().min(2, "Phần thưởng cần có tên"),
    prompt: z.string().trim().min(8, "Câu hỏi cần ít nhất 8 ký tự"),
    instruction: z.string().trim().min(8, "Hướng dẫn cần rõ ràng"),
    sequence: z.array(editorPatternItemSchema).min(3),
    options: z.array(answerOptionSchema).min(2),
    correctAnswer: z.string().trim().min(1, "Hãy chọn đáp án đúng"),
    hints: z.array(editorHintSchema).min(1),
    feedbackCorrect: z.string().trim().min(4, "Phản hồi đúng cần ít nhất 4 ký tự"),
    feedbackIncorrect: z.string().trim().min(4, "Phản hồi thử lại cần ít nhất 4 ký tự"),
    safety: safetyChecklistSchema,
  })
  .superRefine(addCorrectAnswerIssue);
export type MissionEditorInput = z.infer<typeof missionEditorSchema>;

export const missionEditorRequestSchema = z.object({
  action: z.enum(["save", "submit"]),
  mission: missionEditorSchema,
});
export type MissionEditorRequest = z.infer<typeof missionEditorRequestSchema>;

export const parentUnlockSchema = z.object({
  answer: z
    .string()
    .trim()
    .refine((value: string): boolean => value === "23", {
      message: "Câu trả lời chưa đúng, ba/mẹ thử lại nhé.",
    }),
});
export type ParentUnlockInput = z.infer<typeof parentUnlockSchema>;
