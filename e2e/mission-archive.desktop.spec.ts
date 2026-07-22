import { expect, test } from "@playwright/test";
import { signIn } from "./helpers";

test.describe.configure({ mode: "serial" });

test("content admin can archive, find, and safely restore a mission", async ({ page }) => {
  await signIn(page, "content@demo.local", "/admin/missions");

  const activeView = page.getByRole("button", { name: "Đang quản lý", exact: true });
  await expect(activeView).toHaveAttribute("aria-pressed", "true");

  const activeRow = page.locator("tbody tr").first();
  await expect(activeRow).toBeVisible();
  const missionTitle = (await activeRow.locator("strong").first().innerText()).trim();

  await activeRow.getByRole("button", { name: "Lưu trữ nhiệm vụ" }).click();
  const archiveDialog = page.getByRole("alertdialog", {
    name: "Chuyển nhiệm vụ vào Kho lưu trữ?",
  });
  await expect(archiveDialog).toContainText("ngừng hiển thị cho bé");
  await archiveDialog.getByRole("button", { name: "Lưu trữ nhiệm vụ", exact: true }).click();

  await expect(page.getByText("Đã chuyển nhiệm vụ vào Kho lưu trữ")).toBeVisible();
  await expect(page.locator("tbody tr").filter({ hasText: missionTitle })).toHaveCount(0);

  await page.getByRole("button", { name: "Kho lưu trữ", exact: true }).click();
  await expect(page).toHaveURL(/status=archived/);

  const archivedRow = page.locator("tbody tr").filter({ hasText: missionTitle });
  await expect(archivedRow).toBeVisible();
  await expect(archivedRow).toContainText("Đã lưu trữ");
  await expect(archivedRow).toContainText("Lưu trữ");
  await expect(archivedRow.getByRole("button", { name: "Lưu trữ nhiệm vụ" })).toHaveCount(0);

  await archivedRow.getByRole("button", { name: "Khôi phục nhiệm vụ" }).click();
  await expect(page.getByText("Đã khôi phục nhiệm vụ về Bản nháp")).toBeVisible();
  await expect(archivedRow).toHaveCount(0);

  await activeView.click();
  const restoredRow = page.locator("tbody tr").filter({ hasText: missionTitle });
  await expect(restoredRow).toBeVisible();
  await expect(restoredRow).toContainText("Bản nháp");
});
