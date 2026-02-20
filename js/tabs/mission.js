
// ============================================================
//  MOONSTONE UPGRADES (P2-7: 문스톤 소비 다양화)
// ============================================================
const MS_UPGRADES = [
  {
    id:   'ms_part_1',
    name: '부품 비용 절감',
    icon: '&#9881;',
    desc: '모든 부품 제작 비용 영구 -15%',
    cost: 3,
    max:  1,
    apply() { partCostMult *= 0.85; },
  },
  {
    id:   'ms_worker_1',
    name: '인원 확충',
    icon: '&#128100;',
    desc: '인원 상한 영구 +2',
    cost: 2,
    max:  5,
    apply() { gs.workers += 2; },
  },
  {
    id:   'ms_research_1',
    name: '연구 가속',
    icon: '&#128300;',
    desc: '연구 RP 생산 +25%',
    cost: 4,
    max:  2,
    apply() { prodMult.research = (prodMult.research || 1) * 1.25; },
  },
  {
    id:   'ms_slot_1',
    name: '조립 슬롯 증설',
    icon: '&#128295;',
    desc: '조립 슬롯 +1',
    cost: 5,
    max:  2,
    apply() { slotBonus += 1; ensureAssemblyState(); },
  },
  {
    id:   'ms_global_1',
    name: '전역 생산 강화',
    icon: '&#9889;',
    desc: '전체 생산량 +10%',
    cost: 6,
    max:  3,
    apply() { globalMult *= 1.10; },
  },
];

/** 모든 구매된 MS 업그레이드 효과를 다시 적용 (load 후 또는 재시작 후) */
function applyMsUpgradesFromState() {
  if (!gs.msUpgrades) return;
  MS_UPGRADES.forEach(u => {
    const count = gs.msUpgrades[u.id] || 0;
    for (let i = 0; i < count; i++) u.apply();
  });
  // AUTOMATION_UPGRADES 중 프레스티지 후에도 유지되는 영구 효과 재적용
  if (gs.msUpgrades['ms_early_boost']) {
    globalMult *= 1.08;
  }
  // ms_quick_workers: workers는 confirmLaunch에서 savedWorkers로 보존되므로 별도 재적용 불필요
}

/** 문스톤 업그레이드 구매 */
function buyMsUpgrade(id) {
  const u = MS_UPGRADES.find(x => x.id === id);
  if (!u) return;
  const current = (gs.msUpgrades && gs.msUpgrades[id]) || 0;
  if (current >= u.max) { notify('최대 구매 완료', 'red'); return; }
  if (gs.moonstone < u.cost) { notify('문스톤 부족', 'red'); return; }
  gs.moonstone -= u.cost;
  if (!gs.msUpgrades) gs.msUpgrades = {};
  gs.msUpgrades[id] = current + 1;
  u.apply();
  notify(`${u.name} 구매 완료`, 'green');
  playSfx('triangle', 520, 0.12, 0.04, 780);
  renderAll();
  saveGame();
}


// ============================================================
//  PRESTIGE: CONFIRM LAUNCH
// ============================================================
function confirmLaunch() {
  gs.moonstone += pendingLaunchMs;
  pendingLaunchMs = 0;  // closeLaunchOverlay 이중 지급 방지
  const savedMs         = gs.msUpgrades || {};
  const savedMoonstone  = gs.moonstone;
  const savedLaunches   = gs.launches;
  const savedHistory    = gs.history;
  const savedUnlocks    = gs.unlocks;
  const savedWorkers    = gs.workers;     // 문스톤으로 늘린 인원은 유지
  const savedMilestones = gs.milestones || {}; // BUG-P08: 마일스톤 보존 (프레스티지 후 재지급 방지)

  // Prestige reset — keep moonstone, msUpgrades, launches, history, unlocks, workers
  gs.res = { money:5000, metal:0, fuel:0, electronics:0, research:0 };
  gs.buildings = { housing:1, ops_center:0, supply_depot:0, mine:0, extractor:0, refinery:0, cryo_plant:0, elec_lab:0, fab_plant:0, research_lab:0, r_and_d:0, solar_array:0, launch_pad:0 };
  gs.assignments = {};
  gs._prodHubVisited = false;
  gs.parts = { engine:0, fueltank:0, control:0, hull:0, payload:0 };
  gs.assembly = { selectedQuality:'proto', selectedClass:'nano', jobs:[] };
  gs.upgrades = {};
  gs.bldLevels = {};
  gs.bldSlotLevels = {};
  gs.bldUpgrades = {};
  gs.addons = {};
  gs.addonUpgrades = {};

  // Restore persistent fields
  gs.moonstone   = savedMoonstone;
  gs.msUpgrades  = savedMs;
  gs.launches    = savedLaunches;
  gs.history     = savedHistory;
  gs.unlocks     = savedUnlocks;
  gs.workers     = savedWorkers;
  gs.milestones  = savedMilestones; // BUG-P08

  // Reset multipliers then re-apply from saved MS upgrades
  prodMult = {};
  globalMult = 1;
  partCostMult = 1;
  fusionBonus = 0;
  reliabilityBonus = 0;
  slotBonus = 0;
  applyMsUpgradesFromState();

  closeLaunchOverlay();
  notify(`문스톤 ${gs.moonstone}개 보유 — 생산 +${gs.moonstone * 5}%`, '');
  playSfx('triangle', 500, 0.12, 0.04, 760);
  // 프레스티지 BGM 이벤트 (bgm_08_prestige_void)
  if (typeof BGM !== 'undefined' && gs.settings.sound) BGM.playEvent('prestige');
  switchMainTab('production'); // DESIGN-007: 프레스티지 후 생산 탭으로 이동
  saveGame();
  renderAll();
}

function closeLaunchOverlay() {
  // 문스톤 실제 지급 (pendingLaunchMs에 저장된 값)
  if (pendingLaunchMs > 0) {
    gs.moonstone += pendingLaunchMs;
    pendingLaunchMs = 0;
  }
  const overlay = document.getElementById('launch-overlay');
  if (overlay) overlay.classList.remove('show');
  saveGame();
  renderAll();
}


// ============================================================
//  MISSION SUB-TAB SWITCHING (P3-5)
// ============================================================
let activeMissionSubTab = 'phases';

function switchMissionSubTab(subId) {
  activeMissionSubTab = subId;
  playSfx('triangle', 220, 0.04, 0.02, 330);

  // Update sub-tab buttons
  document.querySelectorAll('.msn-sub-tab').forEach(btn => {
    const isActive = btn.dataset.subtab === subId;
    btn.classList.toggle('active', isActive);
    // Update dot icon
    btn.innerHTML = btn.innerHTML.replace(/[●○]/, isActive ? '●' : '○');
  });

  // Update sub-screens
  document.querySelectorAll('.msn-sub-screen').forEach(screen => {
    screen.classList.remove('active');
  });
  const target = document.getElementById('msn-sub-' + subId);
  if (target) target.classList.add('active');

  // Re-render mission tab to update the active sub-screen content
  renderMissionTab();
}


// ============================================================
//  MISSION PHASES
// ============================================================
const PHASES = [
  { id:'proto',    name:'PHASE 1: 프로토타입', targetAlt:50,  targetLaunches:1 },
  { id:'sub',      name:'PHASE 2: 준궤도',     targetAlt:90,  targetLaunches:3 },
  { id:'orbital',  name:'PHASE 3: 궤도',       targetAlt:105, targetLaunches:5 },
  { id:'cislunar', name:'PHASE 4: 시스루나',   targetAlt:120, targetLaunches:8 },
  { id:'lunar',    name:'PHASE 5: 달 착륙',    targetAlt:135, targetLaunches:12 },
]; // targetAlt 현실화: ELITE 최대 도달 가능 고도 기준 (DESIGN-003)


// ============================================================
//  RENDER: MISSION TAB
// ============================================================
function renderMissionTab() {
  const maxAlt = gs.history.length
    ? Math.max(...gs.history.map(h => Number(h.altitude) || 0))
    : 0;

  // ── Mission phase progress ──────────────────────────────
  let phaseHtml = '';
  let prevDone = true;
  PHASES.forEach((ph, i) => {
    const pct = Math.min(100, (maxAlt / ph.targetAlt) * 100);
    const done = maxAlt >= ph.targetAlt && gs.launches >= ph.targetLaunches;
    const locked = !prevDone && i > 0;
    phaseHtml += `<div class="phase-row">
      <div class="phase-name">${ph.name}</div>
      <div class="phase-bar-wrap">
        <div class="phase-bar-fill${done ? ' done' : ''}" style="width:${locked ? 0 : pct}%"></div>
      </div>
      <div class="phase-status${done ? ' done' : locked ? ' locked' : ''}">
        ${done ? '완료 ✓' : locked ? '잠금' : `${Math.floor(pct)}%`}
      </div>
    </div>`;
    prevDone = done; // BUG-P15: 단순화
  });
  const phaseWrap = document.getElementById('phase-progress-wrap');
  if (phaseWrap) phaseWrap.innerHTML = phaseHtml;

  // ── History table (last 20) ─────────────────────────────
  let histHtml = '';
  if (gs.history.length === 0) {
    histHtml = '<div style="color:var(--green-dim);font-size:13px;padding:8px 0;">// 발사 기록 없음</div>';
  } else {
    histHtml = `<table class="history-table">
      <thead><tr>
        <th>NO.</th><th>날짜</th><th>기체</th><th>Δv</th><th>최고도</th><th>신뢰도</th>
      </tr></thead><tbody>`;
    gs.history.slice(-20).reverse().forEach(h => {
      histHtml += `<tr>
        <td>${String(h.no).padStart(3, '0')}</td>
        <td>${h.date}</td>
        <td>${h.quality}</td>
        <td>${h.deltaV} km/s</td>
        <td>${h.altitude} km</td>
        <td>${h.reliability}%</td>
      </tr>`;
    });
    histHtml += '</tbody></table>';
  }
  const histWrap = document.getElementById('history-wrap');
  if (histWrap) histWrap.innerHTML = histHtml;

  // ── Moonstone upgrade shop ──────────────────────────────
  const msShopWrap = document.getElementById('ms-shop-wrap');
  if (msShopWrap) {
    if (gs.moonstone > 0 || Object.values(gs.msUpgrades || {}).some(v => v > 0)) {
      let shopHtml = `<div class="ms-shop">
        <div class="ms-shop-hd">// 문스톤 업그레이드 <span class="ms-balance">◆ ${gs.moonstone}</span></div>
        <div class="ms-shop-grid">`;
      MS_UPGRADES.forEach(u => {
        const owned = (gs.msUpgrades && gs.msUpgrades[u.id]) || 0;
        const maxed = owned >= u.max;
        const canBuy = gs.moonstone >= u.cost && !maxed;
        shopHtml += `<div class="ms-card${maxed ? ' maxed' : canBuy ? ' buyable' : ''}">
          <div class="ms-card-icon">${u.icon}</div>
          <div class="ms-card-name">${u.name}</div>
          <div class="ms-card-desc">${u.desc}</div>
          <div class="ms-card-footer">
            <span class="ms-card-owned">${owned}/${u.max}</span>
            ${maxed
              ? '<span class="ms-card-maxed">최대</span>'
              : `<button class="ms-card-btn${canBuy ? '' : ' disabled'}" onclick="buyMsUpgrade('${u.id}')">◆ ${u.cost}</button>`}
          </div>
        </div>`;
      });
      shopHtml += '</div></div>';
      msShopWrap.innerHTML = shopHtml;
    } else {
      msShopWrap.innerHTML = '';
    }
  }

  // ── Prestige panel ──────────────────────────────────────
  let prestigeHtml = '';
  if (gs.launches > 0) {
    prestigeHtml = `<div class="prestige-panel">
      <div class="panel-header">프레스티지 — 새 시즌</div>
      <div class="prestige-stat">현재 문스톤: <strong>${gs.moonstone}개</strong></div>
      <div class="prestige-stat">현재 생산 보너스: <strong>+${gs.moonstone * 5}%</strong></div>
      <div class="prestige-stat">다음 문스톤 획득: <strong>+${pendingLaunchMs}개</strong></div>
      <div style="font-size:12px;color:var(--amber);margin-bottom:10px;">// 재시작하면 문스톤이 누적됩니다</div>
      <button class="btn btn-amber btn-full" id="btn-prestige" onclick="confirmLaunch()">[ 문스톤 획득 후 재시작 ]</button>
    </div>`;
  }
  const prestigeWrap = document.getElementById('prestige-wrap');
  if (prestigeWrap) prestigeWrap.innerHTML = prestigeHtml;

  // ── Milestone list (P3-5 마일스톤 서브탭) ─────────────────
  renderMilestoneList();
}


// ============================================================
//  P3-5: MILESTONE LIST RENDERING
// ============================================================
function renderMilestoneList() {
  const wrap = document.getElementById('milestone-list-wrap');
  if (!wrap || typeof MILESTONES === 'undefined') return;

  let html = '';
  MILESTONES.forEach(ms => {
    const done = gs.milestones && gs.milestones[ms.id];
    html += `<div class="msn-milestone-row">
      <span class="msn-milestone-icon">${ms.icon}</span>
      <span class="msn-milestone-name" style="color:${done ? 'var(--green)' : 'var(--green-dim)'}">${ms.name}</span>
      <span class="msn-milestone-desc">${ms.desc}</span>
      <span class="msn-milestone-status ${done ? 'done' : 'pending'}">
        ${done ? '&#10003; 완료' : '미달성'}
      </span>
    </div>`;
    // Show reward
    html += `<div style="font-size:10px;color:${done ? 'var(--green-mid)' : 'var(--green-dim)'};padding:0 0 4px 40px;opacity:${done ? '0.7' : '0.5'};">
      보상: ${ms.reward}
    </div>`;
  });

  if (MILESTONES.length === 0) {
    html = '<div style="color:var(--green-dim);font-size:12px;padding:10px;">// 마일스톤 없음</div>';
  }

  wrap.innerHTML = html;
}
