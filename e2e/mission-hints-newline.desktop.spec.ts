import { expect, test } from "@playwright/test";
import { signIn } from "./helpers";

test("mission hints accept Enter as a new hint line", async ({ page }) => {
  await signIn(page, "content@demo.local", "/admin/missions/new");

  const hints = page.locator("#question-0-hints");
  const firstHint = await hints.inputValue();
  const secondHint = "Nhìn vật liệu và khả năng dùng tiếp.";

  await hints.click();
  await hints.press("End");
  await hints.press("Enter");
  await hints.pressSequentially(secondHint);

  await expect(hints).toHaveValue(`${firstHint}\n${secondHint}`);
});
