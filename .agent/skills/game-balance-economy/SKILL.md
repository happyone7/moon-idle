---
name: game-balance-economy
description: Balance and economy workflow for idle/web games. Use for production curves, cost scaling, progression pacing, prestige tuning, and KPI-based rebalance loops.
---

# Game Balance Economy

Use this skill when tuning pacing and growth in idle loops.

## Workflow

1. Define target run time to first milestone (e.g., first rocket part).
2. Model resource gain and spend curves:
- Building cost curve (`base * growth^count`).
- Output multipliers and their compounding order.
3. Set progression anchors:
- Early, mid, late milestones.
- Time-to-launch target range.
4. Tune prestige:
- Retained power, reset friction, expected relaunch speed.
5. Validate with telemetry:
- Median time to key actions.
- Drop-off points and stall segments.

## Guardrails

- Avoid multiplicative stacking without hard caps.
- Keep each new upgrade visibly meaningful.
- Do not require hidden mechanics for progression.
