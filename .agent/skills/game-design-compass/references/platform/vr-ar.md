# VR and AR Platform Design Reference

## Platform Promise
Design for presence and embodiment while protecting comfort, orientation, and sustained usability.

## Core Constraints
- Motion sickness and comfort sensitivity.
- Spatial scale and interaction reach assumptions.
- Device performance budgets and battery limits.
- Tracking reliability differences by platform.

## Comfort-First Design Rules
- Prefer player-controlled movement for comfort.
- Avoid forced camera motion whenever possible.
- Use teleport, dash, or comfort turning options.
- Provide stable horizon and visual anchors.

## Spatial Design Guidelines
- Maintain believable real-world scale references.
- Reserve interaction zones within ergonomic reach.
- Distinguish seated, standing, and room-scale modes.

## Interaction Model Choices
- Hand tracking: high immersion, lower precision in some contexts.
- Controller input: reliable precision with explicit affordances.
- Design fallback paths for tracking loss and occlusion.

## Session and Fatigue Planning
- Keep high-intensity segments short.
- Alternate active and calm phases to reduce fatigue.
- Add clear pause and recenter options.

## Performance-Aware Planning
- Frame stability is comfort-critical.
- Scope scene complexity by headset class.
- Predefine graceful degradation for lower performance tiers.

## AR-Specific Notes
- Respect real-world context and safety boundaries.
- Design for variable lighting and surface detection quality.
- Keep UI anchored to spatial context with clear depth cues.

## Deliverables
- Comfort policy document.
- Locomotion design matrix.
- Spatial interaction map.
- Device-tier performance assumptions.
- VR/AR usability and safety checklist.

## Practical Checklist
- Can players complete core loop without discomfort spikes?
- Are all essential actions accessible in defined play modes?
- Is recenter/recovery behavior always available and clear?

## References
- `resources/game_design_books/ui_ux/Laws_of_UX_Summary.md`
- `resources/game_design_books/The_Art_of_Game_Design_Lenses_Summary.md`
- `[Reference: game-development/vr-ar]`

