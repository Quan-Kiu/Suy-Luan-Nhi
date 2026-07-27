import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const apiRoot = path.join(process.cwd(), "src", "app", "api");
const mutationPattern = /export\s+async\s+function\s+(POST|PATCH|PUT|DELETE)\b/g;
const invalidationPattern = /\b(?:revalidatePath|revalidateTag|updateTag|invalidate[A-Z]\w*)\s*\(/;

const intentionallyLocalMutations = new Map<string, string>([
  [
    "account/complete-temporary-password/route.ts",
    "Completes the active authentication flow, updates the current session-backed user state, and redirects without a cached read model.",
  ],
  [
    "admin/members/[userId]/password-reset/route.ts",
    "Member credentials are read dynamically; the admin workspace refreshes after temporary-password changes and email requests do not mutate a cached list.",
  ],
  [
    "admin/members/[userId]/pin-reset/route.ts",
    "Parent PIN state is read directly; changing the hash invalidates signed Parent Gate access and the admin workspace refreshes locally.",
  ],
  [
    "admin/data-requests/[requestId]/process/route.ts",
    "Processes a request and returns the updated row to the current admin workspace; no server-cached reader owns it.",
  ],
  [
    "admin/feedback/[feedbackId]/route.ts",
    "The feedback manager updates its TanStack Query cache; feedback is not exposed through a server cache.",
  ],
  [
    "admin/media/route.ts",
    "Media creation returns the created asset directly and media lists are not server cached.",
  ],
  [
    "admin/missions/[missionId]/autosave/route.ts",
    "Autosave returns the updated draft version directly to the active editor; published mission caches are unchanged.",
  ],
  [
    "children/[childId]/select/route.ts",
    "Selection changes a cookie and the active-child provider is updated from the mutation result.",
  ],
  [
    "error-reports/route.ts",
    "Automatic error reports are append-only telemetry submissions and do not affect a server-cached application read model.",
  ],
  [
    "feedback/route.ts",
    "Feedback submission returns success directly and does not affect a cached read model.",
  ],
  [
    "parent/delete-data-request/route.ts",
    "Creates a one-off privacy request and does not affect a cached parent read model.",
  ],
  ["parent/export-data/route.ts", "Creates a one-off export and returns its download data directly."],
  [
    "parent/pin/reset-request/route.ts",
    "Creates a one-time verification token and sends email; no server-cached reader owns reset requests.",
  ],
  [
    "parent/pin/reset/route.ts",
    "PIN state is read directly and changing the hash invalidates existing signed parent-gate cookies.",
  ],
  [
    "parent/pin/route.ts",
    "PIN setup is read directly and the response immediately grants the signed parent-gate cookie.",
  ],
  [
    "parent/settings/route.ts",
    "Settings are read dynamically; the form refreshes and crossing into child routes remounts the child layout.",
  ],
  [
    "parent/unlock/route.ts",
    "Unlock changes the signed parent-gate cookie rather than a cached database read.",
  ],
  [
    "sessions/[sessionId]/questions/[questionId]/answer/route.ts",
    "Answer state is returned to the active session player and persisted session summaries invalidate on completion.",
  ],
  [
    "sessions/[sessionId]/questions/[questionId]/hint/route.ts",
    "Hint state is returned to the active session player and persisted summaries invalidate on completion.",
  ],
]);

async function routeFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return routeFiles(entryPath);
      return entry.isFile() && entry.name === "route.ts" ? [entryPath] : [];
    }),
  );
  return nested.flat();
}

async function main() {
  const routes = await routeFiles(apiRoot);
  const mutationRoutes: Array<{ relativePath: string; methods: string[]; invalidates: boolean }> = [];

  for (const route of routes) {
    const source = await readFile(route, "utf8");
    const methods = [...source.matchAll(mutationPattern)].map((match) => match[1]);
    if (!methods.length) continue;
    mutationRoutes.push({
      relativePath: path.relative(apiRoot, route).split(path.sep).join("/"),
      methods,
      invalidates: invalidationPattern.test(source),
    });
  }

  const missingOwnership = mutationRoutes.filter(
    (route) => !route.invalidates && !intentionallyLocalMutations.has(route.relativePath),
  );
  const staleAllowlist = [...intentionallyLocalMutations.keys()].filter(
    (relativePath) =>
      !mutationRoutes.some((route) => route.relativePath === relativePath && !route.invalidates),
  );

  console.log(
    `Mutation routes: ${mutationRoutes.length}; explicit invalidation: ${mutationRoutes.filter((route) => route.invalidates).length}; intentionally local: ${mutationRoutes.filter((route) => intentionallyLocalMutations.has(route.relativePath)).length}.`,
  );

  if (missingOwnership.length) {
    console.error("Mutation routes without cache ownership:");
    for (const route of missingOwnership) {
      console.error(`- ${route.methods.join(",")} ${route.relativePath}`);
    }
  }

  if (staleAllowlist.length) {
    console.error("Stale data-consistency allowlist entries:");
    for (const relativePath of staleAllowlist) console.error(`- ${relativePath}`);
  }

  if (missingOwnership.length || staleAllowlist.length) process.exitCode = 1;
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
