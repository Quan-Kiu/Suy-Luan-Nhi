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

  it("uses a clear sign-in label in the header for guests", () => {
    render(<AuthAwareEntryLink content={{}} compact />);

    const link = screen.getByRole("link", { name: "Đăng nhập" });
    expect(link).toHaveAttribute("href", "/auth/sign-in");
  });

  it("keeps the admin destination only in compact navigation when requested", () => {
    mocks.session.data = { user: { role: "super_admin" } };

    const { rerender } = render(<AuthAwareEntryLink content={{}} compact />);
    expect(screen.getByRole("link", { name: "Trang quản trị" })).toHaveAttribute("href", "/admin");

    rerender(<AuthAwareEntryLink content={{}} hideForStaff />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("keeps the parent destination direct after sign-in", () => {
    mocks.session.data = { user: { role: "parent" } };
    render(<AuthAwareEntryLink content={{}} />);

    const link = screen.getByRole("link", { name: "Vào khu vực phụ huynh" });
    expect(link).toHaveAttribute("href", "/parent");
    expect(link).not.toHaveTextContent("tạo tài khoản trước");
  });
});
