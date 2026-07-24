import { describe, expect, it } from "vitest";
import { DEFAULT_CHILD_AVATAR_ASSET_ID } from "@/domain/child-avatar";
import { createChildSchema, updateChildSchema } from "@/modules/family/schemas";

describe("family child profile schemas", () => {
  it("requires at least two characters when creating a child profile", () => {
    const result = createChildSchema.safeParse({
      displayName: "Q",
      ageGroup: "6-8",
      avatarAssetId: DEFAULT_CHILD_AVATAR_ASSET_ID,
    });

    expect(result.success).toBe(false);
  });

  it("requires at least two characters when renaming a child profile", () => {
    expect(updateChildSchema.safeParse({ displayName: "Q" }).success).toBe(false);
    expect(updateChildSchema.safeParse({ displayName: "An" }).success).toBe(true);
  });
});
