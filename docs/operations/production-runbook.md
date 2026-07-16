# Production runbook

## Release sequence

1. Provision PostgreSQL 17, SMTP and S3-compatible object storage.
2. Copy `.env.production.example` to the secret manager and replace every placeholder.
3. Run `npm ci`, `npm run db:migrate`, then `npm run build` in the release job.
4. Deploy the standalone Next.js image only after migrations succeed.
5. Wait for `/api/health/live` and `/api/health/ready` to return HTTP 200.
6. Run the smoke path: parent sign-in → select child → complete a mission → unlock Parent Workspace.
7. Trigger `/api/cron/publish-scheduled` hourly with `Authorization: Bearer <CRON_SECRET>`.

Migrations are forward-only in production. Roll back application code only when the previous release is compatible with the migrated schema. Schema rollback requires an explicitly reviewed corrective migration.

## Required secrets

- `DATABASE_URL`
- `BETTER_AUTH_URL` set to the canonical public HTTPS origin
- `BETTER_AUTH_SECRET` with at least 32 random characters
- `BETTER_AUTH_TRUSTED_ORIGINS` for any additional approved admin origin
- SMTP credentials
- S3 credentials and public CDN base URL
- `CRON_SECRET`

Never store `.env.production`, database dumps, session tokens or uploaded child-facing media credentials in Git.

## Database backup and restore

Run a daily custom-format PostgreSQL backup:

```bash
DATABASE_URL=... BACKUP_DIR=/secure/backups ./scripts/backup-db.sh
```

Retain encrypted daily backups for at least 30 days and test restore monthly in a non-production environment:

```bash
DATABASE_URL=... ./scripts/restore-db.sh backups/sln-YYYYMMDDTHHMMSSZ.dump
```

## Health and incident checks

- Liveness: `GET /api/health/live`
- Readiness including DB: `GET /api/health/ready`
- Review recent admin activity at `/admin/audit`
- Review failed or pending content at `/admin/reviews`
- Review data requests at `/admin/data-requests`

During a database incident, keep the application out of rotation while readiness returns 503. Do not bypass migrations or point production at a developer database.

## Content release operations

- Content admin edits draft rows and submits an immutable version.
- Reviewer approves or rejects with a required comment.
- Reviewer can publish immediately or schedule a future release.
- The published Child App reads only the `published_version_id` snapshot.
- Uploaded media must be approved and not deleted before submission.
- Production uses `STORAGE_DRIVER=s3`; local storage is reserved for development and isolated verification.
- Local verification serves generated objects through `/uploads/[...segments]` and requires a writable `LOCAL_UPLOAD_DIR` below `public/uploads`.

## Privacy operations

- Parent exports are ownership-checked JSON downloads with `private, no-store` caching.
- Delete requests require super-admin processing and create audit records.
- Parent Gate is required for settings, progress reset, export and deletion APIs.
- Analytics events reject common direct-PII property names and never support advertising identifiers.
