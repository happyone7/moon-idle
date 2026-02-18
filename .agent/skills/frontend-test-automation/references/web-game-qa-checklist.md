# Web Game QA Checklist

Use these checks as release gates for browser games.

## Functional

- Core loop actions succeed without reload.
- Save/load survives refresh and browser restart.
- Invalid or old save data does not crash startup.

## Performance

- Track Core Web Vitals (LCP, INP, CLS) on representative devices.
- Verify no long input stalls during active gameplay.
- Keep memory growth stable in a 15+ minute play session.

## Accessibility

- Keyboard-only navigation works for critical UI.
- Focus indicator is visible on interactive elements.
- Non-text UI controls have accessible names.

## PWA/Offline

- App is installable with valid manifest and service worker.
- Offline start works for cached shell.
- New deploy activates cache update flow correctly.

## Automation Baseline

- Playwright smoke suite for boot + loop + save/load.
- Console error capture in CI.

## Official Sources

- Playwright best practices: https://playwright.dev/docs/best-practices
- Web Vitals overview: https://web.dev/articles/vitals
- INP metric detail: https://web.dev/inp/
- PWA install criteria (Chrome): https://developer.chrome.com/docs/lighthouse/pwa/installable-manifest
- MDN accessibility fundamentals: https://developer.mozilla.org/en-US/docs/Learn/Accessibility
