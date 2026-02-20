
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

  // Re-apply prestige star tree effects
  if (gs.prestigeStars && typeof PRESTIGE_STAR_TREE !== 'undefined') {
    PRESTIGE_STAR_TREE.forEach(node => {
      if (gs.prestigeStars[node.id]) {
        _applyStarEffect(node.effect);
        if (node.bonusEffect) _applyStarEffect(node.bonusEffect);
      }
    });
  }
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
  const savedAchievements = gs.achievements || {}; // P4-2: 업적 보존
  const savedPrestigeStars = gs.prestigeStars || {}; // P4-3: 프레스티지 스타 보존
  const savedPrestigeCount = (gs.prestigeCount || 0) + 1; // P4-3: 프레스티지 횟수

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
  gs.achievements = savedAchievements; // P4-2
  gs.prestigeStars = savedPrestigeStars; // P4-3
  gs.prestigeCount = savedPrestigeCount; // P4-3

  // Apply starting money from star tree
  const startingMoneyBonus = _getStarEffectTotal('startingMoney');
  if (startingMoneyBonus > 0) {
    gs.res.money += startingMoneyBonus;
  }

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
  { id:'sub',      name:'PHASE 2: 준궤도',     targetAlt:80,  targetLaunches:3 },
  { id:'orbital',  name:'PHASE 3: 궤도',       targetAlt:100, targetLaunches:5 },
  { id:'cislunar', name:'PHASE 4: 시스루나',   targetAlt:115, targetLaunches:8 },
  { id:'lunar',    name:'PHASE 5: 달 착륙',    targetAlt:130, targetLaunches:12 },
]; // targetAlt 재조정: 달성 가능 범위 축소 (D5-3)


// ============================================================
//  P4-1: PHASE INTERACTIVE TIMELINE
// ============================================================
let selectedPhaseIdx = -1; // -1 = auto-select current phase

function getPhaseStates() {
  const maxAlt = gs.history.length
    ? Math.max(...gs.history.map(h => Number(h.altitude) || 0))
    : 0;
  const states = [];
  let prevDone = true;
  PHASES.forEach((ph, i) => {
    const pct = Math.min(100, (maxAlt / ph.targetAlt) * 100);
    const done = maxAlt >= ph.targetAlt && gs.launches >= ph.targetLaunches;
    const locked = !prevDone && i > 0;
    const current = !done && !locked && prevDone;
    states.push({ done, locked, current, pct });
    prevDone = done;
  });
  return states;
}

function getCurrentPhaseIndex() {
  const states = getPhaseStates();
  for (let i = 0; i < states.length; i++) {
    if (states[i].current) return i;
  }
  // All done? return last
  if (states.every(s => s.done)) return states.length - 1;
  return 0;
}

function selectPhaseNode(idx) {
  if (idx < 0 || idx >= PHASES.length) return;
  const states = getPhaseStates();
  if (states[idx].locked) return; // Can't click locked nodes
  selectedPhaseIdx = idx;
  playSfx('sine', 380, 0.04, 0.02, 500);
  renderPhaseTimeline();
}

function renderPhaseTimeline() {
  const wrap = document.getElementById('phase-timeline-wrap');
  if (!wrap) return;

  const states = getPhaseStates();
  const viewIdx = selectedPhaseIdx >= 0 ? selectedPhaseIdx : getCurrentPhaseIndex();

  // Use PHASE_SCENES data if available
  const sceneData = (typeof PHASE_SCENES !== 'undefined') ? PHASE_SCENES : null;

  // ── Timeline nodes ──
  let nodesHtml = '<div class="ptl-nodes">';
  PHASES.forEach((ph, i) => {
    const st = states[i];
    let nodeClass = 'ptl-node';
    if (st.done) nodeClass += ' done';
    else if (st.current) nodeClass += ' current';
    else if (st.locked) nodeClass += ' locked';
    if (i === viewIdx) nodeClass += ' selected';

    // Line connector (not for first node)
    if (i > 0) {
      const prevDone = states[i - 1].done;
      nodesHtml += `<div class="ptl-line${prevDone ? ' done' : ''}"></div>`;
    }

    nodesHtml += `<div class="${nodeClass}" onclick="selectPhaseNode(${i})" title="${ph.name}">
      <div class="ptl-dot">${st.done ? '&#10003;' : st.locked ? '&#9679;' : (i + 1)}</div>
      <div class="ptl-label">${ph.name.split(':')[0]}</div>
    </div>`;
  });
  nodesHtml += '</div>';

  // ── Phase detail panel (selected phase) ──
  const phase = PHASES[viewIdx];
  const state = states[viewIdx];
  const scene = sceneData ? sceneData.find(s => s.phase === (viewIdx + 1)) : null;

  let detailHtml = '<div class="ptl-detail">';
  detailHtml += `<div class="ptl-detail-hd">${phase.name}</div>`;

  if (scene) {
    detailHtml += `<div class="ptl-subtitle">${scene.subtitle}</div>`;
    detailHtml += `<div class="ptl-desc">${scene.desc}</div>`;
    detailHtml += `<div class="ptl-flavor">${scene.flavorText}</div>`;
    detailHtml += `<pre class="ptl-ascii">${scene.asciiScene}</pre>`;
    detailHtml += `<div class="ptl-target">`;
    detailHtml += `<span class="ptl-target-label">목표:</span> ${scene.targetDesc}`;
    detailHtml += `</div>`;
  }

  // Progress bar
  detailHtml += `<div class="ptl-progress">
    <div class="ptl-prog-bar-wrap">
      <div class="ptl-prog-fill${state.done ? ' done' : ''}" style="width:${state.locked ? 0 : state.pct}%"></div>
    </div>
    <div class="ptl-prog-status">${state.done ? '완료' : state.locked ? '잠금' : Math.floor(state.pct) + '%'}</div>
  </div>`;

  detailHtml += '</div>';

  wrap.innerHTML = nodesHtml + detailHtml;
}


// ============================================================
//  P4-2: ACHIEVEMENT SYSTEM
// ============================================================

/** Check achievement condition by condition key */
function _checkAchievementCondition(condKey) {
  const totalBldCount = Object.values(gs.buildings || {}).reduce((a, b) => a + b, 0);
  const researchCount = Object.keys(gs.upgrades || {}).filter(k => gs.upgrades[k]).length;
  const rocketsAssembled = gs.history ? gs.history.length : 0; // approximate
  const successCount = gs.history ? gs.history.filter(h => h.success).length : 0;
  const maxAlt = gs.history && gs.history.length
    ? Math.max(...gs.history.map(h => Number(h.altitude) || 0))
    : 0;

  switch (condKey) {
    case 'building_count_gte_1': return totalBldCount >= 1;
    case 'building_count_gte_5': return totalBldCount >= 5;
    case 'any_resource_total_gte_10000':
      return RESOURCES.some(r => (gs.res[r.id] || 0) >= 10000);
    case 'all_resource_total_gte_100000': {
      const total = RESOURCES.reduce((s, r) => s + (gs.res[r.id] || 0), 0);
      return total >= 100000;
    }
    case 'all_buildings_upgraded':
      return typeof BUILDING_UPGRADES !== 'undefined' && Object.keys(BUILDING_UPGRADES).every(bldId => {
        if ((gs.buildings[bldId] || 0) === 0) return true; // Skip unbuilt
        const upgs = BUILDING_UPGRADES[bldId];
        return upgs && upgs.length > 0 && upgs.some(u => gs.bldUpgrades && gs.bldUpgrades[u.id]);
      });
    case 'research_count_gte_1': return researchCount >= 1;
    case 'research_count_gte_5': return researchCount >= 5;
    case 'research_count_gte_10': return researchCount >= 10;
    case 'all_branches_tier2': {
      // Check if at least one tier 2+ research is done in each branch
      const tier2 = ['catalyst', 'microchip', 'alloy'];
      return tier2.every(id => gs.upgrades && gs.upgrades[id]);
    }
    case 'rp_total_gte_10000': return (gs.res.research || 0) >= 10000;
    case 'rockets_assembled_gte_1': return (gs.launches || 0) >= 1;
    case 'rockets_assembled_gte_3': return (gs.launches || 0) >= 3;
    case 'rocket_class_small_unlocked':
      return typeof isPhaseComplete === 'function' && isPhaseComplete('phase_2');
    case 'bom_all_parts_ready':
      return typeof PARTS !== 'undefined' && PARTS.every(p => gs.parts && gs.parts[p.id]);
    case 'launches_gte_1': return (gs.launches || 0) >= 1;
    case 'launch_success_gte_5': return successCount >= 5;
    case 'max_altitude_gte_100': return maxAlt >= 100;
    case 'success_after_failure': {
      if (!gs.history || gs.history.length < 2) return false;
      for (let i = 1; i < gs.history.length; i++) {
        if (!gs.history[i - 1].success && gs.history[i].success) return true;
      }
      return false;
    }
    case 'phase_1_complete':
      return typeof isPhaseComplete === 'function' && isPhaseComplete('phase_1');
    case 'phase_2_complete':
      return typeof isPhaseComplete === 'function' && isPhaseComplete('phase_2');
    default: return false;
  }
}

/** Check all achievements and award new ones */
function checkAchievements() {
  if (typeof ACHIEVEMENTS === 'undefined') return;
  if (!gs.achievements) gs.achievements = {};

  ACHIEVEMENTS.forEach(ach => {
    if (gs.achievements[ach.id]) return; // Already earned
    if (_checkAchievementCondition(ach.condition)) {
      gs.achievements[ach.id] = { ts: Date.now() };
      // Award reward
      if (ach.reward) {
        if (ach.reward.type === 'rp') {
          gs.res.research = (gs.res.research || 0) + ach.reward.amount;
          notify(`업적 달성: ${ach.name} — RP +${ach.reward.amount}`, 'green');
        } else if (ach.reward.type === 'moonstone') {
          gs.moonstone = (gs.moonstone || 0) + ach.reward.amount;
          notify(`업적 달성: ${ach.name} — 문스톤 +${ach.reward.amount}`, 'amber');
        }
      }
      playSfx('triangle', 660, 0.14, 0.05, 900);
    }
  });
}

function renderAchievementList() {
  const wrap = document.getElementById('achievement-list-wrap');
  if (!wrap || typeof ACHIEVEMENTS === 'undefined') return;

  if (!gs.achievements) gs.achievements = {};

  // Group by category
  const categories = ['production', 'research', 'assembly', 'launch', 'mission'];
  const catNames = {
    production: '생산',
    research: '연구',
    assembly: '조립',
    launch: '발사',
    mission: '임무',
  };

  const earned = Object.keys(gs.achievements).length;
  const total = ACHIEVEMENTS.length;

  let html = `<div class="ach-summary">달성: ${earned} / ${total}</div>`;

  categories.forEach(cat => {
    const achs = ACHIEVEMENTS.filter(a => a.category === cat);
    if (achs.length === 0) return;

    html += `<div class="ach-cat-hd">// ${catNames[cat] || cat}</div>`;
    html += '<div class="ach-grid">';

    achs.forEach(ach => {
      const done = gs.achievements[ach.id];
      const rewardStr = ach.reward
        ? (ach.reward.type === 'rp' ? `RP +${ach.reward.amount}` : `MS +${ach.reward.amount}`)
        : '';

      html += `<div class="ach-card${done ? ' earned' : ' locked'}">
        <div class="ach-icon">${ach.icon}</div>
        <div class="ach-info">
          <div class="ach-name">${ach.name}</div>
          <div class="ach-desc">${ach.desc}</div>
          <div class="ach-reward">${rewardStr}</div>
        </div>
        <div class="ach-status">${done ? '&#10003;' : '&#9679;'}</div>
      </div>`;
    });

    html += '</div>';
  });

  wrap.innerHTML = html;
}


// ============================================================
//  P4-3: PRESTIGE STAR TREE
// ============================================================

/** Apply a star tree effect */
function _applyStarEffect(effect) {
  if (!effect) return;
  switch (effect.type) {
    case 'prodSpeed':
      globalMult *= (1 + effect.value);
      break;
    case 'researchSpeed':
      prodMult.research = (prodMult.research || 1) * (1 + effect.value);
      break;
    case 'assemblyTime':
      // Stored as negative, applied as multiplier in getAddonTimeMult-like fashion
      // We'll track via a global
      if (typeof _starAssemblyTimeMult === 'undefined') window._starAssemblyTimeMult = 1;
      window._starAssemblyTimeMult *= (1 + effect.value); // value is negative like -0.15
      break;
    case 'startingMoney':
      // Applied at prestige reset, not here
      break;
    case 'moonstoneGain':
      // Applied at moonstone calculation
      break;
    case 'partCost':
      partCostMult *= (1 + effect.value); // value is negative like -0.10
      break;
    case 'launchReliability':
      reliabilityBonus += effect.value * 100; // Convert decimal to percentage
      break;
    case 'globalProd':
      globalMult *= (1 + effect.value);
      break;
  }
}

/** Get total star effect value for a given type */
function _getStarEffectTotal(type) {
  if (!gs.prestigeStars || typeof PRESTIGE_STAR_TREE === 'undefined') return 0;
  let total = 0;
  PRESTIGE_STAR_TREE.forEach(node => {
    if (!gs.prestigeStars[node.id]) return;
    if (node.effect.type === type) total += node.effect.value;
    if (node.bonusEffect && node.bonusEffect.type === type) total += node.bonusEffect.value;
  });
  return total;
}

/** Get moonstone gain multiplier from star tree */
function getStarMoonstoneGainMult() {
  return 1 + _getStarEffectTotal('moonstoneGain');
}

/** Buy a prestige star node */
function buyPrestigeStar(nodeId) {
  if (typeof PRESTIGE_STAR_TREE === 'undefined') return;
  const node = PRESTIGE_STAR_TREE.find(n => n.id === nodeId);
  if (!node) return;

  if (!gs.prestigeStars) gs.prestigeStars = {};
  if (gs.prestigeStars[nodeId]) { notify('이미 해금됨', 'red'); return; }

  // Check prerequisites
  if (node.requires && node.requires.length > 0) {
    const allMet = node.requires.every(reqId => gs.prestigeStars[reqId]);
    if (!allMet) { notify('선행 노드 해금 필요', 'red'); return; }
  }

  // Check cost
  const costMs = node.cost.moonstone || 0;
  if (gs.moonstone < costMs) { notify('문스톤 부족', 'red'); return; }

  gs.moonstone -= costMs;
  gs.prestigeStars[nodeId] = true;

  // Apply effect immediately
  _applyStarEffect(node.effect);
  if (node.bonusEffect) _applyStarEffect(node.bonusEffect);

  notify(`${node.name} 해금 완료`, 'green');
  playSfx('triangle', 600, 0.14, 0.05, 880);
  saveGame();
  renderAll();
}

/** Calculate prestige moonstone gain using the formula from PRESTIGE_CONFIG */
function calculatePrestigeMoonstoneGain() {
  if (!gs.history || gs.history.length === 0) return 0;

  const totalAltSum = gs.history.reduce((s, h) => s + (Number(h.altitude) || 0), 0);
  const successCount = gs.history.filter(h => h.success).length;
  const maxAlt = Math.max(...gs.history.map(h => Number(h.altitude) || 0));

  const base = Math.floor(Math.sqrt(totalAltSum / 100) + (successCount * 0.5) + (maxAlt / 200));
  const starMult = getStarMoonstoneGainMult();
  const gain = Math.max(1, Math.floor(base * starMult));

  // First prestige bonus
  if ((gs.prestigeCount || 0) === 0) return gain + 3;
  return gain;
}

function renderPrestigeStarTree() {
  const wrap = document.getElementById('prestige-star-tree-wrap');
  if (!wrap || typeof PRESTIGE_STAR_TREE === 'undefined') return;

  if (!gs.prestigeStars) gs.prestigeStars = {};

  const unlockedCount = Object.keys(gs.prestigeStars).length;
  const totalNodes = PRESTIGE_STAR_TREE.length;

  let html = `<div class="pst-header">
    <div class="pst-title">// PRESTIGE STAR TREE</div>
    <div class="pst-summary">해금: ${unlockedCount}/${totalNodes} | 문스톤: ${gs.moonstone} | 프레스티지: ${gs.prestigeCount || 0}회</div>
  </div>`;

  // Group by tier
  const tiers = [0, 1, 2];
  const tierNames = ['기초 노드', '중급 노드', '최종 노드'];

  tiers.forEach((tier, ti) => {
    const nodes = PRESTIGE_STAR_TREE.filter(n => n.tier === tier);
    if (nodes.length === 0) return;

    html += `<div class="pst-tier-label">TIER ${tier} — ${tierNames[ti]}</div>`;
    html += '<div class="pst-tier-grid">';

    nodes.forEach(node => {
      const owned = gs.prestigeStars[node.id];
      const reqMet = !node.requires || node.requires.length === 0 ||
        node.requires.every(reqId => gs.prestigeStars[reqId]);
      const canBuy = !owned && reqMet && gs.moonstone >= (node.cost.moonstone || 0);

      let cardClass = 'pst-card';
      if (owned) cardClass += ' owned';
      else if (!reqMet) cardClass += ' locked';
      else if (canBuy) cardClass += ' available';

      html += `<div class="${cardClass}">
        <div class="pst-star">${node.icon}</div>
        <div class="pst-node-name">${node.name}</div>
        <div class="pst-node-desc">${node.desc}</div>
        <div class="pst-node-footer">
          <span class="pst-cost">${owned ? '해금됨' : `MS ${node.cost.moonstone}`}</span>
          ${!owned ? `<button class="pst-buy-btn${canBuy ? '' : ' disabled'}" onclick="buyPrestigeStar('${node.id}')" ${canBuy ? '' : 'disabled'}>
            ${!reqMet ? '잠금' : canBuy ? '해금' : '부족'}
          </button>` : ''}
        </div>
      </div>`;
    });

    html += '</div>';
  });

  // Prestige reset section
  html += `<div class="pst-reset-section">
    <div class="pst-reset-hd">// PRESTIGE RESET</div>`;

  if (gs.launches > 0) {
    const estGain = calculatePrestigeMoonstoneGain();
    html += `<div class="pst-reset-info">
      <div>현재 문스톤: <strong>${gs.moonstone}개</strong></div>
      <div>예상 획득: <strong>+${estGain}개</strong></div>
      <div>프레스티지 횟수: <strong>${gs.prestigeCount || 0}회</strong></div>
    </div>`;
    html += `<div class="pst-reset-warn">프레스티지 시 자원/건물/연구(기초)가 초기화됩니다.<br>문스톤, 업적, 스타 트리, 발사 기록은 유지됩니다.</div>`;
    html += `<button class="btn btn-amber btn-full" onclick="confirmLaunch()">[ 프레스티지 실행 — 문스톤 +${estGain} ]</button>`;
  } else {
    html += `<div class="pst-reset-info" style="color:var(--green-dim);">// 발사 기록이 없습니다. 발사 후 프레스티지 가능.</div>`;
  }

  html += '</div>';

  // History table (moved from old prestige sub-tab)
  let histHtml = '';
  if (gs.history.length === 0) {
    histHtml = '<div style="color:var(--green-dim);font-size:13px;padding:8px 0;">// 발사 기록 없음</div>';
  } else {
    histHtml = `<div class="pst-hist-hd">// 발사 기록 (최근 20회)</div>`;
    histHtml += `<table class="history-table">
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

  wrap.innerHTML = html + histHtml;
}


// ============================================================
//  P4-6: ERA BADGE + SUBTITLE
// ============================================================
function getCurrentEra() {
  const idx = getCurrentPhaseIndex();
  const states = getPhaseStates();
  if (states.every(s => s.done)) return { phase: 5, name: '달 착륙', badge: 'LUNAR' };

  const sceneData = (typeof PHASE_SCENES !== 'undefined') ? PHASE_SCENES : null;
  if (sceneData && sceneData[idx]) {
    return {
      phase: idx + 1,
      name: sceneData[idx].name,
      badge: sceneData[idx].subtitle || `PHASE ${idx + 1}`,
    };
  }

  return { phase: idx + 1, name: PHASES[idx].name, badge: `PHASE ${idx + 1}` };
}

function getTabSubtitle(tabId) {
  switch (tabId) {
    case 'launch':     return 'Launch Control';
    case 'production': return 'Production Hub';
    case 'research':   return 'Research Lab';
    case 'assembly':   return 'Vehicle Assembly';
    case 'mission':    return 'Mission Progress';
    case 'automation': return 'Automation Center';
    default:           return 'Lunar Rocket Facility';
  }
}

function updateTopBarEra() {
  const eraBadge = document.getElementById('tb-era-badge');
  const eraSubtitle = document.getElementById('tb-era-subtitle');

  if (eraBadge) {
    const era = getCurrentEra();
    eraBadge.textContent = era.badge;
    eraBadge.title = era.name;
  }

  if (eraSubtitle) {
    eraSubtitle.textContent = getTabSubtitle(activeTab);
  }
}


// ============================================================
//  RENDER: MISSION TAB
// ============================================================
function renderMissionTab() {
  const maxAlt = gs.history.length
    ? Math.max(...gs.history.map(h => Number(h.altitude) || 0))
    : 0;

  // ── P4-1: Phase interactive timeline (phases sub-tab) ─────
  if (activeMissionSubTab === 'phases') {
    renderPhaseTimeline();
  }

  // ── P4-2: Achievement list (achievements sub-tab) ─────────
  if (activeMissionSubTab === 'achievements') {
    renderAchievementList();
  }

  // ── P4-3: Prestige star tree (prestige sub-tab) ───────────
  if (activeMissionSubTab === 'prestige') {
    renderPrestigeStarTree();
  }

  // ── Moonstone upgrade shop (milestones sub-tab) ───────────
  if (activeMissionSubTab === 'milestones') {
    const msShopWrap = document.getElementById('ms-shop-wrap');
    if (msShopWrap) {
      if (gs.moonstone > 0 || Object.values(gs.msUpgrades || {}).some(v => v > 0)) {
        let shopHtml = `<div class="ms-shop">
          <div class="ms-shop-hd">// 문스톤 업그레이드 <span class="ms-balance">&#9670; ${gs.moonstone}</span></div>
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
                : `<button class="ms-card-btn${canBuy ? '' : ' disabled'}" onclick="buyMsUpgrade('${u.id}')">&#9670; ${u.cost}</button>`}
            </div>
          </div>`;
        });
        shopHtml += '</div></div>';
        msShopWrap.innerHTML = shopHtml;
      } else {
        msShopWrap.innerHTML = '';
      }
    }

    // Milestone list
    renderMilestoneList();
  }

  // ── P4-6: Update ERA badge ────────────────────────────────
  updateTopBarEra();
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
