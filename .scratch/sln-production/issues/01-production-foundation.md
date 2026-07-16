# 01 — Establish production identity and PostgreSQL foundation

**What to build:** operators can start PostgreSQL and Mailpit, migrate the complete auth/product schema, seed role accounts, and sign in through Better Auth with server-validated roles.

**Blocked by:** None — can start immediately.

**Status:** done

- [x] PostgreSQL migrations and environment validation work from a clean checkout.
- [x] Parent, content admin, reviewer, and super admin sessions are protected server-side.
- [x] Docker, health check, SMTP development path, and deterministic seed are documented.
