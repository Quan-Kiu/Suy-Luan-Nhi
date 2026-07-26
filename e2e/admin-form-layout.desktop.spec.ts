import { expect, test, type Locator } from "@playwright/test";
import { clearAuth, signIn } from "./helpers";

const tinyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z4S8AAAAASUVORK5CYII=",
  "base64",
);

async function top(locator: Locator) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  return box!.y;
}

async function expectAligned(...locators: Locator[]) {
  const positions = await Promise.all(locators.map(top));
  expect(Math.max(...positions) - Math.min(...positions)).toBeLessThanOrEqual(1);
}

async function expectSameHeight(...locators: Locator[]) {
  const heights = await Promise.all(
    locators.map(async (locator) => {
      const box = await locator.boundingBox();
      expect(box).not.toBeNull();
      return box!.height;
    }),
  );
  expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(1);
}

test.describe.configure({ mode: "serial" });

test("content variable fields keep a stable two-column baseline", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await signIn(page, "admin@demo.local", "/admin/content-variables");
  await expect(page.getByRole("heading", { name: "Từ điển", exact: true })).toBeVisible();

  await expectAligned(page.getByLabel("Tên tag").first(), page.getByLabel("Tên dễ hiểu").first());
  await expectAligned(
    page.getByLabel("Dữ liệu được lấy từ").first(),
    page.getByLabel("Dữ liệu xem trước").first(),
  );

  const saveContainerPosition = await page
    .getByRole("button", { name: "Lưu cấu hình tag" })
    .evaluate((button) => getComputedStyle(button.parentElement!).position);
  expect(saveContainerPosition).toBe("static");

  await page.screenshot({
    path: ".verification/browser/admin-form-layout-content-variables.png",
    fullPage: true,
  });
});
test("media upload controls stay aligned before and after validation", async ({ page }) => {
  await clearAuth(page);
  await page.setViewportSize({ width: 1600, height: 900 });
  await signIn(page, "content@demo.local", "/admin/media");
  await expect(page.getByRole("heading", { name: "Hình ảnh, âm thanh và video" })).toBeVisible();

  const fileInput = page.locator('input[type="file"]').first();
  const file = page.getByTestId("media-file-picker");
  await expect(fileInput).toHaveAttribute("hidden", "");
  await expect(page.getByRole("button", { name: "Chọn tệp hình ảnh, âm thanh hoặc video" })).toBeVisible();
  const category = page.locator('select[name="category"]');
  const description = page.locator('input[name="altText"]');
  const upload = page.getByRole("button", { name: "Tải lên" });

  await expect(page.getByText("Chưa chọn tệp", { exact: true })).toBeVisible();
  await expectAligned(file, category, description, upload);
  await expectSameHeight(file, category, description, upload);
  expect(await upload.evaluate((button) => getComputedStyle(button).boxShadow)).not.toContain("127, 46, 5");
  expect(await upload.evaluate((button) => button.scrollHeight - button.clientHeight)).toBeLessThanOrEqual(1);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
  ).toBeLessThanOrEqual(1);
  const positionsBefore = await Promise.all([file, category, description, upload].map(top));

  await page.screenshot({
    path: ".verification/browser/admin-form-layout-media-before-validation.png",
    fullPage: true,
  });

  await upload.click();
  await expect(page.getByText("Hãy chọn một tệp hình ảnh, âm thanh hoặc video")).toBeVisible();
  const positionsAfter = await Promise.all([file, category, description, upload].map(top));
  const maximumShift = Math.max(
    ...positionsAfter.map((position, index) => Math.abs(position - positionsBefore[index])),
  );
  expect(maximumShift).toBeLessThanOrEqual(1);
  await expectSameHeight(file, category, description, upload);

  await page.screenshot({
    path: ".verification/browser/admin-form-layout-media.png",
    fullPage: true,
  });
});

test("media upload controls stay balanced on a wide admin viewport", async ({ page }) => {
  await clearAuth(page);
  await page.setViewportSize({ width: 1920, height: 1080 });
  await signIn(page, "content@demo.local", "/admin/media");
  await expect(page.getByRole("heading", { name: "Hình ảnh, âm thanh và video" })).toBeVisible();

  const file = page.getByTestId("media-file-picker");
  const category = page.locator('select[name="category"]');
  const description = page.locator('input[name="altText"]');
  const upload = page.getByRole("button", { name: "Tải lên" });

  await expectAligned(file, category, description, upload);
  await expectSameHeight(file, category, description, upload);
  expect(await upload.evaluate((button) => getComputedStyle(button).boxShadow)).not.toContain("127, 46, 5");
  expect(await upload.evaluate((button) => button.scrollHeight - button.clientHeight)).toBeLessThanOrEqual(1);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
  ).toBeLessThanOrEqual(1);

  await page.screenshot({
    path: ".verification/browser/admin-form-layout-media-wide.png",
    fullPage: true,
  });
});

test("mission image upload keeps the admin shell inside the viewport", async ({ page }) => {
  await clearAuth(page);
  await page.setViewportSize({ width: 1844, height: 832 });
  await signIn(page, "content@demo.local", "/admin/missions/new");

  const uploadButton = page.getByRole("button", { name: /Hình minh họa.*Tải tệp mới/ }).first();
  await uploadButton.scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => window.scrollY)).toBe(0);

  const uploadResponse = page.waitForResponse(
    (response) => response.request().method() === "POST" && response.url().endsWith("/api/admin/media"),
  );
  const fileChooser = page.waitForEvent("filechooser");
  await uploadButton.click();
  await (
    await fileChooser
  ).setFiles({
    name: "question-image.png",
    mimeType: "image/png",
    buffer: tinyPng,
  });
  expect((await uploadResponse).status()).toBe(201);
  await expect(page.getByText("Đã thêm tệp vào nội dung")).toBeVisible();

  const layout = await page.evaluate(() => {
    const shell = document.querySelector("[data-admin-shell]")?.getBoundingClientRect();
    return {
      scrollY: window.scrollY,
      viewportHeight: window.innerHeight,
      shellTop: shell?.top,
      shellBottom: shell?.bottom,
    };
  });
  expect(layout.scrollY).toBe(0);
  expect(layout.shellTop).toBe(0);
  expect(layout.shellBottom).toBe(layout.viewportHeight);

  await page.screenshot({ path: ".verification/browser/admin-mission-upload-layout.png" });
});
