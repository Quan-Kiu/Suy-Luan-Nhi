import { expect, test } from "@playwright/test";
import { signIn } from "./helpers";

test("super admin sees a parent-area shortcut in admin navigation", async ({ page }) => {
  await signIn(page, "admin@demo.local", "/admin");

  const shortcut = page.getByRole("link", { name: "Khu vực phụ huynh" });
  await expect(shortcut).toBeVisible();
  await expect(shortcut).toHaveAttribute("href", "/parent");
});

test("other staff roles do not see the parent-area shortcut", async ({ page }) => {
  await signIn(page, "content@demo.local", "/admin");

  await expect(page.getByRole("link", { name: "Khu vực phụ huynh" })).toHaveCount(0);
});
