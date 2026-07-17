<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Agent skills

### Issue tracker

Work is tracked as local markdown under `.scratch/` so automated skills do not create remote issue noise. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the canonical labels `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repository. Read `CONTEXT.md` and relevant ADRs under `docs/adr/` before changing domain behaviour. See `docs/agents/domain.md`.

### Frontend architecture

Frontend work must follow the Axios, TanStack Query, React Hook Form, Content Registry, App Router layout, cache, and Motion conventions in `docs/engineering/frontend-architecture.md`.
