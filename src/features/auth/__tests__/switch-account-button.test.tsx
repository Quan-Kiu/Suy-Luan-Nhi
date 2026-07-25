import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SwitchAccountButton } from "@/features/auth/switch-account-button";

const mocks = vi.hoisted(() => ({
  target: "",
  signOutAndNavigate: vi.fn(),
}));

vi.mock("@/features/auth/use-sign-out-navigation", () => ({
  useSignOutNavigation: (target: string) => {
    mocks.target = target;
    return { pending: false, signOutAndNavigate: mocks.signOutAndNavigate };
  },
}));

describe("SwitchAccountButton", () => {
  it("signs out through a fresh sign-in callback for the requested workspace", async () => {
    render(
      <SwitchAccountButton
        callbackUrl="/parent"
        label="Đăng xuất và dùng tài khoản khác"
        pendingLabel="Đang đăng xuất..."
      />,
    );

    expect(mocks.target).toBe("/auth/sign-in?callbackUrl=%2Fparent");
    await userEvent.click(screen.getByRole("button", { name: "Đăng xuất và dùng tài khoản khác" }));
    expect(mocks.signOutAndNavigate).toHaveBeenCalledOnce();
  });
});
