# FPS/TPS Shooter Design Reference

## Genre Promise
Deliver competitive or cooperative shooting mastery through precision, map readability, weapon identity, and fair networking assumptions.

## Core Loop
1. Spawn with objective context.
2. Navigate lane and chokepoint structure.
3. Engage with weapon and utility choices.
4. Resolve fight through aiming, positioning, and timing.
5. Re-enter loop with tactical adaptation.

## Weapon Sandbox Design
- Define weapon role first, then tune stats.
- Maintain tradeoffs between recoil control, range, handling, and burst potential.
- Prevent one-weapon meta through role overlap management.

## Map Design Structure
- Lane readability and flanking opportunities.
- Chokepoint risk/reward calibration.
- Spawn safety and anti-trap logic.
- Objective placement for contested flow.

## Time-To-Kill Governance
- Low TTK emphasizes reaction and positioning.
- Higher TTK emphasizes tracking, utility, and team coordination.
- Pick target TTK based on intended skill expression.

## Network-Aware Planning
- Server authority is baseline for competitive integrity.
- Add lag compensation cautiously and transparently.
- Design hit feedback to reflect network truth, not client-only assumption.

## Anti-Cheat and Fairness Planning
- Define exploit surfaces by weapon and movement systems.
- Build reporting and replay-friendly observability requirements.
- Protect ranked integrity with clear enforcement policy.

## Deliverables
- Weapon role matrix.
- Map flow blueprint.
- TTK target sheet.
- Mode objective ruleset.
- Competitive integrity checklist.

## Practical Checklist
- Does each map support multiple viable tactical routes?
- Are weapons distinct in role but close in viability?
- Are network assumptions explicitly documented for design and engineering?

## References
- `resources/game_design_books/combat_system/Combat_System_Design_Guide.md`
- `resources/game_design_books/balance_economy/Game_Balance_Economy_Guide.md`
- `[Reference: game-development/multiplayer]`

