# Console Platform Design Reference

## Platform Promise
Design for couch play, controller-first interactions, certification compliance, and stable large-screen readability.

## Core Constraints
- Controller-only baseline for all critical flows.
- TV viewing distance and readability constraints.
- Platform certification requirements.
- Performance mode and quality mode expectations.

## Input and Navigation Rules
- Action-mapped inputs instead of hard-coded button assumptions.
- Consistent focus navigation in menus.
- Fast recoverability after accidental input.

## Readability Rules
- Larger typography and stronger contrast than desktop assumptions.
- Minimize dense text blocks during active gameplay.
- Keep critical status information visible at couch distance.

## Certification-Aware Planning
- Save, suspend, and resume behavior requirements.
- Account and entitlement edge case handling.
- User-generated content and safety policy alignment.

## Performance and Haptics
- Define frame stability targets before feature scope lock.
- Plan separate visual presets if required by platform profile.
- Use haptics intentionally for feedback clarity, not constant vibration.

## Deliverables
- Controller interaction specification.
- TV-safe UI layout set.
- Certification risk checklist.
- Performance mode design assumptions.
- Accessibility baseline for console audiences.

## Practical Checklist
- Is the full game playable with controller only?
- Are all critical UI states legible from couch distance?
- Are certification-sensitive scenarios documented early?

## References
- `resources/game_design_books/ui_ux/Laws_of_UX_Summary.md`
- `resources/game_design_books/combat_system/Combat_System_Design_Guide.md`
- `[Reference: game-development/pc-games]`

