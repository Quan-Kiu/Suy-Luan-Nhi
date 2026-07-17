"use client";

import { MemberRow, type MemberItem } from "@/features/admin/member-row";

export function MemberManager({ items, currentUserId }: { items: MemberItem[]; currentUserId: string }) {
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
            <MemberRow key={item.id} item={item} currentUserId={currentUserId} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
