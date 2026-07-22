import { redirect } from "next/navigation";
import type { ParentResourcePage } from "@/api/parent-resources";
import { requireParent } from "@/auth/session";
import { ResourceLibrary } from "@/features/parent/resource-library";
import { getActiveChild } from "@/modules/family/active-child";
import { getResources } from "@/modules/parent/parent-data";
import { getOperationalSystemSettings } from "@/modules/system-settings/runtime";

export default async function Page() {
  const [, systemSettings] = await Promise.all([requireParent(), getOperationalSystemSettings()]);
  if (!systemSettings.features.parentResourcesEnabled) redirect("/parent");
  const active = await getActiveChild();
  if (!active) redirect("/profiles");
  const result = await getResources({ ageGroup: active.child.ageGroup, page: 1, pageSize: 9 });
  const initialData: ParentResourcePage = {
    ...result,
    items: result.items.map((item) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      excerpt: item.excerpt,
      resourceType: item.resourceType,
      category: item.category as ParentResourcePage["items"][number]["category"],
      ageGroups: item.ageGroups,
      coverUrl: item.coverUrl,
      mediaUrl: item.mediaUrl,
    })),
  };
  return (
    <>
      <h1 className="type-page-title">Hướng dẫn cho phụ huynh</h1>
      <p className="mt-2 text-[#786348]">
        Nội dung được lọc theo nhóm tuổi {active.child.ageGroup} của {active.child.displayName}.
      </p>
      <ResourceLibrary initialData={initialData} />
    </>
  );
}
