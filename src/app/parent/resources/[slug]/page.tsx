import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { Card, Pill } from "@/components/ui";
import { ParentShell } from "@/features/parent/parent-shell";
import { getActiveChild } from "@/modules/family/active-child";
import { requireParentWorkspace } from "@/modules/parent/access";
import { getParentDashboard, getResource } from "@/modules/parent/parent-data";
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { parent } = await requireParentWorkspace();
  const active = await getActiveChild();
  if (!active) redirect("/onboarding");
  const { slug } = await params;
  const [item, dashboard] = await Promise.all([
    getResource(slug),
    getParentDashboard(active.child.id, parent.id),
  ]);
  if (!item) notFound();
  return (
    <ParentShell childName={active.child.displayName} unread={dashboard.unreadNotifications}>
      <article className="mx-auto max-w-3xl">
        <Pill>{item.category}</Pill>
        <h1 className="mt-4 text-4xl font-black">{item.title}</h1>
        <p className="mt-3 text-lg text-[#806d54]">{item.excerpt}</p>
        {item.coverUrl ? (
          <Image
            src={item.coverUrl}
            width={900}
            height={500}
            alt=""
            className="mt-6 h-72 w-full rounded-[28px] object-cover"
          />
        ) : null}
        <Card className="mt-6 p-6">
          <div className="text-lg leading-8 whitespace-pre-line">{item.content}</div>
        </Card>
      </article>
    </ParentShell>
  );
}
