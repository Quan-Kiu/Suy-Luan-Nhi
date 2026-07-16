import { redirect } from "next/navigation";
import { NotificationList } from "@/features/parent/notification-list";
import { ParentShell } from "@/features/parent/parent-shell";
import { getActiveChild } from "@/modules/family/active-child";
import { requireParentWorkspace } from "@/modules/parent/access";
import { getParentDashboard, getParentNotifications } from "@/modules/parent/parent-data";
export default async function Page() {
  const { parent } = await requireParentWorkspace();
  const active = await getActiveChild();
  if (!active) redirect("/onboarding");
  const [items, dashboard] = await Promise.all([
    getParentNotifications(parent.id),
    getParentDashboard(active.child.id, parent.id),
  ]);
  return (
    <ParentShell childName={active.child.displayName} unread={dashboard.unreadNotifications}>
      <h1 className="text-3xl font-black">Thông báo</h1>
      <p className="mt-2 mb-5 text-[#806d54]">Các cập nhật quan trọng về hành trình của bé và hệ thống.</p>
      <NotificationList items={items} />
    </ParentShell>
  );
}
