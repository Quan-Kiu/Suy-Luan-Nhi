"use client";

import { useMutation } from "@tanstack/react-query";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { membersApi } from "@/api/admin/members";
import { usePendingRouter } from "@/hooks/use-pending-router";

export type MemberItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean;
  emailVerified: boolean;
  createdAt: Date;
};

type UpdateInput = { payload: Record<string, unknown>; successMessage: string };

export function MemberRow({ item, currentUserId }: { item: MemberItem; currentUserId: string }) {
  const navigation = usePendingRouter();
  const mutation = useMutation({
    mutationFn: ({ payload }: UpdateInput) => membersApi.update(item.id, payload),
    onSuccess: (_, variables) => {
      toast.success(variables.successMessage);
      navigation.refresh();
    },
  });
  const isCurrentUser = item.id === currentUserId;

  return (
    <tr className="border-t">
      <td className="p-3">
        <strong className="block">{item.name}</strong>
        <small>{new Date(item.createdAt).toLocaleDateString("vi-VN")}</small>
      </td>
      <td className="p-3">
        <select
          aria-label={`Vai trò của ${item.name}`}
          disabled={isCurrentUser || mutation.isPending || navigation.isPending}
          defaultValue={item.role}
          onChange={(event) =>
            mutation.mutate({ payload: { role: event.target.value }, successMessage: "Đã cập nhật vai trò" })
          }
          className="min-h-10 rounded-xl border px-3 disabled:opacity-50"
        >
          <option value="parent">Phụ huynh</option>
          <option value="content_admin">Biên tập nội dung</option>
          <option value="reviewer">Người kiểm duyệt</option>
          <option value="super_admin">Quản trị viên</option>
        </select>
      </td>
      <td className="p-3">
        <span className="block">{item.email}</span>
        <small>{item.emailVerified ? "Đã xác minh" : "Chưa xác minh"}</small>
      </td>
      <td className="p-3">
        <span className={item.banned ? "font-bold text-red-700" : "font-bold text-green-700"}>
          {item.banned ? "Tạm ngưng" : "Hoạt động"}
        </span>
        {mutation.isError ? (
          <small className="mt-1 block text-red-700">{mutation.error.message}</small>
        ) : null}
      </td>
      <td className="p-3">
        <button
          disabled={isCurrentUser || mutation.isPending || navigation.isPending}
          type="button"
          aria-busy={mutation.isPending || navigation.isPending}
          onClick={() =>
            mutation.mutate({
              payload: {
                banned: !item.banned,
                banReason: item.banned ? null : "Tạm ngưng bởi super admin",
              },
              successMessage: item.banned ? "Đã mở lại tài khoản" : "Đã tạm ngưng tài khoản",
            })
          }
          className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 font-bold disabled:opacity-30 ${item.banned ? "text-green-700" : "text-red-700"}`}
        >
          {item.banned ? <ShieldCheck size={16} /> : <ShieldOff size={16} />}
          {mutation.isPending || navigation.isPending
            ? "Đang cập nhật..."
            : item.banned
              ? "Mở lại"
              : "Tạm ngưng"}
        </button>
      </td>
    </tr>
  );
}
