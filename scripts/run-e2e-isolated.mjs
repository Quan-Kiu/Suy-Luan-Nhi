import { readdirSync, rmSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const e2eDir = resolve(root, "e2e");
const playwrightCli = resolve(root, "node_modules/@playwright/test/cli.js");
const outputRoot = resolve(root, "test-results/isolated");

function collectSpecs(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? collectSpecs(path) : [path];
    })
    .filter((path) => /\.(desktop|mobile|ios)\.spec\.ts$/.test(path))
    .sort((left, right) => left.localeCompare(right));
}

function portablePath(path) {
  return path.split(sep).join("/");
}

function outputName(spec) {
  return portablePath(relative(e2eDir, spec))
    .replace(/\.spec\.ts$/, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-");
}

const requested = process.argv.slice(2);
const allSpecs = collectSpecs(e2eDir);
const specs = requested.length
  ? allSpecs.filter((spec) => requested.some((value) => portablePath(relative(root, spec)).includes(value)))
  : allSpecs;

if (!specs.length) {
  console.error("Không tìm thấy Playwright spec phù hợp để chạy.");
  process.exit(1);
}

rmSync(outputRoot, { recursive: true, force: true });

const maxAttempts = Math.max(1, Number.parseInt(process.env.E2E_SPEC_ATTEMPTS ?? "2", 10) || 2);
const failures = [];
for (const [index, spec] of specs.entries()) {
  const relativeSpec = portablePath(relative(root, spec));
  let lastFailure = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const outputDir = join(outputRoot, outputName(spec), `attempt-${attempt}`);
    const attemptLabel = maxAttempts > 1 ? ` (attempt ${attempt}/${maxAttempts})` : "";
    console.log(`\n[${index + 1}/${specs.length}] ${relativeSpec}${attemptLabel}`);

    const result = spawnSync(
      process.execPath,
      [playwrightCli, "test", relativeSpec, "--reporter=line", `--output=${outputDir}`],
      {
        cwd: root,
        env: process.env,
        stdio: "inherit",
      },
    );

    if (!result.error && result.status === 0) {
      lastFailure = null;
      break;
    }

    lastFailure =
      result.error?.message ??
      (result.signal ? `signal ${result.signal}` : `exit code ${result.status ?? "unknown"}`);
    if (attempt < maxAttempts) {
      console.warn(`Retrying ${relativeSpec} after ${lastFailure}.`);
    }
  }

  if (lastFailure) failures.push({ spec: relativeSpec, reason: lastFailure });
}

if (failures.length) {
  console.error(`\n${failures.length}/${specs.length} spec files failed:`);
  for (const failure of failures) console.error(`- ${failure.spec}: ${failure.reason}`);
  process.exit(1);
}

console.log(`\nAll ${specs.length} Playwright spec files passed in isolated environments.`);
