import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, Pill } from "@/components/ui";
import { ParentShell } from "@/features/parent/parent-shell";
import { getActiveChild } from "@/modules/family/active-child";
import { requireParentWorkspace } from "@/modules/parent/access";
import { getParentDashboard, getResources } from "@/modules/parent/parent-data";
export default async function Page() {
  const { parent } = await requireParentWorkspace();
  const active = await getActiveChild();
  if (!active) redirect("/onboarding");
  const [items, dashboard] = await Promise.all([
    getResources(),
    getParentDashboard(active.child.id, parent.id),
  ]);
  return (
    <ParentShell childName={active.child.displayName} unread={dashboard.unreadNotifications}>
      <h1 className="text-3xl font-black">Tài nguyên cho phụ huynh</h1>
      <p className="mt-2 text-[#806d54]">Hướng dẫn ngắn, thực tế và không tạo áp lực thành tích cho trẻ.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <Link key={item.id} href={`/parent/resources/${item.slug}`}>
            <Card className="h-full overflow-hidden transition hover:-translate-y-1">
              {item.coverUrl ? (
                <Image
                  src={item.coverUrl}
                  width={520}
                  height={280}
                  alt=""
                  className="h-44 w-full object-cover"
                />
              ) : null}
              <div className="p-5">
                <Pill>{item.category}</Pill>
                <h2 className="mt-3 text-xl font-black">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#6f604b]">{item.excerpt}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </ParentShell>
  );
}
