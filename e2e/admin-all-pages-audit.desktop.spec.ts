import { mkdir, writeFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";
import { apiData, signIn } from "./helpers";

const outputDir = ".verification/admin-all-pages-audit";
const allViewports = [
  { name: "desktop", width: 1600, height: 900 },
  { name: "tablet", width: 1024, height: 768 },
  { name: "mobile", width: 390, height: 844 },
] as const;
const requestedViewport = process.env.ADMIN_AUDIT_VIEWPORT;
const requestedRoute = process.env.ADMIN_AUDIT_ROUTE;
const viewports = requestedViewport
  ? allViewports.filter((viewport) => viewport.name === requestedViewport)
  : allViewports;

type AuditRoute = { name: string; path: string };
type AuditResult = {
  route: string;
  path: string;
  viewport: string;
  finalPath: string;
  title: string;
  horizontalOverflow: boolean;
  mainHorizontalOverflow: boolean;
  mainScrollHeight: number;
  mainClientHeight: number;
  clippedControls: number;
  brokenImages: number;
  tinyTextCount: number;
  consoleErrors: string[];
  pageErrors: string[];
};
async function firstHref(page: Page, selector: string) {
  const link = page.locator(selector).first();
  return (await link.count()) ? await link.getAttribute("href") : null;
}

async function resolveRoutes(page: Page): Promise<AuditRoute[]> {
  await page.goto("/admin/missions");
  const missionEdit = await firstHref(page, 'a[href^="/admin/missions/"][href$="/edit"]');
  await page.goto("/admin/resources");
  const resourceEdit = await firstHref(page, 'a[href^="/admin/resources/"][href$="/edit"]');
  await page.goto("/admin/reviews");
  let reviewDetail = await firstHref(page, 'a[href^="/admin/reviews/"]:not([href="/admin/reviews"])');
  if (!reviewDetail && missionEdit) {
    const missionId = missionEdit.split("/")[3];
    const duplicate = await apiData<{ id: string }>(
      await page.request.post(`/api/admin/missions/${missionId}/duplicate`),
    );
    await apiData(await page.request.post(`/api/admin/missions/${duplicate.id}/submit`));
    await page.goto("/admin/reviews");
    reviewDetail = await firstHref(page, 'a[href^="/admin/reviews/"]:not([href="/admin/reviews"])');
  }

  return [
    { name: "dashboard", path: "/admin" },
    { name: "missions", path: "/admin/missions" },
    { name: "mission-new", path: "/admin/missions/new" },
    ...(missionEdit ? [{ name: "mission-edit", path: missionEdit }] : []),
    { name: "reviews", path: "/admin/reviews" },
    ...(reviewDetail ? [{ name: "review-detail", path: reviewDetail }] : []),
    { name: "resources", path: "/admin/resources" },
    { name: "resource-new", path: "/admin/resources/new" },
    ...(resourceEdit ? [{ name: "resource-edit", path: resourceEdit }] : []),
    { name: "media", path: "/admin/media" },
    { name: "content", path: "/admin/content" },
    { name: "content-variables", path: "/admin/content-variables" },
    { name: "worlds", path: "/admin/worlds" },
    { name: "badges", path: "/admin/badges" },
    { name: "taxonomy", path: "/admin/taxonomy" },
    { name: "feedback", path: "/admin/feedback" },
    { name: "reports", path: "/admin/reports" },
    { name: "members", path: "/admin/members" },
    { name: "data-requests", path: "/admin/data-requests" },
    { name: "audit", path: "/admin/audit" },
    { name: "settings", path: "/admin/settings" },
  ];
}
async function auditPage(page: Page, route: AuditRoute, viewport: (typeof allViewports)[number]) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const onConsole = (message: { type(): string; text(): string }) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  };
  const onPageError = (error: Error) => pageErrors.push(error.message);
  page.on("console", onConsole);
  page.on("pageerror", onPageError);

  await page.goto(route.path, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.locator("#admin-main-content").waitFor({ state: "visible", timeout: 15_000 });
  await page.waitForLoadState("networkidle", { timeout: 3_000 }).catch(() => undefined);
  await page.waitForTimeout(100);
  const main = page.locator("#admin-main-content");
  await main.evaluate((element) => element.scrollTo({ top: 0, behavior: "instant" }));
  const title = (await page.locator("h1").first().textContent())?.trim() ?? "";
  const safeTitle = title || route.name;
  const metrics = await page.evaluate(() => {
    const mainElement = document.querySelector<HTMLElement>("#admin-main-content");
    const interactive = Array.from(
      document.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea, [role="button"]'),
    ).filter((element) => {
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return style.visibility !== "hidden" && style.display !== "none" && box.width > 0 && box.height > 0;
    });
    function isInsideHorizontalScroller(element: HTMLElement) {
      let parent = element.parentElement;
      while (parent) {
        const style = getComputedStyle(parent);
        const scrollable = style.overflowX === "auto" || style.overflowX === "scroll";
        if (scrollable && parent.scrollWidth > parent.clientWidth + 1) return true;
        parent = parent.parentElement;
      }
      return false;
    }
    const clippedControls = interactive.filter((element) => {
      const box = element.getBoundingClientRect();
      const clipped = box.left < -1 || box.right > window.innerWidth + 1;
      return clipped && !isInsideHorizontalScroller(element);
    }).length;
    const brokenImages = Array.from(document.images).filter(
      (image) => image.complete && image.naturalWidth === 0,
    ).length;
    const tinyTextCount = Array.from(document.querySelectorAll<HTMLElement>("main *")).filter((element) => {
      if (!element.textContent?.trim() || element.children.length) return false;
      const size = Number.parseFloat(getComputedStyle(element).fontSize);
      return size < 12;
    }).length;
    return {
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      mainHorizontalOverflow: Boolean(mainElement && mainElement.scrollWidth > mainElement.clientWidth + 1),
      mainScrollHeight: mainElement?.scrollHeight ?? 0,
      mainClientHeight: mainElement?.clientHeight ?? 0,
      clippedControls,
      brokenImages,
      tinyTextCount,
    };
  });
  const prefix = `${viewport.name}-${route.name}`;
  await page.screenshot({ path: `${outputDir}/${prefix}-top.png`, fullPage: false });
  if (metrics.mainScrollHeight > metrics.mainClientHeight * 1.25) {
    await main.evaluate((element) => element.scrollTo({ top: element.scrollHeight, behavior: "instant" }));
    await page.waitForTimeout(100);
    await page.screenshot({ path: `${outputDir}/${prefix}-bottom.png`, fullPage: false });
  }

  page.off("console", onConsole);
  page.off("pageerror", onPageError);
  return {
    route: route.name,
    path: route.path,
    viewport: viewport.name,
    finalPath: new URL(page.url()).pathname,
    title: safeTitle,
    ...metrics,
    consoleErrors,
    pageErrors,
  } satisfies AuditResult;
}

test("capture and measure every admin page", async ({ page }) => {
  test.setTimeout(15 * 60_000);
  await mkdir(outputDir, { recursive: true });
  await page.setViewportSize(viewports[0]);
  await signIn(page, "admin@demo.local", "/admin");
  const routes = await resolveRoutes(page);
  expect(routes.length).toBe(21);
  const auditRoutes = requestedRoute ? routes.filter((route) => route.name === requestedRoute) : routes;
  expect(auditRoutes.length).toBeGreaterThan(0);
  const results: AuditResult[] = [];
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    for (const route of auditRoutes) results.push(await auditPage(page, route, viewport));
  }
  const auditName = requestedRoute
    ? `audit-${requestedRoute}.json`
    : requestedViewport
      ? `audit-${requestedViewport}.json`
      : "audit.json";
  await writeFile(`${outputDir}/${auditName}`, JSON.stringify({ routes, results }, null, 2));

  for (const result of results) {
    expect(result.finalPath, `${result.viewport}/${result.route} redirected unexpectedly`).toBe(result.path);
    expect(result.horizontalOverflow, `${result.viewport}/${result.route} body overflow`).toBe(false);
    expect(result.mainHorizontalOverflow, `${result.viewport}/${result.route} main overflow`).toBe(false);
    expect(result.clippedControls, `${result.viewport}/${result.route} clipped controls`).toBe(0);
    expect(result.brokenImages, `${result.viewport}/${result.route} broken images`).toBe(0);
    expect(result.pageErrors, `${result.viewport}/${result.route} page errors`).toEqual([]);
  }
});
