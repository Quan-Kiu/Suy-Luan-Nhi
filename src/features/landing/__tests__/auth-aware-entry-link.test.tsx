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

  it("keeps the parent destination direct after sign-in", () => {
    mocks.session.data = { user: { role: "parent" } };
    render(<AuthAwareEntryLink content={{}} />);

    const link = screen.getByRole("link", { name: "Vào khu vực phụ huynh" });
    expect(link).toHaveAttribute("href", "/parent");
    expect(link).not.toHaveTextContent("tạo tài khoản trước");
  });
});
