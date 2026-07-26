"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ShieldCheck, UsersRound } from "lucide-react";
import { AdminTabPanel, AdminTabs } from "@/features/admin/admin-tabs";
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
        <table className="type-supporting w-full min-w-[1080px] table-fixed">
          <colgroup>
            <col className="w-[16%]" />
            <col className="w-[22%]" />
            <col className="w-[25%]" />
            <col className="w-[15%]" />
            <col className="w-[22%]" />
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

type MemberTabKey = "staff" | "parents";
type MemberTab = {
  key: MemberTabKey;
  title: string;
  description: string;
  emptyMessage: string;
  items: MemberItem[];
  icon: LucideIcon;
};

export function MemberManager({ items, currentUserId }: { items: MemberItem[]; currentUserId: string }) {
  const { staff, parents } = partitionMembersByAccess(items);
  const [activeTabKey, setActiveTabKey] = useState<MemberTabKey>("staff");
  const tabs: MemberTab[] = [
    {
      key: "staff",
      title: "Ban quản trị",
      description:
        "Các tài khoản có quyền truy cập trang quản trị. Trạng thái xác thực hai lớp được hiển thị để kiểm soát an toàn truy cập.",
      emptyMessage: "Chưa có tài khoản nào thuộc ban quản trị.",
      items: staff,
      icon: ShieldCheck,
    },
    {
      key: "parents",
      title: "Phụ huynh",
      description: "Các tài khoản gia đình sử dụng khu vực phụ huynh và quản lý hồ sơ của bé.",
      emptyMessage: "Chưa có tài khoản phụ huynh.",
      items: parents,
      icon: UsersRound,
    },
  ];
  const activeTab = tabs.find((tab) => tab.key === activeTabKey) ?? tabs[0]!;

  return (
    <div className="space-y-4">
      <AdminTabs
        idPrefix="member"
        ariaLabel="Nhóm thành viên"
        value={activeTab.key}
        onValueChange={setActiveTabKey}
        items={tabs.map((tab) => ({
          value: tab.key,
          label: tab.title,
          icon: tab.icon,
          count: tab.items.length,
          ariaLabel: `${tab.title}, ${tab.items.length} tài khoản`,
        }))}
      />

      <AdminTabPanel idPrefix="member" value={activeTab.key} className="space-y-3">
        <div className="rounded-2xl border bg-[#fffdf8] px-4 py-3">
          <p className="type-supporting text-[#6f6558]">{activeTab.description}</p>
        </div>
        {activeTab.items.length ? (
          <MemberTable items={activeTab.items} currentUserId={currentUserId} />
        ) : (
          <div className="rounded-2xl border border-dashed bg-white px-4 py-8 text-center">
            <p className="type-supporting text-[#6f6558]">{activeTab.emptyMessage}</p>
          </div>
        )}
      </AdminTabPanel>
    </div>
  );
}
