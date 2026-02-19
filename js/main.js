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

  // Left panel update
  const rlInner = document.getElementById('rl-inner');
  if (rlInner) {
    const RES_MAX = { money:999999, metal:50000, fuel:20000, electronics:10000, research:5000 };
    let html = '';
    RESOURCES.forEach(r => {
      const val = gs.res[r.id] || 0;
      const rate = prod[r.id] || 0;
      const max = RES_MAX[r.id] || 10000;
      const pct = Math.min(100, (val / max) * 100);
      const isAmber = r.id === 'money';
      html += `<div class="rl-item">
        <div class="rl-label">${r.symbol} ${r.name}</div>
        <div class="rl-val" style="color:${r.color}">${fmt(val)}</div>
        ${rate > 0.001 ? `<div class="rl-rate">+${fmtDec(rate, 2)}/s</div>` : ''}
        <div class="rl-bar"><div class="rl-bar-fill${isAmber ? ' amber' : ''}" style="width:${pct.toFixed(1)}%"></div></div>
      </div>`;
    });
    // Worker status
    const avail = getAvailableWorkers();
    const totalW = gs.workers || 1;
    const assignedW = totalW - avail;
    html += `<div class="rl-item" style="border-top:1px solid var(--green-dim);margin-top:4px;padding-top:5px;">
      <div class="rl-label">&#128100; 인원</div>
      <div class="rl-val" style="color:var(--white)">${assignedW} / ${totalW}명</div>
      <div class="rl-rate">여유 ${avail}명</div>
    </div>`;
    rlInner.innerHTML = html;
  }

  const rlMs = document.getElementById('rl-ms-box');
  if (rlMs) {
    if (gs.moonstone > 0) {
      rlMs.innerHTML = `<div class="rl-ms-row"><div class="rl-ms-label">&#9670; MOONSTONE</div><div class="rl-ms-val">${gs.moonstone}</div></div>`;
    } else {
      rlMs.innerHTML = '';
    }
  }

  // Update sound button
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

function startNewGame(slot) {
  currentSaveSlot = slot || 1;
  gs.res = { money:0, metal:0, fuel:0, electronics:0, research:0 };
  gs.buildings = { housing:0, ops_center:1, supply_depot:0, mine:0, extractor:0, refinery:0, cryo_plant:0, elec_lab:0, fab_plant:0, research_lab:0, r_and_d:0, solar_array:0, launch_pad:0 };
  gs.workers = 1;  // 건물 구매마다 자동 +1
  gs.assignments = { ops_center: 1 };  // 첫 워커는 ops_center 자동 배치
  gs.bldLevels = {};
  gs.bldUpgrades = {};
  gs.addons = {};
  gs.addonUpgrades = {};
  gs.parts = { engine:0, fueltank:0, control:0, hull:0, payload:0 };
  gs.assembly = { selectedQuality:'proto', jobs:[] };
  gs.upgrades = {};
  gs.launches = 0;
  gs.moonstone = 0;
  gs.history = [];
  gs.lastTick = Date.now();
  gs.settings = { sound: true };
  gs.unlocks = {
    tab_production: true, tab_research: false, tab_assembly: false,
    tab_launch: false, tab_mission: false,
    bld_housing: true, bld_ops_center: true, bld_supply_depot: false, bld_mine: false,
    bld_extractor: false, bld_refinery: false, bld_cryo_plant: false,
    bld_elec_lab: false, bld_fab_plant: false, bld_research_lab: true,
    bld_r_and_d: false, bld_solar_array: false, bld_launch_pad: false,
  };
  prodMult = {}; globalMult = 1; partCostMult = 1;
  fusionBonus = 0; reliabilityBonus = 0; slotBonus = 0;
  enterGame();
}

function continueGame(slot) {
  const ok = loadGame(slot);
  if (!ok) { startNewGame(slot || 1); return; }
  enterGame();
}


// ============================================================
//  SAVE SLOT MODAL
// ============================================================
function openSaveSlotModal(mode) {
  const modal = document.getElementById('save-slot-modal');
  if (!modal) return;
  _renderSlotModal(modal, mode);
  modal.style.display = 'flex';
}

function closeSaveSlotModal() {
  const modal = document.getElementById('save-slot-modal');
  if (modal) modal.style.display = 'none';
}

function _renderSlotModal(modal, mode) {
  const slots = getSaveSlots();
  const title = mode === 'new' ? '새 게임 — 슬롯 선택' : '이어하기 — 슬롯 선택';
  let slotsHtml = '';
  slots.forEach(s => {
    if (s.empty) {
      if (mode === 'new') {
        slotsHtml += `<div class="ssm-slot ssm-empty" onclick="doNewGameInSlot(${s.slot})">
          <div class="ssm-slot-num">SLOT ${s.slot}</div>
          <div class="ssm-slot-info">— 비어 있음 —</div>
          <div class="ssm-slot-action">[ 새 게임 시작 ]</div>
        </div>`;
      } else {
        slotsHtml += `<div class="ssm-slot ssm-empty ssm-disabled">
          <div class="ssm-slot-num">SLOT ${s.slot}</div>
          <div class="ssm-slot-info">— 비어 있음 —</div>
        </div>`;
      }
    } else {
      const date = new Date(s.lastTick).toLocaleDateString('ko-KR');
      if (mode === 'new') {
        slotsHtml += `<div class="ssm-slot ssm-occupied" onclick="confirmNewInSlot(${s.slot})">
          <div class="ssm-slot-num">SLOT ${s.slot}</div>
          <div class="ssm-slot-info">발사 ${s.launches}회 &nbsp;|&nbsp; ◆ ${s.moonstone} &nbsp;|&nbsp; 시설 ${s.buildings}개</div>
          <div class="ssm-slot-date">${date}</div>
          <div class="ssm-slot-action ssm-warn">[ 덮어쓰기 — 클릭 확인 ]</div>
        </div>`;
      } else {
        slotsHtml += `<div class="ssm-slot ssm-occupied" onclick="doLoadSlot(${s.slot})">
          <div class="ssm-slot-num">SLOT ${s.slot}</div>
          <div class="ssm-slot-info">발사 ${s.launches}회 &nbsp;|&nbsp; ◆ ${s.moonstone} &nbsp;|&nbsp; 시설 ${s.buildings}개</div>
          <div class="ssm-slot-date">${date}</div>
          <div class="ssm-slot-action">[ 불러오기 ]</div>
        </div>`;
      }
    }
  });
  modal.innerHTML = `<div class="ssm-box">
    <div class="ssm-title">${title}</div>
    <div class="ssm-slots">${slotsHtml}</div>
    <button class="ssm-cancel" onclick="closeSaveSlotModal()">[ 취소 ]</button>
  </div>`;
}

function confirmNewInSlot(slot) {
  const modal = document.getElementById('save-slot-modal');
  if (!modal) return;
  modal.innerHTML = `<div class="ssm-box">
    <div class="ssm-title ssm-warn-title">슬롯 ${slot} 덮어쓰기?</div>
    <div class="ssm-confirm-text">슬롯 ${slot}의 기존 데이터가 삭제됩니다.<br>이 작업은 되돌릴 수 없습니다.</div>
    <div class="ssm-confirm-btns">
      <button class="ssm-btn ssm-btn-warn" onclick="doNewGameInSlot(${slot})">[ 덮어쓰기 ]</button>
      <button class="ssm-btn" onclick="openSaveSlotModal('new')">[ 취소 ]</button>
    </div>
  </div>`;
}

function doNewGameInSlot(slot) {
  deleteSlot(slot);
  closeSaveSlotModal();
  startNewGame(slot);
}

function doLoadSlot(slot) {
  closeSaveSlotModal();
  continueGame(slot);
}

function enterGame() {
  const ts = document.getElementById('title-screen');
  if (ts) ts.classList.add('fade-out');
  setTimeout(() => {
    if (ts) ts.style.display = 'none';
    const app = document.getElementById('app');
    if (app) app.classList.add('visible');
    const rl = document.getElementById('res-left');
    if (rl) rl.classList.add('visible');
    if (typeof initWorldDrag === 'function') initWorldDrag();
    if (typeof BGM !== 'undefined' && gs.settings.sound) {
      setTimeout(() => BGM.start(0), 1200);
    }
    calcOffline();
    renderUnlocks();
    renderAll();
    setInterval(tick, 200);
    setInterval(renderAll, 500);
    setInterval(saveGame, 10000);
  }, 800);
}

function toggleSound() {
  gs.settings.sound = !gs.settings.sound;
  if (typeof BGM !== 'undefined') {
    if (gs.settings.sound) BGM.start();
    else BGM.stop();
  }
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
  if (newGameBtn) newGameBtn.addEventListener('click', () => openSaveSlotModal('new'));

  const contBtn = document.getElementById('continue-btn');
  if (contBtn) contBtn.addEventListener('click', () => openSaveSlotModal('continue'));

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

  // Check for existing saves (migrate legacy save first)
  migrateLegacySave();
  const allSlots = getSaveSlots();
  const occupied = allSlots.filter(s => !s.empty);
  setTimeout(() => {
    if (occupied.length > 0) {
      const contBtnEl = document.getElementById('continue-btn');
      if (contBtnEl) contBtnEl.style.display = '';
    }
    const saveStrip = document.getElementById('save-strip');
    if (saveStrip) {
      if (occupied.length > 0) {
        const totalLaunches = occupied.reduce((a, s) => a + s.launches, 0);
        const totalMs = occupied.reduce((a, s) => a + s.moonstone, 0);
        saveStrip.innerHTML = `저장 슬롯 ${occupied.length}개 &nbsp;|&nbsp; 발사: <span>${totalLaunches}회</span> &nbsp; 문스톤: <span>${totalMs}</span>`;
      } else {
        saveStrip.textContent = '// 저장 데이터 없음';
      }
    }
  }, 1500);
}

document.addEventListener('DOMContentLoaded', init);
