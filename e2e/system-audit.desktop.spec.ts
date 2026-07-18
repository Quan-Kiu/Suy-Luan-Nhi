import { expect, test } from "@playwright/test";
import { auditRoute } from "./audit-helpers";
import { clearAuth, getDemoChild, selectChild, signIn, unlockParentGate } from "./helpers";

test.setTimeout(360_000);

test("public and authentication routes pass runtime UX checks", async ({ page }, testInfo) => {
  const routes = [
    ["/", "desktop-public-landing"],
    ["/auth/sign-in", "desktop-auth-sign-in"],
    ["/auth/sign-up", "desktop-auth-sign-up"],
    ["/auth/forgot-password", "desktop-auth-forgot-password"],
    ["/auth/reset-password", "desktop-auth-reset-invalid-link"],
    ["/auth/error?reason=forbidden", "desktop-auth-forbidden"],
  ] as const;

  for (const [route, name] of routes) await auditRoute(page, testInfo, route, name);
});

test("parent and child routes pass runtime UX checks", async ({ page }, testInfo) => {
  await signIn(page, "parent@demo.local");
  const child = await getDemoChild(page);
  await selectChild(page, child.id);

  await auditRoute(page, testInfo, "/profiles", "desktop-parent-profiles");
  await auditRoute(page, testInfo, "/onboarding", "desktop-parent-create-child");
  await auditRoute(page, testInfo, "/missions", "desktop-child-mission-map");

  const missionHref = await page.locator('a[href^="/missions/"]').first().getAttribute("href");
  expect(missionHref).toBeTruthy();
  await auditRoute(page, testInfo, missionHref!, "desktop-child-mission-detail");

  await page.getByRole("button", { name: /Bắt đầu nhiệm vụ/i }).click();
  await page.waitForURL(/\/play\//);
  await auditRoute(page, testInfo, new URL(page.url()).pathname, "desktop-child-gameplay");
  await page.getByRole("button", { name: /Dừng và lưu tiến độ/i }).click();
  await page.waitForURL(/\/missions$/);

  await unlockParentGate(page);
  await auditRoute(page, testInfo, "/parent", "desktop-parent-dashboard");
  const parentRoutes = [
    ["/parent/activity", "desktop-parent-activity"],
    ["/parent/notifications", "desktop-parent-notifications"],
    ["/parent/resources", "desktop-parent-resources"],
    ["/parent/suggestions", "desktop-parent-suggestions"],
    ["/parent/settings", "desktop-parent-settings"],
    ["/parent/activities", "desktop-parent-legacy-activities"],
  ] as const;
  for (const [route, name] of parentRoutes) await auditRoute(page, testInfo, route, name);

  await page.goto("/parent/resources");
  const resourceHref = await page.locator('a[href^="/parent/resources/"]').first().getAttribute("href");
  expect(resourceHref).toBeTruthy();
  await auditRoute(page, testInfo, resourceHref!, "desktop-parent-resource-detail");
});

test("content editor routes pass runtime UX checks", async ({ page }, testInfo) => {
  await clearAuth(page);
  await signIn(page, "content@demo.local", "/admin");
  const routes = [
    ["/admin", "desktop-editor-dashboard"],
    ["/admin/missions", "desktop-editor-missions"],
    ["/admin/missions/new", "desktop-editor-new-mission"],
    ["/admin/media", "desktop-editor-media"],
    ["/admin/content", "desktop-editor-content"],
  ] as const;
  const moreRoutes = [
    ["/admin/worlds", "desktop-editor-worlds"],
    ["/admin/taxonomy", "desktop-editor-taxonomy"],
    ["/admin/reports", "desktop-editor-reports"],
    ["/admin/audit", "desktop-editor-audit"],
  ] as const;
  for (const [route, name] of [...routes, ...moreRoutes]) {
    await auditRoute(page, testInfo, route, name);
  }

  await page.goto("/admin/missions");
  const editHref = await page.locator('a[href$="/edit"]').first().getAttribute("href");
  expect(editHref).toBeTruthy();
  await auditRoute(page, testInfo, editHref!, "desktop-editor-edit-mission");
});

test("reviewer routes pass runtime UX checks", async ({ page }, testInfo) => {
  await clearAuth(page);
  await signIn(page, "reviewer@demo.local", "/admin");
  const routes = [
    ["/admin", "desktop-reviewer-dashboard"],
    ["/admin/missions", "desktop-reviewer-missions"],
    ["/admin/reviews", "desktop-reviewer-reviews"],
    ["/admin/media", "desktop-reviewer-media"],
    ["/admin/content", "desktop-reviewer-content"],
    ["/admin/reports", "desktop-reviewer-reports"],
    ["/admin/audit", "desktop-reviewer-audit"],
  ] as const;
  for (const [route, name] of routes) await auditRoute(page, testInfo, route, name);
});

test("super-admin routes pass runtime UX checks", async ({ page }, testInfo) => {
  await clearAuth(page);
  await signIn(page, "admin@demo.local", "/admin");
  const routes = [
    ["/admin", "desktop-super-admin-dashboard"],
    ["/admin/members", "desktop-super-admin-members"],
    ["/admin/data-requests", "desktop-super-admin-data-requests"],
    ["/admin/settings", "desktop-super-admin-settings"],
    ["/admin/reviews", "desktop-super-admin-reviews"],
    ["/admin/reports", "desktop-super-admin-reports"],
    ["/admin/audit", "desktop-super-admin-audit"],
  ] as const;
  for (const [route, name] of routes) await auditRoute(page, testInfo, route, name);
});
