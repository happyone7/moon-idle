// QA - verify auto-save and tick in fresh game
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

  // ── CHECK: Drag scroll via page.mouse on the world-bg ───
  console.log('=== DRAG SCROLL VIA PLAYWRIGHT MOUSE ===');
  // The previous test showed drag_log_events: 0 — meaning Playwright mouse events
  // did NOT trigger the mousedown handler on world-bg
  // Reason: world-bg is position:fixed, at bottom of viewport (y:560 on 800px screen)
  // BUT startY was wbRect.y + 80 = 560 + 80 = 640 which IS on screen
  // The problem might be the Playwright mouse events don't fire on position:fixed elements?
  // Or maybe the target element detection is off

  // Let me test with a fresh page and look at what happens
  await page.goto(GAME_URL);
  await page.waitForTimeout(500);
  await page.click('#new-game-btn');
  await page.waitForTimeout(1500);

  // Set up a listener to verify mousedown fires
  await page.evaluate(() => {
    window._wbMousedown = false;
    window._wbMousemove = false;
    const wb = document.getElementById('world-bg');
    wb.addEventListener('mousedown', () => { window._wbMousedown = true; });
    wb.addEventListener('mousemove', () => { window._wbMousemove = true; });
    document.addEventListener('mousemove', () => { window._docMousemove = true; });
  });

  // world-bg is at y:560 to y:800 in 800px viewport
  // Try to click in the middle of it
  await page.mouse.move(600, 700);  // y=700, inside world-bg (560-800)
  await page.mouse.down();
  const afterDown = await page.evaluate(() => ({ mousedown: window._wbMousedown }));
  console.log('mousedown_fired_on_wb:', afterDown.mousedown);

  await page.mouse.move(300, 700, { steps: 10 });
  const afterMove = await page.evaluate(() => ({
    wbMousemove: window._wbMousemove,
    docMousemove: window._docMousemove,
    scrollLeft: document.getElementById('world-bg').scrollLeft,
  }));
  console.log('mousemove_wb:', afterMove.wbMousemove);
  console.log('mousemove_doc:', afterMove.docMousemove);
  console.log('scroll_left_after_drag:', afterMove.scrollLeft);
  await page.mouse.up();

  // ── CHECK: Tick and auto-save ────────────────────────────
  console.log('\n=== TICK AND AUTO-SAVE CHECK ===');

  // Verify research accumulates
  const r1 = await page.evaluate(() => gs.res.research);
  await page.waitForTimeout(2100);
  const r2 = await page.evaluate(() => gs.res.research);
  console.log('research_at_t0:', r1);
  console.log('research_at_t2100ms:', r2);
  console.log('research_increased:', r2 > r1);

  // Verify save happens (check lastTick changes over time)
  const tick1 = await page.evaluate(() => gs.lastTick);
  await page.waitForTimeout(500);
  const tick2 = await page.evaluate(() => gs.lastTick);
  console.log('lastTick_t0:', tick1);
  console.log('lastTick_t500ms:', tick2);
  console.log('tick_advancing:', tick2 > tick1);

  // For auto-save: wait 11s and check if localStorage was updated
  const lsBefore = await page.evaluate(() => {
    const raw = localStorage.getItem('moonIdle_v2');
    return raw ? JSON.parse(raw).lastTick : null;
  });
  console.log('ls_lastTick_before_11s_wait:', lsBefore);
  await page.waitForTimeout(11000);
  const lsAfter = await page.evaluate(() => {
    const raw = localStorage.getItem('moonIdle_v2');
    return raw ? JSON.parse(raw).lastTick : null;
  });
  console.log('ls_lastTick_after_11s_wait:', lsAfter);
  console.log('auto_save_updated_ls:', lsAfter !== lsBefore && lsAfter > lsBefore);

  // ── CHECK: Drag works code analysis ─────────────────────
  // Looking at world.js:
  //   wb.addEventListener('mousedown', ...) - fires when mousedown on wb
  //   document.addEventListener('mouseup', ...) - fires globally
  //   wb.addEventListener('mousemove', ...) - fires when moving on wb
  //
  // The issue: mousemove is on wb (not document)
  // When dragging fast, mouse might leave wb element = no more mousemove events
  // But more importantly: if the user is dragging across the wb, they stay inside wb
  //
  // In headless mode, the mouse events DO fire (verified above)
  // Let me check if the issue is with pageX vs. clientX
  const dragTest = await page.evaluate(() => {
    const wb = document.getElementById('world-bg');
    wb.scrollLeft = 0;

    let captured = { down: null, moves: [] };
    const origHandler = (e) => {
      if (e.type === 'mousedown') captured.down = { pageX: e.pageX, clientX: e.clientX, offsetLeft: wb.offsetLeft };
      if (e.type === 'mousemove') captured.moves.push({ pageX: e.pageX, clientX: e.clientX, scrollLeft: wb.scrollLeft });
    };
    wb.addEventListener('mousedown', origHandler, { capture: true });
    wb.addEventListener('mousemove', origHandler, { capture: true });

    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ captured, scrollLeft: wb.scrollLeft });
      }, 500);
    });
  });

  await page.mouse.move(600, 700);
  await page.mouse.down();
  await page.mouse.move(500, 700, { steps: 5 });
  await page.mouse.move(400, 700, { steps: 5 });
  await page.mouse.up();
  await page.waitForTimeout(600);

  const dragResult2 = await page.evaluate(() => document.getElementById('world-bg').scrollLeft);
  console.log('\nDrag result after proper test:', dragResult2);

  await browser.close();
  console.log('\nDONE');
})().catch(e => {
  console.error('FATAL:', e.message);
  process.exit(1);
});
