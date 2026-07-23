import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EmailVerificationResultDialog } from "@/features/auth/email-verification-result-dialog";
import { SignInForm } from "@/features/auth/sign-in-form";
import { SignUpForm } from "@/features/auth/sign-up-form";

const mocks = vi.hoisted(() => ({
  signInEmail: vi.fn(),
  signInSocial: vi.fn(),
  signUpEmail: vi.fn(),
  sendVerificationEmail: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("@/auth/client", () => ({
  signIn: { email: mocks.signInEmail, social: mocks.signInSocial },
  signUp: { email: mocks.signUpEmail },
  authClient: { sendVerificationEmail: mocks.sendVerificationEmail },
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("@/content/client", () => ({
  useContent: () => ({}),
  contentText: (_content: unknown, _key: string, fallback: string) => fallback,
}));

function renderWithQuery(ui: React.ReactNode) {
  return render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}
    >
      {ui}
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.sendVerificationEmail.mockResolvedValue({ data: { status: true }, error: null });
  mocks.signInSocial.mockResolvedValue({ data: { redirect: true }, error: null });
});

describe("authentication verification UX", () => {
  it("hides Google sign-in when social login is disabled", () => {
    renderWithQuery(<SignInForm googleAuthEnabled={false} />);

    expect(screen.queryByRole("button", { name: "Đăng nhập bằng Google" })).not.toBeInTheDocument();
  });

  it("allows Google sign-in to create a new account while registration is enabled", async () => {
    renderWithQuery(<SignInForm googleAuthEnabled registrationEnabled />);

    await userEvent.click(screen.getByRole("button", { name: "Đăng nhập bằng Google" }));

    expect(mocks.signInSocial).toHaveBeenCalledWith({
      provider: "google",
      callbackURL: "/auth/complete",
      newUserCallbackURL: "/auth/complete?next=%2Fonboarding",
      errorCallbackURL: "/auth/sign-in?oauth=google",
      requestSignUp: true,
    });
  });

  it("limits Google sign-in to existing accounts while registration is disabled", async () => {
    renderWithQuery(<SignInForm googleAuthEnabled />);

    await userEvent.click(screen.getByRole("button", { name: "Đăng nhập bằng Google" }));

    expect(mocks.signInSocial).toHaveBeenCalledWith({
      provider: "google",
      callbackURL: "/auth/complete",
      newUserCallbackURL: "/auth/complete?next=%2Fonboarding",
      errorCallbackURL: "/auth/sign-in?oauth=google",
      requestSignUp: false,
    });
  });

  it("starts Google registration with the parent onboarding callback", async () => {
    renderWithQuery(<SignUpForm googleAuthEnabled />);

    await userEvent.click(screen.getByRole("button", { name: "Đăng ký bằng Google" }));

    expect(mocks.signInSocial).toHaveBeenCalledWith({
      provider: "google",
      callbackURL: "/auth/complete?next=%2Fonboarding",
      newUserCallbackURL: "/auth/complete?next=%2Fonboarding",
      errorCallbackURL: "/auth/sign-up?oauth=google",
      requestSignUp: true,
    });
  });
  it("shows a success modal after the verification callback", () => {
    renderWithQuery(<EmailVerificationResultDialog result="success" continueHref="/profiles" />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Xác minh email thành công" })).toBeInTheDocument();
    expect(
      screen.getByText("Email của ba/mẹ đã được xác minh. Tài khoản đã sẵn sàng để sử dụng."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Tiếp tục/ })).toHaveAttribute("href", "/profiles");
  });

  it("opens the verification dialog instead of exposing the English server error", async () => {
    mocks.signInEmail.mockResolvedValue({
      data: null,
      error: { code: "EMAIL_NOT_VERIFIED", message: "Email is not verified", status: 403 },
    });
    renderWithQuery(<SignInForm />);

    await userEvent.type(screen.getByLabelText("Email"), "parent@example.com");
    await userEvent.type(screen.getByLabelText("Mật khẩu"), "StrongPass123!");
    await userEvent.click(screen.getByRole("button", { name: "Đăng nhập" }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Xác minh email để tiếp tục")).toBeInTheDocument();
    expect(screen.getByText("parent@example.com")).toBeInTheDocument();
    expect(screen.queryByText("Email is not verified")).not.toBeInTheDocument();
  });

  it("resends verification without the stale signed-in session cookie", async () => {
    mocks.signInEmail.mockResolvedValue({
      data: null,
      error: { code: "EMAIL_NOT_VERIFIED", message: "Email is not verified", status: 403 },
    });
    renderWithQuery(<SignInForm />);

    await userEvent.type(screen.getByLabelText("Email"), "pending@example.com");
    await userEvent.type(screen.getByLabelText("Mật khẩu"), "StrongPass123!");
    await userEvent.click(screen.getByRole("button", { name: "Đăng nhập" }));
    await userEvent.click(await screen.findByRole("button", { name: "Gửi lại email xác minh" }));

    expect(mocks.sendVerificationEmail).toHaveBeenCalledWith({
      email: "pending@example.com",
      callbackURL: "/auth/verify-email?next=%2Fprofiles",
      fetchOptions: { credentials: "omit" },
    });
  });

  it("turns successful registration into a required email-verification step", async () => {
    mocks.signUpEmail.mockResolvedValue({
      data: { token: null, user: { email: "new@example.com", emailVerified: false } },
      error: null,
    });
    renderWithQuery(<SignUpForm />);

    await userEvent.type(screen.getByLabelText("Tên ba/mẹ"), "Nguyễn Minh");
    await userEvent.type(screen.getByLabelText("Email"), "new@example.com");
    await userEvent.type(screen.getByLabelText("Mật khẩu"), "StrongPass123!");
    await userEvent.type(screen.getByLabelText("Nhập lại mật khẩu"), "StrongPass123!");
    await userEvent.click(screen.getByRole("button", { name: "Tạo tài khoản ba mẹ" }));

    expect(await screen.findByText("Kiểm tra email để sang bước 2")).toBeInTheDocument();
    expect(screen.getByText("new@example.com")).toBeInTheDocument();
    expect(mocks.signUpEmail).toHaveBeenCalledWith({
      name: "Nguyễn Minh",
      email: "new@example.com",
      password: "StrongPass123!",
      callbackURL: "/auth/verify-email?next=%2Fauth%2Fsetup-pin%3Fnext%3D%252Fonboarding",
    });
    expect(mocks.push).not.toHaveBeenCalled();
  });
});
