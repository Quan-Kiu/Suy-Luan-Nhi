import {
  BarChart3,
  ClipboardCheck,
  Database,
  FileText,
  Gauge,
  ImageIcon,
  Languages,
  Layers3,
  Settings,
  ShieldCheck,
  Tags,
  Users,
} from "lucide-react";
import Link from "next/link";
import type { AppRole } from "@/auth/roles";
import { contentText } from "@/content/resolve";
import type { ContentDictionary } from "@/content/types";
import { getPrimaryRole } from "@/features/admin/admin-role";
import { cn } from "@/lib/utils";

const allStaff: AppRole[] = ["content_admin", "reviewer", "super_admin"];
const editors: AppRole[] = ["content_admin", "super_admin"];
const reviewers: AppRole[] = ["reviewer", "super_admin"];
const superAdmins: AppRole[] = ["super_admin"];
const navGroups = [
  {
    labelKey: "navGroup.primary",
    fallback: "Công việc chính",
    items: [
      {
        href: "/admin",
        labelKey: "nav.dashboard",
        fallback: "Tổng quan",
        icon: Gauge,
        roles: allStaff,
        exact: true,
      },
      {
        href: "/admin/missions",
        labelKey: "nav.missions",
        fallback: "Nhiệm vụ",
        icon: FileText,
        roles: allStaff,
      },
      {
        href: "/admin/reviews",
        labelKey: "nav.reviews",
        fallback: "Duyệt nội dung",
        icon: ClipboardCheck,
        roles: reviewers,
      },
    ],
  },
  {
    labelKey: "navGroup.content",
    fallback: "Nội dung hiển thị",
    items: [
      {
        href: "/admin/media",
        labelKey: "nav.media",
        fallback: "Hình ảnh & âm thanh",
        icon: ImageIcon,
        roles: allStaff,
      },
      {
        href: "/admin/content",
        labelKey: "nav.content",
        fallback: "Nội dung giao diện",
        icon: Languages,
        roles: allStaff,
      },
      {
        href: "/admin/worlds",
        labelKey: "nav.worlds",
        fallback: "Thế giới nhiệm vụ",
        icon: Layers3,
        roles: editors,
      },
      {
        href: "/admin/taxonomy",
        labelKey: "nav.taxonomy",
        fallback: "Độ tuổi & kỹ năng",
        icon: Tags,
        roles: editors,
      },
    ],
  },
  {
    labelKey: "navGroup.operations",
    fallback: "Theo dõi & vận hành",
    items: [
      {
        href: "/admin/reports",
        labelKey: "nav.reports",
        fallback: "Báo cáo",
        icon: BarChart3,
        roles: allStaff,
      },
      {
        href: "/admin/members",
        labelKey: "nav.members",
        fallback: "Thành viên & quyền",
        icon: Users,
        roles: superAdmins,
      },
      {
        href: "/admin/data-requests",
        labelKey: "nav.dataRequests",
        fallback: "Yêu cầu dữ liệu",
        icon: ShieldCheck,
        roles: superAdmins,
      },
      {
        href: "/admin/audit",
        labelKey: "nav.audit",
        fallback: "Nhật ký thay đổi",
        icon: Database,
        roles: allStaff,
      },
      {
        href: "/admin/settings",
        labelKey: "nav.settings",
        fallback: "Cài đặt nâng cao",
        icon: Settings,
        roles: superAdmins,
      },
    ],
  },
] as const;

type Props = {
  pathname: string;
  role: unknown;
  content: ContentDictionary;
  onNavigate?: () => void;
  ariaLabel?: string;
};

export function AdminNavigation({ pathname, role, content, onNavigate, ariaLabel }: Props) {
  const primaryRole = getPrimaryRole(role);
  return (
    <nav aria-label={ariaLabel} className="space-y-6 text-sm">
      {navGroups.map((group) => {
        const visibleItems = group.items.filter((item) => item.roles.includes(primaryRole));
        if (!visibleItems.length) return null;

        return (
          <section key={group.labelKey}>
            <p className="mb-2 px-3 text-[11px] font-black tracking-[0.14em] text-[#756b60] uppercase">
              {contentText(content, group.labelKey, group.fallback)}
            </p>
            <div className="space-y-1">
              {visibleItems.map((item) => {
                const active =
                  "exact" in item && item.exact
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-11 items-center gap-3 rounded-xl px-3 font-bold transition hover:bg-[#f5f2ec]",
                      active && "bg-[#fff0df] text-[#bd4910] shadow-sm",
                    )}
                  >
                    <Icon size={18} className="shrink-0" />
                    <span>{contentText(content, item.labelKey, item.fallback)}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

      <div className="rounded-2xl bg-[#edf4df] p-4 text-xs text-[#587048]">
        <div className="flex items-center gap-2 font-black">
          <ShieldCheck size={16} />
          {contentText(content, "shell.workflowTitle", "Quy trình nội dung an toàn")}
        </div>
        <ol className="mt-2 space-y-1.5 leading-5">
          <li>1. Soạn và lưu nội dung.</li>
          <li>2. Kiểm tra an toàn cho trẻ.</li>
          <li>3. Người kiểm duyệt xác nhận trước khi hiển thị.</li>
        </ol>
      </div>
    </nav>
  );
}
