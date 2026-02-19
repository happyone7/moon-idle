// MoonIdle – Sprint 2 Playwright Smoke Tests
// QA Engineer: qa-engineer@soulspire.dev
// Covers: Boot, Initial State, Tab Navigation, Save/Load

const { test, expect } = require('@playwright/test');
const path = require('path');

// Absolute path to the game entry point
const INDEX_PATH = path.resolve(__dirname, '..', 'index.html');
const FILE_URL = 'file:///' + INDEX_PATH.replace(/\\/g, '/');

// ─────────────────────────────────────────────────────────────
// Test 1: Boot — title renders, no console errors on load
// ─────────────────────────────────────────────────────────────
test('Boot: 페이지 로드 및 콘솔 오류 없음', async ({ page }) => {
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.message));

  await page.goto(FILE_URL, { waitUntil: 'domcontentloaded' });

  // Game title header should be visible
  const header = page.locator('h1');
  await expect(header).toBeVisible({ timeout: 5000 });
  await expect(header).toContainText('MOON IDLE');

  // Main app container should be present
  await expect(page.locator('#app')).toBeVisible();

  // Resources panel should be present
  await expect(page.locator('#resources-list')).toBeAttached();

  // No uncaught JS errors on load
  expect(consoleErrors).toHaveLength(0);
});

// ─────────────────────────────────────────────────────────────
// Test 2: Initial State — game state initializes without errors
// ─────────────────────────────────────────────────────────────
test('Initial State: 게임 상태 초기화 및 자원 패널 렌더링', async ({ page }) => {
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.message));

  // Start fresh — clear storage so game initialises from scratch
  await page.goto(FILE_URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.removeItem('moonIdle_v1'));
  await page.reload({ waitUntil: 'domcontentloaded' });

  // Wait for renderAll() to populate resources
  await expect(page.locator('#resources-list')).not.toBeEmpty({ timeout: 5000 });

  // At least one resource item should be rendered
  const resourceItems = page.locator('#resources-list .resource-item');
  await expect(resourceItems).toHaveCount(4); // metal, fuel, electronics, research

  // Buildings tab should be the default active tab
  await expect(page.locator('#tab-buildings')).toHaveClass(/active/);
  await expect(page.locator('#buildings-list')).not.toBeEmpty({ timeout: 5000 });

  // Rocket assembly section should be present
  await expect(page.locator('#parts-list')).toBeAttached();
  await expect(page.locator('#assembly-slots')).toBeAttached();

  // No errors during initialisation
  expect(consoleErrors).toHaveLength(0);
});

// ─────────────────────────────────────────────────────────────
// Test 3: Tab Navigation — buildings / upgrades switch without errors
// ─────────────────────────────────────────────────────────────
test('Tab Navigation: 시설/업그레이드 탭 전환', async ({ page }) => {
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.message));

  await page.goto(FILE_URL, { waitUntil: 'domcontentloaded' });

  // Default: buildings tab active
  await expect(page.locator('#tab-buildings')).toHaveClass(/active/, { timeout: 5000 });
  await expect(page.locator('#tab-upgrades')).not.toHaveClass(/active/);

  // Click upgrades tab
  const upgradesTab = page.locator('.tab', { hasText: '업그레이드' });
  await upgradesTab.click();

  // Upgrades pane should become active
  await expect(page.locator('#tab-upgrades')).toHaveClass(/active/, { timeout: 3000 });
  await expect(page.locator('#tab-buildings')).not.toHaveClass(/active/);

  // Switch back to buildings
  const buildingsTab = page.locator('.tab', { hasText: '시설' });
  await buildingsTab.click();

  await expect(page.locator('#tab-buildings')).toHaveClass(/active/, { timeout: 3000 });

  // No JS errors during navigation
  expect(consoleErrors).toHaveLength(0);
});

// ─────────────────────────────────────────────────────────────
// Test 4: Save/Load — manual save persists state across reload
// ─────────────────────────────────────────────────────────────
test('Save/Load: 게임 저장 후 리로드 시 상태 복원', async ({ page }) => {
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.message));

  // Start fresh
  await page.goto(FILE_URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.removeItem('moonIdle_v1'));
  await page.reload({ waitUntil: 'domcontentloaded' });

  // Wait for game to render, then manually inject some resource and save
  await expect(page.locator('#resources-list')).not.toBeEmpty({ timeout: 5000 });

  await page.evaluate(() => {
    // Give the player some resources and trigger save
    gs.res.metal = 999;
    gs.res.fuel = 42;
    saveGame();
  });

  // Verify save key exists in localStorage
  const savedRaw = await page.evaluate(() => localStorage.getItem('moonIdle_v1'));
  expect(savedRaw).not.toBeNull();

  const savedData = JSON.parse(savedRaw);
  expect(savedData.gs.res.metal).toBe(999);

  // Reload the page — game should load from save
  await page.reload({ waitUntil: 'domcontentloaded' });

  await expect(page.locator('#resources-list')).not.toBeEmpty({ timeout: 5000 });

  // After reload, metal should be restored to 999 (or higher due to offline progress)
  const metalAfterReload = await page.evaluate(() => gs.res.metal);
  expect(metalAfterReload).toBeGreaterThanOrEqual(999);

  // Verify save key is still present (game re-saved on load)
  const savedAfterReload = await page.evaluate(() => localStorage.getItem('moonIdle_v1'));
  expect(savedAfterReload).not.toBeNull();

  // No errors during save/load cycle
  expect(consoleErrors).toHaveLength(0);
});
