# Production stack research — 2026-07-16

## Sources reviewed

- Next.js 16 local documentation under `node_modules/next/dist/docs/`
- Better Auth 1.6 documentation: Next.js integration, email/password, admin access control, Drizzle adapter, rate limiting, sessions
- Drizzle ORM documentation: PostgreSQL setup and code-first migrations

## Decisions

1. **Authentication:** Better Auth with email/password, database sessions, email verification/reset hooks, and custom roles. Next.js recommends an authentication library for production security; Better Auth provides the Next.js 16 route handler and full server-side session validation.
2. **Authorization:** roles are `parent`, `content_admin`, `reviewer`, and `super_admin`. Every protected page and route validates the session on the server; proxy redirects are only an optimistic first layer.
3. **Database:** PostgreSQL with Drizzle ORM and checked-in SQL migrations. The same schema contains auth and product data so transactions can atomically update sessions, attempts, badges, activity summaries, review history, analytics, and audit logs.
4. **Rate limiting:** Better Auth's database-backed limiter protects login and reset endpoints. Parent Gate attempts are tracked in PostgreSQL with a temporary lock after repeated failures.
5. **Email:** SMTP adapter for verification and password reset. Development uses Mailpit; production can use any authenticated SMTP provider.
6. **Media:** a storage seam with local filesystem adapter in development and S3-compatible adapter in production. Metadata and alt text remain in PostgreSQL.
7. **Rendering:** one Child Renderer remains the shared interface for published gameplay and admin preview.
8. **Deployment:** Docker image, PostgreSQL health checks, migrations, seed command, environment validation, structured health endpoint, CI verification, and no production fallback to localStorage.

## Primary references

- https://nextjs.org/docs/app/guides/authentication
- https://nextjs.org/docs/app/guides/forms
- https://better-auth.com/docs/integrations/next
- https://better-auth.com/docs/authentication/email-password
- https://better-auth.com/docs/plugins/admin
- https://better-auth.com/docs/adapters/drizzle
- https://better-auth.com/docs/concepts/rate-limit
- https://orm.drizzle.team/docs/get-started-postgresql
- https://orm.drizzle.team/docs/drizzle-kit-generate
- https://orm.drizzle.team/docs/drizzle-kit-migrate
