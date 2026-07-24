import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
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
} satisfies Pick<MemberItem, "banned" | "twoFactorEnabled" | "emailVerified" | "createdAt">;

function renderManager(items: MemberItem[]) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemberManager items={items} currentUserId="staff-google" />
    </QueryClientProvider>,
  );
}

describe("MemberManager", () => {
  it("separates staff and parents and exposes each sign-in method", () => {
    renderManager([
      {
        ...baseMember,
        id: "parent-credential",
        name: "Phụ huynh Email",
        email: "parent@example.com",
        role: "parent",
        accountProviders: ["credential"],
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
      },
    ]);

    const staffSection = screen.getByRole("region", { name: "Ban quản trị" });
    const parentSection = screen.getByRole("region", { name: "Phụ huynh" });

    expect(within(staffSection).getByText("1 tài khoản")).toBeInTheDocument();
    expect(within(staffSection).getAllByText("staff@example.com")).toHaveLength(2);
    expect(within(staffSection).getAllByText("Google")).toHaveLength(2);
    expect(within(staffSection).queryByText("parent@example.com")).not.toBeInTheDocument();

    expect(within(parentSection).getByText("2 tài khoản")).toBeInTheDocument();
    expect(within(parentSection).getAllByText("parent@example.com")).toHaveLength(2);
    expect(within(parentSection).getAllByText("Email & mật khẩu")).toHaveLength(4);
    expect(within(parentSection).getAllByText("Google")).toHaveLength(2);
    expect(within(parentSection).queryByText("staff@example.com")).not.toBeInTheDocument();
  });
});
