import { revalidateTag } from "next/cache";
import { cacheTags } from "@/lib/cache/tags";

const expireImmediately = { expire: 0 } as const;

export function invalidateContentCache() {
  revalidateTag(cacheTags.content, expireImmediately);
}

export function invalidateParentResources() {
  revalidateTag(cacheTags.parentResources, expireImmediately);
}

export function invalidateParentDashboard(childId: string) {
  revalidateTag(cacheTags.parentDashboard(childId), expireImmediately);
}

export function invalidateParentNotifications(parentProfileId: string) {
  revalidateTag(cacheTags.parentNotifications(parentProfileId), expireImmediately);
}
