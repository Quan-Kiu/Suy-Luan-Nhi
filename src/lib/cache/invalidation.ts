import { revalidatePath, revalidateTag } from "next/cache";
import { cacheTags } from "@/lib/cache/tags";
import { clearOperationalSystemSettingsCache } from "@/modules/system-settings/runtime";

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

export function invalidateChildMissionMap(childId: string) {
  revalidateTag(cacheTags.childMissionMap(childId), expireImmediately);
}

export function invalidatePublishedCatalog() {
  revalidateTag(cacheTags.publishedCatalog, expireImmediately);
}

export function invalidateAdminMemberViews() {
  revalidatePath("/admin");
  revalidatePath("/admin/access-control");
  revalidatePath("/admin/members");
}

export function invalidateAdminMissionViews(missionId?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/missions");
  revalidatePath("/admin/reviews");
  if (missionId) revalidatePath(`/admin/missions/${missionId}/edit`);
}

export function invalidateTaxonomyCaches() {
  revalidateTag(cacheTags.adminTaxonomy, expireImmediately);
  revalidateTag(cacheTags.publishedCatalog, expireImmediately);
  revalidatePath("/admin/taxonomy");
  revalidatePath("/admin/worlds");
  revalidatePath("/admin/badges");
  revalidatePath("/admin/missions");
  revalidatePath("/admin/missions/new");
  revalidatePath("/admin/reviews");
  revalidatePath("/parent");
}

export function invalidateSystemSettingsViews() {
  clearOperationalSystemSettingsCache();
  revalidatePath("/", "layout");
}
export function invalidateAdminMediaViews() {
  revalidatePath("/admin/media");
  revalidatePath("/admin/feedback");
}
