import { expect, test } from "@playwright/test";
import { apiData, getDemoChild, selectChild, signIn, unlockParentGate } from "./helpers";

test("super admin sees a parent-area shortcut in admin navigation", async ({ page }) => {
  await signIn(page, "admin@demo.local", "/admin");

  const shortcut = page.getByRole("link", { name: "Khu vực phụ huynh" });
  await expect(shortcut).toBeVisible();
  await expect(shortcut).toHaveAttribute("href", "/admin/parent-access");
});

test("other staff roles do not see the parent-area shortcut", async ({ page }) => {
  await signIn(page, "content@demo.local", "/admin");

  await expect(page.getByRole("link", { name: "Khu vực phụ huynh" })).toHaveCount(0);
});

test("super admin enters the parent area without a PIN challenge and can return", async ({ page }) => {
  await signIn(page, "admin@demo.local", "/admin");

  let children = await apiData<Array<{ id: string }>>(await page.request.get("/api/children"));
  if (children.length === 0) {
    const child = await apiData<{ id: string }>(
      await page.request.post("/api/children", {
        data: { displayName: "Bé Admin", ageGroup: "6-8" },
      }),
    );
    children = [child];
  }
  await selectChild(page, children[0].id);
  await page.getByRole("link", { name: "Khu vực phụ huynh" }).click();

  await expect(page).toHaveURL(/\/parent$/);
  await expect(page.getByRole("textbox", { name: "Mã PIN phụ huynh", exact: true })).toHaveCount(0);
  await expect(page.getByText("Xin chào, ba mẹ!", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Tuần này của/i })).toBeVisible();
  await expect(page.getByText("Super Admin Demo", { exact: true })).toHaveCount(0);

  const desktopAdminLink = page.getByRole("link", { name: "Trang quản trị" });
  await expect(desktopAdminLink).toBeVisible();
  await expect(desktopAdminLink).toHaveAttribute("href", "/admin");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('button[aria-controls="parent-mobile-navigation"]').click();
  const mobileAdminLink = page
    .getByRole("navigation", { name: "Điều hướng phụ huynh mobile" })
    .getByRole("link", { name: "Trang quản trị" });
  await expect(mobileAdminLink).toBeVisible();
  await mobileAdminLink.click();
  await expect(page).toHaveURL(/\/admin$/);
});

test("parent-only accounts do not see the admin shortcut", async ({ page }) => {
  await signIn(page, "parent@demo.local");
  const child = await getDemoChild(page);
  await selectChild(page, child.id);
  await unlockParentGate(page);

  await expect(page.getByRole("link", { name: "Trang quản trị" })).toHaveCount(0);
});
