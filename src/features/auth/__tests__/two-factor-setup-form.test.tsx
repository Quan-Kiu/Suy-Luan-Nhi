import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TwoFactorSetupForm } from "@/features/auth/two-factor-setup-form";

const mocks = vi.hoisted(() => ({
  enable: vi.fn(),
  verifyTotp: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("@/auth/client", () => ({
  authClient: {
    twoFactor: {
      enable: mocks.enable,
      verifyTotp: mocks.verifyTotp,
    },
  },
}));
vi.mock("@/hooks/use-pending-router", () => ({
  usePendingRouter: () => ({
    replace: mocks.replace,
    refresh: mocks.refresh,
    isPending: false,
  }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn() },
}));

function renderForm(requiresPassword: boolean) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <TwoFactorSetupForm requiresPassword={requiresPassword} />
    </QueryClientProvider>,
  );
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.enable.mockResolvedValue({
    data: {
      totpURI: "otpauth://totp/Suy%20Lu%E1%BA%ADn%20Nh%C3%AD:test@example.com?secret=ABC123",
      backupCodes: ["backup-one", "backup-two"],
    },
    error: null,
  });
  mocks.verifyTotp.mockResolvedValue({ data: { status: true }, error: null });
});

describe("two-factor setup account capability", () => {
  it("starts setup without a password for a Google-only account", async () => {
    renderForm(false);

    expect(screen.queryByLabelText("Mật khẩu hiện tại")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Quên mật khẩu?" })).not.toBeInTheDocument();
    expect(screen.getByText(/đăng nhập bằng Google và không có mật khẩu riêng/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Bắt đầu thiết lập" }));

    await waitFor(() => {
      expect(mocks.enable).toHaveBeenCalledWith({ issuer: "Suy Luận Nhí" });
    });

    expect(await screen.findByRole("button", { name: "Xác minh và tiếp tục" })).toHaveClass(
      "inline-flex",
      "items-center",
      "whitespace-nowrap",
    );
  });

  it("keeps password confirmation for a credential account", async () => {
    renderForm(true);

    const password = screen.getByLabelText("Mật khẩu hiện tại");
    expect(screen.getByRole("link", { name: "Quên mật khẩu?" })).toHaveAttribute(
      "href",
      "/auth/forgot-password",
    );
    await userEvent.type(password, "StrongPass123!");
    await userEvent.click(screen.getByRole("button", { name: "Bắt đầu thiết lập" }));

    await waitFor(() => {
      expect(mocks.enable).toHaveBeenCalledWith({
        password: "StrongPass123!",
        issuer: "Suy Luận Nhí",
      });
    });
  });
});
