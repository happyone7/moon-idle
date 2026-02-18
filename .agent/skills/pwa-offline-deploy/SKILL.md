---
name: pwa-offline-deploy
description: PWA and offline deployment workflow for web games. Use for manifest/service worker setup, caching strategy, update activation, and production cache invalidation.
---

# PWA Offline Deploy

Use this skill when shipping installable/offline-capable web builds.

## Workflow

1. Define cache policy:
- App shell (precache).
- Versioned static assets.
- Runtime network strategy for data endpoints.
2. Validate installability:
- Manifest completeness.
- Service worker registration and scope.
3. Define update flow:
- New worker install.
- Safe activation prompt or auto-refresh strategy.
4. Verify offline behavior and rollback plan.

## Release Checks

- Offline launch works for cached build.
- Cache busting works after deploy.
- No stale critical JS after version bump.
