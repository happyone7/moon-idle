---
name: save-migration-localstorage
description: localStorage save schema migration workflow for web games. Use for versioned save formats, migration functions, corruption recovery, and backward compatibility.
---

# Save Migration localStorage

Use this skill whenever save structure changes.

## Workflow

1. Add explicit `saveVersion` to payload.
2. Write one-way migration chain:
- `v1 -> v2 -> v3` (no skip logic in each step).
3. Validate loaded shape before merge into runtime state.
4. On failure:
- Backup raw save.
- Reset to safe defaults.
- Notify player that recovery happened.
5. Keep migration tests for old fixtures.

## Rules

- Never mutate unknown fields destructively.
- Keep migration pure and deterministic.
- Log migration path used for diagnostics.
