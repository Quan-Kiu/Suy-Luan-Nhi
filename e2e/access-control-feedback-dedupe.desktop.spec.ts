import { expect, test } from "@playwright/test";
import { Pool } from "pg";
import { clearAuth, signIn } from "./helpers";

const baseURL = "http://127.0.0.1:3100";
const databaseUrl = process.env.E2E_DATABASE_URL ?? "postgresql://sln@127.0.0.1:54329/sln_e2e";
const pool = new Pool({ connectionString: databaseUrl });
const createdFeedbackPaths = new Set<string>();

async function restoreTargetParent() {
  await pool.query(
    `
      update "user"
      set
        "deleted_at" = null,
        "deleted_by" = null,
        "deletion_reason" = null,
        "deleted_previous_banned" = null,
        "deleted_previous_ban_reason" = null,
        "banned" = false,
        "ban_reason" = null,
        "ban_expires" = null,
        "updated_at" = now()
      where "email" = 'parent@demo.local'
    `,
  );
}

test.afterEach(async () => {
  await restoreTargetParent();
  await pool.query(`
    update "parent_profiles" profile
    set "privacy_settings" = jsonb_set(
      coalesce(profile."privacy_settings", '{}'::jsonb),
      '{errorReporting}',
      'false'::jsonb,
      true
    )
    from "user" account
    where profile."user_id" = account."id"
      and account."email" = 'parent@demo.local'
  `);
  if (createdFeedbackPaths.size) {
    await pool.query('delete from "system_feedback" where "page_path" = any($1::text[])', [
      [...createdFeedbackPaths],
    ]);
    createdFeedbackPaths.clear();
  }
});

test.afterAll(async () => {
  await pool.end();
});

test("super admin can inspect role routes, trash a parent, revoke sessions, and restore the account", async ({
  page,
  browser,
}) => {
  const parentContext = await browser.newContext({
    baseURL,
    extraHTTPHeaders: { origin: baseURL },
  });
  const parentPage = await parentContext.newPage();

  try {
    await signIn(parentPage, "parent@demo.local", "/profiles");
    await expect(parentPage).toHaveURL(/\/profiles$/);

    await signIn(page, "admin@demo.local", "/admin/access-control");
    await expect(page.getByRole("heading", { name: "Vai trò & thành viên", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Quản trị viên", exact: true })).toBeVisible();
    await expect(page.getByText("/api/admin/members/**", { exact: true })).toBeVisible();

    const parentTab = page.getByRole("tab", { name: /Phụ huynh/ });
    await parentTab.click();
    const parentPanel = page.getByRole("tabpanel", { name: /Phụ huynh/ });
    const parentRow = parentPanel.locator("tr", { hasText: "parent@demo.local" });
    await expect(parentRow).toBeVisible();
    await parentRow.getByRole("button", { name: "Đưa vào thùng rác" }).click();

    const confirmation = page.getByRole("alertdialog", { name: /Đưa Phụ huynh Demo vào thùng rác/ });
    await expect(confirmation).toBeVisible();
    await confirmation.getByRole("button", { name: "Đưa vào thùng rác" }).click();
    await expect(page.getByText(/Đã đưa tài khoản vào thùng rác/)).toBeVisible();

    await parentPage.goto("/profiles");
    await expect(parentPage).toHaveURL(/\/auth\/sign-in/);

    const trashTab = page.getByRole("tab", { name: /Thùng rác/ });
    await trashTab.click();
    const trashPanel = page.getByRole("tabpanel", { name: /Thùng rác/ });
    const trashCard = trashPanel.locator("article", { hasText: "parent@demo.local" });
    await expect(trashCard).toBeVisible();
    await trashCard.getByRole("button", { name: "Khôi phục" }).click();
    await expect(page.getByText("Đã khôi phục tài khoản", { exact: true })).toBeVisible();

    await signIn(parentPage, "parent@demo.local", "/profiles");
    await expect(parentPage).toHaveURL(/\/profiles$/);
  } finally {
    await parentContext.close();
  }
});

test("automatic reports with volatile request details aggregate into one feedback card", async ({ page }) => {
  const suffix = Date.now().toString(36);
  const pagePath = `/parent/settings/e2e-feedback-${suffix}`;
  const pageTitle = `Automatic dedupe ${suffix}`;
  createdFeedbackPaths.add(pagePath);

  await pool.query(
    `
      update "parent_profiles" profile
      set "privacy_settings" = jsonb_set(
        coalesce(profile."privacy_settings", '{}'::jsonb),
        '{errorReporting}',
        'true'::jsonb,
        true
      )
      from "user" account
      where profile."user_id" = account."id"
        and account."email" = 'parent@demo.local'
    `,
  );

  await signIn(page, "parent@demo.local", "/profiles");
  const baseReport = {
    source: "api_failure" as const,
    pagePath,
    pageTitle,
    error: {
      name: "ApiRequestError",
      message: "API PATCH /api/parent/settings thất bại",
      details: {
        method: "PATCH",
        path: "/api/parent/settings",
        status: 500,
        code: "SERVER_ERROR",
        requestId: "request-first",
      },
    },
    breadcrumbs: [],
    viewportWidth: 1440,
    viewportHeight: 900,
    devicePixelRatio: 1,
  };

  const firstResponse = await page.request.post("/api/error-reports", { data: baseReport });
  expect(firstResponse.status()).toBe(201);
  const firstBody = (await firstResponse.json()) as {
    data: { id: string; duplicate: boolean; occurrenceCount: number };
  };
  expect(firstBody.data).toMatchObject({ duplicate: false, occurrenceCount: 1 });

  const secondResponse = await page.request.post("/api/error-reports", {
    data: {
      ...baseReport,
      source: "unhandled_rejection",
      error: {
        ...baseReport.error,
        details: { ...baseReport.error.details, requestId: "request-second" },
      },
      breadcrumbs: [
        {
          timestamp: new Date().toISOString(),
          category: "interaction",
          action: "button.click",
          data: { element: "save-settings" },
        },
      ],
      viewportWidth: 390,
      viewportHeight: 844,
    },
  });
  expect(secondResponse.status()).toBe(200);
  const secondBody = (await secondResponse.json()) as {
    data: { id: string; duplicate: boolean; occurrenceCount: number };
  };
  expect(secondBody.data).toMatchObject({ duplicate: true, occurrenceCount: 2 });
  expect(secondBody.data.id).toBe(firstBody.data.id);

  const aggregate = await pool.query<{ rows: number; occurrences: number }>(
    `
      select count(*)::int as "rows", max("occurrence_count")::int as "occurrences"
      from "system_feedback"
      where "page_path" = $1
    `,
    [pagePath],
  );
  expect(aggregate.rows[0]).toEqual({ rows: 1, occurrences: 2 });

  await clearAuth(page);
  await signIn(page, "admin@demo.local", "/admin/feedback");
  const card = page.getByRole("article", { name: `Góp ý: ${pageTitle}` });
  await expect(card).toBeVisible();
  await expect(card.getByText("×2 lần", { exact: true })).toBeVisible();
});
