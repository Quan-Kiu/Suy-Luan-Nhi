# API surface

All mutation endpoints require same-origin browser requests unless explicitly documented as a cron endpoint. Parent and admin APIs return JSON errors with an HTTP status that distinguishes authentication, authorization, validation, conflict and not-found conditions.

## Family and child

- `GET/POST /api/children`
- `GET/PATCH/DELETE /api/children/:childId`
- `POST /api/children/:childId/select`
- `POST /api/children/:childId/reset-progress`
- `GET /api/children/:childId/mission-map`

## Gameplay

- `POST /api/children/:childId/missions/:missionId/start`
- `GET /api/sessions/:sessionId`
- `POST /api/sessions/:sessionId/questions/:questionId/hint`
- `POST /api/sessions/:sessionId/questions/:questionId/answer`
- `POST /api/sessions/:sessionId/complete`
- `POST /api/sessions/:sessionId/exit`

Answer submissions require an idempotency key. Mission completion is safe to retry.

## Parent

- `POST /api/parent/unlock`
- `PATCH /api/parent/settings`
- `POST/GET /api/parent/export-data...`
- `POST /api/parent/delete-data-request`
- `POST /api/parent/notifications/:id/read`

Sensitive endpoints require both an authenticated parent session and a valid Parent Gate cookie.

## Content operations

- Mission draft CRUD, duplicate, archive and submit routes under `/api/admin/missions`
- Review decisions and publish/schedule routes under mission version paths
- Media upload/review/delete under `/api/admin/media`
- Worlds, skills, age groups, members and system settings under `/api/admin`
- Scheduled publisher: `POST /api/cron/publish-scheduled` with Bearer `CRON_SECRET`
