import { requireRoles } from "@/auth/session";
import { ContentManager } from "@/features/admin/content-manager";
import { listContentEntries } from "@/modules/content/content";

export default async function Page() {
  const session = await requireRoles(["content_admin", "reviewer", "super_admin"]);
  const items = await listContentEntries("vi");
  return (
    <div>
      <h1 className="text-3xl font-black">Quản lý nội dung hệ thống</h1>
      <p className="mt-2 mb-5 text-[#806d54]">
        UI copy, thông báo và nội dung dùng chung được quản lý theo namespace, key và locale.
      </p>
      <ContentManager
        items={items}
        canEdit={session.user.role === "content_admin" || session.user.role === "super_admin"}
      />
    </div>
  );
}
