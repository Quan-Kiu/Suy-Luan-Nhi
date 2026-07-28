import { expect, test } from "@playwright/test";
import { signIn } from "./helpers";

test("mission editor keeps editing and preview in independent desktop scroll regions", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 600 });
  await signIn(page, "content@demo.local", "/admin/missions/new");
  await expect(page.getByRole("heading", { name: "Nhiệm vụ chưa đặt tên" })).toBeVisible();

  const shell = page.locator("[data-admin-shell]");
  const fields = page.getByTestId("mission-editor-fields-scroll-region");
  const preview = page.getByTestId("mission-editor-preview-scroll-region");

  await expect(fields).toBeVisible();
  await expect(preview).toBeVisible();
  await expect(fields).toHaveAttribute("tabindex", "0");
  await expect(preview).toHaveAttribute("tabindex", "0");

  const initialLayout = await page.evaluate(() => {
    const shellElement = document.querySelector<HTMLElement>("[data-admin-shell]")!;
    const mainElement = document.querySelector<HTMLElement>("#admin-main-content")!;
    const fieldsElement = document.querySelector<HTMLElement>(
      '[data-testid="mission-editor-fields-scroll-region"]',
    )!;
    const previewElement = document.querySelector<HTMLElement>(
      '[data-testid="mission-editor-preview-scroll-region"]',
    )!;

    return {
      rootOverflow: getComputedStyle(document.documentElement).overflow,
      bodyOverflow: getComputedStyle(document.body).overflow,
      shellBottom: shellElement.getBoundingClientRect().bottom,
      viewportHeight: window.innerHeight,
      mainOverflowY: getComputedStyle(mainElement).overflowY,
      fieldsOverflowY: getComputedStyle(fieldsElement).overflowY,
      previewOverflowY: getComputedStyle(previewElement).overflowY,
      mainScrollTop: mainElement.scrollTop,
      fieldsClientHeight: fieldsElement.clientHeight,
      fieldsScrollHeight: fieldsElement.scrollHeight,
      previewClientHeight: previewElement.clientHeight,
      previewScrollHeight: previewElement.scrollHeight,
      previewScrollTop: previewElement.scrollTop,
    };
  });

  expect(initialLayout.rootOverflow).toBe("hidden");
  expect(initialLayout.bodyOverflow).toBe("hidden");
  expect(initialLayout.shellBottom).toBe(initialLayout.viewportHeight);
  expect(initialLayout.mainOverflowY).toBe("auto");
  expect(initialLayout.fieldsOverflowY).toBe("auto");
  expect(initialLayout.previewOverflowY).toBe("auto");
  expect(initialLayout.fieldsScrollHeight).toBeGreaterThan(initialLayout.fieldsClientHeight);
  expect(initialLayout.previewScrollHeight).toBeGreaterThan(initialLayout.previewClientHeight);

  await fields.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect(page.getByRole("button", { name: "Gửi để kiểm tra" })).toBeInViewport();

  const afterFieldsScroll = await page.evaluate(() => {
    const mainElement = document.querySelector<HTMLElement>("#admin-main-content")!;
    const fieldsElement = document.querySelector<HTMLElement>(
      '[data-testid="mission-editor-fields-scroll-region"]',
    )!;
    const previewElement = document.querySelector<HTMLElement>(
      '[data-testid="mission-editor-preview-scroll-region"]',
    )!;

    return {
      mainScrollTop: mainElement.scrollTop,
      fieldsScrollTop: fieldsElement.scrollTop,
      previewScrollTop: previewElement.scrollTop,
      horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });

  expect(afterFieldsScroll.mainScrollTop).toBe(initialLayout.mainScrollTop);
  expect(afterFieldsScroll.fieldsScrollTop).toBeGreaterThan(0);
  expect(afterFieldsScroll.previewScrollTop).toBe(initialLayout.previewScrollTop);
  expect(afterFieldsScroll.horizontalOverflow).toBeLessThanOrEqual(1);

  await preview.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });

  const afterPreviewScroll = await page.evaluate(() => {
    const mainElement = document.querySelector<HTMLElement>("#admin-main-content")!;
    const fieldsElement = document.querySelector<HTMLElement>(
      '[data-testid="mission-editor-fields-scroll-region"]',
    )!;
    const previewElement = document.querySelector<HTMLElement>(
      '[data-testid="mission-editor-preview-scroll-region"]',
    )!;

    return {
      mainScrollTop: mainElement.scrollTop,
      fieldsScrollTop: fieldsElement.scrollTop,
      previewScrollTop: previewElement.scrollTop,
    };
  });

  expect(afterPreviewScroll.mainScrollTop).toBe(initialLayout.mainScrollTop);
  expect(afterPreviewScroll.fieldsScrollTop).toBe(afterFieldsScroll.fieldsScrollTop);
  expect(afterPreviewScroll.previewScrollTop).toBeGreaterThan(initialLayout.previewScrollTop);

  await shell.screenshot({ path: ".verification/browser/mission-editor-independent-scroll.png" });
});

test("mission editor keeps the existing page scroll below the desktop breakpoint", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 700 });
  await signIn(page, "content@demo.local", "/admin/missions/new");
  await expect(page.getByRole("heading", { name: "Nhiệm vụ chưa đặt tên" })).toBeVisible();

  const main = page.locator("#admin-main-content");
  const overflow = await page.evaluate(() => {
    const mainElement = document.querySelector<HTMLElement>("#admin-main-content")!;
    const fieldsElement = document.querySelector<HTMLElement>(
      '[data-testid="mission-editor-fields-scroll-region"]',
    )!;
    const previewElement = document.querySelector<HTMLElement>(
      '[data-testid="mission-editor-preview-scroll-region"]',
    )!;

    return {
      main: getComputedStyle(mainElement).overflowY,
      fields: getComputedStyle(fieldsElement).overflowY,
      preview: getComputedStyle(previewElement).overflowY,
    };
  });

  expect(overflow.main).toBe("auto");
  expect(overflow.fields).toBe("visible");
  expect(overflow.preview).toBe("visible");

  await main.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect(page.getByRole("button", { name: "Gửi để kiểm tra" })).toBeInViewport();
});

test("admin pages keep bottom breathing room after scrolling to the last section", async ({ page }) => {
  await page.setViewportSize({ width: 1650, height: 600 });
  await signIn(page, "content@demo.local", "/admin/taxonomy");
  await expect(page.getByRole("heading", { name: "Nhóm tuổi và kỹ năng" })).toBeVisible();

  const main = page.locator("#admin-main-content");
  const addSkillCard = page.locator("details").filter({ hasText: "Thêm kỹ năng mới" });

  await main.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect(addSkillCard).toBeInViewport();

  const layout = await page.evaluate(() => {
    const mainElement = document.querySelector<HTMLElement>("#admin-main-content")!;
    const contentElement = mainElement.firstElementChild as HTMLElement;
    const mainRect = mainElement.getBoundingClientRect();
    const contentRect = contentElement.getBoundingClientRect();

    return {
      paddingBottom: Number.parseFloat(getComputedStyle(mainElement).paddingBottom),
      contentBottomGap: mainRect.bottom - contentRect.bottom,
      mainScrollTop: mainElement.scrollTop,
      mainMaxScrollTop: mainElement.scrollHeight - mainElement.clientHeight,
    };
  });
  const lastSectionBottomGap = await addSkillCard.evaluate((element) => {
    const mainElement = document.querySelector<HTMLElement>("#admin-main-content")!;
    return mainElement.getBoundingClientRect().bottom - element.getBoundingClientRect().bottom;
  });

  expect(layout.mainScrollTop).toBeCloseTo(layout.mainMaxScrollTop, 0);
  expect(layout.contentBottomGap).toBeGreaterThanOrEqual(layout.paddingBottom - 1);
  expect(lastSectionBottomGap).toBeGreaterThanOrEqual(layout.paddingBottom - 1);
});
