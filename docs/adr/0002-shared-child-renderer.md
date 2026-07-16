# ADR-0002: Shared Child Renderer for gameplay and admin preview

## Status

Accepted

## Context

The SPEC requires admin preview to match published child mode.

## Decision

Question sequences, answer options, feedback, and mission metadata are rendered by shared child-facing modules. Admin preview composes those same modules inside a phone frame.

## Consequences

Preview drift is reduced and question-type additions have one rendering seam.
