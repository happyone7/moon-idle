// ============================================================
//  MILESTONE SYSTEM
//  영구 보상을 부여하는 달성 조건 시스템
//  상태: 미달성(없음) → 'unlocked'(달성·미수령) → 'claimed'(보상 수령)
// ============================================================

// ─── 마일스톤 효과 배율 헬퍼 ─────────────────────────────────
function getMilestoneProdBonus() {
  if (!gs || !gs.milestones) return 1;
  return gs.milestones.ten_launches === 'claimed' ? 1.1 : 1;
}

function getMilestoneSsBonus() {
  if (!gs || !gs.milestones) return 1;
  return gs.milestones.elite_launch === 'claimed' ? 1.2 : 1;
}

function getMilestoneAssemblyMult() {
  if (!gs || !gs.milestones) return 1;
  return gs.milestones.all_parts === 'claimed' ? 0.9 : 1;
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
      gs.spaceScore = (gs.spaceScore || 0) + 5;
      setTimeout(() => notify('  ↳ 보상: 탐사 점수 +5 즉시 지급', 'amber'), 80);
      break;
    case 'ten_launches':
      // getMilestoneProdBonus() 로 전체 생산 +10% 자동 적용
      setTimeout(() => notify('  ↳ 보상: 전체 생산 +10% 영구 적용', 'amber'), 80);
      break;
    case 'all_buildings':
      gs.citizens = (gs.citizens || 0) + 2;
      if (typeof syncWorkerDots === 'function') syncWorkerDots();
      setTimeout(() => notify('  ↳ 보상: 시민 +2 영구 추가', 'amber'), 80);
      break;
    case 'elite_launch':
      // getMilestoneSsBonus() 로 탐사 점수 획득량 +20% 자동 적용
      setTimeout(() => notify('  ↳ 보상: 탐사 점수 획득량 +20% 영구 적용', 'amber'), 80);
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
    if (gs.milestones[m.id]) return; // 'unlocked' 또는 'claimed' → skip
    if (!m.check(gs)) return;

    gs.milestones[m.id] = 'unlocked'; // 달성했지만 미수령
    changed = true;
    notify(`// 마일스톤 달성: ${m.icon} ${m.name} — 미션 탭에서 보상 수령`, 'amber');
    if (typeof playSfx === 'function') {
      playSfx('square', 880, 0.12, 0.08, 1400);
      setTimeout(() => playSfx('triangle', 1200, 0.08, 0.04), 200);
    }
  });

  if (changed) {
    saveGame();
    renderAll();
  }
}

// ─── 마일스톤 보상 수령 ─────────────────────────────────────
function claimMilestone(milestoneId) {
  if (!gs || !gs.milestones) return;
  if (gs.milestones[milestoneId] !== 'unlocked') return;
  const m = MILESTONES.find(x => x.id === milestoneId);
  if (!m) return;

  gs.milestones[milestoneId] = 'claimed';
  _applyMilestoneReward(m);
  notify(`✓ ${m.icon} ${m.name} 보상 수령 완료!`, 'green');
  playSfx('triangle', 520, 0.12, 0.04, 780);
  saveGame();
  renderAll();
}

// ─── 마일스톤 패널 렌더링 ─────────────────────────────────────
function renderMilestonePanel() {
  const el = document.getElementById('milestone-panel');
  if (!el || typeof MILESTONES === 'undefined') return;

  const total = MILESTONES.length;
  const claimed = MILESTONES.filter(m => gs.milestones && gs.milestones[m.id] === 'claimed').length;
  const unlocked = MILESTONES.filter(m => gs.milestones && gs.milestones[m.id] === 'unlocked').length;

  let html = `<div class="ml-hd">// MILESTONES &nbsp;<span class="ml-count">${claimed}/${total}</span>${unlocked > 0 ? ` <span style="color:var(--amber);">(${unlocked}개 수령 가능)</span>` : ''}</div>`;
  MILESTONES.forEach(m => {
    const state = (gs.milestones && gs.milestones[m.id]) || null;
    const isClaimed = state === 'claimed';
    const isUnlocked = state === 'unlocked';
    const rowClass = isClaimed ? ' ml-done' : isUnlocked ? ' ml-unlocked' : '';

    let rewardHtml;
    if (isClaimed) {
      rewardHtml = `<span class="ml-reward ml-reward-done">수령 완료</span>`;
    } else if (isUnlocked) {
      rewardHtml = `<button class="btn btn-sm ml-claim-btn" onclick="claimMilestone('${m.id}')">[ 보상 수령 ]</button>`;
    } else {
      rewardHtml = `<span class="ml-reward">${m.reward}</span>`;
    }

    html += `<div class="ml-row${rowClass}">
      <span class="ml-chk">${isClaimed ? '✓' : isUnlocked ? '◈' : '○'}</span>
      <span class="ml-body">
        <span class="ml-name">${m.icon} ${m.name}</span>
        <span class="ml-desc">${m.desc}</span>
        ${rewardHtml}
      </span>
    </div>`;
  });
  el.innerHTML = html;
}
