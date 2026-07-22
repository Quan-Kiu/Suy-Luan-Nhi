"use client";

import { MemberCard, MemberRow, type MemberItem } from "@/features/admin/member-row";

export function MemberManager({ items, currentUserId }: { items: MemberItem[]; currentUserId: string }) {
  return (
    <>
      <div className="grid gap-3 md:hidden">
        {items.map((item) => (
          <MemberCard key={item.id} item={item} currentUserId={currentUserId} />
        ))}
      </div>
      <div className="hidden overflow-x-auto rounded-2xl border bg-white md:block">
        <table className="type-supporting min-w-full">
          <thead className="bg-[#f7f3eb] text-left">
            <tr>
              <th className="type-label p-3">Thành viên</th>
              <th className="type-label p-3">Vai trò</th>
              <th className="type-label p-3">Email</th>
              <th className="type-label p-3">Trạng thái</th>
              <th className="type-label p-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <MemberRow key={item.id} item={item} currentUserId={currentUserId} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
