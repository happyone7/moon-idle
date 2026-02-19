// QA Playwright test script part 2 — advanced tests
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

  // Start game with injected rich state so we can test all tabs
  await page.goto(GAME_URL);
  await page.waitForTimeout(500);
  await page.click('#new-game-btn');
  await page.waitForTimeout(1200);

  // Inject a rich game state to unlock all tabs and resources
  await page.evaluate(() => {
    // Give lots of resources
    gs.res = { money: 99999, metal: 99999, fuel: 99999, electronics: 99999, research: 99999 };
    // Buy some buildings
    gs.buildings.mine = 3;
    gs.buildings.ops_center = 2;
    gs.buildings.refinery = 2;
    gs.buildings.elec_lab = 1;
    gs.buildings.research_lab = 2;
    gs.buildings.launch_pad = 1;
    // Unlock everything
    Object.keys(gs.unlocks).forEach(k => { gs.unlocks[k] = true; });
    // Apply some upgrades
    gs.upgrades = {
      basic_prod: true, drill: true, fuel_chem: true, electronics_basics: true,
      catalyst: true, microchip: true, alloy: true, automation: true,
      rocket_eng: true, launch_ctrl: true, mission_sys: true,
    };
    // Re-apply upgrade effects
    prodMult = {};
    globalMult = 1;
    partCostMult = 1;
    fusionBonus = 0;
    reliabilityBonus = 0;
    slotBonus = 0;
    UPGRADES.forEach(upg => {
      if (gs.upgrades[upg.id]) upg.effect();
    });
    // Update world and tabs
    renderUnlocks();
    renderAll();
  });
  await page.waitForTimeout(500);

  await page.screenshot({ path: OUT_DIR + '/qa_05_game_rich_state.png' });
  console.log('SCREENSHOT: qa_05_game_rich_state.png');

  // ── TEST: All tabs visible after unlock ─────────────────
  const assemblyTabNowVisible = await page.isVisible('#nav-tab-assembly');
  const launchTabNowVisible = await page.isVisible('#nav-tab-launch');
  const missionTabNowVisible = await page.isVisible('#nav-tab-mission');
  console.log('\n=== TAB UNLOCK ===');
  console.log('assembly_tab_visible_after_unlock:', assemblyTabNowVisible);
  console.log('launch_tab_visible_after_unlock:', launchTabNowVisible);
  console.log('mission_tab_visible_after_unlock:', missionTabNowVisible);

  // ── TEST: Production tab with buildings unlocked ─────────
  await page.click('#nav-tab-production');
  await page.waitForTimeout(200);
  const buildingRowCountFull = await page.evaluate(() => {
    return document.querySelectorAll('#bld-grid > div').length;
  });
  const buyBtnsFull = await page.evaluate(() => {
    const btns = document.querySelectorAll('#bld-grid button');
    const affordable = Array.from(btns).filter(b => !b.disabled && b.textContent.includes('+구매'));
    return { total: btns.length, affordable: affordable.length };
  });
  console.log('\n=== PRODUCTION TAB (FULL) ===');
  console.log('building_rows_count:', buildingRowCountFull);
  console.log('buy_btns:', JSON.stringify(buyBtnsFull));

  await page.screenshot({ path: OUT_DIR + '/qa_06_production_full.png' });
  console.log('SCREENSHOT: qa_06_production_full.png');

  // ── TEST: World building hover overlay ──────────────────
  // World has buildings now
  const worldBuildingCount = await page.evaluate(() => document.querySelectorAll('.world-building').length);
  console.log('\n=== WORLD BUILDINGS (FULL) ===');
  console.log('world_building_count:', worldBuildingCount);

  // Hover over first world building
  const firstBldEl = page.locator('.world-building').first();
  const firstBldBB = await firstBldEl.boundingBox();
  if (firstBldBB) {
    await page.mouse.move(firstBldBB.x + firstBldBB.width / 2, firstBldBB.y + firstBldBB.height / 2);
    await page.waitForTimeout(300);
    const bldOvVisible = await page.evaluate(() => {
      const el = document.getElementById('bld-ov');
      return el && el.style.display !== 'none';
    });
    const bldOvHdText = await page.textContent('#bov-hd').catch(() => '');
    console.log('bld_overlay_visible_on_hover:', bldOvVisible);
    console.log('bld_overlay_header:', bldOvHdText.slice(0, 60));

    // Test buy button in overlay
    const bldOvBuyBtn = await page.evaluate(() => {
      const btn = document.getElementById('bov-buy');
      return btn ? { text: btn.textContent, disabled: btn.classList.contains('disabled') } : null;
    });
    console.log('bld_overlay_buy_btn:', JSON.stringify(bldOvBuyBtn));

    await page.screenshot({ path: OUT_DIR + '/qa_07_bld_overlay.png' });
    console.log('SCREENSHOT: qa_07_bld_overlay.png');

    // Move mouse away, overlay should close
    await page.mouse.move(600, 400);
    await page.waitForTimeout(300);
    const bldOvClosed = await page.evaluate(() => {
      const el = document.getElementById('bld-ov');
      return !el || el.style.display === 'none';
    });
    console.log('bld_overlay_closes_on_mouseout:', bldOvClosed);
  } else {
    console.log('world_building_not_visible_in_viewport: true');
  }

  // ESC closes overlay
  await page.evaluate(() => {
    const el = document.getElementById('bld-ov');
    if (el) el.style.display = 'block';
  });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(100);
  const bldOvAfterEsc = await page.evaluate(() => {
    const el = document.getElementById('bld-ov');
    return !el || el.style.display === 'none';
  });
  console.log('bld_overlay_closes_on_esc:', bldOvAfterEsc);

  // ── TEST: Assembly Tab ───────────────────────────────────
  await page.click('#nav-tab-assembly');
  await page.waitForTimeout(300);

  const rocketArtEl = await page.evaluate(() => {
    const el = document.getElementById('rocket-art-display');
    return el ? el.innerHTML.length : 0;
  });
  const partsChecklist = await page.evaluate(() => {
    return document.querySelectorAll('.parts-list-item').length;
  });
  const qualityBtns = await page.evaluate(() => {
    return document.querySelectorAll('.q-btn').length;
  });
  const assemblySlots = await page.evaluate(() => {
    return document.querySelectorAll('.slot-card').length;
  });
  const scienceBox = await page.textContent('#science-box').catch(() => '');

  console.log('\n=== ASSEMBLY TAB ===');
  console.log('rocket_art_display_has_content:', rocketArtEl > 0);
  console.log('parts_checklist_count:', partsChecklist);
  console.log('quality_buttons_count:', qualityBtns);
  console.log('assembly_slots_count:', assemblySlots);
  console.log('science_box_has_content:', scienceBox.length > 20);
  console.log('science_box_sample:', scienceBox.slice(0, 80).replace(/\s+/g, ' '));

  await page.screenshot({ path: OUT_DIR + '/qa_08_assembly_tab.png' });
  console.log('SCREENSHOT: qa_08_assembly_tab.png');

  // Test quality button click
  const q2Btn = page.locator('.q-btn').nth(1);
  await q2Btn.click();
  await page.waitForTimeout(200);
  const selectedQuality = await page.evaluate(() => gs.assembly.selectedQuality);
  console.log('quality_selection_works:', selectedQuality === 'standard');

  // ── TEST: Craft a part ───────────────────────────────────
  // Click "제작" for engine part
  const craftBtns = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.parts-list-item button'));
    return btns.map(b => ({ text: b.textContent.trim(), disabled: b.disabled }));
  });
  console.log('craft_buttons:', JSON.stringify(craftBtns));

  // Craft all parts since we have enough resources
  for (const part of ['engine', 'fueltank', 'control', 'hull', 'payload']) {
    await page.evaluate((pid) => craftPart(pid), part);
  }
  await page.waitForTimeout(200);
  const allPartsDone = await page.evaluate(() => PARTS.every(p => gs.parts[p.id]));
  console.log('all_parts_craftable:', allPartsDone);

  // Start assembly
  await page.evaluate(() => startAssembly(0));
  await page.waitForTimeout(200);
  const assemblyStarted = await page.evaluate(() => {
    return gs.assembly.jobs[0] !== null;
  });
  console.log('assembly_start_works:', assemblyStarted);

  await page.screenshot({ path: OUT_DIR + '/qa_09_assembly_in_progress.png' });
  console.log('SCREENSHOT: qa_09_assembly_in_progress.png');

  // Force complete assembly
  await page.evaluate(() => {
    gs.assembly.jobs[0].ready = true;
    renderAll();
  });
  await page.waitForTimeout(200);

  // ── TEST: Launch Tab ─────────────────────────────────────
  await page.click('#nav-tab-launch');
  await page.waitForTimeout(300);

  const readyListWrap = await page.textContent('#ready-list-wrap').catch(() => '');
  const hasReadyRocket = readyListWrap.includes('준비 완료');
  const launchAnimWrap = await page.isVisible('#launch-anim-wrap');

  console.log('\n=== LAUNCH TAB ===');
  console.log('ready_rocket_in_launch_tab:', hasReadyRocket);
  console.log('launch_anim_wrap_visible:', launchAnimWrap);

  await page.screenshot({ path: OUT_DIR + '/qa_10_launch_tab.png' });
  console.log('SCREENSHOT: qa_10_launch_tab.png');

  // Launch the rocket
  const launchBtn = page.locator('.ready-slot-row .btn-amber').first();
  if (await launchBtn.isVisible()) {
    await launchBtn.click();
    await page.waitForTimeout(500);
    const launchOverlayShowing = await page.evaluate(() => {
      // Check if we switched to launch tab and animation running
      return document.getElementById('launch-anim-wrap')?.innerHTML.length > 50;
    });
    console.log('launch_animation_started:', launchOverlayShowing);

    // Wait for launch sequence to complete (3.5s)
    await page.waitForTimeout(4000);
    const launchOverlayVisible = await page.isVisible('#launch-overlay.show');
    console.log('launch_overlay_shows:', launchOverlayVisible);

    if (launchOverlayVisible) {
      await page.screenshot({ path: OUT_DIR + '/qa_11_launch_overlay.png' });
      console.log('SCREENSHOT: qa_11_launch_overlay.png');

      // Check overlay content
      const loStats = await page.textContent('#lo-stats').catch(() => '');
      const loMs = await page.textContent('#lo-ms').catch(() => '');
      console.log('launch_overlay_stats:', loStats.slice(0, 80));
      console.log('launch_overlay_moonstone:', loMs);

      // Test "계속 진행" (continue) button
      await page.click('#btn-continue-game');
      await page.waitForTimeout(200);
      const overlayDismissed = !(await page.isVisible('#launch-overlay.show'));
      console.log('continue_game_btn_dismisses_overlay:', overlayDismissed);
    }
  } else {
    console.log('launch_btn_not_visible: WARN');
  }

  // ── TEST: Mission Tab ────────────────────────────────────
  // Add launch history
  await page.evaluate(() => {
    gs.launches = 3;
    gs.history = [
      { no:1, quality:'PROTO-MK1', deltaV:'2.30', altitude:50, reliability:'58.7', date:'D+2' },
      { no:2, quality:'STD-MK2', deltaV:'3.10', altitude:90, reliability:'70.0', date:'D+4' },
      { no:3, quality:'PROTO-MK1', deltaV:'2.30', altitude:50, reliability:'58.7', date:'D+6' },
    ];
    renderAll();
  });

  await page.click('#nav-tab-mission');
  await page.waitForTimeout(300);

  const phaseRows = await page.evaluate(() => document.querySelectorAll('.phase-row').length);
  const historyTable = await page.evaluate(() => !!document.querySelector('.history-table'));
  const prestigePanel = await page.evaluate(() => !!document.querySelector('.prestige-panel'));

  console.log('\n=== MISSION TAB ===');
  console.log('phase_rows_count:', phaseRows);
  console.log('history_table_present:', historyTable);
  console.log('prestige_panel_present:', prestigePanel);

  await page.screenshot({ path: OUT_DIR + '/qa_12_mission_tab.png' });
  console.log('SCREENSHOT: qa_12_mission_tab.png');

  // ── TEST: Save / Load ────────────────────────────────────
  await page.evaluate(() => saveGame());
  const savedKey = await page.evaluate(() => localStorage.getItem('moonIdle_v2'));
  console.log('\n=== SAVE/LOAD ===');
  console.log('save_creates_localstorage:', savedKey !== null);
  if (savedKey) {
    const parsed = JSON.parse(savedKey);
    console.log('saved_launches:', parsed.launches);
    console.log('saved_version:', parsed.saveVersion);
  }

  // Simulate offline time
  await page.evaluate(() => {
    const old = gs.res.research;
    gs.lastTick = Date.now() - 60 * 1000; // 1 minute ago
    calcOffline();
    const diff = gs.res.research - old;
    console.log('OFFLINE_RESEARCH_GAIN:', diff.toFixed(2));
  });

  // ── TEST: BGM track switch ───────────────────────────────
  await page.evaluate(() => BGM.start(0));
  await page.waitForTimeout(200);
  const bgmLabelBefore = await page.textContent('#bgm-track-label').catch(() => '');
  await page.click('#bgm-prev-btn'); // cycles to next track
  await page.waitForTimeout(200);
  const bgmLabelAfter = await page.textContent('#bgm-track-label').catch(() => '');
  console.log('\n=== BGM ===');
  console.log('bgm_track_label_before:', bgmLabelBefore);
  console.log('bgm_track_label_after_next:', bgmLabelAfter);
  console.log('bgm_track_changed:', bgmLabelBefore !== bgmLabelAfter);

  // ── TEST: Tab switching cleans up ───────────────────────
  // Switch tabs multiple times, check no duplicate elements
  await page.click('#nav-tab-production');
  await page.waitForTimeout(100);
  await page.click('#nav-tab-research');
  await page.waitForTimeout(100);
  await page.click('#nav-tab-assembly');
  await page.waitForTimeout(100);
  await page.click('#nav-tab-launch');
  await page.waitForTimeout(100);
  const activePanes = await page.evaluate(() => document.querySelectorAll('.tab-pane.active').length);
  console.log('\n=== TAB STATE ===');
  console.log('only_one_active_pane:', activePanes === 1);
  console.log('active_panes_count:', activePanes);

  // ── FINAL ERROR CHECK ────────────────────────────────────
  console.log('\n=== FINAL CONSOLE ERRORS ===');
  if (errors.length === 0) {
    console.log('no_errors: true');
  } else {
    errors.forEach((e, i) => console.log('error_' + i + ':', e.slice(0, 150)));
  }

  await browser.close();
  console.log('\nDONE');
})().catch(e => {
  console.error('FATAL:', e.message);
  console.error(e.stack);
  process.exit(1);
});
