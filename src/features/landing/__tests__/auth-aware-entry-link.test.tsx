import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthAwareEntryLink } from "@/features/landing/auth-aware-entry-link";

const mocks = vi.hoisted(() => ({
  session: {
    isPending: false,
    isRefetching: false,
    data: null as { user: { role?: string } } | null,
  },
}));

vi.mock("@/auth/client", () => ({
  useSession: () => mocks.session,
}));

beforeEach(() => {
  mocks.session.isPending = false;
  mocks.session.isRefetching = false;
  mocks.session.data = null;
});

describe("AuthAwareEntryLink", () => {
  it("explains that guests create a parent account before the child profile", () => {
    render(<AuthAwareEntryLink content={{}} />);

    const link = screen.getByRole("link", { name: /Bắt đầu cho bé/ });
    expect(link).toHaveAttribute("href", "/auth/sign-up");
    expect(link).toHaveTextContent("Ba mẹ tạo tài khoản trước, sau đó thêm hồ sơ cho bé.");
  });

  it("uses a familiar sign-in action for guests in public navigation", () => {
    render(<AuthAwareEntryLink content={{}} compact />);

    expect(screen.getByRole("link", { name: "Đăng nhập" })).toHaveAttribute("href", "/auth/sign-in");
  });

  it("names the parent destination by its purpose after sign-in", () => {
    mocks.session.data = { user: { role: "parent" } };
    render(<AuthAwareEntryLink content={{}} compact />);

    expect(screen.getByRole("link", { name: "Quản lý gia đình" })).toHaveAttribute("href", "/parent");
  });

  it("keeps staff navigation separate from the parent destination", () => {
    mocks.session.data = { user: { role: "super_admin" } };
    render(<AuthAwareEntryLink content={{}} compact />);

    expect(screen.getByRole("link", { name: "Trang quản trị" })).toHaveAttribute("href", "/admin");
  });

  it("does not turn marketing CTAs into admin shortcuts", () => {
    mocks.session.data = { user: { role: "content_admin" } };
    render(<AuthAwareEntryLink content={{}} hideForStaff />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
