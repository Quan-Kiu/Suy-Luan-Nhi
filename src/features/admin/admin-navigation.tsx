import {
  Award,
  BarChart3,
  BookOpen,
  Braces,
  ClipboardCheck,
  Database,
  FileText,
  Gauge,
  House,
  ImageIcon,
  Languages,
  Layers3,
  MessageSquareText,
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
        href: "/admin/parent-access",
        labelKey: "nav.parentArea",
        fallback: "Khu vực phụ huynh",
        icon: House,
        roles: superAdmins,
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
    fallback: "Soạn nội dung",
    items: [
      {
        href: "/admin/resources",
        labelKey: "nav.resources",
        fallback: "Gợi ý cho phụ huynh",
        icon: BookOpen,
        roles: allStaff,
      },
      {
        href: "/admin/media",
        labelKey: "nav.media",
        fallback: "Thư viện tư liệu",
        icon: ImageIcon,
        roles: allStaff,
      },
      {
        href: "/admin/content",
        labelKey: "nav.content",
        fallback: "Nội dung hiển thị",
        icon: Languages,
        roles: allStaff,
      },
      {
        href: "/admin/content-variables",
        labelKey: "nav.contentVariables",
        fallback: "Thông tin tự điền",
        icon: Braces,
        roles: superAdmins,
      },
      {
        href: "/admin/worlds",
        labelKey: "nav.worlds",
        fallback: "Chủ đề nhiệm vụ",
        icon: Layers3,
        roles: editors,
      },
      {
        href: "/admin/badges",
        labelKey: "nav.badges",
        fallback: "Huy hiệu",
        icon: Award,
        roles: editors,
      },
      {
        href: "/admin/taxonomy",
        labelKey: "nav.taxonomy",
        fallback: "Nhóm tuổi & kỹ năng",
        icon: Tags,
        roles: editors,
      },
    ],
  },
  {
    labelKey: "navGroup.operations",
    fallback: "Theo dõi hệ thống",
    items: [
      {
        href: "/admin/feedback",
        labelKey: "nav.feedback",
        fallback: "Góp ý hệ thống",
        icon: MessageSquareText,
        roles: allStaff,
      },
      {
        href: "/admin/reports",
        labelKey: "nav.reports",
        fallback: "Tình hình sử dụng",
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
        fallback: "Lịch sử thay đổi",
        icon: Database,
        roles: allStaff,
      },
      {
        href: "/admin/settings",
        labelKey: "nav.settings",
        fallback: "Cấu hình hệ thống",
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
    <nav aria-label={ariaLabel} className="space-y-4 pb-4">
      {navGroups.map((group) => {
        const visibleItems = group.items.filter((item) => item.roles.includes(primaryRole));
        if (!visibleItems.length) return null;

        return (
          <section key={group.labelKey}>
            <p className="type-overline mb-1.5 px-3 text-[#756b60]">
              {contentText(content, group.labelKey, group.fallback)}
            </p>
            <div className="space-y-0.5">
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
                      "type-action flex min-h-10 items-center gap-2.5 rounded-lg px-3 transition hover:bg-[#f5f2ec]",
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

      <details className="type-caption rounded-xl bg-[#edf4df] text-[#587048]">
        <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 px-3 py-2 font-black marker:hidden">
          <ShieldCheck size={16} />
          {contentText(content, "shell.workflowTitle", "Quy trình nội dung an toàn")}
        </summary>
        <ol className="space-y-1 border-t border-[#dbe8c9] px-3 py-2 leading-5">
          <li>1. Soạn và lưu nội dung.</li>
          <li>2. Kiểm tra an toàn cho trẻ.</li>
          <li>3. Một người khác kiểm tra trước khi cho bé xem.</li>
        </ol>
      </details>
    </nav>
  );
}
