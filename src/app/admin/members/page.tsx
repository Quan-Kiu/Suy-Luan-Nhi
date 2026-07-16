import { requireRoles } from "@/auth/session";
import { MemberManager } from "@/features/admin/member-manager";
import { listMembers } from "@/modules/admin/operations";
export default async function Page() {
  const session = await requireRoles(["super_admin"]);
  const items = await listMembers();
  return (
    <div>
      <h1 className="text-3xl font-black">Thành viên & phân quyền</h1>
      <p className="mt-2 mb-5 text-[#806d54]">Role được kiểm tra lại ở server cho mọi API và trang bảo vệ.</p>
      <MemberManager items={items} currentUserId={session.user.id} />
    </div>
  );
}
