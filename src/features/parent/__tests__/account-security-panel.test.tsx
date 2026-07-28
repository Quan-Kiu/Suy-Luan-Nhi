import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { accountSecurityApi } from "@/api/account-security";
import { contentApi } from "@/api/content";
import type { AccountSecurityOverview } from "@/domain/account-security";
import { AccountSecurityPanel } from "@/features/parent/account-security-panel";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const overview: AccountSecurityOverview = {
  account: {
    name: "Ba mẹ Bống",
    email: "parent@demo.local",
    emailVerified: true,
    twoFactorEnabled: false,
    createdAt: "2026-07-01T08:00:00.000Z",
    signInMethods: [{ id: "credential", label: "Mật khẩu" }],
  },
  sessions: [
    {
      id: "current-session",
      current: true,
      browser: "Chrome",
      operatingSystem: "Linux",
      deviceType: "desktop",
      ipAddress: "127.0.0.1",
      createdAt: "2026-07-28T06:00:00.000Z",
      updatedAt: "2026-07-28T06:30:00.000Z",
      expiresAt: "2026-08-28T06:00:00.000Z",
    },
    {
      id: "other-session",
      current: false,
      browser: "Safari",
      operatingSystem: "iOS",
      deviceType: "mobile",
      ipAddress: "10.0.0.2",
      createdAt: "2026-07-27T06:00:00.000Z",
      updatedAt: "2026-07-27T06:30:00.000Z",
      expiresAt: "2026-08-27T06:00:00.000Z",
    },
  ],
};

function renderPanel() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <AccountSecurityPanel initialData={overview} />
    </QueryClientProvider>,
  );
}

describe("AccountSecurityPanel", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(contentApi, "getNamespace").mockResolvedValue({});
  });

  it("marks the current session and revokes only a confirmed other session", async () => {
    const user = userEvent.setup();
    vi.spyOn(accountSecurityApi, "revokeSession").mockResolvedValue({
      ...overview,
      sessions: [overview.sessions[0]!],
    });
    renderPanel();

    const current = screen.getByLabelText("Chrome trên Linux");
    expect(within(current).getByText("Phiên hiện tại")).toBeInTheDocument();
    expect(within(current).queryByRole("button", { name: "Đăng xuất" })).not.toBeInTheDocument();

    const other = screen.getByLabelText("Safari trên iOS");
    await user.click(within(other).getByRole("button", { name: "Đăng xuất" }));
    const dialog = screen.getByRole("alertdialog", { name: "Đăng xuất thiết bị này?" });
    await user.click(within(dialog).getByRole("button", { name: "Đăng xuất thiết bị" }));

    await waitFor(() =>
      expect(vi.mocked(accountSecurityApi.revokeSession).mock.calls[0]?.[0]).toBe("other-session"),
    );
    await waitFor(() => expect(screen.queryByLabelText("Safari trên iOS")).not.toBeInTheDocument());
    expect(toast.success).toHaveBeenCalledWith("Đã đăng xuất thiết bị");
  });

  it("requires confirmation before revoking all other sessions", async () => {
    const user = userEvent.setup();
    vi.spyOn(accountSecurityApi, "revokeOtherSessions").mockResolvedValue({
      ...overview,
      sessions: [overview.sessions[0]!],
    });
    renderPanel();

    await user.click(screen.getByRole("button", { name: "Đăng xuất thiết bị khác" }));
    const dialog = screen.getByRole("alertdialog", { name: "Đăng xuất tất cả thiết bị khác?" });
    expect(accountSecurityApi.revokeOtherSessions).not.toHaveBeenCalled();
    await user.click(within(dialog).getByRole("button", { name: "Đăng xuất tất cả" }));

    await waitFor(() => expect(accountSecurityApi.revokeOtherSessions).toHaveBeenCalledOnce());
    expect(toast.success).toHaveBeenCalledWith("Đã đăng xuất các thiết bị khác");
  });
});
