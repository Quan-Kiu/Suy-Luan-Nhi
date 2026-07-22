import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const sourceRoot = path.join(process.cwd(), "src");
const sourceExtensions = new Set([".ts", ".tsx", ".css"]);
const tinyTailwindSize = /text-\[(?:[0-9]|1[01])px\]/g;
const tinyCssSize = /font-size:\s*(?:[0-9]|1[01])px\b/g;
const staticHeading = /<h[1-3]\b[^>]*className="([^"]*)"/g;
const semanticHeadingRole =
  /\btype-(?:display|page-title|marketing-title|section-title|child-page-title|child-section-title|card-title)\b/;

async function collectFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) return collectFiles(target);
      return sourceExtensions.has(path.extname(entry.name)) ? [target] : [];
    }),
  );
  return nested.flat();
}

async function main() {
  const violations: string[] = [];
  for (const file of await collectFiles(sourceRoot)) {
    const source = await readFile(file, "utf8");
    for (const pattern of [tinyTailwindSize, tinyCssSize]) {
      pattern.lastIndex = 0;
      for (const match of source.matchAll(pattern)) {
        const line = source.slice(0, match.index).split("\n").length;
        violations.push(`${path.relative(process.cwd(), file)}:${line} ${match[0]}`);
      }
    }

    if (path.extname(file) === ".tsx") {
      staticHeading.lastIndex = 0;
      for (const match of source.matchAll(staticHeading)) {
        if (semanticHeadingRole.test(match[1])) continue;
        const line = source.slice(0, match.index).split("\n").length;
        violations.push(
          `${path.relative(process.cwd(), file)}:${line} heading is missing a semantic typography role`,
        );
      }
    }
  }

  if (violations.length > 0) {
    console.error(
      "Typography audit failed. Fix unreadably small text or headings without a semantic role:\n" +
        violations.join("\n"),
    );
    process.exit(1);
  }

  console.log("Typography audit passed.");
}

void main();
