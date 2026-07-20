import { z } from "zod";
import { ageGroupCodes } from "@/domain/age-groups";

export const createChildSchema = z.object({
  displayName: z.string().trim().min(1, "Hãy nhập tên thân mật").max(20, "Tên tối đa 20 ký tự"),
  ageGroup: z.enum(ageGroupCodes),
  avatarUrl: z.string().default("/assets/mascots/mascot-dog-bong-avatar.png"),
  mascotId: z.string().default("bong"),
});

export const updateChildSchema = createChildSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, "Không có thay đổi");

export const updateParentSettingsSchema = z.object({
  displayName: z.string().trim().min(2).max(80).optional(),
  soundEnabled: z.boolean().optional(),
  effectsEnabled: z.boolean().optional(),
  notificationSettings: z.record(z.string(), z.boolean()).optional(),
  privacySettings: z.record(z.string(), z.boolean()).optional(),
  pin: z
    .string()
    .regex(/^\d{4,8}$/, "PIN cần từ 4 đến 8 chữ số")
    .optional(),
});
