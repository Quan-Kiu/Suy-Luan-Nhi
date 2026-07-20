import { describe, expect, it } from "vitest";
import { getLayoutHome } from "@/lib/navigation/layout-home";

describe("getLayoutHome", () => {
  it.each([
    ["/admin/missions/123/edit", "/admin", "Trở về trang quản trị"],
    ["/parent/resources", "/parent", "Trở về khu vực phụ huynh"],
    ["/missions/123", "/missions", "Trở về khu vực của bé"],
    ["/worlds/forest", "/missions", "Trở về khu vực của bé"],
    ["/profiles/123/edit", "/profiles", "Trở về chọn hồ sơ"],
    ["/auth/sign-in", "/", "Trở về trang chủ"],
  ])("maps %s to its layout home", (pathname, href, label) => {
    expect(getLayoutHome(pathname)).toEqual({ href, label });
  });
});
