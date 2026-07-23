import { expect, test } from "@playwright/test";
import sharp from "sharp";

async function createTestImage(label: string) {
  const svg = `
    <svg width="640" height="360" xmlns="http://www.w3.org/2000/svg">
      <rect width="640" height="360" fill="#fff8ec" />
      <rect x="80" y="80" width="480" height="200" rx="24" fill="#f6d4aa" />
      <text x="320" y="190" text-anchor="middle" font-size="40" font-family="sans-serif" fill="#6f3d20">${label}</text>
    </svg>
  `;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

test("feedback images can be added in separate selections and annotated", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 820 });
  await page.goto("/");
  await page.getByRole("button", { name: "Gửi góp ý về trang này" }).click();

  const input = page.getByLabel("Thêm ảnh từ máy");
  await expect(input).toBeEnabled({ timeout: 20_000 });

  await input.setInputFiles({
    name: "first-selection.png",
    mimeType: "image/png",
    buffer: await createTestImage("Ảnh thứ nhất"),
  });
  await expect(page.getByText("first-selection.png", { exact: true })).toBeVisible();

  await input.setInputFiles({
    name: "second-selection.png",
    mimeType: "image/png",
    buffer: await createTestImage("Ảnh thứ hai"),
  });
  await expect(page.getByText("first-selection.png", { exact: true })).toBeVisible();
  await expect(page.getByText("second-selection.png", { exact: true })).toBeVisible();

  const firstCard = page.locator('[data-feedback-file-name="first-selection.png"]');
  await firstCard.getByRole("button", { name: /Đánh dấu ảnh/ }).click();

  const editor = page.getByRole("dialog", { name: "Vẽ vào khu vực cần chúng tôi chú ý" });
  await expect(editor).toBeVisible();
  const canvas = editor.getByLabel("Vùng vẽ đánh dấu trên ảnh");
  await expect(canvas).toBeVisible();

  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;
  await page.mouse.move(box.x + box.width * 0.25, box.y + box.height * 0.3);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.65, { steps: 12 });
  await page.mouse.up();

  const saveButton = editor.getByRole("button", { name: "Lưu ảnh đã đánh dấu" });
  await expect(saveButton).toBeEnabled();
  await page.screenshot({
    path: ".verification/feedback-image-annotation-editor.png",
    fullPage: false,
  });
  await saveButton.click();

  await expect(editor).toBeHidden();
  await expect(firstCard.getByText("Đã đánh dấu", { exact: true })).toBeVisible();
  await page.screenshot({
    path: ".verification/feedback-multi-image-annotation.png",
    fullPage: false,
  });
});
