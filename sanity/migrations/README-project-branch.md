# Project -> Branch Migration

## Goal
Migrate legacy `restaurants` documents into:
- `restaurant` (project-level shared data)
- `restaurantBranch` (branch-level data, including branch gallery)

## Commands
- Dry run (no writes):
  - `npm run migrate:projects:dry`
- Apply migration:
  - `npm run migrate:projects:apply`
- Reset all restaurant data (legacy + new):
  - dry run: `npm run reset:restaurants:dry`
  - apply: `npm run reset:restaurants:apply`

## Required env vars
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `SANITY_API_WRITE_TOKEN` (or `SANITY_API_TOKEN`) for `--apply`

## Notes
- Migration is idempotent via `createIfNotExists`.
- If a legacy document has no card image, it is skipped.
- Mapping rule:
  - one legacy `restaurants` doc => one `restaurantBranch`
  - `restaurant` project is reused by slug key (`restaurant-<slug>`)
- Map coordinates are stored as one field: `map.coordinates` (`longitude,latitude`)
- New frontend queries prefer new types and fallback to legacy type when needed.
