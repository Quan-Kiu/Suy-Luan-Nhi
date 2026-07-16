import { redirect } from "next/navigation";
import { BrandHeader } from "@/components/brand-header";
import { ChildShell } from "@/components/child-shell";
import { Card } from "@/components/ui";
import { MissionMapView } from "@/features/catalog/mission-map-view";
import { getMissionMap } from "@/modules/catalog/catalog";
import { getActiveChild } from "@/modules/family/active-child";
export default async function Page() {
  const active = await getActiveChild();
  if (!active) redirect("/onboarding");
  const data = await getMissionMap(active.child);
  return (
    <ChildShell>
      <BrandHeader />
      <main className="paper-texture min-h-[calc(100vh-5rem)] px-5 pt-5 pb-8">
        <Card className="mb-6 p-4">
          <p className="text-sm text-[#806d54]">Hành trình của</p>
          <h1 className="text-3xl font-black">{active.child.displayName}</h1>
          <p className="mt-1 text-sm">Các nhiệm vụ mở dần theo cách bé khám phá, không có bảng xếp hạng.</p>
        </Card>
        <MissionMapView data={data} />
      </main>
    </ChildShell>
  );
}
