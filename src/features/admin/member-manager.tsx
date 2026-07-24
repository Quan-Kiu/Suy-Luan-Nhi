"use client";

import type { KeyboardEvent } from "react";
import { useRef, useState } from "react";
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

type MemberTabKey = "staff" | "parents";
type MemberTab = {
  key: MemberTabKey;
  title: string;
  description: string;
  emptyMessage: string;
  items: MemberItem[];
  icon: LucideIcon;
};

function MemberTabButton({
  tab,
  selected,
  buttonRef,
  onClick,
  onKeyDown,
}: {
  tab: MemberTab;
  selected: boolean;
  buttonRef: (element: HTMLButtonElement | null) => void;
  onClick: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
}) {
  const Icon = tab.icon;
  return (
    <button
      ref={buttonRef}
      id={`member-tab-${tab.key}`}
      type="button"
      role="tab"
      aria-selected={selected}
      aria-controls={`member-panel-${tab.key}`}
      aria-label={`${tab.title}, ${tab.items.length} tài khoản`}
      tabIndex={selected ? 0 : -1}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={`type-action flex min-h-12 min-w-0 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 transition sm:min-w-52 ${
        selected
          ? "border-[#342f28] bg-white text-[#342f28] shadow-sm"
          : "border-transparent text-[#6f6558] hover:bg-white/70 hover:text-[#342f28]"
      }`}
    >
      <Icon aria-hidden="true" className="shrink-0" size={18} />
      <span className="truncate">{tab.title}</span>
      <span
        aria-hidden="true"
        className={`type-caption shrink-0 rounded-full border px-2 py-0.5 font-bold ${
          selected ? "bg-[#f7f3eb] text-[#493f34]" : "bg-white/70 text-[#6f6558]"
        }`}
      >
        {tab.items.length}
      </span>
    </button>
  );
}

export function MemberManager({ items, currentUserId }: { items: MemberItem[]; currentUserId: string }) {
  const { staff, parents } = partitionMembersByAccess(items);
  const [activeTabKey, setActiveTabKey] = useState<MemberTabKey>("staff");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
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

  function selectTab(index: number, focus = false) {
    const tab = tabs[index];
    if (!tab) return;
    setActiveTabKey(tab.key);
    if (focus) tabRefs.current[index]?.focus();
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    selectTab(nextIndex, true);
  }

  return (
    <div className="space-y-4">
      <div
        role="tablist"
        aria-label="Nhóm thành viên"
        className="grid grid-cols-2 gap-1.5 rounded-2xl border bg-[#f3ecdf] p-1.5 sm:w-fit"
      >
        {tabs.map((tab, index) => (
          <MemberTabButton
            key={tab.key}
            tab={tab}
            selected={tab.key === activeTab.key}
            buttonRef={(element) => {
              tabRefs.current[index] = element;
            }}
            onClick={() => selectTab(index)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
          />
        ))}
      </div>

      <section
        id={`member-panel-${activeTab.key}`}
        role="tabpanel"
        aria-labelledby={`member-tab-${activeTab.key}`}
        tabIndex={0}
        className="space-y-3 outline-none focus-visible:ring-2 focus-visible:ring-[#c45a16] focus-visible:ring-offset-2"
      >
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
      </section>
    </div>
  );
}
