import { z } from "zod";
import { ageGroupCodes } from "@/domain/age-groups";
import { DEFAULT_CHILD_AVATAR_ASSET_ID } from "@/domain/child-avatar";
import { parentPinValueSchema } from "@/domain/parent-pin";
import { childDisplayNameSchema } from "@/domain/schemas";
const avatarAssetIdSchema = z.string().uuid("Hãy chọn avatar cho bé");

export const createChildSchema = z.object({
  displayName: childDisplayNameSchema,
  ageGroup: z.enum(ageGroupCodes),
  avatarAssetId: avatarAssetIdSchema.default(DEFAULT_CHILD_AVATAR_ASSET_ID),
  mascotId: z.string().default("bong"),
});

export const updateChildSchema = z
  .object({
    displayName: childDisplayNameSchema.optional(),
    ageGroup: z.enum(ageGroupCodes).optional(),
    avatarAssetId: avatarAssetIdSchema.optional(),
    mascotId: z.string().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, "Không có thay đổi");

export const updateParentSettingsSchema = z.object({
  displayName: z.string().trim().min(2).max(80).optional(),
  soundEnabled: z.boolean().optional(),
  effectsEnabled: z.boolean().optional(),
  notificationSettings: z.record(z.string(), z.boolean()).optional(),
  privacySettings: z.record(z.string(), z.boolean()).optional(),
  pin: parentPinValueSchema.optional(),
});
