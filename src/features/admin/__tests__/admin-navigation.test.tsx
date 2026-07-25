import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AdminNavigation } from "@/features/admin/admin-navigation";

describe("AdminNavigation", () => {
  it("shows the parent-area shortcut for super admins", () => {
    render(<AdminNavigation pathname="/admin" role="super_admin" content={{}} />);

    expect(screen.getByRole("link", { name: "Khu vực phụ huynh" })).toHaveAttribute(
      "href",
      "/admin/parent-access",
    );
  });

  it("distinguishes the media library from the content dictionary", () => {
    render(<AdminNavigation pathname="/admin" role="super_admin" content={{}} />);

    expect(screen.getByRole("link", { name: "Thư viện" })).toHaveAttribute("href", "/admin/media");
    expect(screen.getByRole("link", { name: "Từ điển" })).toHaveAttribute("href", "/admin/content-variables");
    expect(screen.queryByRole("link", { name: "Thông tin từ điển" })).not.toBeInTheDocument();
  });

  it("shows system feedback for every staff role", () => {
    render(<AdminNavigation pathname="/admin" role="reviewer" content={{}} />);

    expect(screen.getByRole("link", { name: "Góp ý hệ thống" })).toHaveAttribute("href", "/admin/feedback");
  });

  it("shows badge management only to content editors", () => {
    const { rerender } = render(<AdminNavigation pathname="/admin" role="content_admin" content={{}} />);
    expect(screen.getByRole("link", { name: "Huy hiệu" })).toHaveAttribute("href", "/admin/badges");

    rerender(<AdminNavigation pathname="/admin" role="reviewer" content={{}} />);
    expect(screen.queryByRole("link", { name: "Huy hiệu" })).not.toBeInTheDocument();
  });

  it("keeps the parent-area shortcut hidden from other staff roles", () => {
    render(<AdminNavigation pathname="/admin" role="content_admin" content={{}} />);

    expect(screen.queryByRole("link", { name: "Khu vực phụ huynh" })).not.toBeInTheDocument();
  });
});
