import { requireStaff } from "@/auth/session";
import { hasRole } from "@/auth/roles";
import { MediaLibrary } from "@/features/admin/media-library";
import { listMedia } from "@/modules/media/media";
export default async function Page() {
  const session = await requireStaff();
  const items = await listMedia();
  return (
    <div>
      <h1 className="text-3xl font-black">Thư viện media</h1>
      <p className="mt-2 mb-5 text-[#806d54]">Quản lý ảnh và audio được phép dùng trong nội dung trẻ em.</p>
      <MediaLibrary
        items={items}
        canReview={hasRole(session.user.role, ["reviewer", "super_admin"])}
        canUpload={hasRole(session.user.role, ["content_admin", "super_admin"])}
        canDelete={hasRole(session.user.role, ["content_admin", "super_admin"])}
      />
    </div>
  );
}
