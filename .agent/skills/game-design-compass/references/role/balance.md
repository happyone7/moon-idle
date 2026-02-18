# Balance Design Reference

## Purpose
Use this document when planning numeric tuning, progression curves, economy health, and post-launch balancing cadence.

## Balance Domains
- Combat numbers: damage, survivability, time-to-kill.
- Progression pace: XP, gear, unlock cadence.
- Reward economy: faucet/sink equilibrium.
- Match fairness and role viability.
- Live patching and metric governance.

## Inputs Required
- Target session duration and completion time.
- Desired difficulty profile by player segment.
- Economy source/sink inventory.
- Historical telemetry or benchmark assumptions.

## Core Formulas
### DPS
`DPS = (Base Damage * Hit Chance * Crit Modifier) / Action Cycle Time`

### EHP
`EHP = HP * (1 + Mitigation Factor)`

### Practical TTK
`TTK = Target EHP / Attacker Effective DPS`

### Reward Velocity
`Reward Velocity = Currency Earned Per Minute - Currency Spent Per Minute`

## Balancing Workflow
1. Define target experience goals first.
- Fast lethality or sustained dueling.
- Steady growth or spikes of power.
2. Build a baseline model in spreadsheet form.
3. Simulate best-case, median, and worst-case player behavior.
4. Identify dominant strategies and dead options.
5. Adjust parameters in smallest meaningful increments.
6. Re-run simulation and verify with live playtests.

## Economy Design Rules
1. Every major source needs at least one meaningful sink.
2. Avoid early inflation by locking high-yield faucets behind mastery.
3. Prevent hard paywalls in F2P progression.
4. Keep premium convenience from invalidating skill expression.

## Patch Governance
- Patch frequency: establish stable cadence and emergency path.
- Patch notes: explain player-facing rationale and intended outcomes.
- Metric watchlist: churn, match length, conversion, retention, ARPDAU.
- Rollback trigger: define threshold before deployment.

## Deliverables
- Balance model spreadsheet.
- Parameter change log.
- Economy sink/source map.
- Patch risk checklist.
- A/B test plan and success criteria.

## Practical Checklist
- Do at least three viable strategies remain in each context?
- Does progression pace align with session reality?
- Is monetization pressure visible but not coercive?
- Are tuning deltas small enough to isolate effects?

## References
- `resources/game_design_books/balance_economy/Game_Balance_Economy_Guide.md`
- `resources/game_design_books/The_Art_of_Game_Design_Lenses_Summary.md`
- `[Reference: game-development/game-design]`

