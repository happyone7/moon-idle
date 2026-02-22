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
  parts: { hull:0, engine:0, propellant:0, pump_chamber:0 }, // 각 부품의 완성된 공정 횟수
  mfgActive: {},         // { partId: {startAt, endAt} } — 진행 중인 제작 공정
  fuelInjection: 0,      // 연료 주입 % (0-100)
  fuelInjecting: false,  // 연료 주입 진행 중 여부
  assembly: { selectedQuality:'proto', selectedClass:'vega', jobs:[] },
  fuelLoaded: false,     // 연료 수동 주입 여부 (발사 전 주입 필요)
  upgrades: {},
  researchProgress: {},  // { upgradeId: { rpSpent: number, timeSpent: number } } — 진행 중인 연구
  researchPaused: {},    // { upgradeId: { rpSpent: number } } — 일시정지된 연구 (진행도 보존)
  researchQueue: [],     // 예약된 연구 목록 (최대 3개, FIFO)
  maxResearchSlots: 1,   // 활성 연구 슬롯 (항상 1)
  opsRoles: { sales: 0, accounting: 0, consulting: 0 },
  citizens: 1,         // 분양된 시민 수 (P8-4) — 게임 시작 시 주거시설 1동에 입주한 시민 1명
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
    addon_ops_center: false, // 운영 확장 프로그램 연구 후 해금
  },
};
let prodMult = {};
let globalMult = 1;
let partCostMult = 1;
let researchTimeMult = 1;   // 건물 업그레이드로 감소. 연구 소요 시간 배율.
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
  if (!gs.assembly) gs.assembly = { selectedQuality:'proto', selectedClass:'vega', jobs:[] };
  if (!Array.isArray(gs.assembly.jobs)) gs.assembly.jobs = [];
  if (!gs.assembly.selectedQuality) gs.assembly.selectedQuality = 'proto';
  if (!gs.assembly.selectedClass) gs.assembly.selectedClass = 'vega';
  const slots = getAssemblySlots();
  while (gs.assembly.jobs.length < slots) gs.assembly.jobs.push(null);
  if (gs.assembly.jobs.length > slots) gs.assembly.jobs = gs.assembly.jobs.slice(0, slots);
}

// ─── BUILDING LEVEL SYSTEM ─────────────────────────────────
function getBldLevel(bid) {
  return (gs.bldLevels && gs.bldLevels[bid]) || 0;
}

function getBldProdMult(bid) {
  return 1 + getBldLevel(bid) * BALANCE.BLD_PROD_UPG.multPerLevel;
}

function getBldUpgradeCost(bid) {
  const lv = getBldLevel(bid);
  const B = BALANCE.BLD_PROD_UPG;
  return {
    money: Math.floor(B.baseMoney * Math.pow(B.moneyExp, lv)),
    iron:  Math.floor(B.baseIron * Math.pow(B.ironExp, lv)),
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

function getMoonstoneMult() { return Math.pow(BALANCE.MOONSTONE.multPerStone, gs.moonstone || 0); }

function getSolarBonus() {
  let perPanel = BALANCE.SOLAR.baseBonusPerPanel;
  if (gs.bldUpgrades) {
    if (gs.bldUpgrades.sol_hieff)   perPanel += BALANCE.SOLAR.hieffExtra;
    if (gs.bldUpgrades.sol_tracker) perPanel += BALANCE.SOLAR.trackerExtra;
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

const BUILDING_EXPONENTS = BALANCE.BLD_EXPONENTS;

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

// 직원 고용 비용: base × exp^(workers-1) — 전체 인원 기반 (레거시)
function getWorkerHireCost() {
  return Math.floor(BALANCE.WORKER_HIRE.baseCost * Math.pow(BALANCE.WORKER_HIRE.exp, (gs.workers || 1) - 1));
}

// 건물별 직원 고용 비용: buildingBase × 3.0^(해당건물 배치 인원)
// 건물 단계별로 기본 비용이 달라짐 (후반 건물일수록 인력 비용 증가)
const BLD_WORKER_BASE = BALANCE.BLD_WORKER_BASE;
function getBldWorkerCost(bldId) {
  const assigned = (gs.assignments && gs.assignments[bldId]) || 0;
  const base = BLD_WORKER_BASE[bldId] || 150;
  return Math.floor(base * Math.pow(BALANCE.BLD_WORKER_EXP, assigned));
}

// 직원 전문화: 해당 건물 배치 인원 1명을 전문가로 전환 (P8-5)
// 전문가는 배치 직원에서 전환 → assignments 감소, citizens 변화 없음
function promoteToSpecialist(bldId, specId) {
  const assigned = (gs.assignments && gs.assignments[bldId]) || 0;
  if (assigned < 1) return false;
  gs.assignments[bldId] = assigned - 1;
  if (!gs.specialists) gs.specialists = {};
  if (!gs.specialists[bldId]) gs.specialists[bldId] = {};
  gs.specialists[bldId][specId] = (gs.specialists[bldId][specId] || 0) + 1;
  return true;
}

// 시민 분양 비용: threshold명까지 완만, 이후 기하급수
function getCitizenCost() {
  const C = BALANCE.CITIZEN;
  const n = gs.citizenRecruits || gs.citizens || 0;
  if (n < C.earlyThreshold) return Math.floor(C.baseCost * Math.pow(C.earlyExp, n));
  const pivot = Math.floor(C.baseCost * Math.pow(C.earlyExp, C.earlyThreshold));
  return Math.floor(pivot * Math.pow(C.lateExp, n - C.earlyThreshold));
}

// 운영센터 코인 클릭 — 클릭 1회당 현재 수입×N (최소 $M) 즉시 획득
function clickOpsCoin() {
  if ((gs.buildings.ops_center || 0) < 1) return;
  const prod = typeof getProduction === 'function' ? getProduction() : { money: 0 };
  const inc  = Math.max(BALANCE.OPS_CLICK.minReward, Math.floor((prod.money || 0) * BALANCE.OPS_CLICK.prodMult));
  gs.res.money = (gs.res.money || 0) + inc;
  notify(`◈ +$${fmt(inc)} 클릭 수익`, 'amber');
  if (typeof renderAll === 'function') renderAll();
}

// 시민 분양: 자금 차감 후 시민 수 증가 (P8-4)
function allocateCitizen() {
  const cost = getCitizenCost();
  if ((gs.res.money || 0) < cost) return false;
  gs.res.money = Math.max(0, (gs.res.money || 0) - cost);
  gs.citizens = (gs.citizens || 0) + 1;
  gs.citizenRecruits = (gs.citizenRecruits || 0) + 1;
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
  // 주거시설 상가 업그레이드 (P8-4)
  if (gs.bldUpgrades && gs.bldUpgrades.housing_market) {
    prod.money += BALANCE.HOUSING.marketIncomePerSec;
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

// 여유 인원 수 — gs.citizens은 유휴 시민만 나타냄
function getAvailableWorkers() {
  return gs.citizens || 0;
}

// 전체 인구 = 유휴 시민 + 배치 직원 + 전문가
function getTotalWorkers() {
  const idle = gs.citizens || 0;
  const assigned = Object.values(gs.assignments || {}).reduce((a, b) => a + b, 0);
  const specTotal = !gs.specialists ? 0
    : Object.values(gs.specialists).reduce((sum, bldSpecs) =>
        sum + Object.values(bldSpecs).reduce((a, b) => a + b, 0), 0);
  return idle + assigned + specTotal;
}

function getTotalAssigned() {
  return Object.values(gs.assignments || {}).reduce((a, b) => a + b, 0);
}

function getRocketScience(qualityId) {
  const q = getQuality(qualityId);
  const R = BALANCE.ROCKET;
  const isp = R.baseIsp + q.ispBonus + gs.buildings.elec_lab * R.elecLabIspPerBld + (gs.upgrades.fusion ? R.fusionIspBonus : 0);
  const dryMass = R.baseDryMass * q.dryMassMult * (gs.upgrades.lightweight ? R.lightweightMassMult : 1);
  const propMass = R.basePropMass + gs.buildings.refinery * R.refineryPropPerBld + gs.buildings.cryo_plant * R.cryoPropPerBld;
  const thrust = R.baseThrust + gs.buildings.mine * R.minePerBld + (gs.upgrades.fusion ? R.fusionThrustBonus : 0);
  const m0 = dryMass + propMass;
  const deltaV = isp * R.gravity * Math.log(m0 / dryMass) / 1000;
  const twr = thrust / (m0 * R.gravity);
  const reliability = clamp(
    R.baseReliability + gs.buildings.research_lab * R.researchLabRelPerBld + gs.buildings.elec_lab * R.elecLabRelPerBld + reliabilityBonus + q.relBonus + getAddonRelBonus(),
    0, R.maxReliability
  );
  const altitude = clamp(deltaV * R.altitudeMult, 0, 400);
  return { deltaV, twr, reliability, altitude };
}

function getMoonstoneReward(qualityId) {
  const sci = getRocketScience(qualityId);
  const q = getQuality(qualityId);
  const M = BALANCE.MOONSTONE;
  const base = Math.max(1, Math.floor((sci.altitude / M.rewardDivisor) * q.rewardMult) + fusionBonus + Math.floor(gs.launches / M.launchDivisor));
  const mult = typeof getMilestoneMsBonus === 'function' ? getMilestoneMsBonus() : 1;
  return Math.floor(base * mult);
}

function getCostStr(cost) {
  return Object.entries(cost).map(([r, v]) => {
    const res = RESOURCES.find(x => x.id === r);
    if (!res) return `${r}${fmt(v)}`;
    const ic = res.iconColor || res.color || 'var(--green)';
    return `<span style="color:${ic}">${res.icon}</span>${fmt(v)}`;
  }).join(' ');
}

function getAssemblyCost(qualityId) {
  const q = getQuality(qualityId);
  const total = {};
  PARTS.forEach(p => {
    const c = getPartCost(p);
    Object.entries(c).forEach(([r, v]) => {
      total[r] = (total[r] || 0) + Math.floor(v * q.costMult * BALANCE.ASSEMBLY.costFraction);
    });
  });
  // MK2+ 추가 구리 비용
  if (q.copperCost && q.copperCost > 0) {
    total.copper = (total.copper || 0) + q.copperCost;
  }
  return total;
}


// ============================================================
//  MANUFACTURING (공정 기반 부품 제작)
// ============================================================

/** 현재 품질에 필요한 부품만 반환 (minQuality 기반 필터링) */
function _getRequiredParts() {
  const selQ = (gs.assembly && gs.assembly.selectedQuality) || 'proto';
  const qOrder = QUALITIES.map(q => q.id);
  const curIdx = qOrder.indexOf(selQ);
  return PARTS.filter(pt => {
    if (!pt.minQuality) return true;
    const minIdx = qOrder.indexOf(pt.minQuality);
    return curIdx >= minIdx;
  });
}

/** 공정 완료도 기반 로켓 전체 완성도 (0-100) */
function getRocketCompletion() {
  const mk1Parts = PARTS.filter(p => !p.minQuality);
  if (mk1Parts.length === 0) return 0;
  let partScore = 0;
  mk1Parts.forEach(p => {
    partScore += Math.min(1, (gs.parts[p.id] || 0) / p.cycles);
  });
  // 부품 75% + 연료 25%
  const partsPct = (partScore / mk1Parts.length) * 75;
  const fuelPct  = ((gs.fuelInjection || 0) / 100) * 25;
  return Math.min(100, Math.floor(partsPct + fuelPct));
}

/** 공정 1회 시작. 자원 차감 → 타이머 설정 */
function craftPartCycle(partId) {
  const part = PARTS.find(p => p.id === partId);
  if (!part) return;
  if (!gs.mfgActive) gs.mfgActive = {};
  if (gs.mfgActive[partId]) { notify(`${part.name} 공정이 이미 진행 중입니다`, 'amber'); return; }
  const count = gs.parts[partId] || 0;
  if (count >= part.cycles) { notify(`${part.name} 제작 완료 — 더 이상 공정 불필요`, 'amber'); return; }
  if (!canAfford(part.cost)) { notify('자원 부족', 'red'); return; }
  spend(part.cost);
  const now = Date.now();
  gs.mfgActive[partId] = { startAt: now, endAt: now + part.cycleTime * 1000 };
  notify(`${part.icon} ${part.name} 공정 시작 (${count + 1}/${part.cycles})`);
  playSfx('square', 520, 0.08, 0.03, 660);
  renderAll();
}

/** tick에서 호출 — 완료된 공정 처리 + 자원 있으면 자동 연속 */
function updateMfgJobs(now) {
  if (!gs.mfgActive || Object.keys(gs.mfgActive).length === 0) return;
  let changed = false;
  Object.keys(gs.mfgActive).forEach(partId => {
    const job = gs.mfgActive[partId];
    if (!job || now < job.endAt) return;
    // 공정 완료
    const count = (gs.parts[partId] || 0) + 1;
    gs.parts[partId] = count;
    delete gs.mfgActive[partId];
    changed = true;
    const part = PARTS.find(p => p.id === partId);
    if (!part) return;
    if (count >= part.cycles) {
      notify(`✓ ${part.icon} ${part.name} 제작 완료!`, 'green');
      playSfx('triangle', 440, 0.09, 0.025, 660);
      setTimeout(() => playSfx('triangle', 660, 0.07, 0.02, 880), 120);
    } else {
      // 자원 있으면 자동 다음 공정 시작
      if (canAfford(part.cost)) {
        spend(part.cost);
        gs.mfgActive[partId] = { startAt: now, endAt: now + part.cycleTime * 1000 };
      }
    }
  });
  if (changed) renderAll();
}

/** 연료 주입 시작/중단 토글 */
function toggleFuelInjection() {
  const F = BALANCE.FUEL_INJECT;
  if ((gs.fuelInjection || 0) >= F.maxPct) { notify('연료 탱크가 이미 가득 찼습니다', 'amber'); return; }
  gs.fuelInjecting = !gs.fuelInjecting;
  if (gs.fuelInjecting) {
    // 시작 전 연료 최소 확인
    if ((gs.res.fuel || 0) < 1) {
      gs.fuelInjecting = false;
      notify('연료 부족 — LOX를 생산하세요', 'red');
      return;
    }
    notify('연료 주입 시작', 'cyan');
    playSfx('sine', 440, 0.06, 0.02, 550);
  } else {
    notify('연료 주입 중단', 'yellow');
    playSfx('sine', 330, 0.04, 0.02, 220);
  }
  renderAll();
}

/** tick에서 호출 — 연료 주입 진행 (dt: 경과 시간, 초 단위) */
function tickFuelInjection(dt) {
  if (!gs.fuelInjecting) return;
  const F = BALANCE.FUEL_INJECT;
  if ((gs.fuelInjection || 0) >= F.maxPct) {
    gs.fuelInjecting = false;
    return;
  }
  // 초당 연료 소모 계산
  const fuelNeeded = F.fuelPerSec * dt;
  const fuelAvail  = gs.res.fuel || 0;
  if (fuelAvail < 0.01) {
    // 연료 고갈 시 자동 중단
    gs.fuelInjecting = false;
    notify('연료 부족 — 주입 자동 중단', 'red');
    playSfx('square', 200, 0.08, 0.04, 140);
    return;
  }
  // 연료가 부족하면 비례 진행
  let advance;
  if (fuelAvail >= fuelNeeded) {
    advance = F.pctPerSec * dt;
    gs.res.fuel = Math.max(0, fuelAvail - fuelNeeded);
  } else {
    const ratio = fuelAvail / fuelNeeded;
    advance = F.pctPerSec * dt * ratio;
    gs.res.fuel = 0;
  }
  gs.fuelInjection = Math.min(F.maxPct, (gs.fuelInjection || 0) + advance);
  // 100% 도달 시 완료
  if (gs.fuelInjection >= F.maxPct) {
    gs.fuelInjection = F.maxPct;
    gs.fuelInjecting = false;
    gs.fuelLoaded = true;  // 연료 주입 100% → 자동으로 발사 준비 플래그 설정
    notify('✓ 연료 주입 완료 (100%)', 'green');
    playSfx('sine', 660, 0.09, 0.02, 880);
  }
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
const SFX_GLOBAL_VOL = BALANCE.SFX_GLOBAL_VOL;

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

    // Merge parts — 마이그레이션: 구 binary(0/1) → cycle count
    if (saved.parts) {
      // 구 부품 ID 제거, 신규 부품으로 변환
      const oldToNew = { fueltank:'propellant', control:null, payload:null };
      Object.entries(saved.parts).forEach(([id, val]) => {
        if (id in oldToNew) {
          if (oldToNew[id] && val > 0) gs.parts[oldToNew[id]] = gs.parts[oldToNew[id]] || 0; // ignore old binary
        } else if (id in gs.parts) {
          gs.parts[id] = val; // hull, engine: 구 binary 1 → 그대로 (완성된 것으로 간주하지 않음)
        }
      });
    }
    // mfgActive / fuelInjection / fuelInjecting 복원
    gs.mfgActive = (saved.mfgActive && typeof saved.mfgActive === 'object') ? saved.mfgActive : {};
    gs.fuelInjection = saved.fuelInjection || 0;
    gs.fuelInjecting = !!saved.fuelInjecting;

    // Worker system
    gs.workers = saved.workers || 1;
    gs.assignments = saved.assignments || {};

    // Scalars
    gs.launches = saved.launches || 0;
    gs.moonstone = saved.moonstone || 0;
    gs.history = saved.history || [];
    gs.upgrades = saved.upgrades || {};
    // drill(알루미늄 가공) 삭제 마이그레이션 — 기존 세이브 호환
    delete gs.upgrades['drill'];
    if (gs.researchProgress) delete gs.researchProgress['drill'];
    gs.researchProgress = saved.researchProgress || {};
    gs.researchPaused = saved.researchPaused || {};
    gs.researchQueue = Array.isArray(saved.researchQueue) ? saved.researchQueue : [];
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
    // 누적 분양 횟수 마이그레이션 — 없으면 현재 시민 수로 초기화
    gs.citizenRecruits = saved.citizenRecruits !== undefined ? saved.citizenRecruits : (gs.citizens || 0);
    // 전문가 마이그레이션 (P8-5)
    gs.specialists = saved.specialists || {};
    // 시민/직원 분리 마이그레이션 — 기존 세이브에서 citizens은 총 인원이었음
    // 새 모델: citizens = 유휴 시민만. 기존 세이브는 _citizenModelV2 플래그 없음
    if (!saved._citizenModelV2) {
      const assignedSum = Object.values(gs.assignments || {}).reduce((a, b) => a + b, 0);
      const specSum = !gs.specialists ? 0
        : Object.values(gs.specialists).reduce((sum, bldSpecs) =>
            sum + Object.values(bldSpecs).reduce((a, b) => a + b, 0), 0);
      gs.citizens = Math.max(0, (gs.citizens || 0) - assignedSum - specSum);
      gs._citizenModelV2 = true;
    }
    // 기존 ops_center 배치 인원을 역할로 분배 (마이그레이션)
    if (gs.assignments && gs.assignments.ops_center &&
        gs.opsRoles.sales === 0 && gs.opsRoles.accounting === 0 && gs.opsRoles.consulting === 0) {
      const total = gs.assignments.ops_center;
      gs.opsRoles.sales = total; // 기존 배치는 전부 영업팀으로 이관
    }

    gs.assembly = saved.assembly || { selectedQuality:'proto', selectedClass:'vega', jobs:[] };
    if (!gs.assembly.selectedClass) gs.assembly.selectedClass = 'vega';
    // 구 nano→vega 마이그레이션
    if (gs.assembly.selectedClass === 'nano') gs.assembly.selectedClass = 'vega';
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
    // 마일스톤 마이그레이션: 기존 true → 'claimed' (이미 보상 적용된 상태)
    Object.keys(gs.milestones).forEach(mid => {
      if (gs.milestones[mid] === true) gs.milestones[mid] = 'claimed';
    });
    gs.achievements = saved.achievements || {};         // P4-2
    // 업적 마이그레이션: claimed 필드 없는 기존 업적은 이미 보상 지급된 것으로 처리
    Object.keys(gs.achievements).forEach(aid => {
      if (gs.achievements[aid] && gs.achievements[aid].claimed === undefined) {
        gs.achievements[aid].claimed = true;
      }
    });
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
      addon_ops_center: false,
    };
    gs.unlocks = Object.assign({}, defaultUnlocks, saved.unlocks || {});

    // Re-apply upgrade effects to restore prodMult/globalMult etc.
    prodMult = {};
    globalMult = 1;
    partCostMult = 1;
    researchTimeMult = 1;
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
          if (!upg) continue;
          if (upg.rel)             reliabilityBonus += upg.rel * level;
          if (upg.moneyBonus)      { prodMult.money = (prodMult.money || 1) + upg.moneyBonus * level; }
          if (upg.prodBonus)       { globalMult += upg.prodBonus * level; }
          if (upg.ironBonus)       { prodMult.iron = (prodMult.iron || 1) + upg.ironBonus * level; }
          if (upg.researchTimeMult){ researchTimeMult = Math.max(0.2, researchTimeMult - upg.researchTimeMult * level); }
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
  const elapsed = Math.min(rawElapsed, BALANCE.OFFLINE.maxSeconds);
  if (elapsed < 5) { gs.lastTick = now; return; }

  const prod = getProduction();
  const report = {
    elapsed,
    resources: {},
  };

  // 자원 수집
  RESOURCES.forEach(r => {
    const gained = prod[r.id] * elapsed;
    if (gained > 0.01) report.resources[r.id] = gained;
    gs.res[r.id] = Math.max(0, (gs.res[r.id] || 0) + gained);
  });

  gs.lastTick = now;

  // 조립 프로세스 제거됨 — 오프라인 중 자동 발사 처리도 제거
  // (자동 발사는 runAutomation에서 canLaunch 기반으로 처리)

  // 오프라인 보고서 표시
  if (elapsed >= BALANCE.OFFLINE.reportThreshold) {
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
  const RES_NAMES = { money:'$ 자금', iron:'Fe 철', copper:'Cu 구리', fuel:'LOX 연료', electronics:'PCB 전자', research:'RP 연구' };
  let resHtml = '';
  Object.entries(report.resources).forEach(([rid, val]) => {
    if (val > 0.01) {
      resHtml += `<div class="ofr-row"><span class="ofr-lbl">${RES_NAMES[rid]||rid}</span><span class="ofr-val">+${fmt(val)}</span></div>`;
    }
  });

  const modalHtml = `
<div id="offline-report-modal" class="ofr-backdrop">
  <div class="ofr-box">
    <div class="ofr-hd">// 오프라인 복귀 보고서</div>
    <div class="ofr-time">경과 시간: ${timeStr}</div>
    <div class="ofr-section-hd">// 자원 수익</div>
    ${resHtml || '<div class="ofr-empty">// 자원 생산 없음</div>'}
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
/** 연구 시작 — 활성 슬롯 없으면 즉시 시작, 있으면 예약 큐(최대 3개)에 추가 */
function startResearch(uid) {
  gs.selectedTech = uid;
  const upg = UPGRADES.find(u => u.id === uid);
  if (!upg || gs.upgrades[uid]) return;
  if (gs.researchProgress && gs.researchProgress[uid]) return; // 이미 진행 중
  if (!gs.researchQueue) gs.researchQueue = [];
  if (gs.researchQueue.includes(uid)) return;                   // 이미 예약됨
  if (upg.req && !gs.upgrades[upg.req]) { notify('선행 연구 필요', 'red'); return; }

  const activeIds = Object.keys(gs.researchProgress || {});
  const hasPaused = gs.researchPaused && gs.researchPaused[uid];
  if (activeIds.length === 0) {
    // 즉시 시작 — 일시정지 재개 시 비RP 자원 재차감 없음
    if (!hasPaused) {
      const nonRpCost = {};
      Object.entries(upg.cost).forEach(([r, v]) => { if (r !== 'research') nonRpCost[r] = v; });
      if (Object.keys(nonRpCost).length > 0 && !canAfford(nonRpCost)) { notify('자원 부족', 'red'); return; }
      if (Object.keys(nonRpCost).length > 0) spend(nonRpCost);
    }
    if (!gs.researchProgress) gs.researchProgress = {};
    gs.researchProgress[uid] = hasPaused ? gs.researchPaused[uid] : { rpSpent: 0 };
    if (hasPaused) delete gs.researchPaused[uid];
    notify(`${upg.icon} ${upg.name} ${hasPaused ? '연구 재개' : '연구 시작'}`);
  } else {
    // 예약 큐에 추가 (최대 3개)
    if (gs.researchQueue.length >= 3) { notify('예약 슬롯이 가득 찼습니다 (최대 3개)', 'amber'); return; }
    gs.researchQueue.push(uid);
    notify(`${upg.icon} ${upg.name} 예약 등록 (${gs.researchQueue.length}/3)`, 'amber');
  }
  playSfx('sine', 520, 0.06, 0.02);
  renderAll();
}

/** 예약 큐에서 다음 연구 자동 시작 (취소/완료 시 공용) */
function _startNextQueued() {
  if (!gs.researchQueue) gs.researchQueue = [];
  while (gs.researchQueue.length > 0) {
    const nextUid = gs.researchQueue.shift();
    const nextUpg = UPGRADES.find(u => u.id === nextUid);
    if (!nextUpg || gs.upgrades[nextUid]) continue;
    if (nextUpg.req && !gs.upgrades[nextUpg.req]) {
      notify(`${nextUpg.icon} ${nextUpg.name} 선행 연구 미완료 — 예약 취소`, 'red');
      continue;
    }
    const hasPaused = gs.researchPaused && gs.researchPaused[nextUid];
    if (!hasPaused) {
      const nonRpCost = {};
      Object.entries(nextUpg.cost).forEach(([r, v]) => { if (r !== 'research') nonRpCost[r] = v; });
      if (Object.keys(nonRpCost).length > 0 && !canAfford(nonRpCost)) {
        notify(`${nextUpg.icon} ${nextUpg.name} 자원 부족 — 예약 취소`, 'red');
        continue;
      }
      if (Object.keys(nonRpCost).length > 0) spend(nonRpCost);
    }
    if (!gs.researchProgress) gs.researchProgress = {};
    gs.researchProgress[nextUid] = hasPaused ? gs.researchPaused[nextUid] : { rpSpent: 0 };
    if (hasPaused) delete gs.researchPaused[nextUid];
    notify(`${nextUpg.icon} ${nextUpg.name} ${hasPaused ? '예약 → 연구 재개' : '예약 → 연구 시작'}`, 'green');
    break;
  }
}

/** 연구 완료 처리 (내부 호출) — 완료 후 예약 큐에서 다음 연구 자동 시작 */
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
  _startNextQueued();
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

    const techTime    = (upg.time || 60) * researchTimeMult;  // 업그레이드로 감소 가능한 연구 시간
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
  const dt = Math.min((now - gs.lastTick) / 1000, BALANCE.TICK.maxDt);
  gs.lastTick = now;
  if (dt < BALANCE.TICK.minDt) return;
  const prod = getProduction();
  const RES_MAX = BALANCE.RES_MAX;
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
  tickFuelInjection(dt); // 연료 주입 진행
  updateMfgJobs(now); // 제작 공정 진행
  // updateAssemblyJobs 제거됨 — 조립 프로세스 없음
  if (typeof checkAutoUnlocks === 'function') checkAutoUnlocks();
  if (typeof runAutomation === 'function') runAutomation();
  if (typeof checkAchievements === 'function') checkAchievements(); // P4-2
}


// ============================================================
//  CJK 시각적 폭 헬퍼 (한글 등 전각 문자 2칸 처리)
// ============================================================
function _visualLen(str) {
  let len = 0;
  for (const ch of str) {
    const code = ch.codePointAt(0);
    // CJK: 한글(0xAC00-0xD7A3), 가나(0x3040-0x30FF), CJK통합(0x4E00-0x9FFF)
    len += (code >= 0xAC00 && code <= 0xD7A3) ||
           (code >= 0x4E00 && code <= 0x9FFF) ||
           (code >= 0x3040 && code <= 0x30FF) ? 2 : 1;
  }
  return len;
}

function _padEndVisual(str, width) {
  const vLen = _visualLen(str);
  return str + ' '.repeat(Math.max(0, width - vLen));
}

// ============================================================
//  공유 로켓 ASCII 아트 (조립동 + 발사통제 공용)
//  opts.allGreen — true이면 발사 준비 상태로 전체 밝은 녹색
//
//  너비 설계 (모든 줄 col 11 중심 정렬):
//    코 tip:       col 11         (inner 0)
//    코 taper:     col 10-12 ~ col 7-15 (inner 1→7, 단계 +2)
//    코 이름:      col 4-18       (inner 13, 점프)
//    코 바닥:      col 3-19       (inner 15)
//    몸체:         col 3-19       (inner 15) — 코 바닥과 일치
//    내부 박스:    col 6-16       (inner 9) — 통일
//    배기구:       col 2-20 → col 1-21 (inner 17→19)
// ============================================================
function getRocketArtHtml(opts) {
  opts = opts || {};
  const _partDone = id => {
    const p = (typeof PARTS !== 'undefined') ? PARTS.find(x => x.id === id) : null;
    return p && (gs.parts[id] || 0) >= p.cycles;
  };

  // CSS 클래스 결정: allGreen → 'go' / 완료 → 'done' / 미완 → (기본 dim)
  const cls = (base, doneCheck) => {
    if (opts.allGreen) return base + ' go';
    return base + (doneCheck ? ' done' : '');
  };

  const noseClass = cls('r-nose',     _partDone('hull'));
  const payClass  = cls('r-payload',  _partDone('propellant'));
  const aviClass  = cls('r-avionics', _partDone('propellant'));
  const engClass  = cls('r-engine',   _partDone('engine'));
  const exhClass  = cls('r-exhaust',  _partDone('engine') && (gs.fuelInjection || 0) >= 100);

  // 로켓 클래스 이름 (CJK 시각적 패딩 적용)
  const selClass = (gs.assembly && gs.assembly.selectedClass) || 'vega';
  const rc = (typeof ROCKET_CLASSES !== 'undefined')
    ? ROCKET_CLASSES.find(c => c.id === selClass) || ROCKET_CLASSES[0]
    : null;
  const className = rc ? rc.name : 'NANO';
  const thrustLabel = rc ? String(rc.thrustKN) + ' kN' : '18 kN';

  // 코 이름줄: inner 13 = " " + padVisual(11) + " "
  const namePadded = ' ' + _padEndVisual(className, 11) + ' ';
  // 추력줄: inner box 9 = " " + padEnd(7) + " "
  const thrustInner = ' ' + thrustLabel.padEnd(7) + ' ';

  return `<span class="${noseClass}">           *
          /|\\
         / | \\
        /  |  \\
       /   |   \\
    /${namePadded}\\
   /_______________\\</span>
<span class="${payClass}">   |  [PAYLOAD]    |
   |  ___________  |
   |  |  NAV    |  |
   |  |  SYS    |  |
   |  |_________|  |</span>
<span class="${aviClass}">   |               |
   |  [AVIONICS]   |
   |  ___________  |
   |  | O  O  O |  |
   |  |  GYRO   |  |
   |  |_________|  |</span>
<span class="${engClass}">   |               |
   | [PROPULSION]  |
   |  ___________  |
   |  |         |  |
   |  |${thrustInner}|  |
   |  |_________|  |
   |_______________|</span>
<span class="${exhClass}">  / [LOX]   [RP-1]  \\
 /___________________\\
       |   |   |
      /|   |   |\\
     /_|___|___|_\\</span>`;
}

