import { expect, test } from "@playwright/test";
import { signIn } from "./helpers";

test("audit log filters and paginates server-side", async ({ page }) => {
  await signIn(page, "admin@demo.local", "/admin");

  for (let index = 0; index < 12; index += 1) {
    const response = await page.request.patch("/api/admin/settings", {
      data: {
        key: "limits.feedbackMaxAttachments",
        value: index % 2 === 0 ? 6 : 5,
      },
    });
    expect(response.ok()).toBeTruthy();
  }

  await page.goto(
    "/admin/audit?resourceType=system_setting&action=system_setting.updated&resourceId=limits.feedbackMaxAttachments&pageSize=10",
  );

  await expect(page.getByRole("heading", { name: "Các thay đổi gần đây" })).toBeVisible();
  await expect(page.getByText(/Hiển thị 1–10 trong \d+ thay đổi/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Trang sau" })).toBeVisible();
  await expect(page.getByText("Đang dùng bộ lọc")).toBeVisible();
  await expect(page.getByText("Super Admin Demo").first()).toBeVisible();

  await page.getByRole("link", { name: "Trang sau" }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(page.getByText(/Hiển thị 11–\d+ trong \d+ thay đổi/)).toBeVisible();
  await expect(page.getByRole("link", { name: "2", exact: true })).toHaveAttribute("aria-current", "page");

  await page.getByText("Xem chi tiết thay đổi").first().click();
  await expect(page.getByText("Trước thay đổi").first()).toBeVisible();
  await expect(page.getByText("Sau thay đổi").first()).toBeVisible();
});
