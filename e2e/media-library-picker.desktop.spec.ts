import { expect, test } from "@playwright/test";
import { apiData, signIn } from "./helpers";

const tinyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z4S8AAAAASUVORK5CYII=",
  "base64",
);

test("mission editor reuses an existing image without uploading it again", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await signIn(page, "content@demo.local", "/admin/missions/new");
  const fileName = `library-cover-${Date.now()}.png`;
  const media = await apiData<{ url: string }>(
    await page.request.post("/api/admin/media", {
      multipart: {
        file: { name: fileName, mimeType: "image/png", buffer: tinyPng },
        altText: "Ảnh bìa dùng lại từ thư viện",
        category: "mission-cover",
      },
    }),
  );

  await page.goto("/admin/missions/new");
  await page.getByText("Thiết lập nâng cao", { exact: true }).first().click();
  let uploadRequests = 0;
  page.on("request", (request) => {
    if (request.method() === "POST" && request.url().endsWith("/api/admin/media")) uploadRequests += 1;
  });

  await page.getByRole("button", { name: /Ảnh hiển thị trên thẻ.*Chọn từ thư viện/ }).click();
  const dialog = page.getByRole("dialog", { name: "Chọn từ thư viện" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(fileName, { exact: true })).toBeVisible();

  const bounds = await dialog.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.y).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(1440);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(900);

  await dialog
    .locator("article")
    .filter({ hasText: fileName })
    .getByRole("button", { name: "Chọn tư liệu này" })
    .click();

  await expect(dialog).toHaveCount(0);
  await expect(page.getByText("Đã chọn tư liệu từ thư viện")).toBeVisible();
  await expect(page.getByText("Tệp đã được gắn tự động vào nội dung.").last()).toBeVisible();
  expect(uploadRequests).toBe(0);
  expect(media.url).toBeTruthy();

  await page.screenshot({ path: ".verification/browser/media-library-picker.png", fullPage: false });
});
