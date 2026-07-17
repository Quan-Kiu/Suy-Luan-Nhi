import { redirect } from "next/navigation";
import { Card } from "@/components/ui";
import { contentText } from "@/content/resolve";
import { MissionMapView } from "@/features/catalog/mission-map-view";
import { getMissionMap } from "@/modules/catalog/catalog";
import { getContentNamespace } from "@/modules/content/content";
import { getActiveChild } from "@/modules/family/active-child";
export default async function Page() {
  const active = await getActiveChild();
  if (!active) redirect("/onboarding");
  const [data, content] = await Promise.all([getMissionMap(active.child), getContentNamespace("child")]);
  return (
    <main className="paper-texture min-h-[calc(100vh-5rem)] px-5 pt-5 pb-8">
      <Card className="mb-6 p-4">
        <p className="text-sm text-[#806d54]">{contentText(content, "journey.label", "Hành trình của")}</p>
        <h1 className="text-3xl font-black">{active.child.displayName}</h1>
        <p className="mt-1 text-sm">
          {contentText(
            content,
            "journey.description",
            "Các nhiệm vụ mở dần theo cách bé khám phá, không có bảng xếp hạng.",
          )}
        </p>
      </Card>
      <MissionMapView data={data} content={content} />
    </main>
  );
}
