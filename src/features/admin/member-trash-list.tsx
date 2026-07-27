"use client";

import { getAccountMethods } from "@/features/admin/member-presentation";
import type { MemberItem } from "@/features/admin/member-row";
import { MemberTrashActions } from "@/features/admin/member-trash-actions";
import { roleDefinitions } from "@/auth/permissions";
import { appRoleSchema } from "@/auth/roles";

function roleLabel(role: string) {
  const parsed = appRoleSchema.safeParse(role);
  return parsed.success ? roleDefinitions[parsed.data].label : role;
}

function TrashItem({ item, currentUserId }: { item: MemberItem; currentUserId: string }) {
  const methods = getAccountMethods(item.accountProviders);
  return (
    <article className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="type-card-title text-[#342f28]">{item.name}</h3>
          <p className="type-supporting mt-1 break-all text-[#6f6558]">{item.email}</p>
          <div className="type-caption mt-2 flex flex-wrap gap-2 font-bold text-[#6f6558]">
            <span className="rounded-full bg-[#f7f3eb] px-2.5 py-1">{roleLabel(item.role)}</span>
            {methods.map((method) => (
              <span key={method.providerId} className="rounded-full bg-[#f7f3eb] px-2.5 py-1">
                {method.label}
              </span>
            ))}
          </div>
        </div>
        <div className="type-caption shrink-0 text-[#786d60] sm:text-right">
          <p className="font-black text-red-700">Trong thùng rác</p>
          <p className="mt-1">
            {item.deletedAt ? new Date(item.deletedAt).toLocaleString("vi-VN") : "Không rõ thời gian"}
          </p>
        </div>
      </div>
      {item.deletionReason ? (
        <p className="type-supporting mt-3 rounded-xl bg-red-50 px-3 py-2 text-red-800">
          Lý do: {item.deletionReason}
        </p>
      ) : null}
      <div className="mt-4">
        <MemberTrashActions item={item} mode="trash" currentUserId={currentUserId} />
      </div>
    </article>
  );
}

export function MemberTrashList({ items, currentUserId }: { items: MemberItem[]; currentUserId: string }) {
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed bg-white px-4 py-8 text-center">
        <p className="type-supporting text-[#6f6558]">Thùng rác chưa có tài khoản nào.</p>
      </div>
    );
  }
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {items.map((item) => (
        <TrashItem key={item.id} item={item} currentUserId={currentUserId} />
      ))}
    </div>
  );
}
