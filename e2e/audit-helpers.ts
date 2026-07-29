import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { expect, type Page, type TestInfo } from "@playwright/test";
import axe from "axe-core";

const auditRunId = process.env.UI_AUDIT_RUN_ID?.trim() || new Date().toISOString().slice(0, 10);
const evidenceRoot = path.join(process.cwd(), ".verification", `uiux-audit-${auditRunId}`, "screenshots");
const visualEvidenceStyles = `
  nextjs-portal { display: none !important; }
  html { scroll-behavior: auto !important; }
  *, *::before, *::after {
    animation-delay: 0s !important;
    animation-duration: 0.01s !important;
    caret-color: transparent !important;
    transition-delay: 0s !important;
    transition-duration: 0.01s !important;
  }
`;

export async function applyVisualEvidenceStyles(page: Page) {
  await page.addStyleTag({ content: visualEvidenceStyles }).catch(() => undefined);
}

function evidenceSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

type AuditOptions = {
  screenshot?: boolean;
  waitForNetworkIdle?: boolean;
};

async function preparePageForScreenshot(page: Page) {
  await applyVisualEvidenceStyles(page);
  const viewport = page.viewportSize();
  if (!viewport) return;

  const documentHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const maxScrollY = Math.max(0, documentHeight - viewport.height);
  const scrollStep = Math.max(360, Math.floor(viewport.height * 0.75));

  for (let y = 0; y <= maxScrollY; y += scrollStep) {
    await page.evaluate((scrollY) => window.scrollTo({ top: scrollY, behavior: "instant" }), y);
    await page.waitForTimeout(40);
  }
  if (maxScrollY > 0) {
    await page.evaluate((scrollY) => window.scrollTo({ top: scrollY, behavior: "instant" }), maxScrollY);
    await page.waitForTimeout(60);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(100);
}

export async function auditRoute(
  page: Page,
  testInfo: TestInfo,
  route: string,
  name: string,
  options: AuditOptions = {},
) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const serverErrors: string[] = [];
  const failedRequests: string[] = [];
  const startedAt = Date.now();

  const onConsole = (message: { type(): string; text(): string }) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  };
  const onPageError = (error: Error) => pageErrors.push(error.message);
  const onResponse = (response: { status(): number; url(): string }) => {
    if (response.status() >= 500) serverErrors.push(`${response.status()} ${response.url()}`);
  };
  const onRequestFailed = (request: { url(): string; failure(): { errorText: string } | null }) => {
    const errorText = request.failure()?.errorText ?? "failed";
    if (errorText === "net::ERR_ABORTED") return;
    failedRequests.push(`${errorText} ${request.url()}`);
  };

  page.on("console", onConsole);
  page.on("pageerror", onPageError);
  page.on("response", onResponse);
  page.on("requestfailed", onRequestFailed);

  const response = await page.goto(route, { waitUntil: "domcontentloaded" });
  expect(response, `No navigation response for ${route}`).not.toBeNull();
  expect(response!.status(), `Unexpected status for ${route}`).toBeLessThan(500);
  if (options.waitForNetworkIdle !== false) {
    await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => undefined);
  }

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(overflow, `Horizontal overflow on ${route}`).toBe(false);

  await page.addScriptTag({ content: axe.source });
  const axeResults = await page.evaluate(async () => {
    const runner = (
      window as typeof window & {
        axe: {
          run: (
            context?: unknown,
            options?: unknown,
          ) => Promise<{
            violations: Array<{
              id: string;
              impact: string | null;
              help: string;
              nodes: Array<{
                target: string[];
                html: string;
                failureSummary?: string;
              }>;
            }>;
          }>;
        };
      }
    ).axe;
    return runner.run(document, {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
      },
      rules: { "color-contrast": { enabled: true } },
    });
  });
  const blockingViolations = axeResults.violations.filter(
    (violation) => violation.impact === "critical" || violation.impact === "serious",
  );

  await mkdir(evidenceRoot, { recursive: true });
  let screenshotMode: "full-page" | "viewport" | "failed" | "skipped" = "skipped";
  let documentHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  if (options.screenshot !== false) {
    await preparePageForScreenshot(page);
    documentHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const screenshotPath = path.join(evidenceRoot, `${evidenceSlug(name)}.png`);
    try {
      const fullPage = documentHeight <= 10_000;
      await page.screenshot({ path: screenshotPath, fullPage });
      screenshotMode = fullPage ? "full-page" : "viewport";
    } catch {
      try {
        await page.screenshot({ path: screenshotPath, fullPage: false });
        screenshotMode = "viewport";
      } catch {
        screenshotMode = "failed";
      }
    }
  }

  const evidence = {
    route,
    url: page.url(),
    viewport: page.viewportSize(),
    documentHeight,
    durationMs: Date.now() - startedAt,
    screenshotMode,
    consoleErrors,
    pageErrors,
    serverErrors,
    failedRequests,
    blockingViolations,
  };
  const evidenceJson = JSON.stringify(evidence, null, 2);
  await writeFile(path.join(evidenceRoot, `${evidenceSlug(name)}.json`), evidenceJson);
  await testInfo.attach(`${name}-audit.json`, {
    body: Buffer.from(evidenceJson),
    contentType: "application/json",
  });

  page.off("console", onConsole);
  page.off("pageerror", onPageError);
  page.off("response", onResponse);
  page.off("requestfailed", onRequestFailed);

  expect(consoleErrors, `Console errors on ${route}`).toEqual([]);
  expect(pageErrors, `Page errors on ${route}`).toEqual([]);
  expect(serverErrors, `Server errors on ${route}`).toEqual([]);
  expect(failedRequests, `Failed requests on ${route}`).toEqual([]);
  expect(
    blockingViolations.map(({ id, impact, help, nodes }) => ({
      id,
      impact,
      help,
      nodes: nodes.map(({ target, html, failureSummary }) => ({ target, html, failureSummary })),
    })),
    `Serious accessibility violations on ${route}`,
  ).toEqual([]);
}
