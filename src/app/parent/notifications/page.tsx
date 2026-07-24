import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { contentText } from "@/content/resolve";
import { NotificationList } from "@/features/parent/notification-list";
import { getContentNamespace } from "@/modules/content/content";
import { getActiveChild } from "@/modules/family/active-child";
import { getParentNotifications } from "@/modules/parent/parent-data";

export const metadata: Metadata = {
  title: "Thông báo",
};

export default async function Page() {
  const [active, content] = await Promise.all([getActiveChild(), getContentNamespace("parent")]);
  if (!active) redirect("/onboarding");
  const items = await getParentNotifications(active.parent.id);
  return (
    <>
      <h1 className="type-page-title">{contentText(content, "notifications.title", "Thông báo")}</h1>
      <p className="mt-2 mb-5 text-[#786348]">
        {contentText(
          content,
          "notifications.description",
          "Những thông tin mới về hoạt động của bé và các thay đổi quan trọng trong ứng dụng.",
        )}
      </p>
      <NotificationList items={items} />
    </>
  );
}
