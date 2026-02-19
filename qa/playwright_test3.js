// QA Playwright test script part 3 — targeted bug checks
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
  page.on('console', msg => {
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
    gs.buildings.refinery = 2;
    gs.buildings.elec_lab = 1;
    gs.buildings.research_lab = 2;
    gs.buildings.launch_pad = 1;
    Object.keys(gs.unlocks).forEach(k => { gs.unlocks[k] = true; });
    renderUnlocks();
    renderAll();
  });
  await page.waitForTimeout(300);

  // ── CHECK 1: World building hover shows CORRECT name ─────
  // The overlay placeholder HTML shows "건물명" as default content
  // After mouse hover over a world building, the actual name should show
  const worldBldgs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.world-building')).map(el => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height, class: el.className };
    });
  });
  console.log('World buildings:', JSON.stringify(worldBldgs.slice(0, 3)));

  if (worldBldgs.length > 0) {
    const bld = worldBldgs[0];
    // World-bg is fixed at bottom, 240px height, starts at left=200px
    // The buildings are inside #world-bg which is at bottom:0, height:240
    // Let's find the world-bg rect
    const worldBgRect = await page.evaluate(() => {
      const el = document.getElementById('world-bg');
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height };
    });
    console.log('world_bg_rect:', JSON.stringify(worldBgRect));

    // World-bg has scrollLeft=0. The buildings are inside world-scene (position:absolute bottom:0)
    // Check building positions relative to document
    const bldInfo = await page.evaluate(() => {
      const blds = document.querySelectorAll('.world-building');
      return Array.from(blds).map(el => {
        const r = el.getBoundingClientRect();
        return {
          class: el.className,
          left: Math.round(r.left),
          top: Math.round(r.top),
          width: Math.round(r.width),
          height: Math.round(r.height),
          visible: r.width > 0 && r.height > 0
        };
      });
    });
    console.log('\n=== BUILDING POSITIONS ===');
    bldInfo.forEach(b => console.log(JSON.stringify(b)));

    // Find first visible building
    const visibleBld = bldInfo.find(b => b.visible && b.left >= 0 && b.left < 1280);
    if (visibleBld) {
      const mx = visibleBld.left + visibleBld.width / 2;
      const my = visibleBld.top + visibleBld.height / 2;
      console.log('\nHovering over building at', mx, my, '- class:', visibleBld.class);
      await page.mouse.move(mx, my);
      await page.waitForTimeout(400);

      const bldOvVisible = await page.evaluate(() => {
        const el = document.getElementById('bld-ov');
        return el && el.style.display !== 'none';
      });
      const bldOvHd = await page.textContent('#bov-hd').catch(() => 'not found');
      const bldOvCnt = await page.textContent('#bov-cnt').catch(() => '');
      const bldOvProd = await page.textContent('#bov-prod').catch(() => '');
      const bldOvCost = await page.textContent('#bov-cost').catch(() => '');

      console.log('\n=== BUILDING OVERLAY (HOVER TEST) ===');
      console.log('overlay_visible:', bldOvVisible);
      console.log('overlay_header:', bldOvHd);
      console.log('overlay_cnt:', bldOvCnt.slice(0, 80));
      console.log('overlay_prod:', bldOvProd.slice(0, 80));
      console.log('overlay_cost:', bldOvCost.slice(0, 80));
      console.log('header_is_not_placeholder:', bldOvHd !== '건물명');

      await page.screenshot({ path: OUT_DIR + '/qa_13_bld_overlay_hover.png' });
      console.log('SCREENSHOT: qa_13_bld_overlay_hover.png');

      // Mouse move away — check close with mouseleave delay
      await page.mouse.move(600, 400);
      await page.waitForTimeout(250);
      const bldOvAfterLeave = await page.evaluate(() => {
        const el = document.getElementById('bld-ov');
        return el ? el.style.display : 'not found';
      });
      console.log('overlay_after_mouseleave_250ms:', bldOvAfterLeave);
    } else {
      console.log('NO_VISIBLE_BUILDING: world-scene may need scroll');
    }
  }

  // ── CHECK 2: World drag scroll ────────────────────────────
  console.log('\n=== WORLD DRAG SCROLL ===');
  const worldBgPos = await page.evaluate(() => {
    const el = document.getElementById('world-bg');
    return el ? { scrollLeft: el.scrollLeft, cursor: getComputedStyle(el).cursor } : null;
  });
  console.log('initial_scroll_left:', worldBgPos ? worldBgPos.scrollLeft : 'N/A');
  console.log('cursor_grab:', worldBgPos ? worldBgPos.cursor === 'grab' : false);

  // Simulate drag: mousedown on world-bg, move, mouseup
  const wbRect = await page.evaluate(() => {
    const el = document.getElementById('world-bg');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  });
  if (wbRect) {
    const startX = wbRect.x + 400;
    const startY = wbRect.y + 100;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX - 200, startY, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(200);

    const scrollAfterDrag = await page.evaluate(() => {
      const el = document.getElementById('world-bg');
      return el ? el.scrollLeft : 0;
    });
    console.log('scroll_left_after_drag:', scrollAfterDrag);
    console.log('drag_scroll_works:', scrollAfterDrag > 0);
  }

  // ── CHECK 3: continue-btn shows when save exists ──────────
  console.log('\n=== CONTINUE BUTTON ===');
  // Save the game
  await page.evaluate(() => saveGame());
  // Reload page
  await page.reload();
  await page.waitForTimeout(2500);
  const continueBtnVisible = await page.isVisible('#continue-btn');
  const saveStripText = await page.textContent('#save-strip').catch(() => '');
  console.log('continue_btn_shows_with_save:', continueBtnVisible);
  console.log('save_strip_shows_data:', saveStripText.includes('발사'));

  // ── CHECK 4: isContinue — load game correctly ─────────────
  await page.click('#continue-btn').catch(() => {});
  await page.waitForTimeout(1500);
  const appAfterContinue = await page.isVisible('#app.visible');
  const launchesAfterLoad = await page.evaluate(() => gs.launches);
  console.log('continue_loads_game:', appAfterContinue);
  console.log('launches_persisted_through_save:', launchesAfterLoad);

  // ── CHECK 5: Offline banner shows when lastTick is old ────
  console.log('\n=== OFFLINE BANNER ===');
  await page.evaluate(() => {
    gs.lastTick = Date.now() - 10 * 60 * 1000; // 10 minutes ago
    calcOffline();
  });
  await page.waitForTimeout(200);
  const offlineBannerVisible = await page.evaluate(() => {
    const el = document.getElementById('offline-banner');
    return el ? el.style.display !== 'none' : false;
  });
  const offlineBannerText = await page.textContent('#offline-banner').catch(() => '');
  console.log('offline_banner_shows:', offlineBannerVisible);
  console.log('offline_banner_text:', offlineBannerText.slice(0, 80));

  // ── CHECK 6: Research buying via detail panel ─────────────
  console.log('\n=== RESEARCH BUY ===');
  await page.click('#nav-tab-research');
  await page.waitForTimeout(300);
  // Ensure we have research resources but haven't bought basic_prod
  await page.evaluate(() => {
    gs.upgrades = {};
    gs.res.research = 999;
    prodMult = {}; globalMult = 1; partCostMult = 1;
    fusionBonus = 0; reliabilityBonus = 0; slotBonus = 0;
    renderAll();
  });
  // Click basic_prod tech node
  const basicProdNode = page.locator('.tech-node').first();
  await basicProdNode.click();
  await page.waitForTimeout(200);

  // Click the research button
  const resBtn = page.locator('.btn-research, button.btn.btn-full.btn-sm').first();
  const resBtnText = await resBtn.textContent().catch(() => '');
  console.log('research_btn_text:', resBtnText.trim());

  await resBtn.click().catch(() => {});
  await page.waitForTimeout(200);

  const basicProdBought = await page.evaluate(() => !!gs.upgrades.basic_prod);
  console.log('research_purchase_works:', basicProdBought);

  // Check notification appeared
  const notifHtml = await page.evaluate(() => {
    const el = document.getElementById('notif');
    return el ? el.innerHTML : '';
  });
  console.log('notification_shows:', notifHtml.includes('기초 생산'));

  // ── CHECK 7: auto-save timer verification ─────────────────
  console.log('\n=== AUTO SAVE ===');
  const saveCount1 = await page.evaluate(() => {
    window._saveCount = 0;
    const orig = window.saveGame;
    window.saveGame = function() { window._saveCount++; return orig(); };
    return window._saveCount;
  });
  await page.waitForTimeout(11000); // wait >10s for auto-save
  const saveCount2 = await page.evaluate(() => window._saveCount || 0);
  console.log('auto_save_triggered_in_11s:', saveCount2 > 0);

  // ── FINAL ERRORS ─────────────────────────────────────────
  console.log('\n=== FINAL ERRORS ===');
  if (errors.length === 0) {
    console.log('no_errors: true');
  } else {
    errors.forEach((e, i) => console.log('error_' + i + ':', e.slice(0, 200)));
  }

  await browser.close();
  console.log('\nDONE');
})().catch(e => {
  console.error('FATAL:', e.message);
  console.error(e.stack);
  process.exit(1);
});
