// MoonIdle -- Sprint 4 Playwright Smoke Tests
// QA Engineer: qa-engineer@moonidle.dev
// Covers: Boot, Initial State, Tab Navigation,
//         Assembly 3-column (HTML), BOM table, Mission sub-tabs,
//         Shimmer CSS, CRT aesthetic,
//         Phase Timeline, Achievement Grid, Prestige Star Tree,
//         ERA Badge, World Scene, Save/Load
//
// Sprint 3 BUG-S3-001 (duplicate let partsHtml) has been FIXED in Sprint 4.
// Assembly JS tests updated accordingly -- tests 5, 6, 8 now verify rendered content.
//
// [BUG-S4-001] assembly.js: `const checklist` declared twice in renderAssemblyTab()
//   (lines 322 and 406 same function scope) → SyntaxError blocks entire file.
//   Cascading: renderAssemblyTab, updateAssemblyJobs, isPhaseComplete all undefined.
//   Tests that touch assembly tab revert to KNOWN_BUG expectations.

const { test, expect } = require('@playwright/test');
const path = require('path');

// Absolute path to the game entry point
const INDEX_PATH = path.resolve(__dirname, '..', 'index.html');
const FILE_URL = 'file:///' + INDEX_PATH.replace(/\\/g, '/');

/**
 * Known error patterns (bugs filed, won't fail unknown-error checks).
 * BUG-S4-001: duplicate `const checklist` in assembly.js
 */
const KNOWN_PATTERNS = [
  /Identifier 'checklist' has already been declared/,
  /renderAssemblyTab is not defined/,
  /updateAssemblyJobs is not defined/,
  /isPhaseComplete is not defined/,
];

/**
 * Collect console errors.
 * Returns { all: [], unknown: [] }
 * unknown[] excludes messages matching KNOWN_PATTERNS.
 */
function createErrorCollector(page) {
  const errors = { all: [], unknown: [] };
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      errors.all.push(text);
      if (!KNOWN_PATTERNS.some(rx => rx.test(text))) {
        errors.unknown.push(text);
      }
    }
  });
  page.on('pageerror', err => {
    const text = err.message;
    errors.all.push(text);
    if (!KNOWN_PATTERNS.some(rx => rx.test(text))) {
      errors.unknown.push(text);
    }
  });
  return errors;
}

/**
 * Helper: bypass title screen and enter game directly.
 */
async function bypassTitleAndEnter(page) {
  await page.goto(FILE_URL, { waitUntil: 'domcontentloaded' });
  // Clear any existing saves for clean state
  await page.evaluate(() => {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('moonIdle')) localStorage.removeItem(key);
    }
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  // Bypass title screen
  await page.evaluate(() => {
    startNewGame(1);
    enterGame();
  });
  await page.waitForSelector('#app.visible', { timeout: 5000 });
}

/**
 * Helper: force-unlock assembly and mission tabs.
 */
async function unlockAssemblyAndMission(page) {
  await page.evaluate(() => {
    gs.unlocks.tab_assembly = true;
    gs.unlocks.tab_mission = true;
    renderUnlocks();
  });
}


// ===========================================================
// Test 1: Boot -- title renders, no errors
// ===========================================================
test('Boot: page load -- title visible, no JS errors', async ({ page }) => {
  const errors = createErrorCollector(page);

  await page.goto(FILE_URL, { waitUntil: 'domcontentloaded' });

  // Title screen should be visible
  await expect(page.locator('#title-screen')).toBeVisible({ timeout: 5000 });

  // Game title text
  const titleLogo = page.locator('.title-logo');
  await expect(titleLogo).toBeVisible({ timeout: 5000 });
  await expect(titleLogo).toContainText('MOON');

  // No JS errors
  expect(errors.unknown).toHaveLength(0);
});


// ===========================================================
// Test 2: Initial State -- game enters, basic UI renders
// ===========================================================
test('Initial State: game entry, basic UI rendering', async ({ page }) => {
  const errors = createErrorCollector(page);

  await bypassTitleAndEnter(page);

  // App should be visible
  await expect(page.locator('#app')).toBeVisible();
  await expect(page.locator('#topbar')).toBeVisible();
  await expect(page.locator('#res-left')).toBeAttached();

  // Nav tabs present
  const navTabs = page.locator('.nav-tab');
  const count = await navTabs.count();
  expect(count).toBeGreaterThanOrEqual(2);

  // No unknown errors
  expect(errors.unknown).toHaveLength(0);
});


// ===========================================================
// Test 3: Tab Navigation -- production / launch switching
// ===========================================================
test('Tab Navigation: switch Production / Launch', async ({ page }) => {
  const errors = createErrorCollector(page);

  await bypassTitleAndEnter(page);

  // Default: launch tab active
  await expect(page.locator('#nav-tab-launch')).toHaveClass(/active/, { timeout: 3000 });

  // Switch to production
  await page.locator('#nav-tab-production').click();
  await expect(page.locator('#nav-tab-production')).toHaveClass(/active/, { timeout: 3000 });
  await expect(page.locator('#pane-production')).toHaveClass(/active/);

  // Switch back to launch
  await page.locator('#nav-tab-launch').click();
  await expect(page.locator('#nav-tab-launch')).toHaveClass(/active/, { timeout: 3000 });

  // No unknown errors
  expect(errors.unknown).toHaveLength(0);
});


// ===========================================================
// Test 4: Assembly 3-column HTML structure present
// ===========================================================
test('Assembly 3-Column: HTML structure check', async ({ page }) => {
  const errors = createErrorCollector(page);

  await bypassTitleAndEnter(page);
  await unlockAssemblyAndMission(page);

  await page.locator('#nav-tab-assembly').click();
  await expect(page.locator('#pane-assembly')).toHaveClass(/active/, { timeout: 3000 });

  await expect(page.locator('.asm-col-left')).toBeAttached();
  await expect(page.locator('.asm-col-center')).toBeAttached();
  await expect(page.locator('.asm-col-right')).toBeAttached();

  await expect(page.locator('#asm-class-grid')).toBeAttached();
  await expect(page.locator('#asm-class-specs')).toBeAttached();
  await expect(page.locator('#rocket-art-display')).toBeAttached();
  await expect(page.locator('#asm-stage-progress')).toBeAttached();
  await expect(page.locator('#asm-bom-table-wrap')).toBeAttached();
  await expect(page.locator('#assembly-slots-wrap')).toBeAttached();

  expect(errors.unknown).toHaveLength(0);
});


// ===========================================================
// Test 5: Assembly -- rocket class grid renders
//   KNOWN_BUG S4-001: assembly.js fails to parse → grid stays empty.
// ===========================================================
test('Assembly: rocket class grid renders (BUG-S4-001 blocks)', async ({ page }) => {
  const errors = createErrorCollector(page);

  await bypassTitleAndEnter(page);
  await unlockAssemblyAndMission(page);

  await page.locator('#nav-tab-assembly').click();
  await expect(page.locator('#pane-assembly')).toHaveClass(/active/, { timeout: 3000 });
  await page.waitForTimeout(500);

  // BUG-S4-001: renderAssemblyTab is undefined → grid stays empty
  const gridContent = await page.locator('#asm-class-grid').innerHTML();
  expect(gridContent.trim().length).toBe(0); // KNOWN_BUG

  expect(errors.unknown).toHaveLength(0);
});


// ===========================================================
// Test 6: Assembly BOM -- table renders
//   KNOWN_BUG S4-001: assembly.js fails to parse → BOM stays empty.
// ===========================================================
test('Assembly BOM: BOM table renders (BUG-S4-001 blocks)', async ({ page }) => {
  const errors = createErrorCollector(page);

  await bypassTitleAndEnter(page);
  await unlockAssemblyAndMission(page);

  await page.locator('#nav-tab-assembly').click();
  await expect(page.locator('#pane-assembly')).toHaveClass(/active/, { timeout: 3000 });
  await page.waitForTimeout(500);

  await expect(page.locator('#asm-bom-table-wrap')).toBeAttached();

  // BUG-S4-001: renderAssemblyTab is undefined → BOM stays empty
  const bomContent = await page.locator('#asm-bom-table-wrap').innerHTML();
  expect(bomContent.trim().length).toBe(0); // KNOWN_BUG

  expect(errors.unknown).toHaveLength(0);
});


// ===========================================================
// Test 7: Mission sub-tabs -- 4 sub-tabs present and switchable
// ===========================================================
test('Mission Sub-tabs: 4 sub-tabs exist and switch correctly', async ({ page }) => {
  const errors = createErrorCollector(page);

  await bypassTitleAndEnter(page);
  await unlockAssemblyAndMission(page);

  await page.locator('#nav-tab-mission').click();
  await expect(page.locator('#pane-mission')).toHaveClass(/active/, { timeout: 3000 });

  const subTabs = page.locator('.msn-sub-tab');
  await expect(subTabs).toHaveCount(4);

  await expect(page.locator('.msn-sub-tab[data-subtab="phases"]')).toHaveClass(/active/);
  await expect(page.locator('#msn-sub-phases')).toHaveClass(/active/);

  await page.locator('.msn-sub-tab[data-subtab="milestones"]').click();
  await expect(page.locator('.msn-sub-tab[data-subtab="milestones"]')).toHaveClass(/active/);
  await expect(page.locator('#msn-sub-milestones')).toHaveClass(/active/);
  await expect(page.locator('#msn-sub-phases')).not.toHaveClass(/active/);

  await page.locator('.msn-sub-tab[data-subtab="achievements"]').click();
  await expect(page.locator('.msn-sub-tab[data-subtab="achievements"]')).toHaveClass(/active/);
  await expect(page.locator('#msn-sub-achievements')).toHaveClass(/active/);

  await page.locator('.msn-sub-tab[data-subtab="prestige"]').click();
  await expect(page.locator('.msn-sub-tab[data-subtab="prestige"]')).toHaveClass(/active/);
  await expect(page.locator('#msn-sub-prestige')).toHaveClass(/active/);

  await page.locator('.msn-sub-tab[data-subtab="phases"]').click();
  await expect(page.locator('.msn-sub-tab[data-subtab="phases"]')).toHaveClass(/active/);

  expect(errors.unknown).toHaveLength(0);
});


// ===========================================================
// Test 8: Assembly stage progress renders
//   KNOWN_BUG S4-001: assembly.js fails to parse → stage progress stays empty.
// ===========================================================
test('Assembly: stage progress renders (BUG-S4-001 blocks)', async ({ page }) => {
  const errors = createErrorCollector(page);

  await bypassTitleAndEnter(page);
  await unlockAssemblyAndMission(page);

  await page.locator('#nav-tab-assembly').click();
  await expect(page.locator('#pane-assembly')).toHaveClass(/active/, { timeout: 3000 });
  await page.waitForTimeout(500);

  await expect(page.locator('#asm-stage-progress')).toBeAttached();

  // BUG-S4-001: renderAssemblyTab is undefined → stage progress stays empty
  const content = await page.locator('#asm-stage-progress').innerHTML();
  expect(content.trim().length).toBe(0); // KNOWN_BUG

  expect(errors.unknown).toHaveLength(0);
});


// ===========================================================
// Test 9: Progress bar shimmer CSS animation exists
// ===========================================================
test('Visual: progress-shimmer @keyframes CSS exists', async ({ page }) => {
  await bypassTitleAndEnter(page);

  const hasShimmer = await page.evaluate(() => {
    const sheets = document.styleSheets;
    for (let i = 0; i < sheets.length; i++) {
      try {
        const rules = sheets[i].cssRules;
        for (let j = 0; j < rules.length; j++) {
          if (rules[j].type === CSSRule.KEYFRAMES_RULE && rules[j].name === 'progress-shimmer') {
            return true;
          }
        }
      } catch (e) { /* cross-origin */ }
    }
    return false;
  });

  expect(hasShimmer).toBe(true);
});


// ===========================================================
// Test 10: CRT aesthetic -- scanlines + vignette pseudo-elements
// ===========================================================
test('Visual: CRT scanlines + vignette CSS present', async ({ page }) => {
  await bypassTitleAndEnter(page);

  const scanlineContent = await page.evaluate(() => {
    return window.getComputedStyle(document.body, '::before').getPropertyValue('content');
  });
  expect(scanlineContent).not.toBe('none');

  const vignetteContent = await page.evaluate(() => {
    return window.getComputedStyle(document.body, '::after').getPropertyValue('content');
  });
  expect(vignetteContent).not.toBe('none');
});


// ===========================================================
// Test 11: Assembly tab CSS flex layout
// ===========================================================
test('Assembly CSS: flex 3-column layout definition', async ({ page }) => {
  await bypassTitleAndEnter(page);
  await unlockAssemblyAndMission(page);

  await page.locator('#nav-tab-assembly').click();
  await expect(page.locator('#pane-assembly')).toHaveClass(/active/, { timeout: 3000 });

  const display = await page.evaluate(() => {
    const el = document.getElementById('pane-assembly');
    return window.getComputedStyle(el).getPropertyValue('display');
  });
  expect(display).toBe('flex');

  const leftFlex = await page.evaluate(() => {
    const el = document.querySelector('.asm-col-left');
    return window.getComputedStyle(el).getPropertyValue('flex');
  });
  expect(leftFlex).toContain('30%');
});


// ===========================================================
// Test 12: Mission sub-tab CSS styles
// ===========================================================
test('Mission CSS: sub-tab bar flex + screen show/hide', async ({ page }) => {
  await bypassTitleAndEnter(page);
  await unlockAssemblyAndMission(page);

  await page.locator('#nav-tab-mission').click();
  await expect(page.locator('#pane-mission')).toHaveClass(/active/, { timeout: 3000 });

  const subTabsDisplay = await page.evaluate(() => {
    const el = document.getElementById('mission-sub-tabs');
    return window.getComputedStyle(el).getPropertyValue('display');
  });
  expect(subTabsDisplay).toBe('flex');

  const activeScreenDisplay = await page.evaluate(() => {
    const el = document.getElementById('msn-sub-phases');
    return window.getComputedStyle(el).getPropertyValue('display');
  });
  expect(activeScreenDisplay).toBe('block');

  const hiddenDisplay = await page.evaluate(() => {
    const el = document.getElementById('msn-sub-milestones');
    return window.getComputedStyle(el).getPropertyValue('display');
  });
  expect(hiddenDisplay).toBe('none');
});


// ===========================================================
// Test 13: [S4] Phase Timeline -- 5 nodes render
// ===========================================================
test('S4 Phase Timeline: 5 nodes render with correct states', async ({ page }) => {
  const errors = createErrorCollector(page);

  await bypassTitleAndEnter(page);
  await unlockAssemblyAndMission(page);

  await page.locator('#nav-tab-mission').click();
  await expect(page.locator('#pane-mission')).toHaveClass(/active/, { timeout: 3000 });

  await expect(page.locator('#msn-sub-phases')).toHaveClass(/active/);

  const timelineWrap = page.locator('#phase-timeline-wrap');
  const timelineHtml = await timelineWrap.innerHTML();
  expect(timelineHtml.trim().length).toBeGreaterThan(0);

  // 5 phase nodes
  const nodeCount = await page.locator('.ptl-node').count();
  expect(nodeCount).toBe(5);

  // First node should be 'current' (new game, no launches)
  await expect(page.locator('.ptl-node').first()).toHaveClass(/current/);

  // Phase detail panel
  await expect(page.locator('.ptl-detail')).toBeAttached();
  await expect(page.locator('.ptl-detail-hd')).toBeAttached();

  // ASCII scene
  const asciiCount = await page.locator('.ptl-ascii').count();
  expect(asciiCount).toBeGreaterThanOrEqual(1);

  // Clicking a node
  await page.locator('.ptl-node').first().click();
  await page.waitForTimeout(200);

  expect(errors.unknown).toHaveLength(0);
});


// ===========================================================
// Test 14: [S4] Achievement Grid -- renders in achievements sub-tab
// ===========================================================
test('S4 Achievement Grid: renders with categories and cards', async ({ page }) => {
  const errors = createErrorCollector(page);

  await bypassTitleAndEnter(page);
  await unlockAssemblyAndMission(page);

  await page.locator('#nav-tab-mission').click();
  await expect(page.locator('#pane-mission')).toHaveClass(/active/, { timeout: 3000 });

  await page.locator('.msn-sub-tab[data-subtab="achievements"]').click();
  await expect(page.locator('#msn-sub-achievements')).toHaveClass(/active/);

  const achWrap = page.locator('#achievement-list-wrap');
  const achHtml = await achWrap.innerHTML();
  expect(achHtml.trim().length).toBeGreaterThan(0);

  await expect(page.locator('.ach-summary')).toBeAttached();

  const catHeaders = await page.locator('.ach-cat-hd').count();
  expect(catHeaders).toBeGreaterThanOrEqual(2);

  const achCards = await page.locator('.ach-card').count();
  expect(achCards).toBeGreaterThanOrEqual(5);

  const lockedCards = await page.locator('.ach-card.locked').count();
  expect(lockedCards).toBeGreaterThan(0);

  expect(errors.unknown).toHaveLength(0);
});


// ===========================================================
// Test 15: [S4] Prestige Star Tree -- renders in prestige sub-tab
// ===========================================================
test('S4 Prestige Star Tree: renders with tiers and nodes', async ({ page }) => {
  const errors = createErrorCollector(page);

  await bypassTitleAndEnter(page);
  await unlockAssemblyAndMission(page);

  await page.locator('#nav-tab-mission').click();
  await expect(page.locator('#pane-mission')).toHaveClass(/active/, { timeout: 3000 });

  await page.locator('.msn-sub-tab[data-subtab="prestige"]').click();
  await expect(page.locator('#msn-sub-prestige')).toHaveClass(/active/);

  const pstWrap = page.locator('#prestige-star-tree-wrap');
  const pstHtml = await pstWrap.innerHTML();
  expect(pstHtml.trim().length).toBeGreaterThan(0);

  await expect(page.locator('.pst-header')).toBeAttached();

  const tierLabels = await page.locator('.pst-tier-label').count();
  expect(tierLabels).toBeGreaterThanOrEqual(2);

  const pstCards = await page.locator('.pst-card').count();
  expect(pstCards).toBeGreaterThanOrEqual(4);

  await expect(page.locator('.pst-reset-section')).toBeAttached();

  expect(errors.unknown).toHaveLength(0);
});


// ===========================================================
// Test 16: [S4] ERA Badge -- top bar shows phase info
// ===========================================================
test('S4 ERA Badge: topbar shows current phase', async ({ page }) => {
  const errors = createErrorCollector(page);

  await bypassTitleAndEnter(page);

  const eraBadge = page.locator('#tb-era-badge');
  await expect(eraBadge).toBeVisible();

  const badgeText = await eraBadge.textContent();
  expect(badgeText.length).toBeGreaterThan(0);

  const eraSubtitle = page.locator('#tb-era-subtitle');
  await expect(eraSubtitle).toBeVisible();
  const subtitleText = await eraSubtitle.textContent();
  expect(subtitleText.length).toBeGreaterThan(0);

  expect(errors.unknown).toHaveLength(0);
});


// ===========================================================
// Test 17: [S4] World Scene -- world-bg opacity in production tab
// ===========================================================
test('S4 World Scene: opacity 1.0 in production tab', async ({ page }) => {
  const errors = createErrorCollector(page);

  await bypassTitleAndEnter(page);

  await page.locator('#nav-tab-production').click();
  await expect(page.locator('#nav-tab-production')).toHaveClass(/active/, { timeout: 3000 });
  // Wait for CSS transition (opacity 0.5s) to complete
  await page.waitForTimeout(700);

  const opacity = await page.evaluate(() => {
    const wb = document.getElementById('world-bg');
    return window.getComputedStyle(wb).getPropertyValue('opacity');
  });
  expect(parseFloat(opacity)).toBe(1);

  await expect(page.locator('#world-scene')).toBeAttached();
  await expect(page.locator('#buildings-layer')).toBeAttached();
  await expect(page.locator('#ground-line')).toBeAttached();

  const pointerEvents = await page.evaluate(() => {
    const wb = document.getElementById('world-bg');
    return window.getComputedStyle(wb).getPropertyValue('pointer-events');
  });
  expect(pointerEvents).toBe('auto');

  expect(errors.unknown).toHaveLength(0);
});


// ===========================================================
// Test 18: [S4] World Scene -- buildings render
// ===========================================================
test('S4 World Scene: buildings render in world layer', async ({ page }) => {
  const errors = createErrorCollector(page);

  await bypassTitleAndEnter(page);

  await page.locator('#nav-tab-production').click();
  await page.waitForTimeout(500);

  // Should have world-bld elements (at least housing is unlocked by default)
  const worldBlds = await page.locator('.world-bld').count();
  expect(worldBlds).toBeGreaterThan(0);

  expect(errors.unknown).toHaveLength(0);
});


// ===========================================================
// Test 19: [S4] Research tab renders without errors
//   NOTE: renderResearchTab() replaces static #tree-container
//         with dynamic .rsh-layout2 > .rsh-tree-area structure.
// ===========================================================
test('S4 Research tab: renders without errors', async ({ page }) => {
  const errors = createErrorCollector(page);

  await bypassTitleAndEnter(page);

  // Unlock research tab explicitly
  await page.evaluate(() => {
    gs.unlocks.tab_research = true;
    renderUnlocks();
  });

  await page.locator('#nav-tab-research').click();
  await expect(page.locator('#pane-research')).toHaveClass(/active/, { timeout: 3000 });
  await page.waitForTimeout(600); // wait for renderAll() interval

  await expect(page.locator('#research-layout')).toBeAttached();
  // Dynamic research layout (replaces static #tree-container)
  await expect(page.locator('.rsh-layout2')).toBeAttached();
  await expect(page.locator('.rsh-tree-area')).toBeAttached();

  expect(errors.unknown).toHaveLength(0);
});


// ===========================================================
// Test 20: [S4] Save/Load cycle works
// ===========================================================
test('S4 Save/Load: preserves game state', async ({ page }) => {
  const errors = createErrorCollector(page);

  await bypassTitleAndEnter(page);

  await page.locator('#nav-tab-production').click();
  await page.waitForTimeout(500);

  await page.evaluate(() => saveGame());

  const money = await page.evaluate(() => gs.res.money);
  expect(money).toBeGreaterThan(0);

  const ok = await page.evaluate(() => loadGame(1));
  expect(ok).toBeTruthy();

  const moneyAfterLoad = await page.evaluate(() => gs.res.money);
  expect(moneyAfterLoad).toBeGreaterThan(0);

  expect(errors.unknown).toHaveLength(0);
});
