import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AccessControlWorkspace } from "@/features/admin/access-control-workspace";
import type { AccessRoleItem } from "@/modules/admin/access-roles";

const replace = vi.fn();
let queryTab = "roles";
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(`tab=${queryTab}`),
}));

const roles: AccessRoleItem[] = [
  {
    key: "super_admin",
    name: "Quản trị viên",
    description: "Toàn quyền quản trị hệ thống.",
    permissions: ["admin.dashboard.view", "access_control.view", "roles.manage", "members.manage"],
    system: true,
    memberCount: 1,
    createdAt: null,
    updatedAt: null,
  },
];

function renderWorkspace(initialTab: "roles" | "members" = "roles") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return {
    queryClient,
    result: render(
      <QueryClientProvider client={queryClient}>
        <AccessControlWorkspace
          initialTab={initialTab}
          roles={roles}
          members={[]}
          trashedMembers={[]}
          currentUserId="admin"
          canManageRoles={false}
          canManageMembers
        />
      </QueryClientProvider>,
    ),
  };
}

describe("AccessControlWorkspace", () => {
  it("separates roles and members into top-level tabs", async () => {
    const user = userEvent.setup();
    queryTab = "roles";
    const { queryClient, result } = renderWorkspace();

    expect(screen.getByRole("tab", { name: /Vai trò/ })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("heading", { name: "Role hệ thống" })).toBeVisible();
    expect(screen.queryByRole("tab", { name: /Ban quản trị/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /Thành viên/ }));

    expect(replace).toHaveBeenCalledWith("/admin/access-control?tab=members", { scroll: false });

    queryTab = "members";
    result.rerender(
      <QueryClientProvider client={queryClient}>
        <AccessControlWorkspace
          initialTab="members"
          roles={roles}
          members={[]}
          trashedMembers={[]}
          currentUserId="admin"
          canManageRoles={false}
          canManageMembers
        />
      </QueryClientProvider>,
    );
    expect(screen.getByRole("tab", { name: /Ban quản trị/ })).toBeVisible();
    expect(screen.queryByRole("heading", { name: "Role hệ thống" })).not.toBeInTheDocument();
  });

  it("keeps expanded role details within an independently scrollable region", async () => {
    const user = userEvent.setup();
    queryTab = "roles";
    renderWorkspace();

    const roleHeading = screen.getByRole("heading", { name: "Quản trị viên" });
    const summary = roleHeading.closest("summary");
    expect(summary).not.toBeNull();
    await user.click(summary!);

    const region = screen.getByRole("region", { name: "Danh sách quyền của Quản trị viên" });
    expect(region).toHaveAttribute("tabindex", "0");
    expect(region).toHaveClass("scrollbar-thin", "overflow-y-auto", "overscroll-contain");
    expect(region.style.maxHeight).toBe("min(65dvh, 48rem)");
    expect(summary!.closest("details")?.parentElement).toHaveClass("items-start");
  });

  it("does not expose member data without member-management permission", () => {
    queryTab = "members";
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <AccessControlWorkspace
          initialTab="members"
          roles={roles}
          members={[]}
          trashedMembers={[]}
          currentUserId="viewer"
          canManageRoles={false}
          canManageMembers={false}
        />
      </QueryClientProvider>,
    );

    expect(screen.queryByRole("tab", { name: /Thành viên/ })).not.toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Vai trò/ })).toHaveAttribute("aria-selected", "true");
  });
});
