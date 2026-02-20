// ============================================================
//  GAME STATE
// ============================================================
let gs = {
  res: { money:1500, metal:0, fuel:0, electronics:0, research:0 },
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
  upgrades: {},
  msUpgrades: {},
  autoEnabled: {},
  milestones: {},
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
    bld_research_lab: true, // 연구소 구매 가능 (처음부터 표시)
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
    metal: Math.floor(80 * Math.pow(1.6, lv)),
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

function getMoonstoneMult() { return 1 + gs.moonstone * 0.05; }

function getSolarBonus() {
  let perPanel = 0.10;
  if (gs.bldUpgrades) {
    if (gs.bldUpgrades.sol_hieff)   perPanel += 0.05;
    if (gs.bldUpgrades.sol_tracker) perPanel += 0.05;
  }
  return 1 + gs.buildings.solar_array * perPanel;
}

// Returns multiplicative stack from all purchased per-building upgrades
function getBldUpgradeMult(bldId) {
  if (!gs.bldUpgrades) return 1;
  const upgrades = (typeof BUILDING_UPGRADES !== 'undefined' && BUILDING_UPGRADES[bldId]) || [];
  return upgrades.reduce((m, u) => (gs.bldUpgrades[u.id] && u.mult) ? m * u.mult : m, 1);
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
  return Object.entries(cost).every(([r, v]) => (gs.res[r] || 0) >= v);
}

function spend(cost) {
  Object.entries(cost).forEach(([r, v]) => {
    gs.res[r] = Math.max(0, (gs.res[r] || 0) - v);
  });
}

function getBuildingCost(bld) {
  const cost = {};
  Object.entries(bld.baseCost).forEach(([r, v]) => {
    cost[r] = Math.floor(v * Math.pow(1.15, gs.buildings[bld.id] || 0));
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

// 직원 고용 비용: 500 × 2.0^(workers-1)
function getWorkerHireCost() {
  return Math.floor(500 * Math.pow(2.0, (gs.workers || 1) - 1));
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
  const prod = { money:0, metal:0, fuel:0, electronics:0, research:0 };
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
  return prod;
}

// 여유 인원 수
function getAvailableWorkers() {
  const total = gs.workers || 1;
  const assigned = Object.values(gs.assignments || {}).reduce((a, b) => a + b, 0);
  return total - assigned;
}

function getTotalWorkers() {
  return gs.workers || 1;
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
    56 + gs.buildings.research_lab * 1.9 + gs.buildings.elec_lab * 0.8 + reliabilityBonus + q.relBonus + getAddonRelBonus(),
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
  return total;
}


// ============================================================
//  AUDIO
// ============================================================
function ensureAudio() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playSfx(type='sine', freq=440, dur=0.08, vol=0.03, targetFreq=null) {
  if (!gs.settings.sound) return;
  const ctx = ensureAudio();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (targetFreq) osc.frequency.exponentialRampToValueAtTime(targetFreq, now + dur);
  gain.gain.setValueAtTime(vol, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + dur);
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

    // Merge resources
    if (saved.res) Object.assign(gs.res, saved.res);

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
      bld_research_lab: true,
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
        if (!gs.bldUpgrades[uid]) return;
        for (const bldId in BUILDING_UPGRADES) {
          const upg = BUILDING_UPGRADES[bldId].find(u => u.id === uid);
          if (upg && upg.rel) reliabilityBonus += upg.rel;
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
  const h = Math.floor(report.elapsed / 3600);
  const m = Math.floor((report.elapsed % 3600) / 60);
  const s = Math.floor(report.elapsed % 60);
  const timeStr = h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`;

  // 자원 수익 HTML
  const RES_NAMES = { money:'₩ 자금', metal:'Fe 금속', fuel:'LOX 연료', electronics:'PCB 전자', research:'RP 연구' };
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
  const RES_MAX = { money:999999, metal:50000, fuel:20000, electronics:10000, research:5000 };
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
  updateAssemblyJobs(now);
  if (typeof checkAutoUnlocks === 'function') checkAutoUnlocks();
  if (typeof runAutomation === 'function') runAutomation();
}

