import { z } from "zod";
import { playableQuestionSchema } from "@/modules/gameplay/question";

export const missionSnapshotSchema = z.object({
  id: z.string().uuid().optional(),
  worldId: z.string().uuid().optional(),
  slug: z.string().min(1),
  worldSlug: z.string().optional(),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  shortDescription: z.string().min(1),
  storyIntro: z.string().min(1),
  estimatedMinutes: z.number().int().positive(),
  ageGroups: z.array(z.enum(["2-3", "4-5", "6-8"])).min(1),
  primarySkill: z.string().min(1),
  secondarySkills: z.array(z.string()),
  coverUrl: z.string().min(1),
  rewardBadge: z.string().optional(),
  difficulty: z.number().int().min(1).max(5),
  questions: z.array(playableQuestionSchema).min(1),
  safetyChecklist: z.record(z.string(), z.boolean()),
});

export type MissionSnapshot = z.infer<typeof missionSnapshotSchema>;

export function parseMissionSnapshot(value: unknown) {
  return missionSnapshotSchema.parse(value);
}
