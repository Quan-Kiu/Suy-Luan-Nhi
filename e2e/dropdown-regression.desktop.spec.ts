import { expect, test } from "@playwright/test";
import { signIn } from "./helpers";

test("admin age label fields do not expose browser dropdown controls", async ({ page }) => {
  await signIn(page, "content@demo.local", "/admin/taxonomy");
  await page.goto("/admin/taxonomy");
  const fields = page.getByLabel("Tên nhóm tuổi");
  await expect(fields).toHaveCount(3);
  for (const field of await fields.all()) {
    await expect(field).toHaveAttribute("autocomplete", "off");
  }
});
