export type LayoutHome = {
  href: string;
  label: string;
};

export function getLayoutHome(pathname: string): LayoutHome {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return { href: "/admin", label: "Trở về trang quản trị" };
  }

  if (pathname === "/parent" || pathname.startsWith("/parent/")) {
    return { href: "/parent", label: "Trở về khu vực phụ huynh" };
  }

  if (
    pathname === "/missions" ||
    pathname.startsWith("/missions/") ||
    pathname === "/worlds" ||
    pathname.startsWith("/worlds/") ||
    pathname === "/game" ||
    pathname.startsWith("/game/")
  ) {
    return { href: "/missions", label: "Trở về khu vực của bé" };
  }

  if (pathname === "/profiles" || pathname.startsWith("/profiles/")) {
    return { href: "/profiles", label: "Trở về chọn hồ sơ" };
  }

  return { href: "/", label: "Trở về trang chủ" };
}
