import { expect, test } from "@playwright/test";
import { signIn } from "./helpers";

test("audit log stays readable and inspectable on mobile", async ({ page }) => {
  await signIn(page, "admin@demo.local", "/admin");

  for (const value of [6, 5]) {
    const response = await page.request.patch("/api/admin/settings", {
      data: { key: "limits.feedbackMaxAttachments", value },
    });
    expect(response.ok()).toBeTruthy();
  }

  await page.goto("/admin/audit?resourceType=system_setting&action=system_setting.updated&pageSize=10");

  await expect(page.getByRole("heading", { name: "Các thay đổi gần đây" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Cập nhật cài đặt nâng cao", exact: true }).first(),
  ).toBeVisible();
  const firstLog = page
    .getByRole("article")
    .filter({ has: page.getByRole("heading", { name: "Cập nhật cài đặt nâng cao", exact: true }) })
    .first();
  await expect(firstLog.getByText("Super Admin Demo")).toBeVisible();
  await expect(page.getByText("Đang dùng bộ lọc")).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(overflow).toBe(false);

  await page.getByText("Xem chi tiết thay đổi").first().click();
  await expect(page.getByText("Mã hành động").first()).toBeVisible();
  await expect(page.getByText("system_setting.updated").first()).toBeVisible();
});
