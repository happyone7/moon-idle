# System Design Reference

## Purpose
Use this document when defining gameplay systems, interaction logic, progression loops, and AI behavior architecture.

## System Design Scope
- Core loop architecture.
- Input to feedback pipeline.
- State models and transitions.
- Rule consistency and exception handling.
- AI behavior planning at design level.

## Inputs Required
- Target game fantasy and role of the system.
- Primary player actions and failure states.
- Session length and pacing target.
- Platform input constraints.
- Telemetry events available for validation.

## Workflow
1. Write the 30-second loop.
- If a new player cannot understand value in 30 seconds, simplify.
2. Expand to 5-minute mastery loop.
- Add risk-reward and meaningful choice, not only more buttons.
3. Define state transitions.
- Idle, intent, execution, cooldown, recovery, interrupt.
4. Define edge-case policy.
- Disconnections, invalid inputs, exploit prevention, rollback behavior.
5. Define observability.
- Add event hooks for each major transition and fail state.

## State Architecture Selection
### FSM
Use when behavior states are finite and explicit.
Best for enemies with readable telegraphs and predictable counters.

### Behavior Tree
Use when modular decision composition is needed.
Best for layered enemy logic with reusable conditions/actions.

### GOAP
Use when dynamic objective solving is important.
Best for sandbox or emergent encounters.

### Utility AI
Use when decisions must scale by weighted context.
Best for systems balancing many conflicting priorities.

## Combat and System Integration Rules
1. Separate intent from execution windows.
2. Keep telegraph readability higher than reaction demand.
3. Tune interrupts and invulnerability windows intentionally.
4. Align animation timing with hit validation timing.

## Formula Design Principles
- Start with simple formulas and add modifiers only when needed.
- Prevent infinite scaling using diminishing returns.
- Keep early game progression linear in perception even if formulas are exponential.
- Prefer additive bonuses for readability and multiplicative bonuses for rare milestones.

## QA-Ready Specification Pattern
For each mechanic, define:
1. Trigger conditions.
2. Input latency expectation.
3. Success result.
4. Failure result.
5. Cooldown or lockout policy.
6. Telemetry events and parameter names.

## Deliverables
- System overview diagram.
- State transition map.
- Rule and exception table.
- Parameter sheet.
- Telemetry event schema.
- QA scenario checklist.

## Practical Checklist
- Can all transitions be explained in a single diagram?
- Are failure states informative instead of random-feeling?
- Are edge cases specified with deterministic outcomes?
- Can QA validate each rule without verbal clarification?

## References
- `resources/game_design_books/combat_system/Combat_System_Design_Guide.md`
- `resources/game_design_books/sound/Audio_Design_Guide.md`
- `resources/game_design_books/The_Art_of_Game_Design_Lenses_Summary.md`
- `[Reference: game-development/game-design]`
- `[Reference: game-development/game-audio]`

