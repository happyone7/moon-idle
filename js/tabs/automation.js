// ============================================================
//  AUTOMATION TAB
//  moonstone 화폐로 구매하는 자동화 업그레이드 + 실행 로직
// ============================================================

// 자동화 쓰로틀 — tick마다 실행하면 너무 빠름
// 200ms tick × 5 = 1초마다 건물·파트 자동화 실행
let _autoTickCounter = 0;
const AUTO_INTERVAL_SLOW = 5;   // 건물 건설·업그레이드 (5tick = ~1s)
const AUTO_INTERVAL_FAST = 2;   // 파트 제작·조립 (2tick = ~0.4s)

// ─── 자동화 업그레이드 구매 ──────────────────────────────────
function buyAutoUpgrade(id) {
  const upg = AUTOMATION_UPGRADES.find(u => u.id === id);
  if (!upg) return;

  // 이미 구매됨
  if (gs.msUpgrades && gs.msUpgrades[id]) {
    notify('이미 구매된 자동화입니다', 'amber');
    return;
  }

  // 선행 요건 체크
  if (upg.req && !(gs.msUpgrades && gs.msUpgrades[upg.req])) {
    notify('선행 자동화 구매 필요', 'red');
    return;
  }

  // 비용 체크 (moonstone)
  const cost = upg.cost.moonstone || 0;
  if ((gs.moonstone || 0) < cost) {
    notify(`문스톤 부족 (${cost}개 필요)`, 'red');
    return;
  }

  gs.moonstone -= cost;
  if (!gs.msUpgrades) gs.msUpgrades = {};
  gs.msUpgrades[id] = true;
  // 기본 활성화 ON
  if (!gs.autoEnabled) gs.autoEnabled = {};
  gs.autoEnabled[id] = true;

  // 즉시 효과 — ms_quick_workers / ms_early_boost
  if (id === 'ms_quick_workers') {
    gs.workers = (gs.workers || 1) + 1;
    if (typeof syncWorkerDots === 'function') syncWorkerDots();
  }
  if (id === 'ms_early_boost') {
    globalMult *= 1.08;
  }

  notify(`[AUTO] ${upg.name} 활성화`, 'amber');
  playSfx('triangle', 650, 0.12, 0.04, 900);
  saveGame();
  renderAll();
}

// ─── 자동화 ON/OFF 토글 ───────────────────────────────────────
function toggleAutoUpgrade(id) {
  if (!gs.msUpgrades || !gs.msUpgrades[id]) return;
  if (!gs.autoEnabled) gs.autoEnabled = {};
  gs.autoEnabled[id] = !gs.autoEnabled[id];
  saveGame();
  renderAutomationTab();
}

// ─── 자동화 활성 여부 헬퍼 ─────────────────────────────────────
function isAutoOn(id) {
  return !!(gs.msUpgrades && gs.msUpgrades[id] && gs.autoEnabled && gs.autoEnabled[id] !== false);
}

// ─── 자동화 실행 (tick마다 호출) ──────────────────────────────
function runAutomation() {
  _autoTickCounter++;

  const slowTick = (_autoTickCounter % AUTO_INTERVAL_SLOW === 0);
  const fastTick = (_autoTickCounter % AUTO_INTERVAL_FAST === 0);

  // auto_build: 잠금 해제된 건물 자동 건설 (비용 충족 시 가장 저렴한 것부터)
  if (slowTick && isAutoOn('auto_build')) {
    const affordable = BUILDINGS
      .filter(b => gs.unlocks && gs.unlocks['bld_' + b.id])
      .map(b => ({ b, cost: getBuildingCost(b) }))
      .filter(({ cost }) => canAfford(cost))
      .sort((a, b) => (a.cost.money || 0) - (b.cost.money || 0));
    if (affordable.length > 0) {
      const { b, cost } = affordable[0];
      spend(cost);
      gs.buildings[b.id] = (gs.buildings[b.id] || 0) + 1;
      gs.workers = (gs.workers || 1) + 1;
      if (typeof syncWorkerDots === 'function') syncWorkerDots();
      notify(`[AUTO] ${b.icon} ${b.name} 자동 건설`, 'amber');
      if (typeof _triggerBuildAnim === 'function') _triggerBuildAnim(b.id);
    }
  }

  // auto_housing_upg: 여유 인원 0일 때 housing 자동 업그레이드
  if (slowTick && isAutoOn('auto_housing_upg')) {
    if (getAvailableWorkers() === 0 && (gs.buildings.housing || 0) > 0) {
      const upgList = (BUILDING_UPGRADES.housing || []);
      const nextUpg = upgList.find(u => {
        if (gs.bldUpgrades && gs.bldUpgrades[u.id]) return false;
        if (u.req && !(gs.bldUpgrades && gs.bldUpgrades[u.req])) return false;
        return canAfford(u.cost);
      });
      if (nextUpg) {
        spend(nextUpg.cost);
        if (!gs.bldUpgrades) gs.bldUpgrades = {};
        gs.bldUpgrades[nextUpg.id] = true;
        if (nextUpg.wkr) gs.workers = (gs.workers || 1) + nextUpg.wkr;
        notify(`[AUTO] 주거 시설 업그레이드: ${nextUpg.name}`, 'amber');
      }
    }
  }

  // auto_worker: 여유 인원을 현재 배치 비율에 맞춰 자동 배치
  if (slowTick && isAutoOn('auto_worker')) {
    const avail = getAvailableWorkers();
    if (avail > 0) {
      const assigns = gs.assignments || {};
      const total = getTotalAssigned();
      if (total > 0) {
        // 현재 비율로 여유 인원 분배
        const builtBlds = BUILDINGS.filter(b => (gs.buildings[b.id] || 0) > 0 && b.produces !== 'bonus');
        let distributed = 0;
        builtBlds.forEach(b => {
          const current = assigns[b.id] || 0;
          const ratio = current / total;
          const slotCap = (gs.buildings[b.id] || 0) + ((gs.bldSlotLevels && gs.bldSlotLevels[b.id]) || 0);
          const maxExtra = Math.max(0, slotCap - current);
          const extra = Math.min(Math.floor(avail * ratio), maxExtra);
          if (extra > 0) {
            if (!gs.assignments) gs.assignments = {};
            gs.assignments[b.id] = current + extra;
            distributed += extra;
          }
        });
        // 남은 인원은 첫 번째 여유 있는 생산 건물에 배치
        const leftover = avail - distributed;
        if (leftover > 0) {
          const firstBld = builtBlds.find(b => {
            const cnt = gs.buildings[b.id] || 0;
            const slotCap = cnt + ((gs.bldSlotLevels && gs.bldSlotLevels[b.id]) || 0);
            return cnt > 0 && (gs.assignments[b.id] || 0) < slotCap;
          });
          if (firstBld) {
            const slotCap = (gs.buildings[firstBld.id] || 0) + ((gs.bldSlotLevels && gs.bldSlotLevels[firstBld.id]) || 0);
            const curAssign = (gs.assignments && gs.assignments[firstBld.id]) || 0;
            const canAdd = Math.min(leftover, slotCap - curAssign);
            if (canAdd > 0) {
              if (!gs.assignments) gs.assignments = {};
              gs.assignments[firstBld.id] = curAssign + canAdd;
            }
          }
        }
      } else {
        // 배치 이력 없음 → 가장 많이 지은 생산 건물에 전부 배치
        const firstBld = BUILDINGS.find(b => (gs.buildings[b.id] || 0) > 0 && b.produces !== 'bonus');
        if (firstBld) {
          if (!gs.assignments) gs.assignments = {};
          gs.assignments[firstBld.id] = (gs.assignments[firstBld.id] || 0) + avail;
        }
      }
    }
  }

  // auto_addon: 건물 건설 후 첫 번째 애드온 자동 설치
  if (slowTick && isAutoOn('auto_addon')) {
    BUILDINGS.forEach(b => {
      if ((gs.buildings[b.id] || 0) === 0) return;
      if (gs.addons && gs.addons[b.id]) return; // 이미 설치됨
      const def = (typeof BUILDING_ADDONS !== 'undefined') && BUILDING_ADDONS[b.id];
      if (!def || !def.options || def.options.length === 0) return;
      const opt = def.options[0];
      if (opt.cost && !canAfford(opt.cost)) return;
      if (opt.cost) spend(opt.cost);
      if (!gs.addons) gs.addons = {};
      gs.addons[b.id] = opt.id;
      // side-effect 적용 (BUG-P13 수정)
      if (opt.effect) {
        if (opt.effect.rel)            reliabilityBonus += opt.effect.rel;
        if (opt.effect.slotBonus)      slotBonus        += opt.effect.slotBonus;
        if (opt.effect.partCostReduct) partCostMult     *= (1 - opt.effect.partCostReduct);
      }
      notify(`[AUTO] ${b.icon} 애드온 설치: ${opt.name || opt.id}`, 'amber');
    });
  }

  // auto_addon_upg: 설치된 애드온의 업그레이드 자동 구매
  if (slowTick && isAutoOn('auto_addon_upg')) {
    Object.entries(gs.addons || {}).forEach(([bldId, addonOptId]) => {
      const def = (typeof BUILDING_ADDONS !== 'undefined') && BUILDING_ADDONS[bldId];
      if (!def) return;
      const opt = def.options.find(o => o.id === addonOptId);
      if (!opt || !opt.upgrades) return;
      const nextUpg = opt.upgrades.find(u => {
        if (gs.addonUpgrades && gs.addonUpgrades[u.id]) return false;
        return canAfford(u.cost || {});
      });
      if (nextUpg) {
        spend(nextUpg.cost || {});
        if (!gs.addonUpgrades) gs.addonUpgrades = {};
        gs.addonUpgrades[nextUpg.id] = true;
        notify(`[AUTO] 애드온 업그레이드: ${nextUpg.name || nextUpg.id}`, 'amber');
      }
    });
  }

  // auto_parts_*: 각 파트 자동 제작
  if (!fastTick) return; // 파트 제작·조립·발사는 fastTick에서만
  const AUTO_PART_MAP = {
    auto_parts_engine:   'engine',
    auto_parts_fueltank: 'fueltank',
    auto_parts_control:  'control',
    auto_parts_hull:     'hull',
    auto_parts_payload:  'payload',
  };
  Object.entries(AUTO_PART_MAP).forEach(([autoId, partId]) => {
    if (!isAutoOn(autoId)) return;
    if (gs.parts && gs.parts[partId]) return; // 이미 있음
    const part = PARTS.find(p => p.id === partId);
    if (!part) return;
    const cost = getPartCost(part);
    if (!canAfford(cost)) return;
    spend(cost);
    if (!gs.parts) gs.parts = {};
    gs.parts[partId] = 1;
    notify(`[AUTO] ${part.icon} ${part.name} 자동 제작`, 'amber');
  });

  // auto_assemble: 빈 슬롯 + 모든 파트 준비 시 자동 조립 시작
  if (isAutoOn('auto_assemble')) {
    ensureAssemblyState();
    const allPartsReady = PARTS.every(p => gs.parts && gs.parts[p.id]);
    if (allPartsReady) {
      const slots = getAssemblySlots();
      for (let i = 0; i < slots; i++) {
        const job = gs.assembly.jobs[i];
        if (job) continue; // 슬롯 사용 중
        const q = getQuality(gs.assembly.selectedQuality || 'proto');
        const cost = getAssemblyCost(q.id);
        if (!canAfford(cost)) break;
        spend(cost);
        const now = Date.now();
        gs.assembly.jobs[i] = {
          qualityId: q.id,
          startAt: now,
          endAt: now + q.timeSec * 1000
            * (typeof getAddonTimeMult === 'function' ? getAddonTimeMult() : 1)
            * (typeof getMilestoneAssemblyMult === 'function' ? getMilestoneAssemblyMult() : 1),
          ready: false,
        };
        notify(`[AUTO] 슬롯 ${i + 1}: ${q.name} 조립 자동 시작`, 'amber');
        break; // 한 번에 슬롯 하나씩
      }
    }
  }

  // auto_launch: 완료된 슬롯 자동 발사 (오버레이 없이)
  if (isAutoOn('auto_launch')) {
    ensureAssemblyState();
    updateAssemblyJobs();
    for (let i = 0; i < gs.assembly.jobs.length; i++) {
      const job = gs.assembly.jobs[i];
      if (!job || !job.ready) continue;
      if (launchInProgress) break; // 현재 발사 중이면 대기
      const q = getQuality(job.qualityId);
      const sci = getRocketScience(q.id);
      const rollSuccess = Math.random() * 100 < sci.reliability;
      const earned = rollSuccess ? getMoonstoneReward(q.id) : 0;
      gs.launches++;
      if (rollSuccess) gs.successfulLaunches = (gs.successfulLaunches || 0) + 1;
      if (earned > 0) gs.moonstone += earned;
      gs.history.push({
        no: gs.launches,
        quality: q.name,
        qualityId: job.qualityId,
        deltaV: sci.deltaV.toFixed(2),
        altitude: rollSuccess ? Math.floor(sci.altitude) : 0,
        reliability: sci.reliability.toFixed(1),
        success: rollSuccess,
        earned,
        date: `D+${gs.launches * 2}`,
      });
      gs.assembly.jobs[i] = null;
      const icon = rollSuccess ? '✓' : '✗';
      notify(`[AUTO] ${q.icon} 자동 발사 ${icon}${rollSuccess ? ` +${earned}◆` : ''}`, rollSuccess ? 'amber' : 'red');
    }
  }
}

// ─── 자동화 탭 렌더링 ─────────────────────────────────────────
function renderAutomationTab() {
  const pane = document.getElementById('pane-automation');
  if (!pane) return;

  const TIER_LABELS = ['TIER-0  //  생산 자동화', 'TIER-1  //  부품·조립 자동화', 'TIER-2  //  발사 자동화'];

  let html = `<div class="at-header">
    <div class="at-title">// AUTOMATION — 문스톤 자동화 연구</div>
    <div class="at-ms-balance">◆ ${gs.moonstone || 0} 문스톤 보유</div>
  </div>`;

  const tiers = [[], [], []];
  AUTOMATION_UPGRADES.forEach(u => tiers[u.tier] && tiers[u.tier].push(u));

  tiers.forEach((group, ti) => {
    if (group.length === 0) return;
    html += `<div class="at-tier-hd">${TIER_LABELS[ti] || 'TIER-' + ti}</div>`;
    html += `<div class="at-grid">`;
    group.forEach(u => {
      const bought = gs.msUpgrades && gs.msUpgrades[u.id];
      const reqMet = !u.req || (gs.msUpgrades && gs.msUpgrades[u.req]);
      const canBuy = !bought && reqMet && (gs.moonstone || 0) >= (u.cost.moonstone || 0);
      const isOn   = isAutoOn(u.id);

      let statusClass = 'at-card-locked';
      if (bought) statusClass = isOn ? 'at-card-on' : 'at-card-off';
      else if (canBuy) statusClass = 'at-card-buyable';
      else if (!reqMet) statusClass = 'at-card-locked';

      let btn = '';
      if (bought) {
        btn = `<button class="at-toggle${isOn ? ' at-toggle-on' : ' at-toggle-off'}" onclick="toggleAutoUpgrade('${u.id}')">${isOn ? '[ ON ]' : '[OFF]'}</button>`;
      } else if (!reqMet) {
        btn = `<button class="at-toggle at-toggle-locked" disabled>[ 잠금 ]</button>`;
      } else {
        btn = `<button class="at-toggle${canBuy ? ' at-toggle-buy' : ' at-toggle-poor'}" onclick="buyAutoUpgrade('${u.id}')" ${canBuy ? '' : 'disabled'}>[ ◆${u.cost.moonstone} 구매 ]</button>`;
      }

      const reqLabel = u.req ? `<div class="at-req">requires: ${u.req}</div>` : '';

      html += `<div class="at-card ${statusClass}">
        <div class="at-card-top">
          <span class="at-icon">${u.icon}</span>
          <span class="at-name">${u.name}</span>
          ${bought ? '' : `<span class="at-cost">◆${u.cost.moonstone}</span>`}
        </div>
        <div class="at-desc">${u.desc}</div>
        ${reqLabel}
        ${btn}
      </div>`;
    });
    html += `</div>`;
  });

  // 자동화 현황 요약
  const ownedCount = AUTOMATION_UPGRADES.filter(u => gs.msUpgrades && gs.msUpgrades[u.id]).length;
  const onCount    = AUTOMATION_UPGRADES.filter(u => isAutoOn(u.id)).length;
  html += `<div class="at-footer">// 보유 ${ownedCount} / ${AUTOMATION_UPGRADES.length} &nbsp;|&nbsp; 활성 ${onCount}</div>`;

  pane.innerHTML = html;
}
