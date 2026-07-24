import { expect, test } from "@playwright/test";
import { signIn } from "./helpers";

test("expired API session returns the user to sign-in with the current page", async ({ page }) => {
  await signIn(page, "parent@demo.local", "/profiles");
  await expect(page).toHaveURL(/\/profiles$/);

  await page.route("**/api/children/*/select", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Cần đăng nhập" },
        meta: { requestId: "expired-session-e2e", timestamp: new Date().toISOString() },
      }),
    });
  });

  await page.getByRole("button", { name: "Vào bản đồ" }).first().click();

  await expect(page).toHaveURL(/\/auth\/sign-in\?callbackUrl=%2Fprofiles$/);
  await expect(page.getByRole("button", { name: "Đăng nhập", exact: true })).toBeVisible();
  await expect(page.getByText("Cần đăng nhập", { exact: true })).toHaveCount(0);
});
