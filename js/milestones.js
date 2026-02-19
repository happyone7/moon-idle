// ============================================================
//  MILESTONE SYSTEM
//  영구 보상을 부여하는 달성 조건 시스템
// ============================================================

// ─── 마일스톤 효과 배율 헬퍼 ─────────────────────────────────
function getMilestoneProdBonus() {
  if (!gs || !gs.milestones) return 1;
  return gs.milestones.ten_launches ? 1.1 : 1;
}

function getMilestoneMsBonus() {
  if (!gs || !gs.milestones) return 1;
  return gs.milestones.elite_launch ? 1.2 : 1;
}

function getMilestoneAssemblyMult() {
  if (!gs || !gs.milestones) return 1;
  return gs.milestones.all_parts ? 0.9 : 1;
}

// ─── 마일스톤 달성 보상 적용 ─────────────────────────────────
function _applyMilestoneReward(m) {
  switch (m.id) {
    case 'first_mine':
      gs.res.research = (gs.res.research || 0) + 5;
      setTimeout(() => notify('  ↳ 보상: RP +5 즉시 지급', 'amber'), 80);
      break;
    case 'all_parts':
      // getMilestoneAssemblyMult() 로 조립 시간 -10% 자동 적용
      setTimeout(() => notify('  ↳ 보상: 조립 시간 -10% 영구 적용', 'amber'), 80);
      break;
    case 'orbit_200':
      gs.moonstone = (gs.moonstone || 0) + 5;
      setTimeout(() => notify('  ↳ 보상: 문스톤 +5 즉시 지급', 'amber'), 80);
      break;
    case 'ten_launches':
      // getMilestoneProdBonus() 로 전체 생산 +10% 자동 적용
      setTimeout(() => notify('  ↳ 보상: 전체 생산 +10% 영구 적용', 'amber'), 80);
      break;
    case 'all_buildings':
      gs.workers = (gs.workers || 1) + 2;
      if (typeof syncWorkerDots === 'function') syncWorkerDots();
      setTimeout(() => notify('  ↳ 보상: 인원 상한 +2 영구 추가', 'amber'), 80);
      break;
    case 'elite_launch':
      // getMilestoneMsBonus() 로 문스톤 획득량 +20% 자동 적용
      setTimeout(() => notify('  ↳ 보상: 문스톤 획득량 +20% 영구 적용', 'amber'), 80);
      break;
  }
}

// ─── 마일스톤 체크 (tick 마다 호출) ──────────────────────────
function checkMilestones() {
  if (!gs) return;
  if (!gs.milestones) gs.milestones = {};
  if (typeof MILESTONES === 'undefined') return;

  let changed = false;
  MILESTONES.forEach(m => {
    if (gs.milestones[m.id]) return;
    if (!m.check(gs)) return;

    gs.milestones[m.id] = true;
    changed = true;
    _applyMilestoneReward(m);
    notify(`// 마일스톤 달성: ${m.icon} ${m.name}`, 'amber');
    if (typeof playSfx === 'function') playSfx('square', 880, 0.12, 0.08, 1400);
  });

  if (changed) {
    saveGame();
    renderAll();
  }
}

// ─── 마일스톤 패널 렌더링 ─────────────────────────────────────
function renderMilestonePanel() {
  const el = document.getElementById('milestone-panel');
  if (!el || typeof MILESTONES === 'undefined') return;

  const total = MILESTONES.length;
  const done  = MILESTONES.filter(m => gs.milestones && gs.milestones[m.id]).length;

  let html = `<div class="ml-hd">// MILESTONES &nbsp;<span class="ml-count">${done}/${total}</span></div>`;
  MILESTONES.forEach(m => {
    const isDone = !!(gs.milestones && gs.milestones[m.id]);
    html += `<div class="ml-row${isDone ? ' ml-done' : ''}">
      <span class="ml-chk">${isDone ? '✓' : '○'}</span>
      <span class="ml-body">
        <span class="ml-name">${m.icon} ${m.name}</span>
        <span class="ml-desc">${m.desc}</span>
        <span class="ml-reward${isDone ? ' ml-reward-done' : ''}">${isDone ? '달성' : m.reward}</span>
      </span>
    </div>`;
  });
  el.innerHTML = html;
}
