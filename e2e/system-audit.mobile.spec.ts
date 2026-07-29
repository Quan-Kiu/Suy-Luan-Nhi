import { expect, test } from "@playwright/test";
import { auditRoute } from "./audit-helpers";
import { clearAuth, getDemoChild, selectChild, signIn, unlockParentGate } from "./helpers";

test.setTimeout(300_000);

test("public mobile routes pass runtime UX checks", async ({ page }, testInfo) => {
  await auditRoute(page, testInfo, "/", "mobile-public-landing");
  await page.locator('button[aria-controls="landing-mobile-nav"]').click();
  await auditRoute(page, testInfo, "/auth/sign-in", "mobile-auth-sign-in");
  await auditRoute(page, testInfo, "/auth/sign-up", "mobile-auth-sign-up");
  await auditRoute(page, testInfo, "/auth/forgot-password", "mobile-auth-forgot-password");
  await auditRoute(page, testInfo, "/auth/reset-password", "mobile-auth-reset-invalid-link");
});

test("parent and child mobile routes pass runtime UX checks", async ({ page }, testInfo) => {
  await signIn(page, "parent@demo.local");
  const child = await getDemoChild(page);
  await selectChild(page, child.id);

  await auditRoute(page, testInfo, "/profiles", "mobile-parent-profiles");
  await auditRoute(page, testInfo, "/onboarding", "mobile-parent-create-child");
  await auditRoute(page, testInfo, "/missions", "mobile-child-mission-map");

  const missionHref = await page.locator('a[href^="/missions/"]').first().getAttribute("href");
  expect(missionHref).toBeTruthy();
  await auditRoute(page, testInfo, missionHref!, "mobile-child-mission-detail");

  await page.getByRole("button", { name: /Bắt đầu chơi/i }).click();
  await page.waitForURL(/\/play\//);
  await auditRoute(page, testInfo, new URL(page.url()).pathname, "mobile-child-gameplay");
  await page.getByRole("button", { name: /Dừng và lưu tiến độ/i }).click();
  await page.waitForURL(/\/missions$/);

  await unlockParentGate(page);
  await auditRoute(page, testInfo, "/parent", "mobile-parent-dashboard");
  const feedbackButton = page.locator("button.safe-area-floating-action");
  if (await feedbackButton.isVisible().catch(() => false)) {
    const feedbackBox = await feedbackButton.boundingBox();
    expect(feedbackBox).not.toBeNull();
    expect(feedbackBox!.width).toBeGreaterThanOrEqual(44);
    expect(feedbackBox!.width).toBeLessThanOrEqual(48);
    expect(Math.abs(feedbackBox!.x + feedbackBox!.width - page.viewportSize()!.width)).toBeLessThanOrEqual(1);
  }
  const parentRoutes = [
    ["/parent/activity", "mobile-parent-activity"],
    ["/parent/notifications", "mobile-parent-notifications"],
    ["/parent/resources", "mobile-parent-resources"],
    ["/parent/suggestions", "mobile-parent-suggestions"],
    ["/parent/settings", "mobile-parent-settings"],
    ["/parent/whats-new", "mobile-parent-whats-new"],
  ] as const;
  for (const [route, name] of parentRoutes) await auditRoute(page, testInfo, route, name);

  await page.goto("/parent/resources");
  const resourceHref = await page.locator('a[href^="/parent/resources/"]').first().getAttribute("href");
  expect(resourceHref).toBeTruthy();
  await auditRoute(page, testInfo, resourceHref!, "mobile-parent-resource-detail");
});

test("admin mobile routes pass runtime UX checks", async ({ page }, testInfo) => {
  await clearAuth(page);
  await signIn(page, "content@demo.local", "/admin");
  await auditRoute(page, testInfo, "/admin", "mobile-editor-dashboard");
  await auditRoute(page, testInfo, "/admin/missions", "mobile-editor-missions");
  await auditRoute(page, testInfo, "/admin/missions/new", "mobile-editor-new-mission");

  await clearAuth(page);
  await signIn(page, "admin@demo.local", "/admin");
  await auditRoute(page, testInfo, "/admin/access-control", "mobile-super-admin-access-control");
  await auditRoute(page, testInfo, "/admin/reports", "mobile-super-admin-reports");
  await expect(page.locator("#admin-main-content")).toHaveAttribute("tabindex", "0");
  await auditRoute(page, testInfo, "/admin/settings", "mobile-super-admin-settings");
});
