import { redirect } from "next/navigation";
import { NotificationList } from "@/features/parent/notification-list";
import { getActiveChild } from "@/modules/family/active-child";
import { getParentNotifications } from "@/modules/parent/parent-data";

export default async function Page() {
  const active = await getActiveChild();
  if (!active) redirect("/onboarding");
  const items = await getParentNotifications(active.parent.id);
  return (
    <>
      <h1 className="text-3xl font-black">Thông báo</h1>
      <p className="mt-2 mb-5 text-[#786348]">Các cập nhật quan trọng về hành trình của bé và hệ thống.</p>
      <NotificationList items={items} />
    </>
  );
}
