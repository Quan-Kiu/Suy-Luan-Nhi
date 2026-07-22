import { expect, test } from "@playwright/test";
import { apiData, signIn } from "./helpers";

test("parent chooses and changes a system-managed child avatar", async ({ page }) => {
  await signIn(page, "parent@demo.local");

  await page.goto("/onboarding");
  await page.getByLabel("Tên thân mật của bé").fill("Avatar E2E");
  await page.getByRole("radio", { name: "Bạn nhỏ thám tử đang đứng chào" }).check();
  await page.getByRole("button", { name: /Tạo hồ sơ và bắt đầu/i }).click();

  await expect(page).toHaveURL(/\/profiles$/);
  await expect(page.getByAltText("Avatar của Avatar E2E")).toHaveAttribute(
    "src",
    /mascot-detective-boy-standing/,
  );

  await page.getByLabel("Chỉnh sửa Avatar E2E").click();
  await page.getByRole("radio", { name: "Bạn nhím giơ ngón tay cổ vũ" }).check();
  await page.getByRole("button", { name: "Lưu thay đổi" }).click();

  await expect(page).toHaveURL(/\/profiles$/);
  await expect(page.getByAltText("Avatar của Avatar E2E")).toHaveAttribute(
    "src",
    /mascot-hedgehog-thumbs-up/,
  );

  const children = await apiData<
    Array<{ id: string; displayName: string; avatarUrl: string; avatarAssetId: string | null }>
  >(await page.request.get("/api/children"));
  const created = children.find((child) => child.displayName === "Avatar E2E");
  expect(created?.avatarAssetId).toBe("b071b5d0-1f48-4f1b-8b32-66537e17c003");
  expect(created?.avatarUrl).toBe("/assets/mascots/mascot-hedgehog-thumbs-up.png");

  await page.getByLabel("Xóa Avatar E2E").click();
  await page
    .getByRole("alertdialog", { name: "Xóa hồ sơ Avatar E2E?" })
    .getByRole("button", { name: "Chuyển sang chờ xóa" })
    .click();
  await expect(page.getByRole("heading", { name: "Avatar E2E" })).toHaveCount(0);
});
