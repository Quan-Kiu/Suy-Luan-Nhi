# ADR-0004: Local and S3-compatible media adapters

## Status

Accepted

## Context

The CMS must upload images and audio while development must remain self-contained. Storing binary media inside PostgreSQL would make backups and delivery unnecessarily expensive.

## Decision

Store media metadata in PostgreSQL and binary objects behind one storage interface. Use a filesystem adapter for development and isolated E2E/standalone verification, and an S3-compatible adapter for production. The adapter validates size, MIME type, generated key, and public URL before metadata is committed. Local objects are served through the Node.js route `/uploads/[...segments]`, which validates the configured prefix and rejects unsafe paths.

## Consequences

Production requires S3-compatible credentials and a CDN/public base URL. Local media is written below `public/uploads` and requires a writable runtime filesystem. Generated local URLs receive immutable cache headers and continue to work in a standalone Next.js artifact. Deleting metadata also deletes the stored object and records an audit event.
