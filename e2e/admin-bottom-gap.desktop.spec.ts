import { expect, test } from "@playwright/test";
import { signIn } from "./helpers";

test("mission editor stays inside the admin viewport without a trailing page gap", async ({ page }) => {
  await page.setViewportSize({ width: 1912, height: 1080 });
  await signIn(page, "content@demo.local", "/admin/missions/new");
  await expect(page.getByRole("heading", { name: "Nhiệm vụ chưa đặt tên" })).toBeVisible();

  const main = page.locator("#admin-main-content");
  await main.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect(page.getByRole("button", { name: "Gửi để kiểm tra" })).toBeInViewport();

  const layout = await page.evaluate(() => {
    const shell = document.querySelector<HTMLElement>("[data-admin-shell]")!;
    const mainElement = document.querySelector<HTMLElement>("#admin-main-content")!;
    const content = mainElement.firstElementChild as HTMLElement;
    const shellRect = shell.getBoundingClientRect();
    const mainRect = mainElement.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();

    return {
      rootOverflow: getComputedStyle(document.documentElement).overflow,
      rootOverscroll: getComputedStyle(document.documentElement).overscrollBehavior,
      bodyOverflow: getComputedStyle(document.body).overflow,
      bodyOverscroll: getComputedStyle(document.body).overscrollBehavior,
      viewportHeight: window.innerHeight,
      shellTop: shellRect.top,
      shellBottom: shellRect.bottom,
      trailingGap: mainRect.bottom - contentRect.bottom,
      horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });

  await page.getByTestId("admin-header").hover();
  await page.mouse.wheel(400, 400);
  await page.waitForTimeout(100);
  const documentScroll = await page.evaluate(() => ({ x: window.scrollX, y: window.scrollY }));

  expect(layout.rootOverflow).toBe("hidden");
  expect(layout.rootOverscroll).toBe("none");
  expect(layout.bodyOverflow).toBe("hidden");
  expect(layout.bodyOverscroll).toBe("none");
  expect(documentScroll.x).toBe(0);
  expect(documentScroll.y).toBe(0);
  expect(layout.shellTop).toBe(0);
  expect(layout.shellBottom).toBe(layout.viewportHeight);
  expect(layout.trailingGap).toBeLessThanOrEqual(25);
  expect(layout.horizontalOverflow).toBeLessThanOrEqual(1);

  await page.screenshot({ path: ".verification/browser/admin-bottom-gap-fixed.png" });
});
