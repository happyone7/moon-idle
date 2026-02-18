---
name: telemetry-analytics
description: Telemetry and analytics workflow for web games. Use for event taxonomy, KPI instrumentation, funnel analysis, retention checks, and balance-driven iteration loops.
---

# Telemetry Analytics

Use this skill to instrument and interpret gameplay data.

## Workflow

1. Define event taxonomy:
- Economy events.
- Progression milestones.
- Failure/stall events.
2. Define KPIs:
- Time to first upgrade.
- Time to first launch/prestige.
- Session length and return rate.
3. Instrument with schema version and session id.
4. Build simple funnels and drop-off reports.
5. Feed findings back into balance tuning.

## Rules

- Track only data needed for design decisions.
- Keep event names stable and documented.
- Tag breaking analytics changes with version bumps.
