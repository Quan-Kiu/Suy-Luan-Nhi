import { expect, test } from "@playwright/test";

const password = "LocalDemo-2026!";

test("parent can log in, select a child and open the mission map on mobile", async ({ page }) => {
  await page.goto("/auth/sign-in");
  await expect(page.getByLabel("Email")).toHaveAttribute("placeholder", /example\.com/);
  await page.getByLabel("Email").fill("parent@demo.local");
  await page.getByLabel("Mật khẩu").fill(password);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await page.waitForURL(/\/profiles$/);

  await page.getByRole("button", { name: /Vào bản đồ cùng Bống/i }).click();
  await page.waitForURL(/\/missions$/);
  await expect(page.getByRole("heading", { name: /Bản đồ nhiệm vụ|Bống/i })).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(hasHorizontalOverflow).toBe(false);
});

test("parent gate exposes a clear mobile placeholder", async ({ page }) => {
  await page.goto("/auth/sign-in?callbackUrl=/profiles");
  await page.getByLabel("Email").fill("parent@demo.local");
  await page.getByLabel("Mật khẩu").fill(password);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await page.waitForURL(/\/profiles$/);
  await page.getByRole("button", { name: /Vào bản đồ cùng Bống/i }).click();
  await page.waitForURL(/\/missions$/);

  await page.goto("/parent");
  await expect(page.getByLabel(/Kết quả phép tính|PIN phụ huynh/)).toHaveAttribute(
    "placeholder",
    /Nhập kết quả|Nhập PIN/,
  );
});
