// QA Playwright test script part 5 — drag and auto-save investigation
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

  await page.goto(GAME_URL);
  await page.waitForTimeout(500);
  await page.click('#new-game-btn');
  await page.waitForTimeout(1500);

  // ── DRAG SCROLL DEEP DIVE ───────────────────────────────
  console.log('=== DRAG SCROLL ANALYSIS ===');

  const dragAnalysis = await page.evaluate(() => {
    const wb = document.getElementById('world-bg');
    if (!wb) return { error: 'world-bg not found' };

    // Check world-scene width
    const ws = document.getElementById('world-scene');
    return {
      wb_scrollWidth: wb.scrollWidth,
      wb_clientWidth: wb.clientWidth,
      wb_offsetLeft: wb.offsetLeft,
      wb_scrollLeft: wb.scrollLeft,
      ws_width: ws ? ws.offsetWidth : 0,
      wb_overflow: window.getComputedStyle(wb).overflow,
      wb_overflowX: window.getComputedStyle(wb).overflowX,
    };
  });
  console.log('Drag scroll analysis:', JSON.stringify(dragAnalysis, null, 2));

  // The issue: wb.offsetLeft on a position:fixed element
  // For position:fixed elements, offsetLeft is the left value from CSS (200px)
  // BUT e.pageX in a standard drag uses page coordinates, not viewport
  // On a position:fixed element, getBoundingClientRect().x === offsetLeft (both 200)
  // e.pageX = clientX + window.scrollX
  // Since this is a single-page game with no body scroll, pageX === clientX

  // The drag handler:
  //   dragX = e.pageX - wb.offsetLeft   (at mousedown, e.g. = 680 - 200 = 480)
  //   dragSL = wb.scrollLeft (initially 0)
  //   on mousemove: wb.scrollLeft = 0 - (e.pageX - wb.offsetLeft - 480) * 1.3
  //   = 0 - (new_pageX - 200 - 480) * 1.3
  //   = 0 - (new_pageX - 680) * 1.3
  // If we drag left (new_pageX = 380):
  //   = 0 - (380 - 680) * 1.3 = 0 - (-300) * 1.3 = 390 ✓

  // But Playwright's page.mouse.move uses viewport coordinates (which are also pageX for no-scroll pages)
  // Let me trace what happens with Playwright mouse events

  // Capture the event handler execution
  await page.evaluate(() => {
    const wb = document.getElementById('world-bg');
    window._dragLog = [];
    const origDrag = function(e) {
      window._dragLog.push({
        type: e.type,
        pageX: e.pageX,
        clientX: e.clientX,
        wbOffsetLeft: wb.offsetLeft,
        wbScrollLeft: wb.scrollLeft,
      });
    };
    wb.addEventListener('mousedown', origDrag, { capture: true });
    wb.addEventListener('mousemove', origDrag, { capture: true });
  });

  const wbRect = await page.evaluate(() => {
    const r = document.getElementById('world-bg').getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  });

  // Reset scroll
  await page.evaluate(() => { document.getElementById('world-bg').scrollLeft = 0; });

  const startX = wbRect.x + 400;
  const startY = wbRect.y + 80;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX - 100, startY, { steps: 5 });
  await page.mouse.move(startX - 200, startY, { steps: 5 });
  await page.mouse.move(startX - 300, startY, { steps: 5 });
  await page.mouse.up();
  await page.waitForTimeout(200);

  const dragLog = await page.evaluate(() => window._dragLog);
  const finalScroll = await page.evaluate(() => document.getElementById('world-bg').scrollLeft);

  console.log('drag_log_events:', dragLog.length);
  if (dragLog.length > 0) {
    console.log('first_mousedown:', JSON.stringify(dragLog[0]));
    if (dragLog.length > 1) console.log('first_mousemove:', JSON.stringify(dragLog[1]));
    if (dragLog.length > 2) console.log('last_mousemove:', JSON.stringify(dragLog[dragLog.length - 1]));
  }
  console.log('final_scroll_left:', finalScroll);

  // Check if the issue is that the wb.addEventListener is on wb not document for mousemove
  // Looking at the code: wb.addEventListener('mousemove', ...) — on wb, not document
  // But once mousedown fires, subsequent mousemove events may be outside wb bounds
  // (if the cursor moves outside the element)
  // In the real implementation, mousemove is on wb (not document), so moving outside wb won't work
  // That's likely a bug: mousemove should be on document for drag to work properly

  console.log('\n=== DRAG SCROLL HANDLER CODE ANALYSIS ===');
  const handlerCode = await page.evaluate(() => {
    // Get the source of the handler — can't directly, but let's check if it fires on wb
    // The drag moves TO startX-300 which is 400+200=600 - 300 = 300, still > wbRect.x (200)
    // So it should still be within wb bounds... unless the wb has overflow hidden for the top area?
    const wb = document.getElementById('world-bg');
    const r = wb.getBoundingClientRect();
    return {
      wb_x: r.x, wb_y: r.y, wb_right: r.right, wb_bottom: r.bottom,
      wb_position: window.getComputedStyle(wb).position,
    };
  });
  console.log('wb_bounds:', JSON.stringify(handlerCode));

  // The wb is at y:560 (bottom portion of screen, 800-240=560)
  // startY = 560 + 80 = 640 — inside wb
  // But wait: startX = wbRect.x + 400 = 200 + 400 = 600
  // endX = 600 - 300 = 300 — still inside wb (200 to 1280)
  // So movement is all within wb bounds

  // Let me check if the drag listener catches the event
  const mousemoveOnWb = await page.evaluate(() => {
    const wb = document.getElementById('world-bg');
    // Check if mousemove fires on wb
    let fired = false;
    wb.addEventListener('mousemove', () => { fired = true; }, { once: true });
    wb.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 500, clientY: 600 }));
    return fired;
  });
  console.log('mousemove_fires_on_wb:', mousemoveOnWb);

  // The real issue may be: Playwright mouse events don't reach elements inside fixed/scroll containers
  // Let's try a pure JS simulation
  await page.evaluate(() => {
    const wb = document.getElementById('world-bg');
    wb.scrollLeft = 0;
    // Simulate the full drag sequence with proper pageX values
    // Start: pageX=600, wb.offsetLeft=200, dragSL=0
    // dragX = 600 - 200 = 400
    // Move to pageX=300: scrollLeft = 0 - (300 - 200 - 400) * 1.3 = 0 - (-300) * 1.3 = 390

    // Manually trigger the drag state
    let drag = false, dragX = 0, dragSL = 0;

    // Simulate mousedown
    const downEvent = { pageX: 600, target: { closest: () => null } };
    drag = true;
    dragX = downEvent.pageX - wb.offsetLeft; // = 400
    dragSL = wb.scrollLeft; // = 0

    // Simulate mousemove
    const moveEvent = { pageX: 300, preventDefault: () => {} };
    if (drag) {
      wb.scrollLeft = dragSL - (moveEvent.pageX - wb.offsetLeft - dragX) * 1.3;
    }

    window._manualDragResult = wb.scrollLeft;
  });
  const manualDragResult = await page.evaluate(() => window._manualDragResult);
  console.log('manual_drag_scroll_result:', manualDragResult);
  console.log('drag_logic_correct:', manualDragResult > 0);

  // ── AUTO-SAVE ANALYSIS ──────────────────────────────────
  console.log('\n=== AUTO-SAVE ANALYSIS ===');

  // Check if enterGame() sets up the interval
  // In main.js: setInterval(saveGame, 10000) is called inside enterGame()
  // The test3 re-entered game via continueGame() which calls enterGame()
  // But the monkey-patch of saveGame happened AFTER enterGame()
  // The setInterval already captured the original saveGame reference

  // Let's verify the interval IS set up correctly
  const intervalInfo = await page.evaluate(() => {
    // We can't list intervals directly, but we can check if saveGame is called
    window._saveCallCount = 0;
    // Note: setInterval is already running from enterGame()
    // We need to replace saveGame BEFORE enterGame is called
    // OR we can just wait and check localStorage timestamp

    // Save a timestamp
    window._preWaitTimestamp = Date.now();
    const currSave = JSON.parse(localStorage.getItem('moonIdle_v2') || '{}');
    return { lastTick: currSave.lastTick, now: Date.now() };
  });
  console.log('pre_wait_info:', JSON.stringify(intervalInfo));

  await page.waitForTimeout(11000);

  const postWaitSave = await page.evaluate(() => {
    const currSave = JSON.parse(localStorage.getItem('moonIdle_v2') || '{}');
    return {
      lastTick: currSave.lastTick,
      now: Date.now(),
      timeElapsed: Date.now() - window._preWaitTimestamp,
    };
  });
  console.log('post_wait_info:', JSON.stringify(postWaitSave));
  const saveTimestampUpdated = postWaitSave.lastTick > intervalInfo.lastTick;
  console.log('localstorage_updated_after_11s:', saveTimestampUpdated);
  console.log('auto_save_conclusion:', saveTimestampUpdated ? 'WORKS (localStorage updated)' : 'FAIL');

  // Also test tick is running
  const tickResult = await page.evaluate(() => {
    const before = gs.res.money;
    // Wait for tick function to run
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ before, after: gs.res.money, diff: gs.res.money - before });
      }, 1000);
    });
  });
  console.log('\nTick runs in 1s:', JSON.stringify(tickResult));

  await browser.close();
  console.log('\nDONE');
})().catch(e => {
  console.error('FATAL:', e.message, e.stack);
  process.exit(1);
});
