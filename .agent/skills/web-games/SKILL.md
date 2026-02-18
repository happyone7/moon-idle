---
name: web-games
description: Web game development workflow for browser-based games. Use for game loop architecture, input abstraction, DOM/canvas rendering split, mobile responsiveness, and browser/platform constraints.
---

# Web Games

Use this skill for HTML5/browser game implementation decisions.

## Workflow

1. Confirm runtime target: desktop browser, mobile browser, or both.
2. Choose rendering mode:
- DOM-heavy UI + lightweight gameplay overlays.
- Canvas/WebGL-heavy gameplay + DOM HUD.
3. Separate loops:
- Fixed update loop for game state.
- Independent render/UI loop.
4. Define input actions (not raw keys) and map keyboard/mouse/touch.
5. Add persistence and offline behavior constraints early.

## Output Checklist

- Input actions table (`action -> bindings`).
- Update/render timing model.
- Mobile viewport + touch behavior rules.
- Save strategy (`localStorage` or indexed store) and error handling.
- Performance budget target (60fps default).
