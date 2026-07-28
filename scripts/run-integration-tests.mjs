import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, relative } from "node:path";
import process from "node:process";

function collectIntegrationTests(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectIntegrationTests(path);
    return entry.isFile() && entry.name.endsWith(".integration.test.ts") ? [path] : [];
  });
}

const tests = collectIntegrationTests("src")
  .map((path) => relative(process.cwd(), path))
  .sort();
if (!tests.length) throw new Error("No integration tests were found");

for (const test of tests) {
  console.log(`\n=== Integration: ${test} ===`);
  const result = spawnSync(process.execPath, ["node_modules/vitest/vitest.mjs", "run", test], {
    stdio: "inherit",
    env: { ...process.env, RUN_DB_TESTS: "true" },
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
