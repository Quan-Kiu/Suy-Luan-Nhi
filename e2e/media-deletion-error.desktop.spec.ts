import { expect, test } from "@playwright/test";
import { signIn } from "./helpers";

test("media deletion failures stay visible inside the confirmation dialog", async ({ page }) => {
  await signIn(page, "content@demo.local", "/admin/media");
  const deleteCard = page
    .locator("article")
    .filter({ has: page.getByLabel("Xóa tệp") })
    .first();
  await expect(deleteCard).toBeVisible();

  await page.route("**/api/admin/media/*", async (route) => {
    if (route.request().method() !== "DELETE") {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({
        success: false,
        error: {
          code: "MEDIA_DELETE_FAILED",
          message: "Không thể xóa tệp do lỗi hệ thống. Hãy thử lại.",
        },
        meta: { requestId: "media-delete-e2e", timestamp: new Date().toISOString() },
      }),
    });
  });

  await deleteCard.getByLabel("Xóa tệp", { exact: true }).click();
  const dialog = page.getByRole("alertdialog", { name: "Xóa tệp này?" });
  await dialog.getByRole("button", { name: "Xóa tệp" }).click();

  const error = dialog.getByRole("alert");
  await expect(error).toContainText("Không thể xóa tệp do lỗi hệ thống");
  await expect(dialog.getByRole("button", { name: "Thử xóa lại" })).toBeVisible();
  expect(await error.evaluate((element) => element.closest('[role="alertdialog"]') !== null)).toBe(true);

  await dialog.getByRole("button", { name: "Hủy" }).click();
  await expect(dialog).toHaveCount(0);
  await deleteCard.getByLabel("Xóa tệp", { exact: true }).click();
  await expect(page.getByRole("alertdialog").getByRole("alert")).toHaveCount(0);
});
