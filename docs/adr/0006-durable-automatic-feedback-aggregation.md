# ADR-0006: Durable aggregation for automatic error feedback

## Status

Accepted

## Context

Automatic error reporting previously suppressed repeats only in one browser tab for fifteen seconds. Its client key included volatile request identifiers, and the server always inserted a new feedback row. Reloads, multiple tabs, network retries, and an Axios rejection later observed as an unhandled rejection could therefore create many cards for the same fault.

## Decision

Generate a stable server fingerprint from the page path and normalized error identity: name, message, digest, request method, request path, status, and code. Exclude volatile diagnostic context such as request ID, breadcrumbs, viewport, source hook, user agent, and release identifier. Use the fingerprint only as a grouping key, not as a security primitive.

Store one automatic feedback row per fingerprint with occurrence count, first-seen time, and last-seen time. Serialize writes with a PostgreSQL advisory transaction lock and enforce uniqueness with an index. Repeated reports refresh the latest diagnostic context, increment the counter, and move the aggregate according to its latest occurrence. Routine repeats do not create one audit row per occurrence; creation and reopening remain audited. A resolved or dismissed fault that returns after thirty minutes reopens as new. The board orders aggregates by last-seen time so a recurring fault returns to the top of its status column.

Keep a five-minute client suppression layer shared through local storage so multiple tabs avoid unnecessary requests. Store only a small hash and timestamp. Mark normalized API errors before rejecting so the unhandled-rejection listener does not report the same failure a second time.

Migration `0025_automatic_feedback_deduplication.sql` fingerprints and merges existing automatic-report duplicates while leaving manual feedback untouched. Duplicate occurrences update the aggregate without emitting one audit row per event; creation and reopening remain audited to avoid moving the same flood into the audit log.

## Consequences

The feedback board represents one actionable fault rather than one card per occurrence and shows frequency plus recency. New diagnostic samples remain available on the aggregate row, while historical per-occurrence payloads are intentionally not retained. Operators can prioritize recurring faults without clearing duplicate noise manually.

Changing fingerprint fields changes aggregation boundaries and must be coordinated between application code and migration/backfill logic. Hash collisions are possible in theory, but the fingerprint is not used for authentication, authorization, integrity, or secret handling.
