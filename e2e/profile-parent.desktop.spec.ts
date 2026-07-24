import { expect, test } from "@playwright/test";
import { apiData, demoParentPin, getDemoChild, selectChild, signIn, unlockParentGate } from "./helpers";

test.describe.configure({ mode: "serial" });

test("parent moves a child profile to trash, restores it and deletes it permanently", async ({ page }) => {
  await signIn(page, "parent@demo.local");
  const demoChild = await getDemoChild(page);
  await selectChild(page, demoChild.id);

  await unlockParentGate(page);

  await page.goto("/profiles");
  await page.getByRole("link", { name: /Tạo thêm hồ sơ bé/i }).click();
  await expect(page).toHaveURL(/\/onboarding$/);
  await page.getByLabel("Tên thân mật của bé").fill("Q");
  await page.getByRole("button", { name: /Tạo hồ sơ và bắt đầu/i }).click();
  await expect(page.getByText("Tên hồ sơ của bé cần ít nhất 2 ký tự")).toBeVisible();
  await expect(page).toHaveURL(/\/onboarding$/);

  await page.getByLabel("Tên thân mật của bé").fill("Mít E2E");
  await page.getByText("6–8 tuổi", { exact: true }).click();
  await page.getByRole("button", { name: /Tạo hồ sơ và bắt đầu/i }).click();
  await expect(page).toHaveURL(/\/profiles$/);
  await expect(page.getByRole("heading", { name: "Mít E2E" })).toBeVisible();

  await page.getByLabel("Chỉnh sửa Mít E2E").click();
  await page.getByLabel("Tên thân mật").fill("Q");
  await page.getByRole("button", { name: "Lưu thay đổi" }).click();
  await expect(page.getByText("Tên hồ sơ của bé cần ít nhất 2 ký tự")).toBeVisible();
  await expect(page).toHaveURL(/\/profiles\/[^/]+\/edit$/);

  await page.getByLabel("Tên thân mật").fill("Mít Đã Sửa");
  await page.getByLabel("Nhóm tuổi").selectOption("6-8");
  await page.getByRole("button", { name: "Lưu thay đổi" }).click();
  await expect(page).toHaveURL(/\/profiles$/);
  await expect(page.getByRole("heading", { name: "Mít Đã Sửa" })).toBeVisible();

  await page.getByLabel("Xóa Mít Đã Sửa").click();
  await page
    .getByRole("alertdialog", { name: "Đưa hồ sơ Mít Đã Sửa vào thùng rác?" })
    .getByRole("button", { name: "Đưa vào thùng rác" })
    .click();
  await expect(page.getByRole("heading", { name: "Mít Đã Sửa" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Hồ sơ đã xóa/ })).toHaveAttribute("aria-expanded", "true");

  const deletedProfileDetails = page.getByText("Mít Đã Sửa", { exact: true }).locator("..");
  const deletedProfileActions = page
    .getByRole("button", { name: "Khôi phục hồ sơ Mít Đã Sửa" })
    .locator("..");
  const [detailsBox, actionsBox] = await Promise.all([
    deletedProfileDetails.boundingBox(),
    deletedProfileActions.boundingBox(),
  ]);
  if (!detailsBox || !actionsBox) throw new Error("Deleted profile layout is not measurable");
  expect(actionsBox.y).toBeGreaterThan(detailsBox.y + detailsBox.height);

  await page.getByRole("button", { name: "Khôi phục hồ sơ Mít Đã Sửa" }).click();
  await expect(page.getByRole("heading", { name: "Mít Đã Sửa" })).toBeVisible();

  await page.getByLabel("Xóa Mít Đã Sửa").click();
  await page
    .getByRole("alertdialog", { name: "Đưa hồ sơ Mít Đã Sửa vào thùng rác?" })
    .getByRole("button", { name: "Đưa vào thùng rác" })
    .click();
  await page.getByRole("button", { name: "Xóa vĩnh viễn hồ sơ Mít Đã Sửa" }).click();
  await page
    .getByRole("alertdialog", { name: "Xóa vĩnh viễn hồ sơ Mít Đã Sửa?" })
    .getByRole("button", { name: "Xóa vĩnh viễn", exact: true })
    .click();
  await expect(page.getByText("Mít Đã Sửa", { exact: true })).toHaveCount(0);

  const children = await apiData<Array<{ displayName: string }>>(await page.request.get("/api/children"));
  expect(children.some((child) => child.displayName === "Mít Đã Sửa")).toBe(false);
});

test("parent gate rejects a wrong PIN and exports family data", async ({ page }) => {
  await signIn(page, "parent@demo.local");
  const child = await getDemoChild(page);
  await selectChild(page, child.id);

  await page.goto("/parent");
  await page.getByRole("textbox", { name: "Mã PIN phụ huynh", exact: true }).fill("999998");
  await page.getByRole("button", { name: /Mở khu vực phụ huynh/i }).click();
  await expect(page.getByText("Mã PIN chưa đúng, ba/mẹ thử lại nhé.")).toBeVisible();
  await unlockParentGate(page);

  await page.goto("/parent/settings");
  await page.getByPlaceholder("PIN mới").fill(demoParentPin);
  await page.getByRole("button", { name: "Lưu cài đặt" }).click();
  await expect(page.getByText("Đã lưu cài đặt")).toBeVisible();
  await page.context().clearCookies({ name: "sln_parent_gate" });
  await page.goto("/parent");
  await expect(page.getByRole("textbox", { name: "Mã PIN phụ huynh", exact: true })).toHaveAttribute(
    "placeholder",
    /Nhập mã PIN/,
  );
  await page.getByRole("textbox", { name: "Mã PIN phụ huynh", exact: true }).fill(demoParentPin);
  await page.getByRole("button", { name: /Mở khu vực phụ huynh/i }).click();
  await expect(page.getByRole("heading", { name: /Tuần này của Bống/i })).toBeVisible();

  await page.goto("/parent/settings");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Tạo bản sao dữ liệu" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^suy-luan-nhi-export-.*\.json$/);
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  const exported = JSON.parse(Buffer.concat(chunks).toString("utf8")) as {
    parent: { displayName: string };
    children: Array<{ profile: { displayName: string } }>;
  };
  expect(exported.parent.displayName).toBeTruthy();
  expect(exported.children.some((item) => item.profile.displayName === "Bống")).toBe(true);
});

test("parent without a PIN creates the first profile and sees it immediately", async ({ page }) => {
  await page.setViewportSize({ width: 412, height: 915 });
  await page.goto("/auth/sign-in?callbackUrl=/profiles");
  await page.getByLabel("Email").fill("privacy@demo.local");
  await page.locator('input[name="password"]').fill("LocalDemo-2026!");
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();

  await expect(page).toHaveURL(/\/auth\/setup-pin\?next=%2Fprofiles/);
  await expect(page.getByRole("heading", { name: "Tạo mã PIN phụ huynh" })).toBeVisible();

  const pin = page.getByRole("textbox", { name: "Tạo mã PIN 6 chữ số", exact: true });
  const confirmation = page.getByRole("textbox", { name: "Nhập lại mã PIN", exact: true });
  await pin.fill("123456");
  await confirmation.fill("123456");
  await page.getByRole("button", { name: "Lưu mã PIN và tiếp tục" }).click();
  await expect(page.getByText("Hãy chọn mã PIN khó đoán hơn")).toBeVisible();

  await pin.fill("246813");
  await confirmation.fill("246813");
  await page.getByRole("button", { name: "Lưu mã PIN và tiếp tục" }).click();

  await expect(page).toHaveURL(/\/profiles$/);
  await expect(page.getByText("Bước 3/3 · Hồ sơ của bé")).toBeVisible();
  await page.getByRole("link", { name: "Tạo hồ sơ đầu tiên" }).click();
  await expect(page).toHaveURL(/\/onboarding$/);

  await page.getByLabel("Tên thân mật của bé").fill("Mít Đầu Tiên");
  await page.getByRole("button", { name: /Tạo hồ sơ và bắt đầu/i }).click();

  await expect(page).toHaveURL(/\/profiles$/);
  await expect(page.getByRole("heading", { name: "Mít Đầu Tiên" })).toBeVisible();
});
