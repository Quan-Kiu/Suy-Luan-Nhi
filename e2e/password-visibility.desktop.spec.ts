import { expect, test } from "@playwright/test";

test("password visibility works with pointer and keyboard on desktop", async ({ page }) => {
  await page.goto("/auth/sign-in");

  const password = page.getByLabel("Mật khẩu", { exact: true });
  const toggle = page.getByRole("button", { name: "Hiện hoặc ẩn mật khẩu" });
  await expect(password).toHaveAttribute("type", "password");
  await expect(password).toHaveAttribute("autocomplete", "current-password");

  await password.fill("StrongPass123!");
  await toggle.click();
  await expect(password).toHaveAttribute("type", "text");
  await expect(password).toHaveValue("StrongPass123!");
  await expect(password).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(page).toHaveURL(/\/auth\/sign-in$/);

  await password.press("Tab");
  await expect(toggle).toBeFocused();
  await toggle.press("Space");
  await expect(password).toHaveAttribute("type", "password");
  await expect(toggle).toBeFocused();
});
