import { expect, test } from "@playwright/test";
import sharp from "sharp";

async function createMobileTestImage() {
  const svg = `
    <svg width="640" height="900" xmlns="http://www.w3.org/2000/svg">
      <rect width="640" height="900" fill="#fff8ec" />
      <rect x="70" y="180" width="500" height="420" rx="28" fill="#f6d4aa" />
      <text x="320" y="410" text-anchor="middle" font-size="42" font-family="sans-serif" fill="#6f3d20">Khu vực lỗi</text>
    </svg>
  `;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

test("image annotation remains usable on mobile", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Gửi góp ý về trang này" }).click();

  const input = page.getByLabel("Thêm ảnh từ máy");
  await expect(input).toBeEnabled({ timeout: 20_000 });
  await input.setInputFiles({
    name: "mobile-feedback.png",
    mimeType: "image/png",
    buffer: await createMobileTestImage(),
  });

  const card = page.locator('[data-feedback-file-name="mobile-feedback.png"]');
  await card.getByRole("button", { name: /Đánh dấu ảnh/ }).click();

  const editor = page.getByRole("dialog", { name: "Vẽ vào khu vực cần chúng tôi chú ý" });
  const canvas = editor.getByLabel("Vùng vẽ đánh dấu trên ảnh");
  await expect(editor).toBeVisible();
  await expect(canvas).toBeVisible();
  await expect(editor.getByRole("button", { name: "Đóng trình đánh dấu ảnh" })).toBeVisible();

  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.25);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.75, box.y + box.height * 0.55, { steps: 10 });
  await page.mouse.up();

  const saveButton = editor.getByRole("button", { name: "Lưu ảnh đã đánh dấu" });
  await expect(saveButton).toBeVisible();
  await expect(saveButton).toBeEnabled();
  await page.screenshot({
    path: ".verification/feedback-image-annotation-mobile.png",
    fullPage: false,
  });
  await saveButton.click();

  await expect(editor).toBeHidden();
  await expect(card.getByText("Đã đánh dấu", { exact: true })).toBeVisible();
});
