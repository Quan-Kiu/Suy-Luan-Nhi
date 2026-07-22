import { expect, test } from "@playwright/test";

test("password visibility has a stable touch target on mobile", async ({ page }) => {
  await page.goto("/auth/sign-up");

  const password = page.getByLabel("Mật khẩu", { exact: true });
  const confirmation = page.getByLabel("Nhập lại mật khẩu", { exact: true });
  const firstToggle = page.getByRole("button", { name: "Hiện hoặc ẩn mật khẩu", exact: true });
  const box = await firstToggle.boundingBox();

  expect(box?.width).toBeGreaterThanOrEqual(44);
  expect(box?.height).toBeGreaterThanOrEqual(44);
  await expect(password).toHaveAttribute("autocomplete", "new-password");
  await expect(confirmation).toHaveAttribute("autocomplete", "new-password");

  await password.fill("StrongPass123!");
  await firstToggle.tap();
  await expect(password).toHaveAttribute("type", "text");
  await expect(password).toHaveValue("StrongPass123!");
  await expect(confirmation).toHaveAttribute("type", "password");
  await expect(firstToggle).toHaveAttribute("aria-pressed", "true");
});
