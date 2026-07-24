import { redirect } from "next/navigation";
import { BadgeCollection } from "@/features/badges/badge-collection";
import { getActiveChild } from "@/modules/family/active-child";
import { getChildBadgeCollection } from "@/modules/family/child-badges";

export default async function BadgesPage() {
  const active = await getActiveChild();
  if (!active) redirect("/onboarding");

  const items = await getChildBadgeCollection(active.child.id);

  return (
    <main
      data-child-layout="wide"
      className="paper-texture min-h-[calc(100svh-5rem)] px-4 py-5 pb-10 sm:px-6 sm:py-7"
    >
      <BadgeCollection
        childName={active.child.displayName}
        childAvatarUrl={active.child.avatarUrl}
        items={items.map((item) => ({
          ...item,
          unlockedAt: item.unlockedAt?.toISOString() ?? null,
        }))}
      />
    </main>
  );
}
