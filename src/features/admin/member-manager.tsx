"use client";

import { useRouter } from "next/navigation";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { requestJson } from "@/lib/http";

type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean;
  emailVerified: boolean;
  createdAt: Date;
};

export function MemberManager({ items, currentUserId }: { items: Member[]; currentUserId: string }) {
  const router = useRouter();

  async function updateMember(memberId: string, payload: Record<string, unknown>, successMessage: string) {
    try {
      await requestJson(`/api/admin/members/${memberId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      toast.success(successMessage);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật thành viên");
    }
  }

  return (
    <div className="overflow-x-auto rounded-2xl border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-[#f7f3eb] text-left">
          <tr>
            <th className="p-3">Thành viên</th>
            <th className="p-3">Role</th>
            <th className="p-3">Email</th>
            <th className="p-3">Trạng thái</th>
            <th className="p-3">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t">
              <td className="p-3">
                <strong className="block">{item.name}</strong>
                <small>{new Date(item.createdAt).toLocaleDateString("vi-VN")}</small>
              </td>
              <td className="p-3">
                <select
                  disabled={item.id === currentUserId}
                  defaultValue={item.role}
                  onChange={(event) =>
                    updateMember(item.id, { role: event.target.value }, "Đã cập nhật role")
                  }
                  className="min-h-10 rounded-xl border px-3"
                >
                  <option value="parent">parent</option>
                  <option value="content_admin">content_admin</option>
                  <option value="reviewer">reviewer</option>
                  <option value="super_admin">super_admin</option>
                </select>
              </td>
              <td className="p-3">
                <span className="block">{item.email}</span>
                <small>{item.emailVerified ? "Đã xác minh" : "Chưa xác minh"}</small>
              </td>
              <td className="p-3">
                {item.banned ? (
                  <span className="font-bold text-red-700">Tạm ngưng</span>
                ) : (
                  <span className="font-bold text-green-700">Hoạt động</span>
                )}
              </td>
              <td className="p-3">
                <button
                  disabled={item.id === currentUserId}
                  type="button"
                  onClick={() =>
                    updateMember(
                      item.id,
                      {
                        banned: !item.banned,
                        banReason: item.banned ? null : "Tạm ngưng bởi super admin",
                      },
                      item.banned ? "Đã mở lại tài khoản" : "Đã tạm ngưng tài khoản",
                    )
                  }
                  className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 font-bold disabled:opacity-30 ${item.banned ? "text-green-700" : "text-red-700"}`}
                >
                  {item.banned ? <ShieldCheck size={16} /> : <ShieldOff size={16} />}
                  {item.banned ? "Mở lại" : "Tạm ngưng"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
