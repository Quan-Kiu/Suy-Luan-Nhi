import { expect, test } from "@playwright/test";
import { clearAuth, getDemoChild, selectChild, signIn, unlockParentGate } from "./helpers";

test("public, child, parent, and admin routes expose meaningful document titles", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Suy Luận Nhí");

  await page.goto("/auth/sign-in");
  await expect(page).toHaveTitle("Đăng nhập | Suy Luận Nhí");

  await signIn(page, "parent@demo.local");
  const child = await getDemoChild(page);
  await selectChild(page, child.id);

  await page.goto("/missions");
  await expect(page).toHaveTitle("Bản đồ nhiệm vụ | Suy Luận Nhí");

  await unlockParentGate(page);
  await page.goto("/parent/notifications");
  await expect(page).toHaveTitle("Thông báo | Suy Luận Nhí");

  await clearAuth(page);
  await signIn(page, "admin@demo.local", "/admin/reports");
  await expect(page).toHaveTitle("Báo cáo sử dụng | Suy Luận Nhí");
});
