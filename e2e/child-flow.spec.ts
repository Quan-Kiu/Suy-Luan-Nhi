import { expect, test } from "@playwright/test";

test("parent creates a Child Profile and the child completes a mission", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("link", { name: /tạo hồ sơ cho bé/i })
    .first()
    .click();
  await page.getByLabel(/tên thân mật/i).fill("Bống");
  await page.getByText("4–5 tuổi", { exact: true }).click();
  await page.getByRole("button", { name: /bắt đầu chế độ bé/i }).click();
  await expect(page.getByRole("heading", { name: /chào mừng bạn quay lại/i })).toBeVisible();
  await page.getByRole("link", { name: /vào bản đồ nhiệm vụ/i }).click();
  await page.getByRole("link", { name: /thám tử quy luật/i }).click();
  await page.getByRole("link", { name: /bắt đầu nhiệm vụ/i }).click();
  await page.getByRole("button", { name: /ngôi sao/i }).click();
  await page.getByRole("button", { name: /kiểm tra đáp án/i }).click();
  await expect(page.getByText("Tuyệt vời!", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /hoàn thành nhiệm vụ/i }).click();
  await expect(page.getByRole("heading", { name: "Tuyệt vời!" })).toBeVisible();
  await page.goto("/parent");
  await page.getByLabel(/kết quả phép tính/i).fill("23");
  await page.getByRole("button", { name: /mở khu vực phụ huynh/i }).click();
  await expect(page.getByTestId("completed-missions")).toHaveText("1");
});

test("wrong answer gives a gentle retry path", async ({ page }) => {
  await page.goto("/play");
  await page.getByRole("button", { name: /mặt trăng/i }).click();
  await page.getByRole("button", { name: /kiểm tra đáp án/i }).click();
  await expect(page.getByText("Chưa trúng thôi!", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /thử lại/i }).click();
  await expect(page.getByText(/con thử nhìn ba hình đầu tiên/i)).toBeVisible();
});

test("parent data remains behind the Parent Gate", async ({ page }) => {
  await page.goto("/parent");
  await expect(page.getByRole("heading", { name: /khu vực phụ huynh/i })).toBeVisible();
  await page.getByLabel(/kết quả phép tính/i).fill("22");
  await page.getByRole("button", { name: /mở khu vực phụ huynh/i }).click();
  await expect(page.getByText(/chưa đúng/i)).toBeVisible();
  await page.getByLabel(/kết quả phép tính/i).fill("23");
  await page.getByRole("button", { name: /mở khu vực phụ huynh/i }).click();
  await expect(page.getByText(/tổng quan tuần này/i)).toBeVisible();
});

test("admin validation and review workflow are actionable", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile-chromium", "CMS acceptance reference is desktop-only");
  await page.goto("/admin/missions");
  const title = page.getByLabel("Tiêu đề");
  await title.click();
  await title.press("ControlOrMeta+A");
  await title.press("Backspace");
  await expect(title).toHaveValue("");
  await page.getByRole("button", { name: "Lưu bản nháp", exact: true }).click();
  await expect(page.getByText("Tiêu đề cần ít nhất 3 ký tự")).toBeVisible();
  await title.fill("Thám tử dấu chân mới");
  await expect(page.getByRole("button", { name: /gửi duyệt/i })).toBeEnabled();
  await page.getByRole("button", { name: /gửi duyệt/i }).click();
  await expect(page.getByText(/đã gửi nhiệm vụ để kiểm duyệt/i)).toBeVisible();
});
