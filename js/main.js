// ============================================================
//  TAB SWITCHING
// ============================================================
function switchMainTab(tabId) {
  // 탭 전환 클릭음
  playSfx('triangle', 220, 0.05, 0.025, 330);
  // BGM 탭 연동 — 페이즈 갱신 + 발사 탭 덕킹
  if (typeof BGM !== 'undefined' && BGM.playing) {
    BGM.duck(tabId === 'launch');
    BGM.refreshPhase();
  }
  activeTab = tabId;
  document.body.className = 'tab-' + tabId;
  // U8-4: 연구 탭 활성 시 research-active 클래스 토글 (풀-레이아웃용)
  document.body.classList.toggle('research-active', tabId === 'research');
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
  const rlInner = document.getElementById('rl-inner');
  if (!rlInner) return;

  const RES_MAX  = BALANCE.RES_MAX;
  const LOW_THRESH = BALANCE.RES_LOW_THRESH;

  // ── 자금 섹션 ──────────────────────────────────────────────
  const moneyVal  = gs.res.money || 0;
  const moneyRate = prod.money   || 0;
  const moneyPct  = Math.min(100, (moneyVal / RES_MAX.money) * 100);
  const moneyRateStr = moneyRate >= 0.001 ? `(+${fmtDec(moneyRate,1)}/s)` : '';

  let html = `
    <div class="rl-fund-sect">
      <div class="rl-fund-title">$ 기금 <span class="rl-en">(FUND)</span></div>
      <div class="rl-fund-main">
        <span class="rl-fund-val">$ ${fmtComma(moneyVal)}</span>
        <span class="rl-fund-rate">${moneyRateStr}</span>
      </div>
      <div class="rl-bar"><div class="rl-bar-fill amber" style="width:${moneyPct.toFixed(1)}%"></div></div>
    </div>`;

  // ── 리소스 아이템 헬퍼 ──────────────────────────────────────
  function resItem(id, kor, eng) {
    const val  = gs.res[id] || 0;
    const rate = prod[id]   || 0;
    const max  = RES_MAX[id] || 10000;
    const pct  = Math.min(100, (val / max) * 100);
    const rateStr = rate >= 0.001 ? `(+${fmtDec(rate,2)}/s)` : '';
    const isLow   = (LOW_THRESH[id] !== undefined) && val < LOW_THRESH[id];
    const barColor = id === 'copper' ? ' background:#b87333;' : '';
    const resDef  = typeof RESOURCES !== 'undefined' ? RESOURCES.find(r => r.id === id) : null;
    const sym     = resDef ? resDef.symbol : '';
    const symCol  = resDef ? resDef.color  : 'var(--green)';
    const icon    = resDef ? resDef.icon   : '';
    const iconCol = resDef ? (resDef.iconColor || resDef.color) : 'var(--green)';
    return `
      <div class="rl-v7item">
        <div class="rl-v7hd">
          <span class="rl-v7name"><span style="color:${iconCol}">${icon}</span> ${kor} <span class="rl-en">(${eng})</span> <span class="rl-res-sym" style="color:${symCol}">${sym}</span></span>
          <span class="rl-v7rate">${rateStr}</span>
        </div>
        <div class="rl-v7val">${fmtComma(Math.floor(val))}</div>
        <div class="rl-bar" style="position:relative">
          <div class="rl-bar-fill" style="width:${pct.toFixed(1)}%;${barColor}"></div>
          ${isLow ? '<span class="rl-low-badge">LOW</span>' : ''}
        </div>
      </div>`;
  }

  // ■ 원자재
  html += `<div class="rl-sect-hd">&#9632; 원자재</div>`;
  html += resItem('iron',        '철',        'Iron');
  html += resItem('copper',      '구리',     'Copper');

  // ■ 가공품
  html += `<div class="rl-sect-hd">&#9632; 가공품</div>`;
  html += resItem('electronics', '전자부품', 'Electronics');

  // ■ 추진재
  html += `<div class="rl-sect-hd">&#9632; 추진재</div>`;
  html += resItem('fuel', 'LOX', '액체산소');

  // ■ 연구
  html += `<div class="rl-sect-hd">&#9632; 연구</div>`;
  html += resItem('research', '연구 포인트', 'Research');

  // 인원 — 시민(유휴) / 직원(배치) / 전체
  const idleCitizens = gs.citizens || 0;
  const totalPop     = typeof getTotalWorkers === 'function' ? getTotalWorkers() : idleCitizens;
  const assignedW    = typeof getTotalAssigned === 'function' ? getTotalAssigned() : 0;
  html += `
    <div class="rl-v7workers">
      <div class="rl-v7hd">
        <span class="rl-v7name">&#128101; 전체 인원</span>
        <span class="rl-v7right">
          <span class="rl-v7val" style="color:var(--white)">${totalPop}명</span>
        </span>
      </div>
      <div style="font-size:10px;padding:2px 0 0 4px;color:var(--green-dim)">
        시민 <span style="color:var(--green-mid)">${idleCitizens}</span> &nbsp;
        직원 <span style="color:var(--amber)">${assignedW}</span>
      </div>
    </div>`;

  rlInner.innerHTML = html;

  // 문스톤
  const rlMs = document.getElementById('rl-ms-box');
  if (rlMs) {
    rlMs.innerHTML = gs.moonstone > 0
      ? `<div class="rl-ms-row"><div class="rl-ms-label">&#9670; MOONSTONE</div><div class="rl-ms-val">${gs.moonstone}</div></div>`
      : '';
  }

  // 사운드 버튼
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
  if (activeTab === 'production') { renderProductionTab(); }
  if (activeTab === 'research')   renderResearchTab();
  if (activeTab === 'assembly')   renderAssemblyTab();
  if (activeTab === 'launch')     renderLaunchTab();
  if (activeTab === 'mission')    renderMissionTab();
  if (activeTab === 'automation') renderAutomationTab();
  updateWorldBuildings();
  if (typeof refreshBovBuyButton === 'function') refreshBovBuyButton();
  if (typeof renderMilestonePanel === 'function') renderMilestonePanel();
  if (typeof updateTopBarEra === 'function') updateTopBarEra(); // P4-6
  // BGM 페이즈 갱신 (unlock 상태 변화 반영)
  if (typeof BGM !== 'undefined' && BGM.playing) BGM.refreshPhase();
  // LUNA-7 튜토리얼 봇 업데이트
  if (typeof tutBot !== 'undefined') tutBot.update();
  // document.title 동적 업데이트
  _updateDocTitle();
}

function _updateDocTitle() {
  const canLaunch = (typeof getRocketCompletion === 'function' && getRocketCompletion() >= 100);
  if (canLaunch) {
    document.title = '[발사 준비] MoonIdle';
  } else {
    const prod = getProduction();
    const incomeStr = prod.money > 0 ? ` +${Math.floor(prod.money)}/s` : '';
    document.title = `MoonIdle${incomeStr}`;
  }
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
  gs.res = { money:BALANCE.START.money, iron:0, copper:0, fuel:0, electronics:0, research:0 };
  gs.buildings = { housing:1, ops_center:0, supply_depot:0, mine:0, extractor:0, refinery:0, cryo_plant:0, elec_lab:0, fab_plant:0, research_lab:0, r_and_d:0, solar_array:0, launch_pad:0 };
  gs.workers = BALANCE.START.workers;
  gs.citizens = BALANCE.START.citizens;
  gs.citizenRecruits = 0;  // 누적 분양 횟수 (분양 비용 산정용)
  gs._citizenModelV2 = true;  // 시민/직원 분리 모델
  gs.assignments = {};
  gs.specialists = {};
  gs.opsRoles = { sales: 0, accounting: 0, consulting: 0 };
  gs._prodHubVisited = false;
  gs.bldLevels = {};
  gs.bldSlotLevels = {};
  gs.bldUpgrades = {};
  gs.addons = {};
  gs.addonUpgrades = {};
  gs.parts = { hull:0, engine:0, propellant:0, pump_chamber:0 };
  gs.mfgActive = {};
  gs.fuelInjection = 0;
  gs.fuelInjecting = false;
  gs.assembly = { selectedQuality:'proto', jobs:[] };
  gs.fuelLoaded = false;
  gs.upgrades = {};
  gs.researchProgress = {};
  gs.researchPaused = {};
  gs.researchQueue = [];
  gs.maxResearchSlots = 1;
  gs.msUpgrades = {};
  gs.achievements = {};       // P4-2
  gs.prestigeStars = {};      // P4-3
  gs.prestigeCount = 0;       // P4-3
  gs.launches = 0;
  gs.moonstone = 0;
  gs.history = [];
  gs.lastTick = Date.now();
  gs.settings = { sound: true, lang: 'en' };
  gs.unlocks = {
    tab_production: true, tab_research: false, tab_assembly: false,
    tab_launch: true,  tab_mission: false, tab_automation: false,
    bld_housing: true, bld_ops_center: true, bld_supply_depot: false, bld_mine: false,
    bld_extractor: false, bld_refinery: false, bld_cryo_plant: false,
    bld_elec_lab: false, bld_fab_plant: false, bld_research_lab: false,
    bld_r_and_d: false, bld_solar_array: false, bld_launch_pad: false,
    addon_ops_center: false,
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
      const date = s.lastTick ? new Date(s.lastTick).toLocaleDateString('ko-KR') : '—';
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
    // BGM: 브라우저 자동재생 정책으로 인해 첫 사용자 인터랙션에서 시작
    if (typeof BGM !== 'undefined' && gs.settings.sound) {
      const _startBgmOnce = () => {
        document.removeEventListener('click', _startBgmOnce);
        document.removeEventListener('keydown', _startBgmOnce);
        console.log('[BGM] 사용자 인터랙션 감지, BGM.start() 호출');
        setTimeout(() => {
          try { BGM.start(); } catch(e) { console.warn('[BGM] start() 예외:', e); }
        }, 100);
      };
      document.addEventListener('click', _startBgmOnce);
      document.addEventListener('keydown', _startBgmOnce);
    }
    calcOffline();
    if (typeof applyI18n === 'function') applyI18n();
    renderUnlocks();
    switchMainTab('launch');
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

  const titleSndBtn = document.getElementById('title-snd-btn');
  if (titleSndBtn) titleSndBtn.addEventListener('click', () => {
    toggleSound();
    if (titleSndBtn) titleSndBtn.textContent = gs.settings.sound ? 'SND:ON' : 'SND:OFF';
  });

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

  // Check for existing saves — both buttons hidden until check completes
  migrateLegacySave();
  const allSlots = getSaveSlots();
  const occupied = allSlots.filter(s => !s.empty);
  setTimeout(() => {
    // Show New Game (always) and Continue (only if saves exist)
    const newBtnEl = document.getElementById('new-game-btn');
    if (newBtnEl) newBtnEl.style.display = '';
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
