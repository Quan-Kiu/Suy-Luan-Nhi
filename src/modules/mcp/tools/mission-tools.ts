import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  createAdminMission,
  getAdminMission,
  listAdminMissions,
  updateAdminMission,
} from "@/modules/admin/mission-admin";
import { adminMissionDraftSchema } from "@/modules/admin/schemas";
import { assertMcpWritable, type SlnMcpContext } from "@/modules/mcp/context";
import { runTool } from "@/modules/mcp/result";

const statusSchema = z.enum(["draft", "in_review", "rejected", "approved", "published", "archived"]);

export function registerMissionTools(server: McpServer, context: SlnMcpContext) {
  server.registerTool(
    "mission_list",
    {
      title: "List missions",
      description: "Search and paginate mission drafts and published missions.",
      inputSchema: {
        status: statusSchema.optional(),
        worldId: z.string().uuid().optional(),
        search: z.string().trim().optional(),
        page: z.number().int().positive().default(1),
        pageSize: z.number().int().min(5).max(50).default(10),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    (input) => runTool(() => listAdminMissions(input)),
  );
  server.registerTool(
    "mission_get",
    {
      title: "Get mission draft",
      description: "Get one mission, its editable draft, versions and review history.",
      inputSchema: { missionId: z.string().uuid() },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    ({ missionId }) =>
      runTool(async () => {
        const mission = await getAdminMission(missionId);
        if (!mission) throw new Error("Mission not found");
        return mission;
      }),
  );

  server.registerTool(
    "mission_create_draft",
    {
      title: "Create mission draft",
      description: "Validate or create a mission draft. This tool never submits, approves or publishes it.",
      inputSchema: { draft: adminMissionDraftSchema, dryRun: z.boolean().default(false) },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    ({ draft, dryRun }) =>
      runTool(async () => {
        if (dryRun) return { valid: true, dryRun: true, draft };
        assertMcpWritable(context);
        return createAdminMission(draft, context.actor.id);
      }),
  );

  server.registerTool(
    "mission_update_draft",
    {
      title: "Update mission draft",
      description:
        "Validate or replace an editable mission draft. Published content returns to draft through existing domain rules.",
      inputSchema: {
        missionId: z.string().uuid(),
        draft: adminMissionDraftSchema,
        dryRun: z.boolean().default(false),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    ({ missionId, draft, dryRun }) =>
      runTool(async () => {
        const current = await getAdminMission(missionId);
        if (!current) throw new Error("Mission not found");
        if (dryRun) return { valid: true, dryRun: true, before: current.draft, after: draft };
        assertMcpWritable(context);
        return updateAdminMission(missionId, draft, context.actor.id);
      }),
  );
}
