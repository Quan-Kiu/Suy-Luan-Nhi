import { expect, test } from "@playwright/test";
import { signIn } from "./helpers";

const settingLabels = [
  "Bật chế độ bảo trì",
  "Cho phép tạo tài khoản mới",
  "Cho phép đăng nhập bằng tài khoản mạng xã hội",
  "Hiển thị tài nguyên cho phụ huynh",
  "Cho phép gửi góp ý hệ thống",
  "Số hồ sơ bé tối đa mỗi gia đình",
  "Số ảnh tối đa trong một góp ý",
  "Số lần thử Parent Gate trước khi khóa",
  "Thời gian khóa Parent Gate",
  "Thời gian giữ Parent Gate đã mở",
] as const;

async function maintenanceCard(page: import("@playwright/test").Page) {
  return page
    .getByRole("article")
    .filter({ has: page.getByRole("heading", { name: "Bật chế độ bảo trì", exact: true }) });
}

async function expectMaintenanceRedirect(page: import("@playwright/test").Page, enabled: boolean) {
  await expect
    .poll(
      async () => {
        const response = await page.request.get("/", { maxRedirects: 0 });
        return response.status() === 307 && response.headers().location?.startsWith("/maintenance");
      },
      { timeout: 15_000 },
    )
    .toBe(enabled);
}

test("super admin manages runtime settings and maintenance mode", async ({ page }) => {
  await signIn(page, "admin@demo.local", "/admin/settings");
  await expect(page.getByRole("heading", { name: "Cấu hình hệ thống" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Cấu hình hệ thống", exact: true })).toBeVisible();

  for (const label of settingLabels) {
    await expect(page.getByRole("heading", { name: label, exact: true })).toBeVisible();
  }

  const card = await maintenanceCard(page);
  const checkbox = card.getByRole("checkbox", { name: "Bật thiết lập này" });
  const saveButton = card.getByRole("button", { name: "Lưu thay đổi" });

  try {
    await checkbox.check();
    await saveButton.click();
    await expect(card.getByText("Thay đổi đã được ghi nhận", { exact: false })).toBeVisible();
    await expectMaintenanceRedirect(page, true);

    const apiResponse = await page.request.get("/api/feedback", { maxRedirects: 0 });
    expect(apiResponse.status()).toBe(503);
    const authResponse = await page.request.get("/auth/sign-in", { maxRedirects: 0 });
    expect(authResponse.status()).toBe(200);

    await page.screenshot({
      path: ".verification/browser/system-settings-dashboard.png",
      fullPage: true,
    });
  } finally {
    await checkbox.uncheck();
    await saveButton.click();
    await expectMaintenanceRedirect(page, false);
  }
});

test("super admin can disable social login without disabling email login", async ({ page }) => {
  await signIn(page, "admin@demo.local", "/admin/settings");

  const card = page
    .locator("details")
    .filter({ has: page.getByRole("heading", { name: "Cho phép đăng nhập bằng tài khoản mạng xã hội" }) });
  await card.locator(":scope > summary").click();
  const checkbox = card.getByRole("checkbox", { name: "Bật thiết lập này" });
  const saveButton = card.getByRole("button", { name: "Lưu thay đổi" });

  try {
    await checkbox.uncheck();
    await saveButton.click();
    await expect(card.getByText("Thay đổi đã được ghi nhận", { exact: false })).toBeVisible();

    await page.goto("/auth/sign-in");
    await expect(page.getByRole("button", { name: "Đăng nhập bằng Google" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Đăng nhập", exact: true })).toBeEnabled();
  } finally {
    const restoreResponse = await page.request.patch("/api/admin/settings", {
      data: { key: "features.socialLoginEnabled", value: true },
    });
    expect(restoreResponse.status()).toBe(200);
  }
});
