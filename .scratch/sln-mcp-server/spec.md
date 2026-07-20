# SLN MCP Gateway

## Goal

Expose approved Suy Luận Nhí administration workflows through Model Context Protocol without bypassing domain validation, review rules, storage adapters, or audit logs.

## Transports

- Streamable HTTP at `/mcp` for remote clients and ChatGPT-compatible deployment.
- stdio for MCP Inspector and local clients.

## Authentication

- Bearer token for the first production-ready gateway.
- Configured actor email must resolve to an active content_admin or super_admin account.
- Authentication is isolated behind one adapter so OAuth can replace bearer tokens later.

## Initial tools

- `system_health`: database, storage and aggregate counts.
- `taxonomy_list`: worlds, skills, badges, age groups and supported categories.
- `mission_list`, `mission_get`, `mission_create_draft`, `mission_update_draft`.
- `resource_list`, `resource_get`, `resource_create`, `resource_update`.
- `media_list`, `media_upload` from HTTPS URL or base64 payload.

## Safety

- Read/write tool annotations are explicit.
- Write tools support `dryRun` where useful.
- Mission publication remains outside the gateway review boundary.
- Remote downloads block private/reserved hosts, cap redirects, timeout and bytes.
- Tool output omits secrets and storage keys.
