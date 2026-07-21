import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { systemSettings } from "@/db/schema";
import {
  defaultImageUploadPolicies,
  isImageUploadCategory,
  mediaUploadPolicySettingKey,
  parseImageUploadPolicies,
  type ImageUploadPolicies,
} from "@/domain/media-upload-policy";
import type { MediaCategory } from "@/domain/media";

export async function getImageUploadPolicies(): Promise<ImageUploadPolicies> {
  const setting = await db.query.systemSettings.findFirst({
    where: eq(systemSettings.key, mediaUploadPolicySettingKey),
  });
  return setting ? parseImageUploadPolicies(setting.value) : defaultImageUploadPolicies;
}

export async function getImageUploadPolicy(category: MediaCategory) {
  if (!isImageUploadCategory(category)) return undefined;
  const policies = await getImageUploadPolicies();
  return policies[category];
}
