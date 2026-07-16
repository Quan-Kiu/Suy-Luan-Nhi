# ADR-0001: Local-first MVP with replaceable data adapters

## Status

Accepted

## Context

The supplied screenshots and SPEC require a complete interactive MVP, while production identity, database, and cloud decisions are intentionally unresolved.

## Decision

Build the first vertical slice with typed Zod domain schemas, route-handler adapters, TanStack Query hooks, and browser storage for durable demo progress. UI modules depend on domain interfaces rather than storage details.

## Consequences

The MVP is fully demonstrable without credentials. A PostgreSQL or hosted API adapter can replace the local adapter without rewriting screen modules or validation rules.
