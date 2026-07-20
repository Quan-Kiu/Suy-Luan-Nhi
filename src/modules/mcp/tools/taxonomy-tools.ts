import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { asc } from "drizzle-orm";
import { db } from "@/db/client";
import { ageGroups } from "@/db/schema";
import { mediaCategories, mediaCategoryLabels } from "@/domain/media";
import {
  parentResourceCategories,
  parentResourceCategoryLabels,
  parentResourceTypes,
  parentResourceTypeLabels,
} from "@/domain/parent-resources";
import { getAdminTaxonomy } from "@/modules/admin/mission-admin";
import { runTool } from "@/modules/mcp/result";

export function registerTaxonomyTools(server: McpServer) {
  server.registerTool(
    "taxonomy_list",
    {
      title: "List SLN taxonomy",
      description: "List mission worlds, skills, badges, age groups and supported resource/media categories.",
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    () =>
      runTool(async () => {
        const [taxonomy, ageGroupRows] = await Promise.all([
          getAdminTaxonomy(),
          db.select().from(ageGroups).orderBy(asc(ageGroups.sortOrder)),
        ]);
        return {
          ...taxonomy,
          ageGroups: ageGroupRows,
          resourceTypes: parentResourceTypes.map((value) => ({
            value,
            label: parentResourceTypeLabels[value],
          })),
          resourceCategories: parentResourceCategories.map((value) => ({
            value,
            label: parentResourceCategoryLabels[value],
          })),
          mediaCategories: mediaCategories.map((value) => ({
            value,
            label: mediaCategoryLabels[value],
          })),
        };
      }),
  );
}
