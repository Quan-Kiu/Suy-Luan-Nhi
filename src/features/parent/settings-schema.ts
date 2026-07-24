import { z } from "zod";
import { parentPinValueSchema } from "@/domain/parent-pin";

export const parentSettingsSchema = z.object({
  soundEnabled: z.boolean(),
  effectsEnabled: z.boolean(),
  notificationSettings: z.object({
    missionCompleted: z.boolean(),
    suggestions: z.boolean(),
    weeklySummary: z.boolean(),
  }),
  privacySettings: z.object({
    analytics: z.boolean(),
    errorReporting: z.boolean(),
  }),
  pin: z.union([z.literal(""), parentPinValueSchema]),
});

export type ParentSettingsFormValues = z.infer<typeof parentSettingsSchema>;
