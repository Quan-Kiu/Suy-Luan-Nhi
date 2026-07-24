"use client";

import type { LucideIcon } from "lucide-react";
import { ShieldCheck, UsersRound } from "lucide-react";
import { MemberCard, MemberRow, type MemberItem } from "@/features/admin/member-row";
import { partitionMembersByAccess } from "@/features/admin/member-presentation";

function MemberTable({ items, currentUserId }: { items: MemberItem[]; currentUserId: string }) {
  return (
    <>
      <div className="grid gap-3 md:hidden">
        {items.map((item) => (
          <MemberCard key={item.id} item={item} currentUserId={currentUserId} />
        ))}
      </div>
      <div className="hidden overflow-x-auto rounded-2xl border bg-white md:block">
        <table className="type-supporting w-full min-w-[960px] table-fixed">
          <colgroup>
            <col className="w-[17%]" />
            <col className="w-[26%]" />
            <col className="w-[27%]" />
            <col className="w-[15%]" />
            <col className="w-[15%]" />
          </colgroup>
          <thead className="bg-[#f7f3eb] text-left">
            <tr>
              <th className="type-label p-3">Tài khoản</th>
              <th className="type-label p-3">Vai trò</th>
              <th className="type-label p-3">Email & đăng nhập</th>
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

function MemberSection({
  id,
  title,
  description,
  emptyMessage,
  items,
  currentUserId,
  icon: Icon,
}: {
  id: string;
  title: string;
  description: string;
  emptyMessage: string;
  items: MemberItem[];
  currentUserId: string;
  icon: LucideIcon;
}) {
  return (
    <section aria-labelledby={id} className="space-y-3">
      <div className="flex items-start gap-3 rounded-2xl border bg-[#fffdf8] p-4 sm:p-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f3ecdf] text-[#493f34]">
          <Icon aria-hidden="true" size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id={id} className="type-section-title">
              {title}
            </h2>
            <span className="type-caption rounded-full border bg-white px-2.5 py-1 font-bold text-[#6f6558]">
              {items.length} tài khoản
            </span>
          </div>
          <p className="type-supporting mt-1 text-[#6f6558]">{description}</p>
        </div>
      </div>

      {items.length ? (
        <MemberTable items={items} currentUserId={currentUserId} />
      ) : (
        <div className="rounded-2xl border border-dashed bg-white px-4 py-8 text-center">
          <p className="type-supporting text-[#6f6558]">{emptyMessage}</p>
        </div>
      )}
    </section>
  );
}

export function MemberManager({ items, currentUserId }: { items: MemberItem[]; currentUserId: string }) {
  const { staff, parents } = partitionMembersByAccess(items);

  return (
    <div className="space-y-8">
      <MemberSection
        id="staff-members-heading"
        title="Ban quản trị"
        description="Các tài khoản có quyền truy cập trang quản trị. Trạng thái xác thực hai lớp được hiển thị để kiểm soát an toàn truy cập."
        emptyMessage="Chưa có tài khoản nào thuộc ban quản trị."
        items={staff}
        currentUserId={currentUserId}
        icon={ShieldCheck}
      />
      <MemberSection
        id="parent-members-heading"
        title="Phụ huynh"
        description="Các tài khoản gia đình sử dụng khu vực phụ huynh và quản lý hồ sơ của bé."
        emptyMessage="Chưa có tài khoản phụ huynh."
        items={parents}
        currentUserId={currentUserId}
        icon={UsersRound}
      />
    </div>
  );
}
