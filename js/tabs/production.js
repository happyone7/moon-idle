
function buyBuilding(bid) {
  const bld = BUILDINGS.find(b => b.id === bid);
  if (!bld) return;
  if (!gs.unlocks['bld_' + bid]) { notify('잠금 해제 필요', 'red'); return; }
  const cost = getBuildingCost(bld);
  if (!canAfford(cost)) { notify('자원 부족', 'red'); return; }
  spend(cost);
  gs.buildings[bid] = (gs.buildings[bid] || 0) + 1;
  // 모든 건물 구매마다 워커 상한 +1
  gs.workers = (gs.workers || 1) + 1;
  if (typeof syncWorkerDots === 'function') syncWorkerDots();
  notify(`${bld.icon} ${bld.name} 건설 완료 (×${gs.buildings[bid]}) — 인원 +1`);
  playSfx('triangle', 360, 0.08, 0.03, 520);
  renderAll();
}
// ============================================================
//  MISSION GOAL PANEL
// ============================================================
function renderMissionGoal() {
  const el = document.getElementById('mission-goal');
  if (!el) return;

  const parts     = gs.parts || {};
  const builtParts = Object.values(parts).reduce((a, v) => a + (v > 0 ? 1 : 0), 0);
  const totalParts = PARTS.length;
  const hasMine    = gs.unlocks && gs.unlocks['bld_mine'];
  const hasAssembly= gs.unlocks && gs.unlocks['tab_assembly'];
  const hasLaunch  = gs.unlocks && gs.unlocks['tab_launch'];

  // Rocket ASCII — changes as player progresses (╲ = U+2572, safe in Korean fonts)
  let rocketArt;
  if (hasLaunch) {
    rocketArt = '    *\n   ╱|╲\n  ╱▓|▓╲\n ╔══╧══╗\n ║READY║\n ╚═════╝\n   ███';
  } else if (hasAssembly) {
    rocketArt = '    ?\n   ╱|╲\n  ╱░|░╲\n ╔══╧══╗\n ║ WIP ║\n ╚═════╝\n   ▒▒▒';
  } else {
    rocketArt = '    ?\n   ╱X╲\n  ╱X|X╲\n ╔══X══╗\n ║BUILD║\n ╚═════╝\n   ░░░';
  }

  // Research progress
  const researchDone  = Object.keys(gs.upgrades || {}).length;
  const researchTotal = UPGRADES.length;

  function bar(pct) {
    pct = Math.min(100, Math.max(0, pct));
    const f = Math.round(pct / 10);
    return '█'.repeat(f) + '░'.repeat(10 - f);
  }

  // Next objective
  let nextObj;
  if (!hasMine)     nextObj = '→ 연구소 건설 후 기초 생산 기술 연구';
  else if (!hasAssembly) nextObj = '→ 합금·로켓공학 기술 연구 시 조립동 해금';
  else if (builtParts < totalParts) nextObj = `→ 부품 제작 진행 중 (${builtParts}/${totalParts})`;
  else if (!hasLaunch) nextObj = '→ 발사 제어 시스템 연구 후 발사 탭 해금!';
  else               nextObj = '→ 발사 탭에서 로켓을 발사하세요!';

  const techPct = researchTotal > 0 ? (researchDone / researchTotal * 100) : 0;
  const partPct = (builtParts / totalParts) * 100;

  el.innerHTML = `
<div class="mg-rocket-wrap">
  <div class="mg-rocket-label">STATUS</div>
  <pre class="mg-rocket">${rocketArt}</pre>
</div>
<div class="mg-info">
  <div class="mg-title">// MISSION: 달 탐사 로켓 발사</div>
  <div class="mg-bar-row"><span class="mg-bar-lbl">기술 연구</span><span class="mg-bar-val">[${bar(techPct)}]</span><span class="mg-bar-cnt">${researchDone}/${researchTotal}</span></div>
  <div class="mg-bar-row"><span class="mg-bar-lbl">부품 제작</span><span class="mg-bar-val">[${bar(partPct)}]</span><span class="mg-bar-cnt">${builtParts}/${totalParts}</span></div>
  <div class="mg-next">${nextObj}</div>
</div>`;
}

// ============================================================
//  RENDER: PRODUCTION TAB
// ============================================================
function renderProductionTab() {
  const prod = getProduction();
  const totalIncome = prod.money;
  const totalW = getTotalWorkers();
  const assignedW = getTotalAssigned();
  const statusEl = document.getElementById('prod-status');
  if (statusEl) statusEl.textContent = `[ 수입: ₩${fmtDec(totalIncome, 1)}/s ]  [ 인원: ${assignedW}/${totalW}명 배치 ]`;

  // Show unlocked buildings as compact rows (hover world buildings for worker assignment)
  let cardsHtml = '<div style="color:var(--green-mid);font-size:12px;margin-bottom:8px;">// 세계관 건물에 마우스를 오버하면 인원 배치 메뉴가 열립니다</div>';
  BUILDINGS.forEach(b => {
    if (!gs.unlocks['bld_' + b.id]) return;
    const cnt = gs.buildings[b.id] || 0;
    const cost = getBuildingCost(b);
    const costStr = getCostStr(cost);
    const affordable = canAfford(cost);
    const assigned = (gs.assignments && gs.assignments[b.id]) || 0;
    let rateStr = '';
    if (b.produces !== 'bonus') {
      const rate = b.baseRate * assigned * (prodMult[b.produces] || 1) * globalMult * getMoonstoneMult() * getSolarBonus();
      rateStr = cnt > 0
        ? (assigned > 0 ? `${assigned}명 → +${fmtDec(rate, 2)}/s` : '<span style="color:var(--amber)">인원 미배치</span>')
        : '<span style="color:var(--green-dim)">미건설</span>';
    } else {
      rateStr = b.id === 'solar_array' ? `+${cnt * 10}%` : `+${cnt} 슬롯`;
    }
    cardsHtml += `
<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid #0a1a0a;">
  <span style="color:var(--green-mid);min-width:40px">${b.icon}</span>
  <span style="flex:1;color:var(--white)">${b.name} <span style="color:var(--green-dim)">×${cnt}</span></span>
  <span style="color:var(--green-mid);font-size:12px;min-width:120px;text-align:right">${rateStr}</span>
  <button class="btn btn-sm${affordable ? '' : ''}" style="min-width:56px;font-size:12px" onclick="buyBuilding('${b.id}')" ${affordable ? '' : 'disabled'}>
    ${cnt > 0 ? (affordable ? '+1동' : '부족') : (affordable ? '건설' : '부족')}
  </button>
</div>`;
  });
  const bldGrid = document.getElementById('bld-grid');
  if (bldGrid) bldGrid.innerHTML = cardsHtml;
}

