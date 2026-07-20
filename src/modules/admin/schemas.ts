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

const draftHintSchema = z.object({ level: z.number().int().min(1).max(3), text: z.string().trim().min(4) });
const draftQuestionFields = {
  id: z.string().uuid().optional(),
  hints: z.array(draftHintSchema).min(1).max(3),
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
    .min(3)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang"),
  worldId: z.string().uuid(),
  title: z.string().trim().min(3).max(120),
  subtitle: z.string().trim().min(3).max(180),
  shortDescription: z.string().trim().min(10).max(300),
  storyIntro: z.string().trim().min(20).max(1800),
  estimatedMinutes: z.number().int().min(1).max(30),
  primarySkillId: z.string().uuid(),
  secondarySkillIds: z.array(z.string().uuid()).max(8),
  rewardBadgeId: z.string().uuid().nullable(),
  coverUrl: z.string().trim().min(1),
  ageGroups: z.array(z.enum(ageGroupCodes)).min(1),
  difficulty: z.number().int().min(1).max(5),
  allowReplay: z.boolean(),
  randomizeAnswers: z.boolean(),
  questions: z.array(draftQuestionSchema).min(1).max(30),
  safety: z.object(
    Object.fromEntries(safetyKeys.map((key) => [key, z.boolean()])) as Record<
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

export const reviewDecisionSchema = z.object({
  comment: z.string().trim().min(4).max(2000),
});

export const updateRoleSchema = z.object({
  role: z.enum(["parent", "content_admin", "reviewer", "super_admin"]),
});

export type AdminMissionDraft = z.infer<typeof adminMissionDraftSchema>;
