import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ageGroupCodes } from "@/domain/age-groups";
import { parentResourceCategories, parentResourceTypes } from "@/domain/parent-resources";
import {
  adminResourceSchema,
  createAdminResource,
  getAdminResource,
  listAdminResources,
  updateAdminResource,
} from "@/modules/admin/resource-admin";
import { assertMcpWritable, type SlnMcpContext } from "@/modules/mcp/context";
import { runTool } from "@/modules/mcp/result";

const listInput = {
  search: z.string().trim().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  resourceType: z.enum(parentResourceTypes).optional(),
  category: z.enum(parentResourceCategories).optional(),
  ageGroup: z.enum(ageGroupCodes).optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().min(5).max(50).default(10),
};

export function registerResourceTools(server: McpServer, context: SlnMcpContext) {
  server.registerTool(
    "resource_list",
    {
      title: "List parent resources",
      description: "Search and paginate parent articles, guides, activities and videos.",
      inputSchema: listInput,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    (input) => runTool(() => listAdminResources(input)),
  );
  server.registerTool(
    "resource_get",
    {
      title: "Get parent resource",
      description: "Get one parent resource by database ID.",
      inputSchema: { resourceId: z.string().uuid() },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    ({ resourceId }) =>
      runTool(async () => {
        const resource = await getAdminResource(resourceId);
        if (!resource) throw new Error("Resource not found");
        return resource;
      }),
  );

  server.registerTool(
    "resource_create",
    {
      title: "Create parent resource",
      description:
        "Validate or create a parent resource. Use dryRun before writing when content is newly generated.",
      inputSchema: { resource: adminResourceSchema, dryRun: z.boolean().default(false) },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    ({ resource, dryRun }) =>
      runTool(async () => {
        if (dryRun) return { valid: true, dryRun: true, resource };
        assertMcpWritable(context);
        return createAdminResource(resource, context.actor.id);
      }),
  );

  server.registerTool(
    "resource_update",
    {
      title: "Update parent resource",
      description:
        "Validate or replace one parent resource by ID. The current resource is returned when not found as an error.",
      inputSchema: {
        resourceId: z.string().uuid(),
        resource: adminResourceSchema,
        dryRun: z.boolean().default(false),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    ({ resourceId, resource, dryRun }) =>
      runTool(async () => {
        const current = await getAdminResource(resourceId);
        if (!current) throw new Error("Resource not found");
        if (dryRun) return { valid: true, dryRun: true, before: current, after: resource };
        assertMcpWritable(context);
        return updateAdminResource(resourceId, resource, context.actor.id);
      }),
  );
}
