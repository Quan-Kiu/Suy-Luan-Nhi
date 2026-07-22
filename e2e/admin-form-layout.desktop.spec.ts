import { expect, test, type Locator } from "@playwright/test";
import { clearAuth, signIn } from "./helpers";

async function top(locator: Locator) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  return box!.y;
}

async function expectAligned(...locators: Locator[]) {
  const positions = await Promise.all(locators.map(top));
  expect(Math.max(...positions) - Math.min(...positions)).toBeLessThanOrEqual(1);
}

test.describe.configure({ mode: "serial" });

test("content variable fields keep a stable two-column baseline", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await signIn(page, "admin@demo.local", "/admin/content-variables");
  await expect(page.getByRole("heading", { name: "Thông tin tự điền", exact: true })).toBeVisible();

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
  const file = fileInput.locator("..");
  const category = page.locator('select[name="category"]');
  const description = page.locator('input[name="altText"]');
  const upload = page.getByRole("button", { name: "Chọn và tải lên" });

  await expect(page.getByText("Chưa chọn tệp", { exact: true })).toBeVisible();
  await expectAligned(file, category, description, upload);
  const positionsBefore = await Promise.all([file, category, description, upload].map(top));

  await upload.click();
  await expect(page.getByText("Hãy chọn một tệp hình ảnh, âm thanh hoặc video")).toBeVisible();
  const positionsAfter = await Promise.all([file, category, description, upload].map(top));
  const maximumShift = Math.max(
    ...positionsAfter.map((position, index) => Math.abs(position - positionsBefore[index])),
  );
  expect(maximumShift).toBeLessThanOrEqual(1);

  await page.screenshot({
    path: ".verification/browser/admin-form-layout-media.png",
    fullPage: true,
  });
});
