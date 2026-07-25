import { expect, test } from "@playwright/test";
import { getDemoChild, selectChild, signIn, unlockParentGate } from "./helpers";

function isRscRequestFor(requestUrl: string, pathname: string) {
  const url = new URL(requestUrl);
  return url.pathname === pathname && url.searchParams.has("_rsc");
}

test("admin reuses a recently visited page segment", async ({ page }) => {
  await signIn(page, "content@demo.local", "/admin");
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.locator("main h1")).toBeVisible();

  await page.locator('a[href="/admin/missions"]:visible').first().click();
  await expect(page).toHaveURL(/\/admin\/missions$/);
  await expect(page.locator("main h1")).toBeVisible();
  await page.locator('a[href="/admin"]:visible').first().click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.locator("main h1")).toBeVisible();

  let repeatedRequests = 0;
  page.on("request", (request) => {
    if (isRscRequestFor(request.url(), "/admin/missions")) repeatedRequests += 1;
  });

  await page.locator('a[href="/admin/missions"]:visible').first().click();
  await expect(page).toHaveURL(/\/admin\/missions$/);
  await expect(page.locator("main h1")).toBeVisible();
  await expect(page.getByText("Đang tải dữ liệu quản trị...")).toHaveCount(0);
  expect(repeatedRequests).toBeLessThanOrEqual(1);
});

test("parent reuses a recently visited page segment", async ({ page }) => {
  await signIn(page, "parent@demo.local");
  const child = await getDemoChild(page);
  await selectChild(page, child.id);
  await unlockParentGate(page);

  await page.locator('a[href="/parent/activity"]:visible').first().click();
  await expect(page).toHaveURL(/\/parent\/activity$/);
  await expect(page.locator("main h1")).toBeVisible();
  await page.locator('a[href="/parent/resources"]:visible').first().click();
  await expect(page).toHaveURL(/\/parent\/resources$/);
  await expect(page.locator("main h1")).toBeVisible();

  let repeatedRequests = 0;
  page.on("request", (request) => {
    if (isRscRequestFor(request.url(), "/parent/activity")) repeatedRequests += 1;
  });

  await page.locator('a[href="/parent/activity"]:visible').first().click();
  await expect(page).toHaveURL(/\/parent\/activity$/);
  await expect(page.locator("main h1")).toBeVisible();
  await expect(page.getByText("Đang tải dữ liệu gia đình...")).toHaveCount(0);
  expect(repeatedRequests).toBeLessThanOrEqual(1);
});
