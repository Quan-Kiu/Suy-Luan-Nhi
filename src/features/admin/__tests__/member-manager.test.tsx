import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MemberManager } from "@/features/admin/member-manager";
import type { MemberItem } from "@/features/admin/member-row";

vi.mock("@/hooks/use-pending-router", () => ({
  usePendingRouter: () => ({
    refresh: vi.fn(),
    isPending: false,
  }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn() },
}));

const baseMember = {
  banned: false,
  twoFactorEnabled: false,
  emailVerified: true,
  createdAt: new Date("2026-07-23T00:00:00.000Z"),
  parentProfileId: null,
  mustChangePassword: false,
  deletedAt: null,
  deletedBy: null,
  deletionReason: null,
} satisfies Pick<
  MemberItem,
  | "banned"
  | "twoFactorEnabled"
  | "emailVerified"
  | "createdAt"
  | "parentProfileId"
  | "mustChangePassword"
  | "deletedAt"
  | "deletedBy"
  | "deletionReason"
>;

const members: MemberItem[] = [
  {
    ...baseMember,
    id: "parent-credential",
    name: "Phụ huynh Email",
    email: "parent@example.com",
    role: "parent",
    accountProviders: ["credential"],
    parentProfileId: "parent-profile-credential",
  },
  {
    ...baseMember,
    id: "staff-google",
    name: "Quản trị Google",
    email: "staff@example.com",
    role: "super_admin",
    twoFactorEnabled: true,
    accountProviders: ["google"],
  },
  {
    ...baseMember,
    id: "parent-linked",
    name: "Phụ huynh Liên kết",
    email: "linked@example.com",
    role: "parent",
    accountProviders: ["credential", "google"],
    parentProfileId: "parent-profile-linked",
  },
];

const trashedMembers: MemberItem[] = [
  {
    ...baseMember,
    id: "trashed-parent",
    name: "Phụ huynh đã xóa",
    email: "trash@example.com",
    role: "parent",
    accountProviders: ["credential"],
    parentProfileId: "trashed-parent-profile",
    banned: true,
    deletedAt: new Date("2026-07-27T08:00:00.000Z"),
    deletedBy: "staff-google",
    deletionReason: "Không còn sử dụng",
  },
];

function renderManager(trash: MemberItem[] = []) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemberManager items={members} trashedItems={trash} currentUserId="staff-google" />
    </QueryClientProvider>,
  );
}

describe("MemberManager", () => {
  it("shows one member group at a time and switches tabs", async () => {
    const user = userEvent.setup();
    renderManager();

    const staffTab = screen.getByRole("tab", { name: "Ban quản trị, 1 tài khoản" });
    const parentTab = screen.getByRole("tab", { name: "Phụ huynh, 2 tài khoản" });
    expect(staffTab).toHaveAttribute("aria-selected", "true");
    expect(parentTab).toHaveAttribute("aria-selected", "false");

    const staffPanel = screen.getByRole("tabpanel", { name: /Ban quản trị/ });
    expect(within(staffPanel).getAllByText("staff@example.com")).toHaveLength(2);
    expect(within(staffPanel).getAllByText("Google")).toHaveLength(2);
    expect(within(staffPanel).queryByText("parent@example.com")).not.toBeInTheDocument();

    await user.click(parentTab);

    expect(parentTab).toHaveAttribute("aria-selected", "true");
    expect(staffTab).toHaveAttribute("aria-selected", "false");
    expect(screen.queryByRole("tabpanel", { name: /Ban quản trị/ })).not.toBeInTheDocument();

    const parentPanel = screen.getByRole("tabpanel", { name: /Phụ huynh/ });
    expect(within(parentPanel).getAllByText("parent@example.com")).toHaveLength(2);
    expect(within(parentPanel).getAllByText("Email & mật khẩu")).toHaveLength(4);
    expect(within(parentPanel).getAllByText("Google")).toHaveLength(2);
    expect(within(parentPanel).queryByText("staff@example.com")).not.toBeInTheDocument();
  });

  it("shows trashed parent accounts separately with restore and permanent-delete actions", async () => {
    const user = userEvent.setup();
    renderManager(trashedMembers);

    const trashTab = screen.getByRole("tab", { name: "Thùng rác, 1 tài khoản" });
    await user.click(trashTab);

    const panel = screen.getByRole("tabpanel", { name: /Thùng rác/ });
    expect(within(panel).getByText("trash@example.com")).toBeVisible();
    expect(within(panel).getByText("Lý do: Không còn sử dụng")).toBeVisible();
    expect(within(panel).getByRole("button", { name: "Khôi phục" })).toBeEnabled();
    expect(within(panel).getByRole("button", { name: "Xóa vĩnh viễn" })).toBeEnabled();
  });

  it("supports arrow-key navigation between tabs", async () => {
    const user = userEvent.setup();
    renderManager();

    const staffTab = screen.getByRole("tab", { name: /Ban quản trị/ });
    const parentTab = screen.getByRole("tab", { name: /Phụ huynh/ });
    staffTab.focus();

    await user.keyboard("{ArrowRight}");
    expect(parentTab).toHaveFocus();
    expect(parentTab).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{ArrowLeft}");
    expect(staffTab).toHaveFocus();
    expect(staffTab).toHaveAttribute("aria-selected", "true");
  });
});
