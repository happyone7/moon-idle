
function confirmLaunch() {
  gs.moonstone += pendingLaunchMs;
  // Prestige reset — keep moonstone, launches, history, unlocks
  gs.res = { money:500, metal:0, fuel:0, electronics:0, research:0 };
  gs.buildings = { ops_center:0, supply_depot:0, mine:0, extractor:0, refinery:0, cryo_plant:0, elec_lab:0, fab_plant:0, research_lab:1, r_and_d:0, solar_array:0, launch_pad:0 };
  gs.parts = { engine:0, fueltank:0, control:0, hull:0, payload:0 };
  gs.assembly = { selectedQuality:'proto', jobs:[] };
  gs.upgrades = {};
  prodMult = {};
  globalMult = 1;
  partCostMult = 1;
  fusionBonus = 0;
  reliabilityBonus = 0;
  slotBonus = 0;
  // unlocks persist
  closeLaunchOverlay();
  notify(`문스톤 ${gs.moonstone}개 보유 — 생산 +${gs.moonstone * 5}%`, '');
  playSfx('triangle', 500, 0.12, 0.04, 760);
  saveGame();
  renderAll();
}

function closeLaunchOverlay() {
  const overlay = document.getElementById('launch-overlay');
  if (overlay) overlay.classList.remove('show');
}
// ============================================================
//  RENDER: MISSION TAB
// ============================================================
const PHASES = [
  { id:'proto',    name:'PHASE 1: 프로토타입', targetAlt:50,  targetLaunches:1 },
  { id:'sub',      name:'PHASE 2: 준궤도',     targetAlt:100, targetLaunches:3 },
  { id:'orbital',  name:'PHASE 3: 궤도',       targetAlt:200, targetLaunches:5 },
  { id:'cislunar', name:'PHASE 4: 시스루나',   targetAlt:300, targetLaunches:8 },
  { id:'lunar',    name:'PHASE 5: 달 착륙',    targetAlt:400, targetLaunches:12 },
];

function renderMissionTab() {
  const maxAlt = gs.history.length
    ? Math.max(...gs.history.map(h => Number(h.altitude) || 0))
    : 0;

  let phaseHtml = '';
  let prevDone = true;
  PHASES.forEach((ph, i) => {
    const pct = Math.min(100, (maxAlt / ph.targetAlt) * 100);
    const done = maxAlt >= ph.targetAlt && gs.launches >= ph.targetLaunches;
    const locked = !prevDone && i > 0;
    if (done) prevDone = true;
    phaseHtml += `<div class="phase-row">
      <div class="phase-name">${ph.name}</div>
      <div class="phase-bar-wrap">
        <div class="phase-bar-fill${done ? ' done' : ''}" style="width:${locked ? 0 : pct}%"></div>
      </div>
      <div class="phase-status${done ? ' done' : locked ? ' locked' : ''}">
        ${done ? '완료 ✓' : locked ? '잠금' : `${Math.floor(pct)}%`}
      </div>
    </div>`;
    if (!done) prevDone = false;
  });
  const phaseWrap = document.getElementById('phase-progress-wrap');
  if (phaseWrap) phaseWrap.innerHTML = phaseHtml;

  // History table (last 20)
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

  // Prestige panel
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
}

