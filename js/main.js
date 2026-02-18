// ============================================================
//  TAB SWITCHING
// ============================================================
function switchMainTab(tabId) {
  activeTab = tabId;
  document.querySelectorAll('.nav-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tabId);
  });
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  const pane = document.getElementById('pane-' + tabId);
  if (pane) pane.classList.add('active');
  renderAll();
}


// ============================================================
//  RENDER: RESOURCES
// ============================================================
function renderResources() {
  const prod = getProduction();
  let html = '';
  RESOURCES.forEach(r => {
    const rate = prod[r.id] || 0;
    const rateStr = rate > 0.001 ? ` <span class="rate">(+${fmtDec(rate, 1)}/s)</span>` : '';
    html += `<div class="res-cell" style="color:${r.color}">${r.symbol}: <strong>${fmt(gs.res[r.id] || 0)}</strong>${rateStr}</div>`;
  });
  if (gs.moonstone > 0) {
    html += `<div class="res-cell ms" id="ms-display" style="color:var(--amber)">MS: <strong>${gs.moonstone}</strong></div>`;
  }
  const el = document.getElementById('res-bar-inner');
  if (el) el.innerHTML = html;
  const sndBtn = document.getElementById('sound-btn');
  if (sndBtn) {
    sndBtn.textContent = gs.settings.sound ? 'SND:ON' : 'SND:OFF';
    sndBtn.style.color = gs.settings.sound ? 'var(--green-mid)' : 'var(--red)';
  }
}


// ============================================================
//  RENDER ALL
// ============================================================
function renderAll() {
  renderResources();
  if (activeTab === 'production') renderProductionTab();
  if (activeTab === 'research')   renderResearchTab();
  if (activeTab === 'assembly')   renderAssemblyTab();
  if (activeTab === 'launch')     renderLaunchTab();
  if (activeTab === 'mission')    renderMissionTab();
  updateWorldBuildings();
}


// ============================================================
//  TITLE SCREEN
// ============================================================
const BOOT_LINES = [
  '> [SYS] MOON IDLE LAUNCH FACILITY — INITIALIZING...',
  '> [CHK] 저장 데이터 확인 중...',
  '> [OK]  세이브 시스템 v2 — 정상',
  '> [CHK] 자원 시스템 로드...',
  '> [OK]  Fe/LOX/PCB/RP — 확인',
  '> [CHK] 제조 파이프라인...',
  '> [OK]  연구소 초기화 완료',
  '> [CHK] 텔레메트리 시스템...',
  '> [OK]  모든 시스템 NOMINAL',
  '> [SYS] 발사 시설 준비 완료.',
];

function startTitleSequence() {
  const log = document.getElementById('boot-log');
  if (!log) return;
  log.innerHTML = '';
  BOOT_LINES.forEach((line, i) => {
    setTimeout(() => {
      const span = document.createElement('span');
      span.className = 'boot-line';
      span.style.animationDelay = '0s';
      span.textContent = line;
      log.appendChild(span);
      log.scrollTop = log.scrollHeight;
    }, i * 130);
  });
}

function startNewGame() {
  gs.res = { money:500, metal:0, fuel:0, electronics:0, research:0 };
  gs.buildings = { ops_center:0, supply_depot:0, mine:0, extractor:0, refinery:0, cryo_plant:0, elec_lab:0, fab_plant:0, research_lab:1, r_and_d:0, solar_array:0, launch_pad:0 };
  gs.parts = { engine:0, fueltank:0, control:0, hull:0, payload:0 };
  gs.assembly = { selectedQuality:'proto', jobs:[] };
  gs.upgrades = {};
  gs.launches = 0;
  gs.moonstone = 0;
  gs.history = [];
  gs.lastTick = Date.now();
  gs.settings = { sound: true };
  gs.unlocks = {
    tab_production: true, tab_research: true, tab_assembly: false,
    tab_launch: false, tab_mission: false,
    bld_ops_center: false, bld_supply_depot: false, bld_mine: false,
    bld_extractor: false, bld_refinery: false, bld_cryo_plant: false,
    bld_elec_lab: false, bld_fab_plant: false, bld_research_lab: true,
    bld_r_and_d: false, bld_solar_array: false, bld_launch_pad: false,
  };
  prodMult = {}; globalMult = 1; partCostMult = 1;
  fusionBonus = 0; reliabilityBonus = 0; slotBonus = 0;
  enterGame();
}

function continueGame() {
  const ok = loadGame();
  if (!ok) { startNewGame(); return; }
  enterGame();
}

function enterGame() {
  const ts = document.getElementById('title-screen');
  if (ts) ts.classList.add('fade-out');
  setTimeout(() => {
    if (ts) ts.style.display = 'none';
    const app = document.getElementById('app');
    if (app) app.classList.add('visible');
    calcOffline();
    renderUnlocks();
    renderAll();
    setInterval(tick, 200);
    setInterval(renderAll, 500);
    setInterval(saveGame, 10000);
    animateWorld();
  }, 800);
}

function toggleSound() {
  gs.settings.sound = !gs.settings.sound;
  const btn = document.getElementById('sound-btn');
  if (btn) btn.textContent = gs.settings.sound ? 'SND:ON' : 'SND:OFF';
  saveGame();
}


// ============================================================
//  INIT
// ============================================================
function init() {
  // Bind title screen buttons
  const newGameBtn = document.getElementById('new-game-btn');
  if (newGameBtn) newGameBtn.addEventListener('click', startNewGame);

  const contBtn = document.getElementById('continue-btn');
  if (contBtn) contBtn.addEventListener('click', continueGame);

  const sndBtn = document.getElementById('sound-btn');
  if (sndBtn) sndBtn.addEventListener('click', toggleSound);

  const prestigeBtn = document.getElementById('btn-prestige');
  if (prestigeBtn) prestigeBtn.addEventListener('click', confirmLaunch);

  const contGameBtn = document.getElementById('btn-continue-game');
  if (contGameBtn) contGameBtn.addEventListener('click', closeLaunchOverlay);

  // Nav tabs
  document.querySelectorAll('.nav-tab').forEach(t => {
    t.addEventListener('click', () => switchMainTab(t.dataset.tab));
  });

  // Boot sequence
  startTitleSequence();

  // Check for existing save
  const saved = localStorage.getItem(SAVE_KEY);
  setTimeout(() => {
    if (saved) {
      const contBtnEl = document.getElementById('continue-btn');
      if (contBtnEl) contBtnEl.style.display = '';
      try {
        const d = JSON.parse(saved);
        const bldTotal = Object.values(d.buildings || {}).reduce((a, b) => a + b, 0);
        const saveStrip = document.getElementById('save-strip');
        if (saveStrip) saveStrip.innerHTML =
          `발사: <span>${d.launches || 0}회</span> &nbsp; 문스톤: <span>${d.moonstone || 0}</span> &nbsp; 시설: <span>${bldTotal}개</span>`;
      } catch(e) {}
    }
  }, 1500);
}

document.addEventListener('DOMContentLoaded', init);
