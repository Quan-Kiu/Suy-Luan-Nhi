# Published mission visibility

## Problem

A mission can be marked as published while remaining invisible in the child app when its Mission World has no `world_age_groups` rows. The current world admin form cannot configure age groups, and the publish workflow does not validate that the world can expose the mission to every intended age group.

## Root cause observed in production

- Mission `tram-phan-loai-gon-gang` is published.
- Its published snapshot targets `6-8` and `9-10`.
- World `biet-doi-khu-pho-xanh` is published but has no age-group associations.
- `getMissionMap()` inner-joins `world_age_groups`, so the world and all of its missions are filtered out.

## Acceptance criteria

- Admins must select at least one age group when creating or editing a world.
- World age groups are saved transactionally and returned to the admin UI.
- A mission cannot be published unless its world is published and supports every mission age group.
- Existing worlds missing age groups are backfilled from their missions.
- Production data is repaired and the affected mission appears for eligible children.
- Unit/integration and targeted browser coverage prevent recurrence.
