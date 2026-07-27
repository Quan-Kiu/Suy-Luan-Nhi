import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { membersApi } from "@/api/admin/members";
import { MemberAccountActions } from "@/features/admin/member-account-actions";
import type { MemberItem } from "@/features/admin/member-row";
import { toast } from "sonner";

const refresh = vi.fn();
vi.mock("@/hooks/use-pending-router", () => ({
  usePendingRouter: () => ({ refresh, isPending: false }),
}));
vi.mock("@/api/admin/members", () => ({
  membersApi: {
    resetPassword: vi.fn(),
    resetParentPin: vi.fn(),
  },
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));

const baseItem: MemberItem = {
  id: "parent-1",
  name: "Phụ huynh Test",
  email: "parent@example.com",
  role: "parent",
  banned: false,
  twoFactorEnabled: false,
  emailVerified: true,
  createdAt: new Date("2026-07-25T00:00:00.000Z"),
  accountProviders: ["credential"],
  parentProfileId: "parent-profile-1",
  mustChangePassword: false,
  deletedAt: null,
  deletedBy: null,
  deletionReason: null,
};

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute("open");
  };
});

function renderActions(item: MemberItem = baseItem, currentUserId = "admin-1") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemberAccountActions item={item} currentUserId={currentUserId} />
    </QueryClientProvider>,
  );
}

describe("MemberAccountActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(membersApi.resetPassword).mockResolvedValue({
      accepted: true,
      duplicate: false,
      mode: "temporary_password",
      revokedSessionCount: 2,
    });
    vi.mocked(membersApi.resetParentPin).mockResolvedValue({
      accepted: true,
      duplicate: false,
      mode: "clear",
    });
  });

  it("sets a temporary password through a confirmed dialog", async () => {
    const user = userEvent.setup();
    renderActions();

    await user.click(screen.getByText("Thao tác tài khoản"));
    await user.click(screen.getByRole("button", { name: "Đặt lại mật khẩu" }));
    expect(screen.getByRole("dialog", { name: /Đặt lại mật khẩu/ })).toBeInTheDocument();

    await user.click(screen.getByText("Đặt mật khẩu tạm thời"));
    await user.type(screen.getByLabelText("Mật khẩu tạm thời"), "Temporary-Password-2026");
    await user.type(screen.getByLabelText("Nhập lại mật khẩu tạm thời"), "Temporary-Password-2026");
    await user.click(screen.getByRole("button", { name: "Đặt mật khẩu tạm" }));

    await waitFor(() =>
      expect(membersApi.resetPassword).toHaveBeenCalledWith("parent-1", {
        mode: "temporary_password",
        temporaryPassword: "Temporary-Password-2026",
      }),
    );
    expect(toast.success).toHaveBeenCalledWith(
      "Đã đặt mật khẩu tạm thời và đăng xuất tài khoản khỏi các thiết bị",
    );
    expect(refresh).toHaveBeenCalled();
  });

  it("shows a server error without closing the dialog", async () => {
    const user = userEvent.setup();
    vi.mocked(membersApi.resetPassword).mockRejectedValue(new Error("Tài khoản không hỗ trợ mật khẩu"));
    renderActions();

    await user.click(screen.getByText("Thao tác tài khoản"));
    await user.click(screen.getByRole("button", { name: "Đặt lại mật khẩu" }));
    await user.click(screen.getByRole("button", { name: "Gửi liên kết" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Tài khoản không hỗ trợ mật khẩu");
    expect(screen.getByRole("dialog", { name: /Đặt lại mật khẩu/ })).toBeInTheDocument();
  });

  it("disables password reset for Google-only accounts and PIN reset for unsupported members", async () => {
    const user = userEvent.setup();
    renderActions({
      ...baseItem,
      role: "reviewer",
      accountProviders: ["google"],
      parentProfileId: null,
    });

    await user.click(screen.getByText("Thao tác tài khoản"));
    expect(screen.getByRole("button", { name: "Đặt lại mật khẩu" })).toBeDisabled();
    expect(screen.getByText("Tài khoản Google-only quản lý mật khẩu qua Google.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Đặt lại mã PIN" })).toBeDisabled();
    expect(screen.getByText(/Chỉ tài khoản phụ huynh/)).toBeInTheDocument();
  });

  it("prevents the current admin from resetting their own credentials", async () => {
    const user = userEvent.setup();
    renderActions(baseItem, baseItem.id);

    await user.click(screen.getByText("Thao tác tài khoản"));
    expect(screen.getByRole("button", { name: "Đặt lại mật khẩu" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Đặt lại mã PIN" })).toBeDisabled();
    expect(screen.getAllByText(/Không thể tự đặt lại/)).toHaveLength(2);
  });
});
