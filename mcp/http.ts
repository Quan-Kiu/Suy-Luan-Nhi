import { randomUUID } from "node:crypto";
import express, { type NextFunction, type Request, type Response } from "express";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { pool } from "@/db/client";
import { resolveMcpActor } from "@/modules/mcp/actor";
import { bearerTokenMiddleware, corsMiddleware, rateLimitMiddleware } from "@/modules/mcp/auth";
import { getMcpHttpConfig } from "@/modules/mcp/config";
import { createSlnMcpServer } from "@/modules/mcp/server";

async function main() {
  const config = getMcpHttpConfig();
  const actor = await resolveMcpActor(config.MCP_ACTOR_EMAIL);
  const app = createMcpExpressApp({
    host: config.MCP_HOST,
    allowedHosts: config.MCP_ALLOWED_HOSTS,
  });
  app.use(express.json({ limit: "1mb" }));
  app.use(corsMiddleware(config.MCP_CORS_ORIGINS));
  app.use(rateLimitMiddleware(config.MCP_RATE_LIMIT_PER_MINUTE));

  const authenticate =
    config.MCP_AUTH_MODE === "token"
      ? bearerTokenMiddleware(config.MCP_API_TOKEN)
      : (_request: Request, _response: Response, next: NextFunction) => next();
  type SessionEntry = {
    transport: StreamableHTTPServerTransport;
    server: ReturnType<typeof createSlnMcpServer>;
  };
  const sessions = new Map<string, SessionEntry>();

  function sessionId(request: Request) {
    const value = request.header("mcp-session-id");
    return typeof value === "string" ? value : undefined;
  }

  async function handlePost(request: Request, response: Response) {
    try {
      const id = sessionId(request);
      const existing = id ? sessions.get(id) : undefined;
      if (existing) {
        await existing.transport.handleRequest(request, response, request.body);
        return;
      }
      if (id || !isInitializeRequest(request.body)) {
        response.status(400).json({
          jsonrpc: "2.0",
          error: { code: -32000, message: "Invalid or missing MCP session" },
          id: null,
        });
        return;
      }

      let createdSessionId: string | undefined;
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (createdId) => {
          createdSessionId = createdId;
        },
      });
      const server = createSlnMcpServer({ actor, config });
      const entry: SessionEntry = { transport, server };
      transport.onclose = () => {
        const closedId = transport.sessionId;
        if (closedId) sessions.delete(closedId);
      };
      await server.connect(transport);
      await transport.handleRequest(request, response, request.body);
      if (createdSessionId) sessions.set(createdSessionId, entry);
    } catch (error) {
      console.error("[sln-mcp] HTTP request failed", error);
      if (!response.headersSent) {
        response.status(500).json({
          jsonrpc: "2.0",
          error: { code: -32603, message: "Internal MCP server error" },
          id: null,
        });
      }
    }
  }

  async function handleSessionRequest(request: Request, response: Response) {
    const id = sessionId(request);
    const entry = id ? sessions.get(id) : undefined;
    if (!entry) {
      response.status(404).send("Unknown MCP session");
      return;
    }
    await entry.transport.handleRequest(request, response);
  }

  app.get("/healthz", (_request, response) => {
    response.json({ status: "ok", service: "sln-gpt-mcp", timestamp: new Date().toISOString() });
  });
  app.post("/mcp", authenticate, handlePost);
  app.get("/mcp", authenticate, handleSessionRequest);
  app.delete("/mcp", authenticate, handleSessionRequest);

  const httpServer = app.listen(config.MCP_PORT, config.MCP_HOST, () => {
    console.error(
      `[sln-mcp] listening at http://${config.MCP_HOST}:${config.MCP_PORT}/mcp as ${actor.email}`,
    );
  });
  httpServer.on("error", (error) => {
    console.error("[sln-mcp] failed to listen", error);
    process.exitCode = 1;
  });

  async function shutdown(signal: string) {
    console.error(`[sln-mcp] shutting down after ${signal}`);
    httpServer.close();
    for (const entry of sessions.values()) await entry.server.close().catch(() => undefined);
    sessions.clear();
    await pool.end();
    process.exit(0);
  }

  process.once("SIGINT", () => void shutdown("SIGINT"));
  process.once("SIGTERM", () => void shutdown("SIGTERM"));
}

void main().catch((error) => {
  console.error("[sln-mcp] startup failed", error);
  process.exit(1);
});
