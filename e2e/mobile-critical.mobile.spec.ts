import { expect, test } from "@playwright/test";

const password = "LocalDemo-2026!";

test("landing page exposes an accessible mobile navigation menu", async ({ page }) => {
  await page.goto("/");
  const trigger = page.locator('button[aria-controls="landing-mobile-nav"]');
  await expect(trigger).toBeVisible();
  await expect(trigger).toHaveAccessibleName("Mở menu điều hướng");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");

  await trigger.click();
  await expect(trigger).toHaveAccessibleName("Đóng menu điều hướng");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("navigation", { name: "Điều hướng mobile" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Khu vực phụ huynh" })).toBeVisible();
});

test("admin CMS exposes an accessible mobile navigation drawer", async ({ page }) => {
  await page.goto("/auth/sign-in");
  await page.getByLabel("Email").fill("content@demo.local");
  await page.getByLabel("Mật khẩu").fill(password);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await page.waitForURL(/\/admin$/);

  const trigger = page.locator('button[aria-controls="admin-mobile-navigation"]');
  await expect(trigger).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("navigation", { name: "Điều hướng quản trị mobile" })).toBeVisible();
  const adminHeader = page.getByTestId("admin-header");
  await adminHeader.evaluate((element) => element.setAttribute("data-persistence-token", "kept"));
  await page.getByRole("link", { name: "Nhiệm vụ", exact: true }).click();
  await page.waitForURL(/\/admin\/missions$/);
  await expect(page.getByTestId("admin-header")).toHaveAttribute("data-persistence-token", "kept");
});

test("parent can log in, select a child and open the mission map on mobile", async ({ page }) => {
  await page.goto("/auth/sign-in?callbackUrl=/profiles");
  await expect(page.getByLabel("Email")).toHaveAttribute("placeholder", /example\.com/);
  await page.getByLabel("Email").fill("parent@demo.local");
  await page.getByLabel("Mật khẩu").fill(password);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await page.waitForURL((url) => url.pathname === "/profiles");

  await page.getByRole("button", { name: /Vào bản đồ cùng Bống/i }).click();
  await page.waitForURL(/\/missions$/);
  await expect(page.getByRole("heading", { name: /Bản đồ nhiệm vụ|Bống/i })).toBeVisible();

  const childMenuTrigger = page.locator('button[aria-controls="child-mobile-navigation"]');
  await expect(childMenuTrigger).toBeVisible();
  await childMenuTrigger.click();
  await expect(page.getByRole("navigation", { name: "Điều hướng chế độ bé" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("navigation", { name: "Điều hướng chế độ bé" })).toBeHidden();

  const cardHeights = await page
    .locator("[data-mission-card]")
    .evaluateAll((cards) => cards.slice(0, 2).map((card) => Math.round(card.getBoundingClientRect().height)));
  expect(new Set(cardHeights).size).toBe(1);

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(hasHorizontalOverflow).toBe(false);

  const childHeader = page.getByTestId("child-header");
  await childHeader.evaluate((element) => element.setAttribute("data-persistence-token", "kept"));
  await page.locator('a[href^="/missions/"]').first().click();
  await page.waitForURL(/\/missions\/.+/);
  await expect(page.getByTestId("child-header")).toHaveAttribute("data-persistence-token", "kept");
});

test("parent gate exposes a clear mobile placeholder", async ({ page }) => {
  await page.goto("/auth/sign-in?callbackUrl=/profiles");
  await page.getByLabel("Email").fill("parent@demo.local");
  await page.getByLabel("Mật khẩu").fill(password);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await page.waitForURL((url) => url.pathname === "/profiles");
  await page.getByRole("button", { name: /Vào bản đồ cùng Bống/i }).click();
  await page.waitForURL(/\/missions$/);

  await page.goto("/parent");
  const gateInput = page.getByLabel(/Kết quả phép tính|PIN phụ huynh/);
  await expect(gateInput).toHaveAttribute("placeholder", /Nhập kết quả|Nhập PIN/);
  const placeholder = await gateInput.getAttribute("placeholder");
  await gateInput.fill(placeholder?.includes("PIN") ? "2468" : "23");
  await page.getByRole("button", { name: /Mở khu vực phụ huynh/i }).click();

  const parentHeader = page.getByTestId("parent-header");
  await expect(parentHeader).toBeVisible();
  await expect(parentHeader.getByRole("link", { name: "Tổng quan khu vực phụ huynh" })).toHaveAttribute(
    "href",
    "/parent",
  );

  const parentMenuTrigger = page.locator('button[aria-controls="parent-mobile-navigation"]');
  await parentMenuTrigger.click();
  await expect(page.getByRole("navigation", { name: "Điều hướng phụ huynh mobile" })).toBeVisible();
  await page.keyboard.press("Escape");

  await parentHeader.evaluate((element) => element.setAttribute("data-persistence-token", "kept"));
  await page.getByRole("link", { name: "Cài đặt", exact: true }).click();
  await page.waitForURL(/\/parent\/settings$/);
  await expect(page.getByTestId("parent-header")).toHaveAttribute("data-persistence-token", "kept");
});

test("landing primary CTA routes an authenticated parent into the Parent Workspace", async ({ page }) => {
  await page.goto("/auth/sign-in?callbackUrl=/profiles");
  await page.getByLabel("Email").fill("parent@demo.local");
  await page.getByLabel("Mật khẩu").fill(password);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await page.waitForURL((url) => url.pathname === "/profiles");

  await page.goto("/");
  const entryLink = page.getByRole("link", { name: "Vào khu vực phụ huynh" }).first();
  await expect(entryLink).toHaveAttribute("href", "/parent");
});
