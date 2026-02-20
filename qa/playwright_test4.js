// QA Playwright test script part 4 — deep-dive bug investigation
const path = require('path');
const localAppData = process.env.LOCALAPPDATA || path.join(process.env.USERPROFILE, 'AppData', 'Local');
const pwBase = path.join(localAppData, 'npm-cache', '_npx', '520e866687cefe78', 'node_modules');
module.paths.unshift(pwBase);

const { chromium } = require('playwright');
const GAME_URL = 'file:///C:/Users/happy/.gemini/antigravity/playground/primordial-station/index.html';
const OUT_DIR = path.join(__dirname);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const errors = [];
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push('PAGE_ERROR: ' + err.message));

  await page.goto(GAME_URL);
  await page.waitForTimeout(500);
  await page.click('#new-game-btn');
  await page.waitForTimeout(1200);

  // Inject rich state
  await page.evaluate(() => {
    gs.res = { money: 99999, metal: 99999, fuel: 99999, electronics: 99999, research: 99999 };
    gs.buildings.mine = 3;
    gs.buildings.ops_center = 2;
    gs.buildings.research_lab = 2;
    Object.keys(gs.unlocks).forEach(k => { gs.unlocks[k] = true; });
    renderUnlocks();
    renderAll();
  });
  await page.waitForTimeout(300);

  // ── BUG 1: Building overlay hover shows "건물명" placeholder ──
  // Issue: The first test hover returned '건물명', meaning openBldOv wasn't called
  // The world-bg has overflow-x:auto and buildings inside world-scene
  // Buildings INSIDE the scroll container may be outside the viewport
  // Let me check: world-bg is fixed at bottom, buildings are inside
  // But #world-bg scroll container starts at left:200, and wb-ops is at x:620 page coord

  // The issue: mouseenter/mouseleave events on .world-building might not fire when
  // the element is inside a scrollable container that's positioned differently

  console.log('=== BUG INVESTIGATION: Building Overlay ===');

  // Check if mouseenter event listener is actually registered on the building
  const hasMouseenter = await page.evaluate(() => {
    const bld = document.querySelector('.world-building');
    // We can't directly check event listeners via JS
    // Instead, manually trigger the mouseenter event
    if (!bld) return { found: false };
    const bldInfo = BUILDINGS.find(b => b.wbClass === bld.className.replace('world-building ', ''));
    return {
      found: true,
      className: bld.className,
      bldId: bldInfo ? bldInfo.id : 'unknown',
    };
  });
  console.log('first_world_building:', JSON.stringify(hasMouseenter));

  // Manually call openBldOv to see if it works
  await page.evaluate(() => {
    const bld = document.querySelector('.world-building');
    const bldData = BUILDINGS.find(b => b.wbClass === bld.className.split(' ').pop());
    if (bld && bldData) {
      openBldOv(bldData, bld);
    }
  });
  await page.waitForTimeout(200);
  const ovHdAfterManual = await page.textContent('#bov-hd').catch(() => '');
  console.log('overlay_header_after_manual_call:', ovHdAfterManual);
  console.log('overlay_works_when_called_manually:', ovHdAfterManual !== '건물명');

  // The issue: world-bg is position:fixed, and buildings are inside it
  // getBoundingClientRect gives document-relative coords
  // BUT mouse events on elements inside fixed containers might behave differently
  // Let's check if the building is actually at the right position in page coords
  const bldPagePos = await page.evaluate(() => {
    const bld = document.querySelector('.world-building');
    if (!bld) return null;
    const r = bld.getBoundingClientRect();
    // Also check if it's inside world-bg which is position:fixed
    const wb = document.getElementById('world-bg');
    const wbR = wb ? wb.getBoundingClientRect() : null;
    return {
      bld: { x: r.x, y: r.y, w: r.width, h: r.height },
      wb: wbR ? { x: wbR.x, y: wbR.y, w: wbR.width, h: wbR.height } : null,
      // Is building visible in viewport?
      inViewport: r.x >= 0 && r.y >= 0 && r.x < window.innerWidth && r.y < window.innerHeight,
    };
  });
  console.log('building_page_position:', JSON.stringify(bldPagePos));

  // The world-bg is position:fixed at bottom:0, so buildings are at bottom of screen
  // Their getBoundingClientRect Y will be high (close to window.innerHeight)
  // Let's try hovering at the exact center of the first building
  if (bldPagePos && bldPagePos.inViewport) {
    const cx = bldPagePos.bld.x + bldPagePos.bld.w / 2;
    const cy = bldPagePos.bld.y + bldPagePos.bld.h / 2;
    console.log('Hovering at exact center:', cx, cy);
    await page.mouse.move(cx, cy);
    await page.waitForTimeout(400);
    const ovVisible = await page.evaluate(() => {
      const el = document.getElementById('bld-ov');
      return el && el.style.display !== 'none';
    });
    const ovHd = await page.textContent('#bov-hd').catch(() => '');
    console.log('hover_result_visible:', ovVisible);
    console.log('hover_result_header:', ovHd);
  }

  // ── BUG 2: Drag scroll not working ──────────────────────
  console.log('\n=== BUG INVESTIGATION: Drag Scroll ===');

  // Check if initWorldDrag was called
  const dragInitialized = await page.evaluate(() => {
    // Check if the mousedown listener is on world-bg
    // Can't directly check, but we can verify the function exists
    return typeof initWorldDrag === 'function';
  });
  console.log('initWorldDrag_function_exists:', dragInitialized);

  // The drag uses e.pageX - wb.offsetLeft for calculation
  // Let's check offsetLeft of world-bg
  const wbOffsetLeft = await page.evaluate(() => {
    const wb = document.getElementById('world-bg');
    return wb ? { offsetLeft: wb.offsetLeft, scrollWidth: wb.scrollWidth, clientWidth: wb.clientWidth } : null;
  });
  console.log('world_bg_offsetLeft:', JSON.stringify(wbOffsetLeft));

  // The world-bg is position:fixed, so offsetLeft is 200 (from CSS: left: 200px)
  // The drag scroll formula: wb.scrollLeft = dragSL - (e.pageX - wb.offsetLeft - dragX) * 1.3
  // where dragX = e.pageX - wb.offsetLeft at mousedown
  // So: wb.scrollLeft = dragSL - (e.pageX - wb.offsetLeft - (e.pageX_at_down - wb.offsetLeft)) * 1.3
  //                   = dragSL - (e.pageX - e.pageX_at_down) * 1.3
  // This means dragging LEFT decreases pageX, making (e.pageX - pageX_at_down) negative
  // So wb.scrollLeft = 0 - (negative) * 1.3 = positive — scroll right
  // BUT the test dragged from x+400 to x-200 (left), which should scroll RIGHT
  // The issue might be that the drag doesn't work in headless Playwright's mouse simulation
  // Let's try again with a more explicit simulation

  const wbRect2 = await page.evaluate(() => {
    const wb = document.getElementById('world-bg');
    if (!wb) return null;
    const r = wb.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  });

  if (wbRect2) {
    // First, make sure we're not on a building
    const startX = wbRect2.x + 200; // Safe area (left portion, no building there)
    const startY = wbRect2.y + 100;
    const endX = startX - 300;

    // Reset scroll
    await page.evaluate(() => { document.getElementById('world-bg').scrollLeft = 0; });

    // Simulate drag by dispatching events directly on the element
    await page.evaluate(({startX, startY, endX}) => {
      const wb = document.getElementById('world-bg');
      wb.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: startX, clientY: startY, pageX: startX, pageY: startY, button: 0 }));
      document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: startX - 100, clientY: startY, pageX: startX - 100, pageY: startY }));
      document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: startX - 200, clientY: startY, pageX: startX - 200, pageY: startY }));
      document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: endX, clientY: startY, pageX: endX, pageY: startY }));
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    }, { startX, startY, endX });

    await page.waitForTimeout(200);
    const scrollAfterManual = await page.evaluate(() => document.getElementById('world-bg').scrollLeft);
    console.log('scroll_after_manual_event_dispatch:', scrollAfterManual);
    console.log('drag_scroll_works_with_direct_events:', scrollAfterManual > 0);
  }

  // ── BUG 3: Auto-save not triggering ──────────────────────
  console.log('\n=== BUG INVESTIGATION: Auto Save ===');
  // The auto-save is in setInterval(saveGame, 10000) inside enterGame()
  // In test3, we called saveGame() then reloaded and re-entered game
  // The continueGame() calls enterGame() which sets up new intervals
  // But test3 waited only 11s after page reload and continueGame click
  // Let's do a proper test here

  // Re-patch saveGame to count calls
  await page.evaluate(() => {
    window._autoSaveCalls = 0;
    const orig = window.saveGame;
    window.saveGame = function() {
      window._autoSaveCalls++;
      return orig.apply(this, arguments);
    };
  });

  await page.waitForTimeout(11000);
  const autoSaveCalls = await page.evaluate(() => window._autoSaveCalls || 0);
  console.log('auto_save_calls_in_11s:', autoSaveCalls);
  console.log('auto_save_works:', autoSaveCalls > 0);

  // ── BUG 4: Overlay mouseleave timing ─────────────────────
  console.log('\n=== BUG INVESTIGATION: Overlay Mouseleave ===');
  // The overlay closes after 150ms delay when mouse leaves building
  // But only if the mouse is NOT over the overlay itself
  // openBldOv sets overlay visible, scheduleBldOvClose closes after 150ms
  // The overlay has mouseenter to cancel close, mouseleave to close immediately
  // In test2, after moving mouse away (250ms), the overlay style.display was '' (empty string)
  // Empty string means the CSS `display:none` default takes over OR the display was not set
  // Actually in HTML: #bld-ov has display:none initially from CSS
  // But when opened, JS sets style.display = 'block'
  // When closed, JS sets style.display = 'none'
  // If style.display === '' that means it was never explicitly set — odd

  // Let's check: what was the overlay display value after mouseleave in test2?
  // The result was '' — which means display property was set to empty string
  // Looking at closeBldOv: ov.style.display = 'none' → that's 'none', not ''
  // But scheduleBldOvClose checks: !ov.matches(':hover') → then closeBldOv()
  // In headless browser, does :hover pseudo-class work? Likely not.
  // So scheduleBldOvClose fires after 150ms, checks :hover which is false (headless),
  // and calls closeBldOv() which sets display = 'none'

  // BUT in test2, overlay_after_mouseleave_250ms was '' (empty string)
  // Let's verify this specific case

  // Manually open overlay
  await page.evaluate(() => {
    const bld = document.querySelector('.world-building');
    const bldData = BUILDINGS.find(b => b.wbClass === bld?.className.split(' ').pop());
    if (bld && bldData) openBldOv(bldData, bld);
  });
  await page.waitForTimeout(100);
  const beforeLeave = await page.evaluate(() => document.getElementById('bld-ov').style.display);
  console.log('overlay_display_when_open:', beforeLeave);

  // Simulate mouseleave
  await page.evaluate(() => {
    const bld = document.querySelector('.world-building');
    if (bld) {
      scheduleBldOvClose();
    }
  });
  await page.waitForTimeout(250);
  const afterLeave = await page.evaluate(() => document.getElementById('bld-ov').style.display);
  console.log('overlay_display_after_scheduleBldOvClose_250ms:', afterLeave);
  console.log('overlay_closes_via_schedule:', afterLeave === 'none');

  // ── Final error check ─────────────────────────────────────
  console.log('\n=== CONSOLE LOGS ===');
  consoleLogs.filter(l => l.type !== 'log').forEach(l => {
    console.log(l.type.toUpperCase() + ':', l.text.slice(0, 150));
  });
  // Also show any game-logged messages
  const gameLogs = consoleLogs.filter(l => l.text.startsWith('OFFLINE'));
  gameLogs.forEach(l => console.log('GAME_LOG:', l.text));

  console.log('\n=== FINAL ERRORS ===');
  if (errors.length === 0) {
    console.log('no_errors: true');
  } else {
    errors.forEach((e, i) => console.log('error_' + i + ':', e.slice(0, 200)));
  }

  await browser.close();
  console.log('\nDONE');
})().catch(e => {
  console.error('FATAL:', e.message, e.stack);
  process.exit(1);
});
