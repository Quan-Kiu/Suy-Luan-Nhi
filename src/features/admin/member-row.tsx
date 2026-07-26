"use client";

import { useMutation } from "@tanstack/react-query";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { membersApi } from "@/api/admin/members";
import { MemberAccountActions } from "@/features/admin/member-account-actions";
import { getAccountMethods } from "@/features/admin/member-presentation";
import { usePendingRouter } from "@/hooks/use-pending-router";

export type MemberItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean;
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  createdAt: Date;
  accountProviders: string[];
  parentProfileId: string | null;
  mustChangePassword: boolean;
};

type UpdateInput = { payload: Record<string, unknown>; successMessage: string };

function useMemberActions(item: MemberItem, currentUserId: string) {
  const navigation = usePendingRouter();
  const mutation = useMutation({
    mutationFn: ({ payload }: UpdateInput) => membersApi.update(item.id, payload),
    onSuccess: (_, variables) => {
      toast.success(variables.successMessage);
      navigation.refresh();
    },
  });
  return { mutation, navigation, isCurrentUser: item.id === currentUserId };
}
type Actions = ReturnType<typeof useMemberActions>;

function RoleSelect({
  item,
  actions,
  className = "",
}: {
  item: MemberItem;
  actions: Actions;
  className?: string;
}) {
  const disabled = actions.isCurrentUser || actions.mutation.isPending || actions.navigation.isPending;
  return (
    <select
      aria-label={`Vai trò của ${item.name}`}
      disabled={disabled}
      defaultValue={item.role}
      onChange={(event) =>
        actions.mutation.mutate({
          payload: { role: event.target.value },
          successMessage: "Đã cập nhật vai trò",
        })
      }
      className={`type-body min-h-10 rounded-xl border bg-white px-3 disabled:opacity-50 ${className}`}
    >
      <option value="parent">Phụ huynh</option>
      <option value="content_admin">Biên tập nội dung</option>
      <option value="reviewer">Người kiểm tra nội dung</option>
      <option value="super_admin">Quản trị viên</option>
    </select>
  );
}

function AccountMethods({ providerIds }: { providerIds: string[] }) {
  const methods = getAccountMethods(providerIds);
  return (
    <div aria-label="Hình thức đăng nhập" className="flex flex-wrap gap-1.5">
      {methods.map((method) => (
        <span
          key={method.providerId}
          className={`type-caption inline-flex min-h-7 items-center rounded-full border px-2.5 py-1 font-bold ${
            method.providerId === "google"
              ? "border-blue-200 bg-blue-50 text-blue-800"
              : method.providerId === "credential"
                ? "border-stone-200 bg-stone-50 text-stone-700"
                : "border-slate-200 bg-slate-50 text-slate-600"
          }`}
        >
          {method.label}
        </span>
      ))}
    </div>
  );
}

function MemberStatus({ item }: { item: MemberItem }) {
  const staff = item.role !== "parent";
  return (
    <div>
      <span className={item.banned ? "type-label block text-red-700" : "type-label block text-green-700"}>
        {item.banned ? "Tạm ngưng" : "Hoạt động"}
      </span>
      {item.mustChangePassword ? (
        <span className="type-caption mt-1 block font-bold text-amber-700">Cần đổi mật khẩu tạm thời</span>
      ) : null}
      {staff ? (
        <span
          className={`type-caption mt-1 block ${item.twoFactorEnabled ? "text-green-700" : "text-amber-700"}`}
        >
          {item.twoFactorEnabled ? "Đã bật xác thực hai lớp" : "Chưa bật xác thực hai lớp"}
        </span>
      ) : null}
    </div>
  );
}
function AccessButton({
  item,
  actions,
  className = "",
}: {
  item: MemberItem;
  actions: Actions;
  className?: string;
}) {
  const pending = actions.mutation.isPending || actions.navigation.isPending;
  return (
    <button
      disabled={actions.isCurrentUser || pending}
      type="button"
      aria-busy={pending}
      onClick={() =>
        actions.mutation.mutate({
          payload: {
            banned: !item.banned,
            banReason: item.banned ? null : "Tạm ngưng bởi super admin",
          },
          successMessage: item.banned ? "Đã mở lại tài khoản" : "Đã tạm ngưng tài khoản",
        })
      }
      className={`type-action inline-flex min-h-10 items-center gap-2 rounded-xl border px-3 py-2 whitespace-nowrap disabled:opacity-30 ${
        item.banned ? "text-green-700" : "text-red-700"
      } ${className}`}
    >
      {item.banned ? <ShieldCheck size={16} /> : <ShieldOff size={16} />}
      {pending ? "Đang cập nhật..." : item.banned ? "Mở lại" : "Tạm ngưng"}
    </button>
  );
}

function MutationError({ actions }: { actions: Actions }) {
  return actions.mutation.isError ? (
    <p role="alert" className="type-caption mt-2 font-bold text-red-700">
      {actions.mutation.error.message}
    </p>
  ) : null;
}
export function MemberRow({ item, currentUserId }: { item: MemberItem; currentUserId: string }) {
  const actions = useMemberActions(item, currentUserId);
  return (
    <tr className="border-t align-top">
      <td className="p-3">
        <strong className="type-label block">{item.name}</strong>
        <span className="type-caption">Tạo ngày {new Date(item.createdAt).toLocaleDateString("vi-VN")}</span>
      </td>
      <td className="p-3">
        <RoleSelect item={item} actions={actions} className="w-full" />
      </td>
      <td className="p-3">
        <span className="block break-all">{item.email}</span>
        <span className="type-caption">{item.emailVerified ? "Đã xác minh" : "Chưa xác minh"}</span>
        <div className="mt-2">
          <AccountMethods providerIds={item.accountProviders} />
        </div>
      </td>
      <td className="p-3">
        <MemberStatus item={item} />
        <MutationError actions={actions} />
      </td>
      <td className="p-3">
        <div className="grid gap-2">
          <AccessButton item={item} actions={actions} className="w-full justify-center" />
          <MemberAccountActions item={item} currentUserId={currentUserId} />
        </div>
      </td>
    </tr>
  );
}

export function MemberCard({ item, currentUserId }: { item: MemberItem; currentUserId: string }) {
  const actions = useMemberActions(item, currentUserId);
  return (
    <article className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="type-card-title truncate">{item.name}</h3>
          <p className="type-supporting mt-1 break-all text-[#6f6558]">{item.email}</p>
        </div>
        <MemberStatus item={item} />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="type-label block">
          Vai trò
          <RoleSelect item={item} actions={actions} className="mt-1 w-full" />
        </label>
        <div className="rounded-xl bg-[#f7f3eb] p-3">
          <p className="type-caption font-black text-[#6f6558]">Hình thức đăng nhập</p>
          <div className="mt-2">
            <AccountMethods providerIds={item.accountProviders} />
          </div>
          <p className="type-caption mt-2 font-bold text-[#493f34]">
            {item.emailVerified ? "Email đã xác minh" : "Email chưa xác minh"}
          </p>
          <p className="type-caption mt-1 text-[#6f6558]">
            Tạo ngày {new Date(item.createdAt).toLocaleDateString("vi-VN")}
          </p>
        </div>
      </div>
      {actions.isCurrentUser ? (
        <p className="type-caption mt-3 rounded-xl bg-blue-50 px-3 py-2 font-bold text-blue-800">
          Đây là tài khoản bạn đang sử dụng nên không thể tự đổi quyền, tạm ngưng hoặc đặt lại thông tin đăng
          nhập tại đây.
        </p>
      ) : null}
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <AccessButton item={item} actions={actions} className="w-full justify-center" />
        <MemberAccountActions item={item} currentUserId={currentUserId} />
      </div>
      <MutationError actions={actions} />
    </article>
  );
}
