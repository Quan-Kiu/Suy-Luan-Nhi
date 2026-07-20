import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { user } from "@/db/schema";

const allowedRoles = new Set(["content_admin", "super_admin"]);

export type McpActor = {
  id: string;
  email: string;
  name: string;
  role: "content_admin" | "super_admin";
};

export async function resolveMcpActor(email: string): Promise<McpActor> {
  const actor = await db.query.user.findFirst({ where: eq(user.email, email) });
  if (!actor) throw new Error(`MCP actor not found: ${email}`);
  if (actor.banned) throw new Error(`MCP actor is banned: ${email}`);
  if (!allowedRoles.has(actor.role)) {
    throw new Error(`MCP actor must be content_admin or super_admin: ${email}`);
  }
  return {
    id: actor.id,
    email: actor.email,
    name: actor.name,
    role: actor.role as McpActor["role"],
  };
}
