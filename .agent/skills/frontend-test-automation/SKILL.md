---
name: frontend-test-automation
description: Playwright-based QA automation for web games. Use for deterministic smoke/regression tests, save-load checks, offline/PWA checks, and release gates.
---

# Frontend Test Automation

Use this skill to define or implement browser QA automation.

## Core Test Lanes

1. Smoke
- App boot, no fatal console errors, core UI visible.
2. Core loop
- Resource gain, purchase action, upgrade action, launch condition.
3. Persistence
- Save, refresh, load consistency, migration path.
4. Offline/PWA
- Service worker active, offline shell works, cache updates safely.
5. Accessibility sanity
- Keyboard navigation and focus visibility.

## Execution Policy

- Run smoke on every commit.
- Run full regression before release tag.
- Block release if critical lane fails.

## References

- Web QA checklist and sources: `references/web-game-qa-checklist.md`
