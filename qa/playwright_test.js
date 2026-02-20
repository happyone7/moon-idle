// QA Playwright test script for MoonIdle
const path = require('path');
const localAppData = process.env.LOCALAPPDATA || path.join(process.env.USERPROFILE, 'AppData', 'Local');
const pwBase = path.join(localAppData, 'npm-cache', '_npx', '520e866687cefe78', 'node_modules');
module.paths.unshift(pwBase);

const { chromium } = require('playwright');
const fs = require('fs');

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

  // ── TEST 1: Title Screen ──────────────────────────────────
  await page.goto(GAME_URL);
  await page.waitForTimeout(2500);

  const titleVisible = await page.isVisible('#title-screen');
  const titleLogo = await page.textContent('.title-logo').catch(() => '(not found)');
  const bootLogText = await page.textContent('#boot-log').catch(() => '(not found)');
  const saveStrip = await page.textContent('#save-strip').catch(() => '(not found)');
  const newGameBtnVisible = await page.isVisible('#new-game-btn');
  const continueBtnVisible = await page.isVisible('#continue-btn');

  // CRT check
  const hasCrt = await page.evaluate(() => {
    // scanlines via body::before and vignette via body::after in CSS
    const style = document.styleSheets[0];
    if (!style) return false;
    // Check computed animation on body
    const bodyAnim = window.getComputedStyle(document.body).animation;
    return bodyAnim && bodyAnim.includes('crt-flicker');
  });

  await page.screenshot({ path: path.join(OUT_DIR, 'qa_01_title.png') });
  console.log('SCREENSHOT: qa_01_title.png');

  console.log('\n=== TITLE SCREEN ===');
  console.log('title_screen_visible:', titleVisible);
  console.log('logo_text:', titleLogo);
  console.log('save_strip:', saveStrip);
  console.log('new_game_btn:', newGameBtnVisible);
  console.log('continue_btn_hidden:', !continueBtnVisible);
  console.log('boot_log_has_lines:', bootLogText.includes('>'));
  console.log('crt_flicker_animation:', hasCrt);

  // ── TEST 2: Start New Game ────────────────────────────────
  await page.click('#new-game-btn');
  await page.waitForTimeout(1500);

  const appVisible = await page.isVisible('#app.visible');
  const resLeftVisible = await page.isVisible('#res-left.visible');
  const worldBgVisible = await page.isVisible('#world-bg');

  await page.screenshot({ path: path.join(OUT_DIR, 'qa_02_game_start.png') });
  console.log('SCREENSHOT: qa_02_game_start.png');

  console.log('\n=== GAME START ===');
  console.log('app_visible:', appVisible);
  console.log('res_left_visible:', resLeftVisible);
  console.log('world_bg_visible:', worldBgVisible);

  // ── TEST 3: Left Resource Panel ──────────────────────────
  const resLeftWidth = await page.evaluate(() => {
    const el = document.getElementById('res-left');
    return el ? el.getBoundingClientRect().width : 0;
  });
  const rlInnerHtml = await page.evaluate(() => {
    const el = document.getElementById('rl-inner');
    return el ? el.innerHTML.length : 0;
  });
  const rlItemCount = await page.evaluate(() => document.querySelectorAll('.rl-item').length);

  console.log('\n=== LEFT RESOURCE PANEL ===');
  console.log('res_left_width_200px:', Math.round(resLeftWidth) === 200);
  console.log('res_left_actual_width:', resLeftWidth);
  console.log('rl_inner_has_content:', rlInnerHtml > 0);
  console.log('rl_item_count:', rlItemCount);

  // ── TEST 4: Nav Tabs ─────────────────────────────────────
  const prodTabVisible = await page.isVisible('#nav-tab-production');
  const researchTabVisible = await page.isVisible('#nav-tab-research');
  const assemblyTabHidden = !(await page.isVisible('#nav-tab-assembly'));
  const launchTabHidden = !(await page.isVisible('#nav-tab-launch'));
  const missionTabHidden = !(await page.isVisible('#nav-tab-mission'));
  const activeTab = await page.evaluate(() => {
    const active = document.querySelector('.nav-tab.active');
    return active ? active.dataset.tab : null;
  });

  console.log('\n=== NAV TABS ===');
  console.log('production_tab_visible:', prodTabVisible);
  console.log('research_tab_visible:', researchTabVisible);
  console.log('assembly_tab_hidden:', assemblyTabHidden);
  console.log('launch_tab_hidden:', launchTabHidden);
  console.log('mission_tab_hidden:', missionTabHidden);
  console.log('active_tab:', activeTab);

  // ── TEST 5: BGM Controls ─────────────────────────────────
  const bgmPrevBtn = await page.isVisible('#bgm-prev-btn');
  const bgmLabel = await page.textContent('#bgm-track-label').catch(() => '');
  const sndBtn = await page.textContent('#sound-btn').catch(() => '');

  console.log('\n=== BGM CONTROLS ===');
  console.log('bgm_prev_btn_visible:', bgmPrevBtn);
  console.log('bgm_label:', bgmLabel);
  console.log('sound_btn_text:', sndBtn);

  // ── TEST 6: Production Tab Content ───────────────────────
  const bldGridHtml = await page.evaluate(() => {
    const el = document.getElementById('bld-grid');
    return el ? el.innerHTML : '';
  });
  const prodStatusText = await page.textContent('#prod-status').catch(() => '');
  const buildingRowCount = await page.evaluate(() => {
    return document.querySelectorAll('#bld-grid > div').length;
  });

  console.log('\n=== PRODUCTION TAB ===');
  console.log('prod_status_text:', prodStatusText.slice(0, 80));
  console.log('building_rows_count:', buildingRowCount);
  console.log('bld_grid_has_content:', bldGridHtml.length > 0);

  await page.screenshot({ path: path.join(OUT_DIR, 'qa_03_production_tab.png') });
  console.log('SCREENSHOT: qa_03_production_tab.png');

  // ── TEST 7: Research Tab ─────────────────────────────────
  await page.click('#nav-tab-research');
  await page.waitForTimeout(300);

  const researchLayout = await page.isVisible('#research-layout');
  const leftPanelVisible = await page.isVisible('#panel-left-research');
  const centerPanelVisible = await page.isVisible('#panel-center-research');
  const rightPanelVisible = await page.isVisible('#panel-right-research');
  const treeSvgVisible = await page.isVisible('#tree-svg');
  const treeSvgNodeCount = await page.evaluate(() => document.querySelectorAll('.tech-node').length);

  console.log('\n=== RESEARCH TAB ===');
  console.log('research_3col_layout:', researchLayout);
  console.log('left_panel:', leftPanelVisible);
  console.log('center_panel:', centerPanelVisible);
  console.log('right_panel:', rightPanelVisible);
  console.log('tree_svg_visible:', treeSvgVisible);
  console.log('tech_node_count:', treeSvgNodeCount);

  await page.screenshot({ path: path.join(OUT_DIR, 'qa_04_research_tab.png') });
  console.log('SCREENSHOT: qa_04_research_tab.png');

  // ── TEST 8: Research node click / detail panel ────────────
  const firstNode = page.locator('.tech-node').first();
  await firstNode.click();
  await page.waitForTimeout(200);
  const detailPanelText = await page.textContent('#tech-detail-panel').catch(() => '');

  console.log('tech_detail_panel_populated:', detailPanelText.length > 20);
  console.log('tech_detail_sample:', detailPanelText.slice(0, 80).replace(/\s+/g, ' '));

  // ── TEST 9: World BG drag area ───────────────────────────
  const worldBgEl = await page.evaluate(() => {
    const el = document.getElementById('world-bg');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height, cursor: window.getComputedStyle(el).cursor };
  });

  console.log('\n=== WORLD BG ===');
  console.log('world_bg_found:', !!worldBgEl);
  if (worldBgEl) {
    console.log('world_bg_cursor_grab:', worldBgEl.cursor === 'grab');
    console.log('world_bg_height:', worldBgEl.height);
    console.log('world_bg_left_offset:', worldBgEl.x); // should be ~200 (left panel width)
  }

  // ── TEST 10: Building overlay trigger ───────────────────
  // First buy a mine so there's something to hover in world
  // Can't do that without enough resources — check if world buildings exist
  const worldBuildingCount = await page.evaluate(() => document.querySelectorAll('.world-building').length);
  console.log('\n=== WORLD BUILDINGS ===');
  console.log('world_building_count:', worldBuildingCount);
  // research_lab should be there at start (count=1)

  // ── TEST 11: Sound toggle ────────────────────────────────
  const sndBtnBefore = await page.textContent('#sound-btn').catch(() => '');
  await page.click('#sound-btn');
  await page.waitForTimeout(100);
  const sndBtnAfter = await page.textContent('#sound-btn').catch(() => '');

  console.log('\n=== SOUND TOGGLE ===');
  console.log('sound_btn_before:', sndBtnBefore);
  console.log('sound_btn_after_toggle:', sndBtnAfter);
  console.log('toggle_works:', sndBtnBefore !== sndBtnAfter);
  // Toggle back
  await page.click('#sound-btn');

  // ── TEST 12: Resource tick (wait ~1.5s) ──────────────────
  const resBefore = await page.evaluate(() => {
    const items = document.querySelectorAll('.rl-val');
    return Array.from(items).map(el => el.textContent.trim());
  });
  await page.waitForTimeout(1500);
  const resAfter = await page.evaluate(() => {
    const items = document.querySelectorAll('.rl-val');
    return Array.from(items).map(el => el.textContent.trim());
  });

  console.log('\n=== RESOURCE TICK ===');
  console.log('res_values_before:', resBefore.join(', '));
  console.log('res_values_after:', resAfter.join(', '));
  // Research lab produces 0.4 research/s, after 1.5s should increase
  const researchChanged = resBefore.length > 0 && resAfter.length > 0 && resBefore.join() !== resAfter.join();
  console.log('resources_ticking:', researchChanged);

  // ── TEST 13: Buy building (check button in prod tab) ─────
  await page.click('#nav-tab-production');
  await page.waitForTimeout(200);
  // Check if there's a buy button and if click notification appears
  const buyBtns = await page.evaluate(() => {
    const btns = document.querySelectorAll('#bld-grid button');
    return Array.from(btns).map(b => ({ text: b.textContent.trim(), disabled: b.disabled }));
  });
  console.log('\n=== BUY BUTTONS ===');
  console.log('buy_btns:', JSON.stringify(buyBtns));

  // ── TEST 14: Console errors summary ─────────────────────
  console.log('\n=== CONSOLE ERRORS ===');
  if (errors.length === 0) {
    console.log('no_errors: true');
  } else {
    errors.forEach((e, i) => console.log('error_' + i + ':', e));
  }

  console.log('\n=== ALL CONSOLE LOGS ===');
  consoleLogs.filter(l => l.type !== 'log').forEach(l => {
    console.log(l.type.toUpperCase() + ':', l.text.slice(0, 120));
  });

  await browser.close();
  console.log('\nDONE');
})().catch(e => {
  console.error('FATAL:', e.message);
  process.exit(1);
});
