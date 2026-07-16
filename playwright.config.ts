import { defineConfig, devices } from "@playwright/test";

const databaseUrl = process.env.E2E_DATABASE_URL ?? "postgresql://sln@127.0.0.1:54329/sln_e2e";
const baseURL = "http://127.0.0.1:3100";
const production = process.env.E2E_SERVER_MODE === "production";
const serverCommand = production
  ? "rm -rf .next/standalone/public .next/standalone/.next/static && cp -R public .next/standalone/public && mkdir -p .next/standalone/.next && cp -R .next/static .next/standalone/.next/static && cd .next/standalone && HOSTNAME=127.0.0.1 PORT=3100 node server.js"
  : "npm run dev -- --hostname 127.0.0.1 --port 3100";
const environment = [
  `DATABASE_URL='${databaseUrl}'`,
  `E2E_DATABASE_URL='${databaseUrl}'`,
  `BETTER_AUTH_URL='${baseURL}'`,
  "BETTER_AUTH_SECRET='e2e-only-secret-with-more-than-thirty-two-characters'",
  `AUTH_REQUIRE_EMAIL_VERIFICATION='${production ? "true" : "false"}'`,
  "AUTH_RATE_LIMIT_ENABLED='false'",
  "STORAGE_DRIVER='local'",
  "LOCAL_UPLOAD_DIR='public/uploads/e2e'",
  "PUBLIC_UPLOAD_BASE_URL='/uploads/e2e'",
].join(" ");

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  outputDir: "test-results",
  use: {
    baseURL,
    extraHTTPHeaders: { origin: baseURL },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: `${environment} npm run e2e:prepare && ${environment} sh -c '${serverCommand}'`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 180_000,
    stdout: "pipe",
    stderr: "pipe",
  },
  projects: [
    {
      name: "desktop-chromium",
      testMatch: /.*\.desktop\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chromium",
      testMatch: /.*\.mobile\.spec\.ts/,
      use: { ...devices["Pixel 7"] },
    },
  ],
});
