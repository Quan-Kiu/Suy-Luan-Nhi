import { z } from "zod";

export const parentSettingsSchema = z.object({
  soundEnabled: z.boolean(),
  effectsEnabled: z.boolean(),
  notificationSettings: z.object({
    missionCompleted: z.boolean(),
    suggestions: z.boolean(),
    weeklySummary: z.boolean(),
  }),
  privacySettings: z.object({ analytics: z.boolean() }),
  pin: z.string().regex(/^$|^\d{4,8}$/, "PIN phải gồm 4–8 chữ số"),
});

export type ParentSettingsFormValues = z.infer<typeof parentSettingsSchema>;
