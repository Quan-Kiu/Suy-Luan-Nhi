import { expect, test, type Locator } from "@playwright/test";
import sharp from "sharp";
import { clearAuth, getDemoChild, selectChild, signIn, unlockParentGate } from "./helpers";

async function expectTouchTarget(locator: Locator, minimum = 44) {
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThanOrEqual(minimum);
  expect(box!.height).toBeGreaterThanOrEqual(minimum);
}

async function createTestImage() {
  return sharp({
    create: {
      width: 160,
      height: 120,
      channels: 4,
      background: { r: 246, g: 212, b: 170, alpha: 1 },
    },
  })
    .png()
    .toBuffer();
}

test("auth recovery and account links have reliable mobile touch targets", async ({ page }) => {
  await page.goto("/auth/sign-in");
  await expectTouchTarget(page.getByRole("link", { name: "Quên mật khẩu?" }));
  await expectTouchTarget(page.getByRole("link", { name: "Tạo tài khoản" }));

  await page.goto("/auth/sign-up");
  await expectTouchTarget(page.getByRole("link", { name: "Đăng nhập", exact: true }));
});

test("parent and gameplay secondary actions remain easy to tap", async ({ page }) => {
  await signIn(page, "parent@demo.local");
  const child = await getDemoChild(page);
  await selectChild(page, child.id);

  await page.goto("/parent");
  await expectTouchTarget(page.getByRole("link", { name: "Quên mã PIN?" }));

  await page.goto("/missions");
  const missionHref = await page.locator('a[href^="/missions/"]').first().getAttribute("href");
  expect(missionHref).toBeTruthy();
  await page.goto(missionHref!);
  await page.getByRole("button", { name: /Bắt đầu chơi/i }).click();
  await page.waitForURL(/\/play\//);
  await expectTouchTarget(page.getByRole("button", { name: "Dừng và lưu tiến độ" }));

  await unlockParentGate(page);
  await page.goto("/parent");
  const bottomNavLinks = page.locator("nav.safe-area-bottom-nav a");
  await expect(bottomNavLinks).toHaveCount(5);
  for (let index = 0; index < 5; index += 1) {
    await expectTouchTarget(bottomNavLinks.nth(index));
  }
});

test("admin media and mission editor actions meet mobile target sizing", async ({ page }) => {
  await clearAuth(page);
  await signIn(page, "admin@demo.local", "/admin/media");

  for (const name of ["Sao chép liên kết", "Đánh dấu phù hợp", "Đánh dấu cần thay", "Xóa tệp"]) {
    await expectTouchTarget(page.getByRole("button", { name }).first());
  }

  await page.goto("/admin/missions/new");
  await expectTouchTarget(page.getByRole("button", { name: "Chèn biến" }).first());
});

test("feedback attachment actions meet mobile target sizing", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Gửi góp ý về trang này" }).click();

  const input = page.getByLabel("Thêm ảnh từ máy");
  await expect(input).toBeEnabled({ timeout: 20_000 });
  await input.setInputFiles({
    name: "touch-target.png",
    mimeType: "image/png",
    buffer: await createTestImage(),
  });

  const card = page.locator('[data-feedback-file-name="touch-target.png"]');
  await expect(card).toBeVisible();
  await expectTouchTarget(card.getByRole("button", { name: /Đánh dấu ảnh/ }));
  await expectTouchTarget(card.getByRole("button", { name: /Bỏ ảnh đính kèm/ }));
});
