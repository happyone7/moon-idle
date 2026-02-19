
// ─── 인원 배치 UX 헬퍼 ────────────────────────────────────
function withdrawAllWorkers() {
  if (!gs.assignments) return;
  const was = getTotalAssigned();
  if (was === 0) { notify('배치된 인원이 없습니다', 'amber'); return; }
  Object.keys(gs.assignments).forEach(k => { gs.assignments[k] = 0; });
  notify(`// 전체 인원 철수 완료 (${was}명 회수)`, 'amber');
  renderAll();
}

function quickAssign(bid) {
  const avail = getAvailableWorkers();
  if (avail <= 0) { notify('여유 인원 없음', 'amber'); return; }
  const slotCap = (gs.buildings[bid] || 0) + ((gs.bldLevels && gs.bldLevels[bid]) || 0);
  const assigned = (gs.assignments && gs.assignments[bid]) || 0;
  if (assigned >= slotCap) { notify(`슬롯 수용 한도 초과 (${slotCap})`, 'amber'); return; }
  if (!gs.assignments) gs.assignments = {};
  gs.assignments[bid] = assigned + 1;
  renderAll();
}

function quickUnassign(bid) {
  const assigned = (gs.assignments && gs.assignments[bid]) || 0;
  if (assigned <= 0) return;
  if (!gs.assignments) gs.assignments = {};
  gs.assignments[bid] = assigned - 1;
  renderAll();
}

function buyBuilding(bid) {
  const bld = BUILDINGS.find(b => b.id === bid);
  if (!bld) return;
  if (!gs.unlocks['bld_' + bid]) { notify(t('notif_locked'), 'red'); return; }
  const cost = getBuildingCost(bld);
  if (!canAfford(cost)) { notify(t('notif_afford'), 'red'); return; }
  spend(cost);
  gs.buildings[bid] = (gs.buildings[bid] || 0) + 1;
  // 모든 건물 구매마다 워커 상한 +1
  gs.workers = (gs.workers || 1) + 1;
  if (typeof syncWorkerDots === 'function') syncWorkerDots();
  notify(`${bld.icon} ${bld.name} 건설 완료 (×${gs.buildings[bid]}) — 인원 +1`);
  playSfx('triangle', 360, 0.08, 0.03, 520);
  renderAll();
  // 건설 애니메이션
  if (typeof _triggerBuildAnim === 'function') _triggerBuildAnim(bid);
  // 건물 오버레이 닫기 (ghost popup → actual building)
  if (typeof closeBldOv === 'function') closeBldOv();
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
  if (statusEl) {
    const withdrawBtn = assignedW > 0
      ? `&nbsp;<button class="blr-withdraw-btn" onclick="withdrawAllWorkers()">[ 전체 철수 ]</button>`
      : '';
    statusEl.innerHTML = `인원: ${assignedW}/${totalW} &nbsp; 수입: +${fmtDec(totalIncome, 1)}/s${withdrawBtn}`;
  }

  // 건물 리스트: 버튼 없이 상태만 표시 (건설은 월드 호버 팝업에서)
  let html = '';
  BUILDINGS.forEach(b => {
    if (!gs.unlocks['bld_' + b.id]) return;
    const cnt = gs.buildings[b.id] || 0;
    const assigned = (gs.assignments && gs.assignments[b.id]) || 0;
    let rateStr = '';
    if (b.produces !== 'bonus') {
      const rate = b.baseRate * assigned * (prodMult[b.produces] || 1) * globalMult * getMoonstoneMult() * getSolarBonus();
      rateStr = cnt > 0
        ? (assigned > 0 ? `<span style="color:var(--green)">+${fmtDec(rate, 2)}/s</span>` : `<span style="color:var(--amber)">대기</span>`)
        : `<span style="color:#1a3a1a">미건설</span>`;
    } else {
      if (b.id === 'solar_array')  rateStr = `<span style="color:var(--green-mid)">+${cnt * 10}%</span>`;
      else if (b.id === 'launch_pad') rateStr = `<span style="color:var(--green-mid)">슬롯 ${cnt}</span>`;
      else if (b.id === 'housing')    rateStr = `<span style="color:var(--green-mid)">인원 +${cnt}</span>`;
    }
    const slotCap = cnt + ((gs.bldLevels && gs.bldLevels[b.id]) || 0);
    const canPlus = b.produces !== 'bonus' && cnt > 0 && getAvailableWorkers() > 0 && assigned < slotCap;
    const canMinus = b.produces !== 'bonus' && assigned > 0;
    const wkrCell = (b.produces !== 'bonus' && cnt > 0)
      ? `<span class="blr-wkr">
          <button class="blr-wbtn${canMinus ? '' : ' dis'}" onclick="quickUnassign('${b.id}')" ${canMinus ? '' : 'disabled'}>-</button>
          <span class="blr-wassign">${assigned}</span>
          <button class="blr-wbtn${canPlus ? '' : ' dis'}" onclick="quickAssign('${b.id}')" ${canPlus ? '' : 'disabled'}>+</button>
        </span>`
      : `<span class="blr-wkr-empty"></span>`;
    html += `<div class="bld-list-row">
      <span class="blr-icon">${b.icon}</span>
      <span class="blr-name">${b.name}</span>
      <span class="blr-cnt">×${cnt}</span>
      ${wkrCell}
      <span class="blr-rate">${rateStr}</span>
    </div>`;
  });
  const bldGrid = document.getElementById('bld-grid');
  if (bldGrid) bldGrid.innerHTML = html;
}

