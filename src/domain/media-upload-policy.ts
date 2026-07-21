import { z } from "zod";
import { mediaCategoryLabels, type MediaCategory } from "@/domain/media";

export const mediaUploadPolicySettingKey = "media.imageUploadPolicies";
export const imageUploadCategories = [
  "general",
  "mission-cover",
  "world-cover",
  "question-asset",
  "resource-cover",
] as const satisfies readonly MediaCategory[];

export type ImageUploadCategory = (typeof imageUploadCategories)[number];

export const imageUploadPolicySchema = z
  .object({
    sizeValidationEnabled: z.boolean(),
    maxSizeMb: z.number().int().min(1).max(10),
    dimensionValidationEnabled: z.boolean(),
    minWidth: z.number().int().min(1).max(10000).nullable(),
    minHeight: z.number().int().min(1).max(10000).nullable(),
    maxWidth: z.number().int().min(1).max(10000).nullable(),
    maxHeight: z.number().int().min(1).max(10000).nullable(),
  })
  .refine((value) => value.minWidth === null || value.maxWidth === null || value.minWidth <= value.maxWidth, {
    message: "Chiều rộng tối thiểu không được lớn hơn chiều rộng tối đa",
    path: ["maxWidth"],
  })
  .refine(
    (value) => value.minHeight === null || value.maxHeight === null || value.minHeight <= value.maxHeight,
    {
      message: "Chiều cao tối thiểu không được lớn hơn chiều cao tối đa",
      path: ["maxHeight"],
    },
  );

export const imageUploadPoliciesSchema = z.record(z.enum(imageUploadCategories), imageUploadPolicySchema);

export type ImageUploadPolicy = z.infer<typeof imageUploadPolicySchema>;
export type ImageUploadPolicies = Record<ImageUploadCategory, ImageUploadPolicy>;
const defaultPolicy: ImageUploadPolicy = {
  sizeValidationEnabled: true,
  maxSizeMb: 5,
  dimensionValidationEnabled: false,
  minWidth: null,
  minHeight: null,
  maxWidth: null,
  maxHeight: null,
};

export const defaultImageUploadPolicies = Object.fromEntries(
  imageUploadCategories.map((category) => [category, { ...defaultPolicy }]),
) as ImageUploadPolicies;

export const imageUploadPolicyLabels = Object.fromEntries(
  imageUploadCategories.map((category) => [category, mediaCategoryLabels[category]]),
) as Record<ImageUploadCategory, string>;

export function isImageUploadCategory(category: MediaCategory): category is ImageUploadCategory {
  return imageUploadCategories.includes(category as ImageUploadCategory);
}

export function parseImageUploadPolicies(value: unknown): ImageUploadPolicies {
  const source = typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
  return Object.fromEntries(
    imageUploadCategories.map((category) => {
      const parsed = imageUploadPolicySchema.safeParse(source[category]);
      return [category, parsed.success ? parsed.data : { ...defaultImageUploadPolicies[category] }];
    }),
  ) as ImageUploadPolicies;
}
