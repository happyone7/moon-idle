# UI/UX Design Reference

## Purpose
Use this document when planning interface structure, interaction flow, readability, feedback systems, and accessibility at design stage.

## Scope
- Information architecture.
- Player flow and decision friction.
- HUD and menu readability.
- Input feedback timing.
- Accessibility and localization readiness.

## Inputs Required
- Platform and control scheme.
- Session format and gameplay intensity.
- Critical decisions per minute.
- Localization target languages.
- Accessibility compliance targets.

## UX Law Application in Games
### Fitts Law
Place high-frequency actions in large, fast-reach hit areas.

### Hick Law
Reduce simultaneous options in stressful contexts.

### Jakob Law
Reuse familiar interaction conventions unless deliberate differentiation is required.

### Miller Law
Chunk information into small groups for rapid parsing.

### Peak-End Rule
Design high-emotion moments and ending states intentionally.

### Doherty Threshold
Keep feedback under 400ms for most interactions.

## Wireframe Workflow
1. Define top-level player goals per screen.
2. Map primary and secondary actions.
3. Build low-fidelity wireframes for flow logic.
4. Validate with click path testing.
5. Build annotated UI spec for engineering/art handoff.

## HUD Design Rules
- Reserve central area for gameplay readability.
- Keep health/resource states visible without eye travel spikes.
- Group tactical information by action timing.
- Use icon and text pairing for localization resilience.

## Accessibility Baseline
- Color is never the only signal.
- Minimum text contrast and scalable typography.
- Subtitle controls and speaker labeling.
- Input remapping support requirements.
- Motion reduction options for sensitive users.

## Platform Resolution Guidelines
- Mobile UI target size baseline: 64-128 px visual components.
- PC UI target size baseline: 128-256 px visual components.
- Validate ultra-wide and non-standard aspect ratios.

## Deliverables
- Screen flow map.
- Wireframe pack.
- Interaction specification.
- HUD information hierarchy matrix.
- Accessibility acceptance checklist.

## Practical Checklist
- Can a first-time player complete onboarding without external explanation?
- Are error states recoverable in one step?
- Is visual hierarchy preserved under localization expansion?
- Do frequent actions have minimal interaction cost?

## References
- `resources/game_design_books/ui_ux/Laws_of_UX_Summary.md`
- `resources/game_design_books/The_Art_of_Game_Design_Lenses_Summary.md`
- `[Reference: game-development/game-art]`

