# Visual Verification Task List

During unit QA, perform play-mode visual verification only for work types listed below.
Skip visual verification for non-matching work (SO value changes, code refactoring, doc edits, etc.).

## Work Types Requiring Visual Verification

### UI Related
- New UI panel/HUD creation or layout changes
- UI element show/hide logic changes
- Canvas/panel activation state changes
- Sprite/image replacement or addition
- Button interaction (hover, click effect) changes

### Screen Transitions
- Scene transition or game state (Title/Hub/InGame/RunEnd) transition logic changes
- Show/Hide call flow changes

### Visual Effects
- Shader, particle, VFX additions/changes
- Animation additions/changes
- Tower/monster sprite changes

### GameObject Placement
- Scene object add/delete/move
- Prefab structure changes (child object add/delete)
- Camera setting changes

### Gameplay Visual Elements
- Tower range display, projectile visualization
- HP bar, damage text, and other in-game visual feedback
- Monster path visualization

## Work Types NOT Requiring Visual Verification (reference)
- SO value-only changes (damage, cost, cooldown, etc.)
- Internal logic refactoring (no behavior change)
- Audio/sound-only changes
- Document/agent/skill file edits
- Build script/CI configuration changes
