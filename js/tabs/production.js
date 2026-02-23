
// ─── 인원 배치 UX 헬퍼 ────────────────────────────────────
function withdrawAllWorkers() {
  if (!gs.assignments) return;
  const was = getTotalAssigned();
  if (was === 0) { notify('배치된 인원이 없습니다', 'amber'); return; }
  Object.keys(gs.assignments).forEach(k => { gs.assignments[k] = 0; });
  notify(`// 전체 직원 철수 (${was}명)`, 'amber');
  playSfx('triangle', 440, 0.12, 0.03, 220);
  renderAll();
}

function quickAssign(bid) {
  const cost = typeof getBldWorkerCost === 'function' ? getBldWorkerCost(bid) : 0;
  if (cost > 0 && (gs.res.money || 0) < cost) { notify('자금 부족', 'amber'); return; }
  const slotCap = (gs.buildings[bid] || 0) + ((gs.bldSlotLevels && gs.bldSlotLevels[bid]) || 0);
  const assigned = (gs.assignments && gs.assignments[bid]) || 0;
  if (assigned >= slotCap) { notify(`슬롯 수용 한도 초과 (${slotCap})`, 'amber'); return; }
  if (!gs.assignments) gs.assignments = {};
  gs.assignments[bid] = assigned + 1;
  if (cost > 0) gs.res.money = Math.max(0, (gs.res.money || 0) - cost);
  playSfx('triangle', 300, 0.04, 0.02, 400);
  renderAll();
}

function quickUnassign(bid) {
  const assigned = (gs.assignments && gs.assignments[bid]) || 0;
  if (assigned <= 0) return;
  if (!gs.assignments) gs.assignments = {};
  gs.assignments[bid] = assigned - 1;
  gs.citizens = (gs.citizens || 0) + 1;
  playSfx('triangle', 400, 0.04, 0.02, 300);
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
  // 운영센터 완공 시 연구소 해금
  if (bid === 'ops_center' && !gs.unlocks['bld_research_lab']) {
    gs.unlocks['bld_research_lab'] = true;
    if (typeof applyUnlocks === 'function') applyUnlocks([]);
    notify('[RSH] 연구소 건설 가능 — 연구소가 해금됐습니다', 'green');
  }
  if (typeof syncWorkerDots === 'function') syncWorkerDots();
  if (bid === 'housing') {
    notify(`${bld.icon} ${bld.name} 건설 완료 (×${gs.buildings[bid]}) — 시민 분양 가능`);
  } else {
    notify(`${bld.icon} ${bld.name} 건설 완료 (×${gs.buildings[bid]})`);
  }
  playSfx('triangle', 360, 0.08, 0.03, 520);
  renderAll();
  // 건설 애니메이션
  if (typeof _triggerBuildAnim === 'function') _triggerBuildAnim(bid);
  // 건설 후 오버레이 갱신 (ghost → real overlay, keepPosition=true — 위치 드리프트 방지)
  setTimeout(() => {
    const freshPre = document.querySelector('.world-bld[data-bid="' + bid + '"]');
    if (freshPre && typeof openBldOv === 'function') {
      openBldOv(bld, freshPre, true);
    }
  }, 60);
  // 파티클 이펙트: 건물 pre 위치 기준 버스트
  if (typeof spawnAsciiParticles === 'function') {
    setTimeout(() => {
      const pre = document.querySelector('.world-bld[data-bid="' + bid + '"]');
      if (pre) {
        const rect = pre.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top  + rect.height / 2;
        spawnAsciiParticles(cx, cy, 8, 'var(--green)');
      } else {
        // 월드 뷰 중앙 fallback
        spawnAsciiParticles(window.innerWidth / 2, window.innerHeight * 0.6, 8, 'var(--green)');
      }
    }, 80);
  }
}
// ============================================================
//  MISSION GOAL PANEL
// ============================================================
function renderMissionGoal() {
  const el = document.getElementById('mission-goal');
  if (!el) return;

  const parts     = gs.parts || {};
  const builtParts = PARTS.filter(p => (parts[p.id] || 0) >= p.cycles).length;
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
    statusEl.innerHTML = `직원 ${assignedW}명 &nbsp; 수입: +${fmtDec(totalIncome, 1)}/s${withdrawBtn}`;
  }

  // 튜토리얼 힌트: ops_center 미건설 시 안내
  // 기존 텍스트 튜토리얼 영역 비움 (LUNA-7 봇이 대체)
  const tutEl = document.getElementById('prod-tutorial');
  if (tutEl) tutEl.innerHTML = '';

  // 직원 현황 요약
  const researchStaff = (gs.assignments && gs.assignments['research_lab']) || 0;
  const opsStaff      = (gs.assignments && gs.assignments['ops_center'])   || 0;
  let html = `<div class="blr-stats">
    <span class="blr-stat-item">연구소 직원 <span class="blr-stat-val">${researchStaff}명</span></span>
    <span class="blr-stat-sep">|</span>
    <span class="blr-stat-item">운영센터 직원 <span class="blr-stat-val">${opsStaff}명</span></span>
  </div>`;

  // 건물 리스트: 상태만 표시 (배치는 건물 호버 팝업에서)
  BUILDINGS.forEach(b => {
    if (!gs.unlocks['bld_' + b.id]) return;
    const cnt = gs.buildings[b.id] || 0;
    const assigned = (gs.assignments && gs.assignments[b.id]) || 0;
    let rateStr = '';
    if (b.produces !== 'bonus') {
      const msBonus = typeof getMilestoneProdBonus === 'function' ? getMilestoneProdBonus() : 1;
      const rate = b.baseRate * assigned * (prodMult[b.produces] || 1) * globalMult * getSpaceScoreMult() * getSolarBonus() * (typeof getBldProdMult === 'function' ? getBldProdMult(b.id) : 1) * (typeof getBldUpgradeMult === 'function' ? getBldUpgradeMult(b.id) : 1) * (typeof getAddonMult === 'function' ? getAddonMult(b.id) : 1) * msBonus;
      rateStr = cnt > 0
        ? (assigned > 0 ? `<span style="color:var(--green)">+${fmtDec(rate, 2)}/s</span>` : `<span style="color:var(--amber)">대기</span>`)
        : `<span style="color:#1a3a1a">미건설</span>`;
    } else {
      if (b.id === 'solar_array')  rateStr = `<span style="color:var(--green-mid)">+${cnt * 10}%</span>`;
      else if (b.id === 'launch_pad') rateStr = `<span style="color:var(--green-mid)">슬롯 ${cnt}</span>`;
      else if (b.id === 'housing')    rateStr = `<span style="color:var(--green-mid)">×${cnt}</span>`;
    }
    const staffStr = (cnt > 0 && b.produces !== 'bonus') ? `${assigned}명` : '';
    html += `<div class="bld-list-row" data-bld="${b.id}">
      <span class="blr-icon">${b.icon}</span>
      <span class="blr-name">${b.name}</span>
      <span class="blr-cnt">${staffStr}</span>
      <span class="blr-rate">${rateStr}</span>
    </div>`;
  });
  const bldGrid = document.getElementById('bld-grid');
  if (bldGrid) bldGrid.innerHTML = html;
}

