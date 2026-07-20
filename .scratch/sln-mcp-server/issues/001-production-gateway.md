# Production MCP gateway

Status: completed

## Acceptance criteria

- Streamable HTTP and stdio transports are available.
- Actor resolves to an active content_admin or super_admin.
- Read and write tools reuse existing domain services and Zod schemas.
- Write tools provide dry-run where appropriate.
- Remote upload blocks SSRF and enforces timeout and byte limits.
- Media output redacts internal storage fields.
- Bearer auth, rate limit, host validation and loopback-only tunnel mode are enforced.
- Unit tests, protocol smoke tests, real upload cleanup, lint, typecheck and production build pass.
