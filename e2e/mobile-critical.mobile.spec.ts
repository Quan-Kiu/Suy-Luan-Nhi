import { expect, test } from "@playwright/test";
import { apiData, getDemoChild, selectChild, signIn, unlockParentGate } from "./helpers";

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
  await expect(page.getByRole("link", { name: "Đăng nhập" })).toBeVisible();
});

test("landing explains the product in three clear steps", async ({ page }) => {
  await page.goto("/");
  const howLink = page.getByRole("link", { name: "Xem 3 bước bắt đầu" });
  await expect(howLink).toBeVisible();

  await howLink.click();
  await expect(page).toHaveURL(/#how$/);
  await expect(page.getByRole("heading", { name: "Ba bước để bé bắt đầu một nhiệm vụ" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ba mẹ tạo hồ sơ cho bé" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Bé chọn một nhiệm vụ ngắn" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ba mẹ xem bé đã luyện gì" })).toBeVisible();

  await expect
    .poll(() => page.locator("#how").evaluate((element) => Math.round(element.getBoundingClientRect().top)))
    .toBeLessThan(80);
  const howTop = await page
    .locator("#how")
    .evaluate((element) => Math.round(element.getBoundingClientRect().top));
  expect(howTop).toBeGreaterThanOrEqual(0);
});

test("admin CMS exposes an accessible mobile navigation drawer", async ({ page }) => {
  await page.goto("/auth/sign-in");
  await page.getByLabel("Email").fill("content@demo.local");
  await page.locator('input[name="password"]').fill(password);
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
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await page.waitForURL((url) => url.pathname === "/profiles");

  await page.getByRole("button", { name: "Vào bản đồ", exact: true }).first().click();
  await page.waitForURL(/\/missions$/);
  await expect(page.getByRole("heading", { name: "Bống", exact: true })).toBeVisible();

  const childMenuTrigger = page.locator('button[aria-controls="child-mobile-navigation"]');
  await expect(childMenuTrigger).toBeVisible();
  await childMenuTrigger.click();
  await expect(page.getByRole("navigation", { name: "Điều hướng chế độ bé" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("navigation", { name: "Điều hướng chế độ bé" })).toBeHidden();

  const missionCards = page.locator("[data-mission-card]");
  await expect.poll(() => missionCards.count()).toBeGreaterThanOrEqual(2);
  const cardHeights = await missionCards.evaluateAll((cards) =>
    cards.slice(0, 2).map((card) => Math.round(card.getBoundingClientRect().height)),
  );
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

test("deleted profile card keeps its content and actions readable on mobile", async ({ page }) => {
  await signIn(page, "parent@demo.local");
  await page.goto("/profiles");

  await page.getByLabel("Xóa Bống").click();
  await page
    .getByRole("alertdialog", { name: "Đưa hồ sơ Bống vào thùng rác?" })
    .getByRole("button", { name: "Đưa vào thùng rác" })
    .click();

  const restoreButton = page.getByRole("button", { name: "Khôi phục hồ sơ Bống" });
  const deleteButton = page.getByRole("button", { name: "Xóa vĩnh viễn hồ sơ Bống" });
  const card = restoreButton.locator("xpath=ancestor::li");
  const name = card.getByText("Bống", { exact: true });

  await expect(card).toBeVisible();
  await expect(name).toBeVisible();
  await expect(restoreButton).toBeVisible();
  await expect(deleteButton).toBeVisible();

  await expect
    .poll(async () => {
      const boxes = await Promise.all([
        card.boundingBox(),
        name.boundingBox(),
        restoreButton.boundingBox(),
        deleteButton.boundingBox(),
      ]);
      return boxes.every(Boolean);
    })
    .toBe(true);

  const [cardBox, nameBox, restoreBox, deleteBox] = await Promise.all([
    card.boundingBox(),
    name.boundingBox(),
    restoreButton.boundingBox(),
    deleteButton.boundingBox(),
  ]);
  expect(cardBox).not.toBeNull();
  expect(nameBox).not.toBeNull();
  expect(restoreBox).not.toBeNull();
  expect(deleteBox).not.toBeNull();
  expect(nameBox!.width).toBeGreaterThan(180);
  expect(restoreBox!.y).toBeGreaterThan(nameBox!.y + nameBox!.height);
  expect(deleteBox!.x).toBeGreaterThan(restoreBox!.x);
  expect(deleteBox!.x + deleteBox!.width).toBeLessThanOrEqual(cardBox!.x + cardBox!.width + 1);

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(hasHorizontalOverflow).toBe(false);

  await restoreButton.click();
  await expect(page.getByRole("heading", { name: "Bống" })).toBeVisible();
});

test("parent gate exposes a clear mobile placeholder", async ({ page }) => {
  await page.goto("/auth/sign-in?callbackUrl=/profiles");
  await page.getByLabel("Email").fill("parent@demo.local");
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await page.waitForURL((url) => url.pathname === "/profiles");
  await page.getByRole("button", { name: "Vào bản đồ", exact: true }).first().click();
  await page.waitForURL(/\/missions$/);

  await page.goto("/parent");
  const gateInput = page.getByLabel(/Kết quả phép tính|PIN phụ huynh/);
  await expect(gateInput).toHaveAttribute("placeholder", /Nhập kết quả|Nhập PIN/);
  await unlockParentGate(page);

  const parentHeader = page.getByTestId("parent-header");
  await expect(parentHeader).toBeVisible();
  await expect(parentHeader).toHaveCSS("position", "sticky");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect
    .poll(() => parentHeader.evaluate((element) => Math.round(element.getBoundingClientRect().top)))
    .toBe(0);
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
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await page.waitForURL((url) => url.pathname === "/profiles");

  await page.goto("/");
  const entryLink = page.getByRole("link", { name: "Vào khu vực phụ huynh" }).first();
  await expect(entryLink).toHaveAttribute("href", "/parent");
});

test("activity cards and date filters stay usable on mobile", async ({ page }) => {
  await signIn(page, "parent@demo.local");
  const child = await getDemoChild(page);
  await selectChild(page, child.id);
  await unlockParentGate(page);
  await apiData(await page.request.post(`/api/children/${child.id}/reset-progress`));

  await page.goto("/missions");
  await page.getByRole("link", { name: /Thám tử dấu chân/i }).click();
  await page.getByRole("button", { name: /Bắt đầu chơi/i }).click();
  await page.getByRole("button", { name: "Ngôi sao", exact: true }).click();
  await page.getByRole("button", { name: /Xem con làm đúng chưa/i }).click();
  await page.getByRole("button", { name: /Câu tiếp theo/i }).click();
  await page.getByRole("button", { name: "Dấu chân xanh", exact: true }).click();
  await page.getByRole("button", { name: /Xem con làm đúng chưa/i }).click();
  await page.getByRole("button", { name: /Nhận huy hiệu/i }).click();

  await unlockParentGate(page);
  await page.goto("/parent/activity");
  const from = page.getByLabel("Từ ngày");
  const to = page.getByLabel("Đến ngày");
  await expect(from).toHaveAttribute("placeholder", "dd/mm/yyyy");
  await from.fill("01072026");
  await expect(from).toHaveValue("01/07/2026");
  await to.fill("31022026");
  await page.getByRole("button", { name: "Xem kết quả" }).click();
  await expect(page.getByText(/Ngày chưa hợp lệ\. Hãy nhập đúng định dạng/)).toBeVisible();

  await to.fill("31072026");
  await page.getByRole("button", { name: "Xem kết quả" }).click();
  await page.waitForURL(/from=2026-07-01.*to=2026-07-31/);

  const card = page.locator("[data-activity-card]").first();
  await expect(card).toBeVisible();
  await expect(card.locator("[data-activity-time]")).toHaveText(/^\d{2}:\d{2} · \d{2}\/\d{2}\/\d{4}$/);
  await expect(card.locator("[data-activity-metrics] > span")).toHaveCount(3);
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(hasHorizontalOverflow).toBe(false);
});
