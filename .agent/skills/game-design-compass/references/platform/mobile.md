# Mobile Platform Design Reference

## Platform Promise
Design for short, frequent sessions with touch-first readability, low friction onboarding, and sustainable battery/performance behavior.

## Core Constraints
- Touch precision and thumb reach limits.
- Interruption-heavy usage patterns.
- Thermal and battery sensitivity.
- Platform policy requirements for privacy and purchases.

## Session Model
- Primary loop target: 1-5 minutes.
- Optional deep session target: 10-20 minutes.
- Resume-ready state at every key transition.

## Input and UI Rules
- Minimum actionable touch target around 44x44pt baseline.
- Keep high-frequency actions in thumb zones.
- Minimize dense multi-step interaction chains.
- Design for portrait and landscape only when both add clear value.

## Onboarding and Retention
- First-minute value demonstration is mandatory.
- Layer complexity over multiple sessions.
- Push notifications should map to meaningful in-game states.

## Economy and Monetization
- F2P loops must avoid hard early frustration walls.
- Premium convenience should not invalidate skill progression.
- Rewarded ads should remain opt-in and contextual.

## Performance-Aware Planning
- Prioritize frame stability over visual spikes.
- Define acceptable quality fallback for low-end devices.
- Plan content complexity with memory budgets in mind.

## Store Readiness Planning
- Privacy and data use disclosures.
- Purchase flow clarity and parental safeguards.
- Regional content and legal policy checks.

## Deliverables
- Mobile loop and session map.
- Touch interaction wireframes.
- Onboarding funnel design.
- Notification policy brief.
- Device-tier content budget assumptions.

## Practical Checklist
- Can a user understand the game value in under 60 seconds?
- Is one-handed interaction viable for core actions?
- Are monetization prompts timed away from frustration peaks?

## References
- `resources/game_design_books/ui_ux/Laws_of_UX_Summary.md`
- `resources/game_design_books/balance_economy/Game_Balance_Economy_Guide.md`
- `[Reference: game-development/mobile-games]`

