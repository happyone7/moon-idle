// QA test 7 — investigate drag scroll z-index issue
const path = require('path');
const localAppData = process.env.LOCALAPPDATA || path.join(process.env.USERPROFILE, 'AppData', 'Local');
const pwBase = path.join(localAppData, 'npm-cache', '_npx', '520e866687cefe78', 'node_modules');
module.paths.unshift(pwBase);

const { chromium } = require('playwright');
const GAME_URL = 'file:///C:/Users/happy/.gemini/antigravity/playground/primordial-station/index.html';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  await page.goto(GAME_URL);
  await page.waitForTimeout(500);
  await page.click('#new-game-btn');
  await page.waitForTimeout(1500);

  // ── Check z-index layers ──────────────────────────────────
  console.log('=== Z-INDEX ANALYSIS ===');
  const zAnalysis = await page.evaluate(() => {
    // Check element at position (600, 700) — where we try to drag
    const el = document.elementFromPoint(600, 700);
    const worldBg = document.getElementById('world-bg');
    const app = document.getElementById('app');

    // Get z-indices
    const elZ = el ? window.getComputedStyle(el).zIndex : 'N/A';
    const wbZ = worldBg ? window.getComputedStyle(worldBg).zIndex : 'N/A';
    const appZ = app ? window.getComputedStyle(app).zIndex : 'N/A';
    const appRect = app ? app.getBoundingClientRect() : null;
    const wbRect = worldBg ? worldBg.getBoundingClientRect() : null;

    return {
      element_at_600_700: el ? { id: el.id, class: el.className, tag: el.tagName } : null,
      element_z: elZ,
      world_bg_z: wbZ,
      app_z: appZ,
      world_bg_rect: wbRect ? { y: wbRect.y, bottom: wbRect.bottom, height: wbRect.height } : null,
      app_rect: appRect ? { y: appRect.y, bottom: appRect.bottom, height: appRect.height } : null,
    };
  });
  console.log('z_analysis:', JSON.stringify(zAnalysis, null, 2));

  // #app has z-index:10 and min-height:100vh
  // #world-bg has z-index:1
  // So #app (z:10) is on top of #world-bg (z:1) at most y positions
  // BUT #app has padding-bottom:250px to make room for world-bg
  // The world-bg is fixed at bottom:0, height:240px
  // #app's content ends at viewport bottom - 250px

  // The actual element at (600, 700) should tell us what blocks the click
  // Expected: world-bg at bottom means y from 560-800
  // But #app extends to 100vh (0-800) and z-index:10 > z-index:1
  // So #app blocks click events to world-bg!

  console.log('\n=== DRAG SCROLL: REAL BEHAVIOR ASSESSMENT ===');
  // Actually, let's check: does the game work in a real browser?
  // The app div has padding-bottom:250px so its content area doesn't extend to bottom
  // BUT the div itself (with min-height:100vh) covers the whole viewport area
  // The world-bg is behind the app
  // In a real browser, clicking at y=700 would hit #app, not #world-bg

  // HOWEVER: #app has no background-color at the bottom 250px (only panel-bg panels which are
  // within padding-bottom:250px from the last panel)
  // Actually #app is transparent at the bottom — but it still captures mouse events!

  // Let's check: can we click through #app's transparent bottom area?
  const appBgCheck = await page.evaluate(() => {
    const app = document.getElementById('app');
    const cs = window.getComputedStyle(app);
    return {
      background: cs.background,
      pointerEvents: cs.pointerEvents,
    };
  });
  console.log('app_background:', appBgCheck.background.slice(0, 60));
  console.log('app_pointer_events:', appBgCheck.pointerEvents);
  // #app has background: none (no explicit bg after .visible) but pointer-events is auto
  // So even though it's transparent, it still captures clicks

  // This means in the REAL browser too:
  // - If the user clicks at y=700 (in world-bg area), they'd hit #app not #world-bg
  // UNLESS the page is scrolled so #app content ends before y=700
  // At initial load, #app has very little content, so it might only extend ~150-200px vertically
  // The key: #app is position:relative with z-index:10 but its background is transparent
  // and its actual rendered height may be much less than 100vh

  const actualAppHeight = await page.evaluate(() => {
    const app = document.getElementById('app');
    const r = app.getBoundingClientRect();
    return {
      offsetHeight: app.offsetHeight,
      clientHeight: app.clientHeight,
      rect_top: r.top,
      rect_bottom: r.bottom,
      rect_height: r.height,
    };
  });
  console.log('app_actual_height:', JSON.stringify(actualAppHeight));

  // The app has min-height:100vh = 800px, so it DOES cover the full viewport
  // This means #app (z:10) is always on top of #world-bg (z:1)
  // The drag scroll cannot work through the app overlay

  // But wait — world-bg is position:FIXED, not relative
  // Fixed elements are in a different stacking context
  // position:fixed elements with lower z-index still render behind higher z-index elements
  // So yes, #app blocks mouse events to world-bg

  // CONCLUSION: The drag scroll functionality is BLOCKED by the #app div in the current layout
  // This is a UI layout bug where the game UI covers the world-bg draggable area

  // But the game has mouse events on world-bg — let's check if there are any clicks
  // at a position where world-bg is actually accessible (not blocked by app)

  // Actually wait — let me re-read:
  // #app has margin-left:200px and max-width:1200px
  // It's displayed as block with padding-bottom:250px
  // The world-bg is position:fixed, left:200px, bottom:0, height:240px
  // In real use, the user sees the world panorama at bottom
  // The GAME CONTENT (#app) has padding-bottom:250px specifically to not overlap with world-bg
  // But the #app div itself (even its padding area) has z-index:10

  // Check if pointer-events should be 'none' for the world-bg area
  // Actually: #app has `padding-bottom:250px` — this padding area IS part of the div
  // The div has z-index:10, so it blocks the world-bg

  // Possible: the designer intended for users to scroll down past game content to access world
  // OR: there's a CSS rule missing that should use pointer-events:none on #app's bottom padding

  // Let me check what actually happens when user moves mouse to the very bottom
  const elementAtBottom = await page.evaluate(() => {
    const checks = [];
    for (let y = 560; y <= 790; y += 30) {
      const el = document.elementFromPoint(600, y);
      checks.push({ y, id: el ? el.id : '', class: el ? el.className.slice(0, 40) : '', tag: el ? el.tagName : '' });
    }
    return checks;
  });
  console.log('\n=== ELEMENT AT Y POSITIONS 560-790 ===');
  elementAtBottom.forEach(c => console.log(`y=${c.y}: ${c.tag}#${c.id} .${c.class}`));

  await browser.close();
  console.log('\nDONE');
})().catch(e => {
  console.error('FATAL:', e.message);
  process.exit(1);
});
