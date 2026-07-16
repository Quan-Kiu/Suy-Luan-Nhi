# ADR-0003: PostgreSQL, Drizzle, and Better Auth for production state

## Status

Accepted

## Context

The local-first MVP stores Child Profiles and progress in browser storage and exposes demonstration-only route handlers. Production requires cloud persistence, multi-device parent accounts, admin/reviewer identity, atomic gameplay updates, auditable publication, and server-side authorization.

## Decision

Use PostgreSQL as the system of record, Drizzle as the data interface and migration tool, and Better Auth for parent/admin identity and database sessions. Product modules receive a database adapter at a narrow seam and perform multi-table changes transactionally.

## Consequences

Production behavior no longer depends on browser storage. Local development requires Docker or a compatible PostgreSQL URL. Database migrations and seeds become part of deployment. Authentication schema upgrades must be coordinated with Better Auth and Drizzle migrations.
