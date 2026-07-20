import { expect, test } from "@playwright/test";
import { signIn } from "./helpers";

test("content studio stays clear and usable on mobile", async ({ page }) => {
  await signIn(page, "content@demo.local", "/admin/content?namespace=auth");

  await expect(page.getByRole("heading", { name: "Chỉnh sửa câu chữ hiển thị", exact: true })).toBeVisible();
  await expect(page.getByText("Chọn nơi cần sửa câu chữ")).toBeVisible();
  await expect(page.getByLabel("Tìm câu chữ")).toBeVisible();
  await expect(page.getByLabel("Khu vực hiển thị")).toHaveValue("auth");

  const card = page.locator("article").first();
  await expect(card.getByText("Người dùng đang nhìn thấy")).toBeVisible();
  await expect(card.getByText(/auth\./)).toBeHidden();
  await card.getByText("Thông tin dành cho đội kỹ thuật").click();
  await expect(card.getByText(/auth\./)).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(hasHorizontalOverflow).toBe(false);
});
