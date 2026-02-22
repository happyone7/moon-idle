// ============================================================
//  GAME STATE
// ============================================================
let gs = {
  res: { money:1500, iron:0, copper:0, fuel:0, electronics:0, research:0 },
  buildings: { housing:1, ops_center:0, supply_depot:0, mine:0, extractor:0, refinery:0, cryo_plant:0, elec_lab:0, fab_plant:0, research_lab:0, r_and_d:0, solar_array:0, launch_pad:0 },
  bldUpgrades: {},    // per-building named upgrades purchased
  bldLevels: {},      // { buildingId: statUpgradeCount } — 생산량 업그레이드 (getBldProdMult용)
  bldSlotLevels: {},  // { buildingId: slotUpgradeCount } — 인원 슬롯 추가 (BUG-013 분리)
  addons: {},         // { buildingId: addonOptionId } — A/B 선택된 애드온
  addonUpgrades: {}, // { upgradeId: true }
  workers: 1,          // 총 인원
  assignments: {},     // { buildingId: workerCount }
  parts: { engine:0, fueltank:0, control:0, hull:0, payload:0 },
  assembly: { selectedQuality:'proto', selectedClass:'nano', jobs:[] },
  fuelLoaded: false,     // 연료 수동 주입 여부 (발사 전 주입 필요)
  upgrades: {},
  researchProgress: {},  // { upgradeId: { rpSpent: number, timeSpent: number } } — 진행 중인 연구
  maxResearchSlots: 1,   // 연구 슬롯 초기 1개
  opsRoles: { sales: 0, accounting: 0, consulting: 0 },
  citizens: 0,         // 분양된 시민 수 (P8-4)
  specialists: {},     // { bldId: { specId: count } } — 전문화된 직원
  selectedTech: null,
  msUpgrades: {},
  autoEnabled: {},
  milestones: {},
  achievements: {},       // P4-2: earned achievement IDs
  prestigeStars: {},      // P4-3: purchased star tree node IDs
  prestigeCount: 0,       // P4-3: total prestige count
  launches: 0,
  moonstone: 0,
  history: [],
  lastTick: Date.now(),
  settings: { sound: true, lang: 'en' },
  saveVersion: 2,
  unlocks: {
    tab_production: true,
    tab_research: false,   // 연구소 구매 후 자동 해금
    tab_assembly: false,
    tab_launch: true,
    tab_mission: false,
    tab_automation: false, // 첫 발사 완료 후 자동 해금
    bld_housing: true,      // 처음부터 표시
    bld_ops_center: true,  // 처음부터 표시
    bld_supply_depot: false,
    bld_mine: true,        // 처음부터 표시 (채굴기는 초기 핵심 건물)
    bld_extractor: false,
    bld_refinery: false,
    bld_cryo_plant: false,
    bld_elec_lab: false,
    bld_fab_plant: false,
    bld_research_lab: false, // 운영센터 건설 후 해금
    bld_r_and_d: false,
    bld_solar_array: false,
    bld_launch_pad: false,
  },
};
let prodMult = {};
let globalMult = 1;
let partCostMult = 1;
let fusionBonus = 0;
let reliabilityBonus = 0;
let slotBonus = 0;
let audioCtx = null;
let activeTab  = 'launch';
let resLeftTab = 'all';
let launchInProgress = false;
let pendingLaunchMs = 0;
let pendingLaunchData = null;
let selectedTechId = null;
let recentResearches = [];


// ============================================================
//  HELPERS
// ============================================================
function fmt(n) {
  if (typeof n !== 'number' || !isFinite(n)) return '0';
  if (n >= 1e9) return (n/1e9).toFixed(1)+'B';
  if (n >= 1e6) return (n/1e6).toFixed(1)+'M';
  if (n >= 1e3) return (n/1e3).toFixed(1)+'K';
  return Math.floor(n).toString();
}

function fmtDec(n, d=1) {
  if (typeof n !== 'number' || !isFinite(n)) return '0.0';
  if (n >= 1e6) return (n/1e6).toFixed(2)+'M';
  if (n >= 1e3) return (n/1e3).toFixed(1)+'K';
  return n.toFixed(d);
}

function fmtTime(sec) {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${r}s`;
  return `${r}s`;
}

function fmtComma(n) {
  if (typeof n !== 'number' || !isFinite(n)) return '0';
  if (n >= 1e9) return (n/1e9).toFixed(2)+'B';
  if (n >= 1e6) return (n/1e6).toFixed(3)+'M';
  return Math.floor(n).toLocaleString('en-US');
}

function clamp(v, mn, mx) { return Math.min(mx, Math.max(mn, v)); }

function getQuality(qid) { return QUALITIES.find(q => q.id === qid) || QUALITIES[0]; }

function getAssemblySlots() { return 1 + gs.buildings.launch_pad + slotBonus + getAddonSlotBonus(); }

function ensureAssemblyState() {
  if (!gs.assembly) gs.assembly = { selectedQuality:'proto', selectedClass:'nano', jobs:[] };
  if (!Array.isArray(gs.assembly.jobs)) gs.assembly.jobs = [];
  if (!gs.assembly.selectedQuality) gs.assembly.selectedQuality = 'proto';
  if (!gs.assembly.selectedClass) gs.assembly.selectedClass = 'nano';
  const slots = getAssemblySlots();
  while (gs.assembly.jobs.length < slots) gs.assembly.jobs.push(null);
  if (gs.assembly.jobs.length > slots) gs.assembly.jobs = gs.assembly.jobs.slice(0, slots);
}

// ─── BUILDING LEVEL SYSTEM ─────────────────────────────────
function getBldLevel(bid) {
  return (gs.bldLevels && gs.bldLevels[bid]) || 0;
}

function getBldProdMult(bid) {
  return 1 + getBldLevel(bid) * 0.5;  // Lv0=1× Lv1=1.5× Lv2=2× ...
}

function getBldUpgradeCost(bid) {
  const lv = getBldLevel(bid);
  return {
    money: Math.floor(300 * Math.pow(2.0, lv)),
    iron:  Math.floor(80 * Math.pow(1.6, lv)),
  };
}

function upgBuilding(bid) {
  const bld = BUILDINGS.find(b => b.id === bid);
  if (!bld) return;
  if ((gs.buildings[bid] || 0) === 0) { notify('건물 없음', 'red'); return; }
  const cost = getBldUpgradeCost(bid);
  if (!canAfford(cost)) { notify('자원 부족', 'red'); return; }
  spend(cost);
  if (!gs.bldLevels) gs.bldLevels = {};
  gs.bldLevels[bid] = (gs.bldLevels[bid] || 0) + 1;
  notify(`${bld.icon} ${bld.name} Lv.${gs.bldLevels[bid]} 업그레이드 완료`);
  playSfx('triangle', 520, 0.1, 0.04, 780);
  // 오버레이 갱신
  const el = document.querySelector('.world-bld[data-bid="' + bid + '"]');
  if (el) openBldOv(bld, el);
  renderAll();
}

function getMoonstoneMult() { return Math.pow(1.07, gs.moonstone || 0); }

function getSolarBonus() {
  let perPanel = 0.15;
  if (gs.bldUpgrades) {
    if (gs.bldUpgrades.sol_hieff)   perPanel += 0.05;
    if (gs.bldUpgrades.sol_tracker) perPanel += 0.05;
  }
  return 1 + gs.buildings.solar_array * perPanel;
}

// Returns multiplicative stack from all purchased per-building upgrades
// Handles both one-time (boolean/1) and repeatable (number N → mult^N) upgrades
function getBldUpgradeMult(bldId) {
  if (!gs.bldUpgrades) return 1;
  const upgrades = (typeof BUILDING_UPGRADES !== 'undefined' && BUILDING_UPGRADES[bldId]) || [];
  return upgrades.reduce((m, u) => {
    const raw = gs.bldUpgrades[u.id];
    if (!raw || !u.mult) return m;
    const lvl = typeof raw === 'number' ? raw : 1;
    return m * Math.pow(u.mult, lvl);
  }, 1);
}

// ─── ADD-ON HELPERS ──────────────────────────────────────────
function _getAddonOpt(bldId) {
  if (!gs.addons || !gs.addons[bldId]) return null;
  const def = (typeof BUILDING_ADDONS !== 'undefined') && BUILDING_ADDONS[bldId];
  if (!def) return null;
  return def.options.find(o => o.id === gs.addons[bldId]) || null;
}

// Production multiplier from add-on (affects parent building's output)
function getAddonMult(bldId) {
  const opt = _getAddonOpt(bldId);
  if (!opt) return 1;
  let mult = (opt.effect && opt.effect.moneyMult) || 1;
  (opt.upgrades || []).forEach(u => {
    if (gs.addonUpgrades && gs.addonUpgrades[u.id] && u.mult) mult *= u.mult;
  });
  return mult;
}

// Extra RP/s from ops_center tech hub addon
function getAddonRpBonus() {
  const opt = _getAddonOpt('ops_center');
  if (!opt) return 0;
  let bonus = (opt.effect && opt.effect.rpBonus) || 0;
  (opt.upgrades || []).forEach(u => {
    if (gs.addonUpgrades && gs.addonUpgrades[u.id] && u.rpBonus) bonus += u.rpBonus;
  });
  return bonus;
}

// Extra reliability from launch_pad ctrl addon
function getAddonRelBonus() {
  const opt = _getAddonOpt('launch_pad');
  if (!opt) return 0;
  let rel = (opt.effect && opt.effect.rel) || 0;
  (opt.upgrades || []).forEach(u => {
    if (gs.addonUpgrades && gs.addonUpgrades[u.id] && u.rel) rel += u.rel;
  });
  return rel;
}

// Assembly time multiplier from launch_pad addons
function getAddonTimeMult() {
  const opt = _getAddonOpt('launch_pad');
  if (!opt) return 1;
  let mult = (opt.effect && opt.effect.timeMult) || 1;
  (opt.upgrades || []).forEach(u => {
    if (gs.addonUpgrades && gs.addonUpgrades[u.id] && u.timeMult) mult *= u.timeMult;
  });
  return mult;
}

// Extra assembly slots from VIF addon
function getAddonSlotBonus() {
  const opt = _getAddonOpt('launch_pad');
  if (!opt) return 0;
  let slot = (opt.effect && opt.effect.slotBonus) || 0;
  (opt.upgrades || []).forEach(u => {
    if (gs.addonUpgrades && gs.addonUpgrades[u.id] && u.slotBonus) slot += u.slotBonus;
  });
  return slot;
}

// Part cost multiplier from VIF addon (< 1 = discount)
function getAddonPartCostMult() {
  const opt = _getAddonOpt('launch_pad');
  if (!opt) return 1;
  let reduct = (opt.effect && opt.effect.partCostReduct) || 0;
  (opt.upgrades || []).forEach(u => {
    if (gs.addonUpgrades && gs.addonUpgrades[u.id] && u.partCostReduct) reduct += u.partCostReduct;
  });
  return Math.max(0.05, 1 - reduct);
}

function canAfford(cost) {
  return Object.entries(cost).every(([r, v]) => {
    if (r === 'moonstone') return (gs.moonstone || 0) >= v;
    return (gs.res[r] || 0) >= v;
  });
}

function spend(cost) {
  Object.entries(cost).forEach(([r, v]) => {
    if (r === 'moonstone') { gs.moonstone = Math.max(0, (gs.moonstone || 0) - v); return; }
    gs.res[r] = Math.max(0, (gs.res[r] || 0) - v);
  });
}

const BUILDING_EXPONENTS = {
  housing:       1.12,
  ops_center:    1.18,
  supply_depot:  1.18,
  mine:          1.13,
  extractor:     1.15,
  refinery:      1.15,
  cryo_plant:    1.15,
  elec_lab:      1.12,
  fab_plant:     1.15,
  research_lab:  1.12,
  r_and_d:       1.15,
  solar_array:   1.22,
  launch_pad:    1.30,
};

function getBuildingCost(bld) {
  const cost = {};
  Object.entries(bld.baseCost).forEach(([r, v]) => {
    const exp = BUILDING_EXPONENTS[bld.id] || 1.15;
    cost[r] = Math.floor(v * Math.pow(exp, gs.buildings[bld.id] || 0));
  });
  return cost;
}

// 지수형 건물 구매 비용: baseCost × 1.15^currentCount
// buildingId로 직접 조회하는 헬퍼 (자동화/UI 등에서 사용)
function getBldPurchaseCost(bldId) {
  const bld = BUILDINGS.find(b => b.id === bldId);
  if (!bld) return {};
  return getBuildingCost(bld);
}

// 직원 고용 비용: 500 × 2.0^(workers-1) — 전체 인원 기반 (레거시)
function getWorkerHireCost() {
  return Math.floor(500 * Math.pow(2.0, (gs.workers || 1) - 1));
}

// 건물별 직원 고용 비용: 100 × 3.0^(해당건물 배치 인원) — 슬롯 제한 없이 비용만 증가
function getBldWorkerCost(bldId) {
  const assigned = (gs.assignments && gs.assignments[bldId]) || 0;
  return Math.floor(100 * Math.pow(3.0, assigned));
}

// 직원 전문화: 해당 건물 배치 인원 1명을 전문가로 전환 (P8-5)
function promoteToSpecialist(bldId, specId) {
  const assigned = (gs.assignments && gs.assignments[bldId]) || 0;
  if (assigned < 1) return false;
  gs.assignments[bldId] = assigned - 1;
  gs.citizens = Math.max(0, (gs.citizens || 0) - 1);
  if (!gs.specialists) gs.specialists = {};
  if (!gs.specialists[bldId]) gs.specialists[bldId] = {};
  gs.specialists[bldId][specId] = (gs.specialists[bldId][specId] || 0) + 1;
  return true;
}

// 시민 분양 비용: 500 × 1.8^(citizens) (P8-4)
function getCitizenCost() {
  return Math.floor(500 * Math.pow(1.8, gs.citizens || 0));
}

// 시민 분양: 자금 차감 후 시민 수 증가 (P8-4)
function allocateCitizen() {
  const cost = getCitizenCost();
  if ((gs.res.money || 0) < cost) return false;
  gs.res.money = Math.max(0, (gs.res.money || 0) - cost);
  gs.citizens = (gs.citizens || 0) + 1;
  return true;
}

function getPartCost(part) {
  const cost = {};
  const addonMult = getAddonPartCostMult();
  Object.entries(part.cost).forEach(([r, v]) => {
    cost[r] = Math.floor(v * partCostMult * addonMult);
  });
  return cost;
}

function getProduction() {
  const prod = { money:0, iron:0, copper:0, fuel:0, electronics:0, research:0 };
  BUILDINGS.forEach(b => {
    if (b.produces === 'bonus' || !(b.produces in prod)) return;
    // 생산량은 배치된 인원(assignments) 기반
    const assigned = (gs.assignments && gs.assignments[b.id]) || 0;
    if (assigned === 0) return;
    const msBonus = typeof getMilestoneProdBonus === 'function' ? getMilestoneProdBonus() : 1;
    const rate = b.baseRate * assigned * (prodMult[b.produces] || 1) * globalMult * getMoonstoneMult() * getSolarBonus() * getBldProdMult(b.id) * getBldUpgradeMult(b.id) * getAddonMult(b.id) * msBonus;
    prod[b.produces] += rate;
  });
  // Add RP bonus from tech hub addon
  prod.research += getAddonRpBonus();
  // 주거시설 상가 업그레이드: +50/s (P8-4)
  if (gs.bldUpgrades && gs.bldUpgrades.housing_market) {
    prod.money += 50;
  }
  // ── 전문가 효과 반영 (P8-5) ──────────────────────────────────
  if (gs.specialists) {
    // research_lab 실험 전문가: 연구 생산 +25%/명
    const expCount = (gs.specialists.research_lab && gs.specialists.research_lab.experiment) || 0;
    if (expCount > 0) prod.research = (prod.research || 0) * (1 + expCount * 0.25);
    // research_lab 데이터 분석가: 모든 생산 +8%/명
    const analCount = (gs.specialists.research_lab && gs.specialists.research_lab.analyst) || 0;
    if (analCount > 0) {
      const analMult = 1 + analCount * 0.08;
      Object.keys(prod).forEach(k => { if (typeof prod[k] === 'number') prod[k] *= analMult; });
    }
    // ops_center 영업 전문가: 자금 수입 +20%/명
    const salesCount = (gs.specialists.ops_center && gs.specialists.ops_center.sales_pro) || 0;
    if (salesCount > 0) prod.money = (prod.money || 0) * (1 + salesCount * 0.20);
  }
  return prod;
}

// 여유 인원 수 (시민 총수 기반 — 인원 상한 없음)
function getAvailableWorkers() {
  const total = gs.citizens || 0;
  const assigned = Object.values(gs.assignments || {}).reduce((a, b) => a + b, 0);
  return total - assigned;
}

function getTotalWorkers() {
  return gs.citizens || 0;
}

function getTotalAssigned() {
  return Object.values(gs.assignments || {}).reduce((a, b) => a + b, 0);
}

function getRocketScience(qualityId) {
  const q = getQuality(qualityId);
  const isp = 315 + q.ispBonus + gs.buildings.elec_lab * 1.2 + (gs.upgrades.fusion ? 22 : 0);
  const dryMass = 28 * q.dryMassMult * (gs.upgrades.lightweight ? 0.9 : 1);
  const propMass = 76 + gs.buildings.refinery * 0.1 + gs.buildings.cryo_plant * 0.2;
  const thrust = 1450 + gs.buildings.mine * 0.8 + (gs.upgrades.fusion ? 120 : 0);
  const m0 = dryMass + propMass;
  const deltaV = isp * 9.81 * Math.log(m0 / dryMass) / 1000;
  const twr = thrust / (m0 * 9.81);
  const reliability = clamp(
    70 + gs.buildings.research_lab * 1.9 + gs.buildings.elec_lab * 0.8 + reliabilityBonus + q.relBonus + getAddonRelBonus(),
    0, 99.5
  );
  const altitude = clamp(deltaV * 22, 0, 400);
  return { deltaV, twr, reliability, altitude };
}

function getMoonstoneReward(qualityId) {
  const sci = getRocketScience(qualityId);
  const q = getQuality(qualityId);
  const base = Math.max(1, Math.floor((sci.altitude / 20) * q.rewardMult) + fusionBonus + Math.floor(gs.launches / 4));
  const mult = typeof getMilestoneMsBonus === 'function' ? getMilestoneMsBonus() : 1;
  return Math.floor(base * mult);
}

function getCostStr(cost) {
  return Object.entries(cost).map(([r, v]) => {
    const res = RESOURCES.find(x => x.id === r);
    return `${res ? res.symbol : r}:${fmt(v)}`;
  }).join(' ');
}

function getAssemblyCost(qualityId) {
  const q = getQuality(qualityId);
  const total = {};
  PARTS.forEach(p => {
    const c = getPartCost(p);
    Object.entries(c).forEach(([r, v]) => {
      total[r] = (total[r] || 0) + Math.floor(v * q.costMult * 0.32);
    });
  });
  // MK2+ 추가 구리 비용
  if (q.copperCost && q.copperCost > 0) {
    total.copper = (total.copper || 0) + q.copperCost;
  }
  return total;
}


// ============================================================
//  AUDIO
// ============================================================
function ensureAudio() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    try { audioCtx = new Ctx(); } catch(e) { return null; }
    // 첫 사용자 상호작용 시 오디오 컨텍스트 자동 활성화
    const _unlock = () => {
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
      document.removeEventListener('pointerdown', _unlock);
    };
    document.addEventListener('pointerdown', _unlock, { passive: true });
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
    return null; // 이번 사운드는 생략, 다음 클릭부터 재생됨
  }
  return audioCtx;
}

// SFX 전체 볼륨 배율 — BGM(0.2) 대비 SFX가 너무 작아서 보정
const SFX_GLOBAL_VOL = 5.0;

function playSfx(type='sine', freq=440, dur=0.08, vol=0.05, targetFreq=null) {
  if (!gs.settings.sound) return;
  const ctx = ensureAudio();
  if (!ctx) return;
  try {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    const now  = ctx.currentTime;
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (targetFreq) osc.frequency.exponentialRampToValueAtTime(targetFreq, now + dur);
    gain.gain.setValueAtTime(Math.min(1.0, vol * SFX_GLOBAL_VOL), now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + dur);
  } catch(e) {}
}

function playLaunchSfx() {
  playSfx('triangle', 280, 0.12, 0.04, 380);
  setTimeout(() => playSfx('triangle', 420, 0.16, 0.05, 620), 120);
  setTimeout(() => playSfx('sawtooth', 680, 0.22, 0.04, 980), 250);
}


// ============================================================
//  SAVE / LOAD
// ============================================================
const SAVE_PREFIX     = 'moonIdle_slot_';
const LEGACY_SAVE_KEY = 'moonIdle_v2';
const MAX_SAVE_SLOTS  = 3;
let currentSaveSlot   = 1;

/** 레거시 단일 세이브(moonIdle_v2)를 슬롯1로 마이그레이션 (슬롯1이 비어있을 때만) */
function migrateLegacySave() {
  const legacy = localStorage.getItem(LEGACY_SAVE_KEY);
  if (!legacy) return false;
  if (localStorage.getItem(SAVE_PREFIX + '1')) return false; // 슬롯1 이미 점유
  try {
    localStorage.setItem(SAVE_PREFIX + '1', legacy);
    localStorage.removeItem(LEGACY_SAVE_KEY);
    return true;
  } catch(e) { return false; }
}

/** 전체 슬롯 메타데이터 조회 (빈 슬롯도 포함) */
function getSaveSlots() {
  const slots = [];
  for (let i = 1; i <= MAX_SAVE_SLOTS; i++) {
    const raw = localStorage.getItem(SAVE_PREFIX + i);
    if (raw) {
      try {
        const d = JSON.parse(raw);
        const bldTotal = Object.values(d.buildings || {}).reduce((a, b) => a + b, 0);
        slots.push({
          slot: i, empty: false,
          launches: d.launches || 0,
          moonstone: d.moonstone || 0,
          buildings: bldTotal,
          lastTick: d.lastTick || 0,
        });
      } catch(e) { slots.push({ slot: i, empty: true }); }
    } else {
      slots.push({ slot: i, empty: true });
    }
  }
  return slots;
}

/** 특정 슬롯 삭제 */
function deleteSlot(slot) {
  localStorage.removeItem(SAVE_PREFIX + slot);
}

function saveGame() {
  try {
    localStorage.setItem(SAVE_PREFIX + currentSaveSlot, JSON.stringify(gs));
  } catch(e) {
    if (e.name === 'QuotaExceededError') notify('저장 실패: 저장 공간 부족', 'red');
  }
}

function loadGame(slot) {
  if (slot !== undefined) currentSaveSlot = slot;
  try {
    const raw = localStorage.getItem(SAVE_PREFIX + currentSaveSlot);
    if (!raw) return false;
    const saved = JSON.parse(raw);

    // Merge resources (+ metal→iron migration)
    if (saved.res) {
      Object.assign(gs.res, saved.res);
      if (gs.res.metal !== undefined && gs.res.iron === undefined) {
        gs.res.iron = gs.res.metal;
      }
      delete gs.res.metal;
      if (gs.res.copper === undefined) gs.res.copper = 0;
    }

    // Merge buildings
    if (saved.buildings) Object.assign(gs.buildings, saved.buildings);

    // Merge parts
    if (saved.parts) Object.assign(gs.parts, saved.parts);

    // Worker system
    gs.workers = saved.workers || 1;
    gs.assignments = saved.assignments || {};

    // Scalars
    gs.launches = saved.launches || 0;
    gs.moonstone = saved.moonstone || 0;
    gs.history = saved.history || [];
    gs.upgrades = saved.upgrades || {};
    gs.researchProgress = saved.researchProgress || {};
    // researchProgress 마이그레이션: timeSpent 없으면 추론
    if (gs.researchProgress) {
      Object.entries(gs.researchProgress).forEach(([uid, prog]) => {
        if (prog.timeSpent === undefined) {
          const upg = UPGRADES.find(u => u.id === uid);
          if (upg) {
            const techTime = upg.time || 60;
            const rpTotal  = upg.cost.research || 1;
            prog.timeSpent = ((prog.rpSpent || 0) / rpTotal) * techTime;
          } else {
            prog.timeSpent = 0;
          }
        }
      });
    }
    gs.opsRoles = saved.opsRoles || { sales: 0, accounting: 0, consulting: 0 };
    if (!gs.opsRoles) gs.opsRoles = { sales: 0, accounting: 0, consulting: 0 };
    // 시민 수 마이그레이션 (P8-4)
    gs.citizens = saved.citizens !== undefined ? saved.citizens : 0;
    // 전문가 마이그레이션 (P8-5)
    gs.specialists = saved.specialists || {};
    // 기존 ops_center 배치 인원을 역할로 분배 (마이그레이션)
    if (gs.assignments && gs.assignments.ops_center &&
        gs.opsRoles.sales === 0 && gs.opsRoles.accounting === 0 && gs.opsRoles.consulting === 0) {
      const total = gs.assignments.ops_center;
      gs.opsRoles.sales = total; // 기존 배치는 전부 영업팀으로 이관
    }

    gs.assembly = saved.assembly || { selectedQuality:'proto', selectedClass:'nano', jobs:[] };
    if (!gs.assembly.selectedClass) gs.assembly.selectedClass = 'nano';
    gs.settings = saved.settings || { sound: true, lang: 'en' };
    if (gs.settings.lang === undefined) gs.settings.lang = 'en';
    gs.lastTick = saved.lastTick || Date.now();
    gs.bldLevels = saved.bldLevels || {};
    gs.bldSlotLevels = saved.bldSlotLevels || {};
    gs.bldUpgrades = saved.bldUpgrades || {};
    gs._prodHubVisited = saved._prodHubVisited !== undefined ? saved._prodHubVisited :
      ((saved.buildings && (saved.buildings.ops_center || 0) > 0) ||
       (saved.buildings && (saved.buildings.research_lab || 0) > 0));
    gs.addons = saved.addons || {};
    gs.addonUpgrades = saved.addonUpgrades || {};
    gs.msUpgrades = saved.msUpgrades || {};
    gs.autoEnabled = saved.autoEnabled || {};
    gs.milestones  = saved.milestones  || {};
    gs.achievements = saved.achievements || {};         // P4-2
    gs.prestigeStars = saved.prestigeStars || {};       // P4-3
    gs.prestigeCount = saved.prestigeCount || 0;        // P4-3

    // Merge unlocks — keep defaults for any missing keys
    const defaultUnlocks = {
      tab_production: true,
      tab_research: true,
      tab_assembly: false,
      tab_launch: true,
      tab_mission: false,
      tab_automation: false,
      bld_housing: true,
      bld_ops_center: true,
      bld_supply_depot: false,

      bld_mine: true,        // 처음부터 표시 (채굴기는 초기 핵심 건물)
      bld_extractor: false,
      bld_refinery: false,
      bld_cryo_plant: false,
      bld_elec_lab: false,
      bld_fab_plant: false,
      bld_research_lab: false,
      bld_r_and_d: false,
      bld_solar_array: false,
      bld_launch_pad: false,
    };
    gs.unlocks = Object.assign({}, defaultUnlocks, saved.unlocks || {});

    // Re-apply upgrade effects to restore prodMult/globalMult etc.
    prodMult = {};
    globalMult = 1;
    partCostMult = 1;
    fusionBonus = 0;
    reliabilityBonus = 0;
    slotBonus = 0;
    Object.keys(gs.upgrades).forEach(uid => {
      if (!gs.upgrades[uid]) return;
      const upg = UPGRADES.find(u => u.id === uid);
      if (upg) upg.effect();
    });
    // Re-apply building upgrade side-effects (rel only; wkr is already in gs.workers)
    if (typeof BUILDING_UPGRADES !== 'undefined') {
      Object.keys(gs.bldUpgrades || {}).forEach(uid => {
        const raw = gs.bldUpgrades[uid];
        if (!raw) return;
        const level = typeof raw === 'number' ? raw : 1;
        for (const bldId in BUILDING_UPGRADES) {
          const upg = BUILDING_UPGRADES[bldId].find(u => u.id === uid);
          if (upg && upg.rel) reliabilityBonus += upg.rel * level;
        }
      });
    }
    // Re-apply add-on immediate effects (rel, slotBonus, partCostReduct)
    if (typeof BUILDING_ADDONS !== 'undefined') {
      Object.entries(gs.addons || {}).forEach(([bldId, optId]) => {
        const def = BUILDING_ADDONS[bldId];
        if (!def) return;
        const opt = def.options.find(o => o.id === optId);
        if (!opt || !opt.effect) return;
        if (opt.effect.rel)            reliabilityBonus += opt.effect.rel;
        if (opt.effect.slotBonus)      slotBonus        += opt.effect.slotBonus;
        if (opt.effect.partCostReduct) partCostMult     *= (1 - opt.effect.partCostReduct);
        // Re-apply addon upgrade side-effects
        (opt.upgrades || []).forEach(u => {
          if (!gs.addonUpgrades || !gs.addonUpgrades[u.id]) return;
          if (u.rel)            reliabilityBonus += u.rel;
          if (u.slotBonus)      slotBonus        += u.slotBonus;
          if (u.partCostReduct) partCostMult     *= (1 - u.partCostReduct);
        });
      });
    }

    ensureAssemblyState();
    if (typeof applyMsUpgradesFromState === 'function') applyMsUpgradesFromState();
    return true;
  } catch(e) {
    console.warn('Load failed', e);
    return false;
  }
}

function calcOffline() {
  const now = Date.now();
  const rawElapsed = (now - gs.lastTick) / 1000;
  const elapsed = Math.min(rawElapsed, 8 * 3600);
  if (elapsed < 5) { gs.lastTick = now; return; }

  const prod = getProduction();
  const report = {
    elapsed,
    resources: {},
    assemblyCompleted: 0,
    autoLaunches: [],
  };

  // 자원 수집
  RESOURCES.forEach(r => {
    const gained = prod[r.id] * elapsed;
    if (gained > 0.01) report.resources[r.id] = gained;
    gs.res[r.id] = Math.max(0, (gs.res[r.id] || 0) + gained);
  });

  gs.lastTick = now;

  // 조립 완료 처리
  const beforeJobs = JSON.stringify((gs.assembly && gs.assembly.jobs) || []);
  updateAssemblyJobs(now);
  const afterJobs = JSON.stringify((gs.assembly && gs.assembly.jobs) || []);
  // 새로 완료된 슬롯 수 세기
  const jobsBefore = JSON.parse(beforeJobs);
  const jobsAfter  = JSON.parse(afterJobs);
  jobsAfter.forEach((job, idx) => {
    if (job && job.ready && (!jobsBefore[idx] || !jobsBefore[idx].ready)) {
      report.assemblyCompleted++;
      // 자동 발사 처리 — auto_launch 구매 + 활성화된 경우에만
      if (gs.msUpgrades && gs.msUpgrades['auto_launch'] && gs.autoEnabled && gs.autoEnabled['auto_launch'] !== false) {
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
        gs.assembly.jobs[idx] = null;
        report.autoLaunches.push({ quality: q.name, qualityId: job.qualityId, success: rollSuccess, earned, altitude: Math.floor(sci.altitude), reliability: sci.reliability.toFixed(1) });
      }
    }
  });

  // 오프라인 보고서 표시 (1분 이상 오프라인 시)
  if (elapsed >= 60) {
    setTimeout(() => _showOfflineReport(report), 500);
  } else {
    const secs = Math.floor(elapsed % 60);
    const banner = document.getElementById('offline-banner');
    if (banner) {
      banner.style.display = 'block';
      banner.textContent = `오프라인 ${secs}초 — 자원 생산 완료`;
      setTimeout(() => { banner.style.display = 'none'; }, 3000);
    }
  }
}

function _showOfflineReport(report) {
  // P5-3: 오프라인 복귀 SFX
  if (typeof playSfx_offlineReturn === 'function') playSfx_offlineReturn();

  const h = Math.floor(report.elapsed / 3600);
  const m = Math.floor((report.elapsed % 3600) / 60);
  const s = Math.floor(report.elapsed % 60);
  const timeStr = h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`;

  // 자원 수익 HTML
  const RES_NAMES = { money:'₩ 자금', iron:'Fe 철광석', copper:'Cu 구리', fuel:'LOX 연료', electronics:'PCB 전자', research:'RP 연구' };
  let resHtml = '';
  Object.entries(report.resources).forEach(([rid, val]) => {
    if (val > 0.01) {
      resHtml += `<div class="ofr-row"><span class="ofr-lbl">${RES_NAMES[rid]||rid}</span><span class="ofr-val">+${fmt(val)}</span></div>`;
    }
  });

  // 자동 발사 이력 HTML
  let launchHtml = '';
  if (report.autoLaunches.length > 0) {
    // 기체 종류별 집계
    const byQuality = {};
    report.autoLaunches.forEach(l => {
      if (!byQuality[l.quality]) byQuality[l.quality] = { total:0, success:0, earned:0, altMax:0 };
      byQuality[l.quality].total++;
      if (l.success) { byQuality[l.quality].success++; byQuality[l.quality].earned += l.earned; }
      if (l.altitude > byQuality[l.quality].altMax) byQuality[l.quality].altMax = l.altitude;
    });

    const totalEarned = report.autoLaunches.reduce((s,l) => s + (l.earned||0), 0);
    const totalSuccess = report.autoLaunches.filter(l => l.success).length;
    const totalLaunches = report.autoLaunches.length;
    const successRate = totalLaunches > 0 ? ((totalSuccess/totalLaunches)*100).toFixed(0) : 0;

    launchHtml += `<div class="ofr-section-hd">// 자동 발사 (${totalLaunches}회 · 성공률 ${successRate}%)</div>`;
    Object.entries(byQuality).forEach(([qname, stat]) => {
      const qSuccessRate = stat.total > 0 ? ((stat.success/stat.total)*100).toFixed(0) : 0;
      launchHtml += `<div class="ofr-launch-row">
        <span class="ofr-quality">${qname}</span>
        <span class="ofr-launch-stat">×${stat.total} 발사</span>
        <span class="ofr-launch-stat" style="color:${stat.success===stat.total?'var(--green)':'var(--amber)'}">✓ ${stat.success}회 (${qSuccessRate}%)</span>
        <span class="ofr-launch-stat">최고도 ${stat.altMax}km</span>
      </div>`;
    });
    launchHtml += `<div class="ofr-row ofr-total"><span class="ofr-lbl">총 문스톤 획득</span><span class="ofr-val" style="color:var(--amber)">+${totalEarned}개</span></div>`;
  }

  const assemblyHtml = report.assemblyCompleted > 0
    ? `<div class="ofr-section-hd">// 조립 완료</div><div class="ofr-row"><span class="ofr-lbl">조립 완료 슬롯</span><span class="ofr-val">${report.assemblyCompleted}개</span></div>`
    : '';

  const modalHtml = `
<div id="offline-report-modal" class="ofr-backdrop">
  <div class="ofr-box">
    <div class="ofr-hd">// 오프라인 복귀 보고서</div>
    <div class="ofr-time">경과 시간: ${timeStr}</div>
    <div class="ofr-section-hd">// 자원 수익</div>
    ${resHtml || '<div class="ofr-empty">// 자원 생산 없음</div>'}
    ${assemblyHtml}
    ${launchHtml}
    <button class="ofr-confirm-btn" onclick="document.getElementById('offline-report-modal').remove()">[ 확인 ]</button>
  </div>
</div>`;

  const div = document.createElement('div');
  div.innerHTML = modalHtml;
  document.body.appendChild(div.firstElementChild);
}


// ============================================================
//  RESEARCH PROGRESS — 점진적 RP 소모 시스템
// ============================================================
/** 연구 시작 — 비RP 자원 즉시 차감, RP는 tick마다 점진 소모 */
function startResearch(uid) {
  gs.selectedTech = uid;  // 마지막 선택 기술 기록
  const upg = UPGRADES.find(u => u.id === uid);
  if (!upg || gs.upgrades[uid]) return;
  if (gs.researchProgress && gs.researchProgress[uid]) return; // 이미 진행 중
  if (upg.req && !gs.upgrades[upg.req]) { notify('선행 연구 필요', 'red'); return; }
  // 비RP 자원 비용 확인 + 즉시 차감
  const nonRpCost = {};
  Object.entries(upg.cost).forEach(([r, v]) => { if (r !== 'research') nonRpCost[r] = v; });
  if (Object.keys(nonRpCost).length > 0 && !canAfford(nonRpCost)) { notify('자원 부족', 'red'); return; }
  if (Object.keys(nonRpCost).length > 0) spend(nonRpCost);
  if (!gs.researchProgress) gs.researchProgress = {};
  gs.researchProgress[uid] = { rpSpent: 0 };
  notify(`${upg.icon} ${upg.name} 연구 시작`);
  playSfx('sine', 520, 0.06, 0.02);
  renderAll();
}

/** 연구 완료 처리 (내부 호출) */
function _completeResearch(uid) {
  const upg = UPGRADES.find(u => u.id === uid);
  if (!upg) return;
  gs.upgrades[uid] = true;
  delete gs.researchProgress[uid];
  upg.effect();
  if (upg.unlocks) applyUnlocks(upg.unlocks);
  recentResearches.push({ name: upg.name, ts: Date.now() });
  notify(`✓ ${upg.icon} ${upg.name} 연구 완료!`, 'green');
  // 연구 완료 팡파레 (3화음 상승)
  playSfx('triangle', 440, 0.09, 0.025, 660);
  setTimeout(() => playSfx('triangle', 660, 0.08, 0.022, 880), 130);
  setTimeout(() => playSfx('triangle', 880, 0.07, 0.02, 1100), 260);
}

/** tick마다 호출 — 시간 기반 연구 진행 (dt: 경과 시간, 초 단위) */
function tickResearch(dt) {
  if (!gs.researchProgress) return;
  const activeIds = Object.keys(gs.researchProgress);
  if (activeIds.length === 0) return;

  const completedIds = [];
  activeIds.forEach(uid => {
    const upg = UPGRADES.find(u => u.id === uid);
    if (!upg) return;

    const techTime    = upg.time || 60;                      // 기술 고정 시간(초)
    const rpTotal     = upg.cost.research || 0;
    const rpPerSec    = techTime > 0 ? rpTotal / techTime : 0; // RP 소모 속도
    const prog        = gs.researchProgress[uid];
    if (!prog.timeSpent) prog.timeSpent = 0;

    // RP 소모 계산
    const rpNeeded = rpPerSec * dt;
    const rpAvail  = gs.res.research || 0;

    let advance = 0;
    if (rpPerSec <= 0) {
      // RP 비용 없는 기술 → 시간만으로 진행
      advance = dt;
    } else if (rpAvail >= rpNeeded) {
      // 충분한 RP → 정속 진행
      advance = dt;
      gs.res.research = Math.max(0, rpAvail - rpNeeded);
      prog.rpSpent = (prog.rpSpent || 0) + rpNeeded;
    } else if (rpAvail > 0) {
      // RP 부족 → 비율만큼 진행
      const ratio = rpAvail / rpNeeded;
      advance = dt * ratio;
      prog.rpSpent = (prog.rpSpent || 0) + rpAvail;
      gs.res.research = 0;
    }
    // else: RP 없음 → 정지

    prog.timeSpent += advance;
    if (prog.timeSpent >= techTime) completedIds.push(uid);
  });

  completedIds.forEach(uid => _completeResearch(uid));
}

/**
 * 연구 완료까지 남은 시간(초)을 반환한다.
 * RP 생산이 부족하면 실제 예상 시간(느린 속도 반영)을 반환.
 * @param {string} uid
 * @returns {number} 남은 초. RP 없음이면 Infinity.
 */
function getResearchETA(uid) {
  if (!gs.researchProgress || !gs.researchProgress[uid]) return 0;
  const upg = UPGRADES.find(u => u.id === uid);
  if (!upg) return 0;

  const techTime    = upg.time || 60;
  const rpTotal     = upg.cost.research || 0;
  const rpPerSec    = techTime > 0 ? rpTotal / techTime : 0;
  const prog        = gs.researchProgress[uid];
  const timeSpent   = prog.timeSpent || 0;
  const timeLeft    = Math.max(0, techTime - timeSpent);

  if (rpPerSec <= 0) return timeLeft;

  const rpRate      = getProduction().research || 0;
  const activeCount = Object.keys(gs.researchProgress).length;
  const myRpRate    = activeCount > 0 ? rpRate / activeCount : 0;

  if (myRpRate <= 0) return Infinity;

  const speedRatio  = Math.min(1, myRpRate / rpPerSec);
  if (speedRatio <= 0) return Infinity;
  return timeLeft / speedRatio;
}

// ─── 운영 센터 역할 배치 ──────────────────────────────────────
function assignOpsRole(roleId) {
  const roleDef = (typeof OPS_ROLES !== 'undefined') && OPS_ROLES.find(r => r.id === roleId);
  if (!roleDef) return;
  const cnt = gs.buildings.ops_center || 0;
  if (cnt === 0) { notify('운영 센터를 먼저 건설하세요', 'red'); return; }
  const maxSlots = cnt * roleDef.maxSlotsPerBld;
  const curRole = (gs.opsRoles && gs.opsRoles[roleId]) || 0;
  if (curRole >= maxSlots) { notify(`${roleDef.name} 슬롯 한도 (${maxSlots}명)`, 'amber'); return; }
  const avail = getAvailableWorkers();
  if (avail <= 0) { notify('여유 인원 없음 — 직원 고용 필요', 'red'); return; }
  if (!gs.opsRoles) gs.opsRoles = { sales: 0, accounting: 0, consulting: 0 };
  gs.opsRoles[roleId] = curRole + 1;
  if (!gs.assignments) gs.assignments = {};
  gs.assignments.ops_center = (gs.assignments.ops_center || 0) + 1;
  notify(`운영 센터 — ${roleDef.name} 배치 (${gs.opsRoles[roleId]}명)`);
  playSfx('triangle', 320, 0.06, 0.03, 480);
  renderAll();
}

function unassignOpsRole(roleId) {
  const roleDef = (typeof OPS_ROLES !== 'undefined') && OPS_ROLES.find(r => r.id === roleId);
  if (!roleDef) return;
  const curRole = (gs.opsRoles && gs.opsRoles[roleId]) || 0;
  if (curRole <= 0) { notify(`${roleDef.name} 배치 인원 없음`, 'amber'); return; }
  gs.opsRoles[roleId] = curRole - 1;
  if (!gs.assignments) gs.assignments = {};
  gs.assignments.ops_center = Math.max(0, (gs.assignments.ops_center || 0) - 1);
  if (gs.assignments.ops_center === 0) delete gs.assignments.ops_center;
  notify(`운영 센터 — ${roleDef.name} 철수 (${gs.opsRoles[roleId]}명)`);
  playSfx('triangle', 400, 0.04, 0.02, 280);
  renderAll();
}

// ============================================================
//  TICK / OFFLINE
// ============================================================
// 자원 한도 경고음 쿨다운 (연속 발생 방지)
let _resCap_lastSfx = 0;
const RES_CAP_COOLDOWN = 10000; // 10초 쿨다운

function tick() {
  const now = Date.now();
  const dt = Math.min((now - gs.lastTick) / 1000, 1);
  gs.lastTick = now;
  if (dt < 0.001) return;  // 너무 짧은 tick 방지 (calcOffline 직후)
  const prod = getProduction();
  const RES_MAX = { money:1e12, iron:5e7, copper:2e7, fuel:2e7, electronics:1e7, research:50000 };
  RESOURCES.forEach(r => { gs.res[r.id] = Math.max(0, (gs.res[r.id] || 0) + prod[r.id] * dt); });
  // 자원 한도 도달 경고음 (생산 중인 자원이 한도에 근접/도달 시)
  if (now - _resCap_lastSfx > RES_CAP_COOLDOWN) {
    const prod2 = getProduction();
    const atCap = RESOURCES.some(r => {
      const cap = RES_MAX[r.id];
      if (!cap || !prod2[r.id] || prod2[r.id] <= 0) return false;
      return (gs.res[r.id] || 0) >= cap * 0.99;
    });
    if (atCap) {
      playSfx('square', 160, 0.12, 0.06, 120);
      _resCap_lastSfx = now;
    }
  }
  tickResearch(dt);  // 시간 기반 연구 진행
  updateAssemblyJobs(now);
  if (typeof checkAutoUnlocks === 'function') checkAutoUnlocks();
  if (typeof runAutomation === 'function') runAutomation();
  if (typeof checkAchievements === 'function') checkAchievements(); // P4-2
}

