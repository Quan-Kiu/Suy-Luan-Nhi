import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { mediaAssets } from "@/db/schema";
import { CHILD_AVATAR_CATEGORY } from "@/domain/child-avatar";

const selectableAvatarWhere = and(
  eq(mediaAssets.type, "image"),
  eq(mediaAssets.category, CHILD_AVATAR_CATEGORY),
  eq(mediaAssets.safetyStatus, "approved"),
  isNull(mediaAssets.deletedAt),
);

export type SelectableChildAvatar = {
  id: string;
  url: string;
  altText: string;
};

export class InvalidChildAvatarError extends Error {
  readonly code = "INVALID_CHILD_AVATAR";
  readonly status = 422;

  constructor() {
    super("Avatar đã chọn không còn khả dụng. Hãy chọn avatar khác.");
    this.name = "InvalidChildAvatarError";
  }
}

export async function listSelectableChildAvatars(): Promise<SelectableChildAvatar[]> {
  return db
    .select({ id: mediaAssets.id, url: mediaAssets.url, altText: mediaAssets.altText })
    .from(mediaAssets)
    .where(selectableAvatarWhere)
    .orderBy(asc(mediaAssets.createdAt));
}

export async function getSelectableChildAvatar(avatarAssetId: string) {
  return db.query.mediaAssets.findFirst({
    where: and(selectableAvatarWhere, eq(mediaAssets.id, avatarAssetId)),
    columns: { id: true, url: true },
  });
}
