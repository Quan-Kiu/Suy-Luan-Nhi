import { expect, test } from "@playwright/test";
import { getDemoChild, selectChild, signIn, unlockParentGate } from "./helpers";

async function simulateIPhoneSafeArea(page: import("@playwright/test").Page) {
  await page.evaluate(() => {
    document.documentElement.style.setProperty("--safe-area-top", "47px");
    document.documentElement.style.setProperty("--safe-area-right", "0px");
    document.documentElement.style.setProperty("--safe-area-bottom", "34px");
    document.documentElement.style.setProperty("--safe-area-left", "0px");
  });
}

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(overflow).toBe(false);
}

test("iOS auth controls avoid focus zoom and unstable viewport sizing", async ({ page }) => {
  await page.goto("/auth/sign-in");

  const viewportMeta = page.locator('meta[name="viewport"]');
  await expect(viewportMeta).toHaveAttribute("content", /viewport-fit=cover/);

  for (const control of [page.getByLabel("Email"), page.locator('input[name="password"]')]) {
    await expect(control).toBeVisible();
    const fontSize = await control.evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).fontSize),
    );
    expect(fontSize).toBeGreaterThanOrEqual(16);
  }

  const minHeight = await page.locator("main").evaluate((element) => element.getBoundingClientRect().height);
  expect(minHeight).toBeGreaterThanOrEqual(page.viewportSize()!.height);
  await expectNoHorizontalOverflow(page);
});

test("iOS parent navigation clears the home indicator", async ({ page }) => {
  await signIn(page, "parent@demo.local");
  await page.waitForURL((url) => url.pathname === "/profiles");
  const child = await getDemoChild(page);
  await selectChild(page, child.id);
  await unlockParentGate(page);
  await page.goto("/parent");

  const nav = page.locator("nav.safe-area-bottom-nav");
  await expect(nav).toBeVisible();
  await page.waitForLoadState("networkidle").catch(() => undefined);
  await simulateIPhoneSafeArea(page);
  const navBox = await nav.boundingBox();
  expect(navBox).not.toBeNull();
  expect(Math.round(navBox!.height)).toBe(114);
  expect(Math.round(navBox!.y + navBox!.height)).toBe(page.viewportSize()!.height);

  const mainPaddingBottom = await page
    .locator("main.safe-area-page-with-bottom-nav")
    .evaluate((element) => Number.parseFloat(getComputedStyle(element).paddingBottom));
  expect(mainPaddingBottom).toBe(130);

  const feedbackButton = page.locator("button.safe-area-floating-action");
  if (await feedbackButton.isVisible().catch(() => false)) {
    const feedbackBox = await feedbackButton.boundingBox();
    expect(feedbackBox).not.toBeNull();
    expect(feedbackBox!.y + feedbackBox!.height).toBeLessThan(navBox!.y);
  }
  await expectNoHorizontalOverflow(page);
});

test("iOS media picker hides the native WebKit control behind the localized picker", async ({ page }) => {
  await signIn(page, "content@demo.local", "/admin/media");

  const input = page.locator('input[type="file"][name="file"]');
  await expect(input).toHaveClass(/sr-only/);
  const inputBox = await input.boundingBox();
  expect(inputBox).not.toBeNull();
  expect(inputBox!.width).toBeLessThanOrEqual(1);
  expect(inputBox!.height).toBeLessThanOrEqual(1);

  await input.setInputFiles({
    name: "anh-kiem-tra.png",
    mimeType: "image/png",
    buffer: Buffer.from("not-submitted"),
  });

  await expect(page.getByText("anh-kiem-tra.png", { exact: true })).toBeVisible();
  await expect(page.getByText(/Choose File|no file selected/i)).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test("iOS admin shell keeps header and scroll region inside the visual viewport", async ({ page }) => {
  await signIn(page, "content@demo.local", "/admin");
  await simulateIPhoneSafeArea(page);

  const shell = page.locator("[data-admin-shell]");
  const header = page.getByTestId("admin-header");
  const main = page.locator("#admin-main-content");
  const [shellBox, headerBox, mainBox] = await Promise.all([
    shell.boundingBox(),
    header.boundingBox(),
    main.boundingBox(),
  ]);

  expect(shellBox).not.toBeNull();
  expect(headerBox).not.toBeNull();
  expect(mainBox).not.toBeNull();
  expect(Math.round(shellBox!.height)).toBe(page.viewportSize()!.height);
  expect(Math.round(headerBox!.height)).toBe(111);
  expect(Math.round(mainBox!.y)).toBe(Math.round(headerBox!.height));
  expect(Math.round(mainBox!.y + mainBox!.height)).toBe(page.viewportSize()!.height);

  await page.locator('button[aria-controls="admin-mobile-navigation"]').click();
  const drawer = page.locator("#admin-mobile-navigation");
  await expect(drawer).toBeVisible();
  const drawerPaddingBottom = await drawer.evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).paddingBottom),
  );
  expect(drawerPaddingBottom).toBeGreaterThanOrEqual(34);
  await expectNoHorizontalOverflow(page);
});
