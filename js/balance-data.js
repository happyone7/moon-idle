// ============================================================
//  BALANCE DATA — 기획팀장 전용 수치 레이어
//  게임 밸런스에 영향을 주는 모든 하드코딩 수치를 한 곳에서 관리
//  이 파일을 수정해도 로직 코드(game-state.js)를 건드릴 필요 없음
// ============================================================
const BALANCE = {

  // ── 초기 자원 (새 게임 시작) ─────────────────────────────────
  START: {
    money: 2000,
    citizens: 1,
    workers: 1,
  },

  // ── 건물 생산량 업그레이드 (스탯 업그레이드) ──────────────────
  BLD_PROD_UPG: {
    multPerLevel: 0.5,          // Lv당 생산 배율 증가 (Lv0=1×, Lv1=1.5×, ...)
    baseMoney: 5000,            // 업그레이드 기본 비용 (money)
    moneyExp: 2.0,              // 비용 지수 (money)
    baseIron: 80,               // 업그레이드 기본 비용 (iron)
    ironExp: 1.6,               // 비용 지수 (iron)
  },

  // ── 건물 구매 지수 ────────────────────────────────────────────
  BLD_EXPONENTS: {
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
  },

  // ── 건물별 직원 고용 기본 비용 ────────────────────────────────
  BLD_WORKER_BASE: {
    ops_center:   150,
    research_lab: 300,
    supply_depot: 450,
    mine:         600,
    extractor:    900,
    refinery:     1200,
    cryo_plant:   1500,
    elec_lab:     1800,
    fab_plant:    2500,
    r_and_d:      4000,
  },
  BLD_WORKER_EXP: 3.0,         // 고용 비용 지수 (base × 3^assigned)

  // ── 시민 분양 ─────────────────────────────────────────────────
  CITIZEN: {
    baseCost: 300,              // 기본 분양 비용
    earlyExp: 1.3,              // 10명 이하 지수
    earlyThreshold: 10,         // 피벗 기준
    lateExp: 1.8,               // 10명 이상 지수
  },

  // ── 운영센터 코인 클릭 ────────────────────────────────────────
  OPS_CLICK: {
    minReward: 25,              // 최소 클릭 수익
    prodMult: 2,                // 현재 수입 × N
  },

  // ── 문스톤 ────────────────────────────────────────────────────
  MOONSTONE: {
    multPerStone: 1.07,         // 문스톤 1개당 생산 배율
    rewardDivisor: 20,          // altitude / N
    launchDivisor: 4,           // launches / N
  },

  // ── 태양광 ────────────────────────────────────────────────────
  SOLAR: {
    baseBonusPerPanel: 0.15,    // 패널당 생산 보너스
    hieffExtra: 0.05,           // 고효율 패널 업그레이드 추가 보너스
    trackerExtra: 0.05,         // 추적 시스템 업그레이드 추가 보너스
  },

  // ── 로켓 과학 기본값 ──────────────────────────────────────────
  ROCKET: {
    baseIsp: 315,
    baseDryMass: 28,
    basePropMass: 76,
    baseThrust: 1450,
    baseReliability: 70,
    maxReliability: 99.5,
    fusionIspBonus: 22,
    fusionThrustBonus: 120,
    lightweightMassMult: 0.9,
    elecLabIspPerBld: 1.2,
    refineryPropPerBld: 0.1,
    cryoPropPerBld: 0.2,
    minePerBld: 0.8,
    researchLabRelPerBld: 1.9,
    elecLabRelPerBld: 0.8,
    altitudeMult: 22,           // deltaV * N = altitude (km)
    gravity: 9.81,
  },

  // ── 조립 비용 ─────────────────────────────────────────────────
  ASSEMBLY: {
    costFraction: 0.32,         // 부품 합계 × quality.costMult × N
  },

  // ── 연료 주입 ─────────────────────────────────────────────────
  FUEL_INJECT: {
    maxPct: 100,                // 최대 %
    pctPerSec: 2,               // 초당 진행도 (50초에 100%)
    fuelPerSec: 40,             // 초당 연료 소모 (총 2000 fuel)
  },

  // ── 자원 한도 ─────────────────────────────────────────────────
  RES_MAX: {
    money: 1e12,
    iron: 5e7,
    copper: 2e7,
    fuel: 2e7,
    electronics: 1e7,
    research: 50000,
  },

  // ── 직원 고용 (레거시) ────────────────────────────────────────
  WORKER_HIRE: {
    baseCost: 500,
    exp: 2.0,
  },

  // ── 오프라인 ──────────────────────────────────────────────────
  OFFLINE: {
    maxSeconds: 8 * 3600,       // 최대 오프라인 보상 (8시간)
    reportThreshold: 60,        // 오프라인 보고서 표시 최소 초
  },

  // ── 틱 ────────────────────────────────────────────────────────
  TICK: {
    maxDt: 1,                   // 틱당 최대 경과 시간 (초)
    minDt: 0.001,               // 최소 경과 시간 (이하 무시)
  },

  // ── 주거 업그레이드 효과 ──────────────────────────────────────
  HOUSING: {
    marketIncomePerSec: 50,     // 상가 업그레이드 자금 보너스
  },

  // ── SFX ────────────────────────────────────────────────────────
  SFX_GLOBAL_VOL: 5.0,

  // ── 자원 부족 경고 ────────────────────────────────────────────
  RES_LOW_THRESH: {
    iron: 500,
    copper: 200,
    fuel: 200,
    electronics: 100,
  },
};

// 공정 기반 부품 제작 — cycles×cycleTime 동안 cycleCost 소모 반복
// cost 필드 = cycleCost (getPartCost 호환 유지)
const PARTS = [
  // ── MK1 (모든 품질 공통) ──────────────────────────────────
  { id:'hull',         name:'동체',        icon:'[HUL]', cycles:50, cycleTime:3,   cost:{iron:200}                                },
  { id:'engine',       name:'엔진',        icon:'[ENG]', cycles:5,  cycleTime:10,  cost:{iron:100, copper:250, electronics:30}   },
  { id:'propellant',   name:'탱크',        icon:'[TNK]', cycles:2,  cycleTime:60,  cost:{iron:200, copper:150}       },
  // ── MK2+ 전용 (standard 이상) ───────────────────────────
  { id:'pump_chamber', name:'펌프/연소실', icon:'[PMP]', cycles:8,  cycleTime:30,  cost:{iron:500, copper:300}, minQuality:'standard' },
];

const QUALITIES = [
  { id:'proto',    name:'PROTO-MK1', icon:'[P1]', costMult:1.0, timeSec:20,  ispBonus:0,  dryMassMult:1.0,  relBonus:5,  reuseBonus:0,  rewardMult:1.0, copperCost:0,    locked:false },
  { id:'standard', name:'STD-MK2',  icon:'[S2]', costMult:2.0, timeSec:40,  ispBonus:15, dryMassMult:0.95, relBonus:8,  reuseBonus:5,  rewardMult:2.0, copperCost:500,  locked:true  },
  { id:'advanced', name:'ADV-MK3',  icon:'[A3]', costMult:4.0, timeSec:80,  ispBonus:35, dryMassMult:0.88, relBonus:18, reuseBonus:12, rewardMult:3.5, copperCost:1500, locked:true  },
  { id:'elite',    name:'ELITE-MK4',icon:'[E4]', costMult:8.0, timeSec:160, ispBonus:65, dryMassMult:0.78, relBonus:32, reuseBonus:22, rewardMult:6.0, copperCost:4000, locked:true  },
];

// Each upgrade has optional 'unlocks' array: strings matching keys in gs.unlocks
// Organized by RESEARCH BRANCHES — S(구조), P(추진), A(항전), T(열보호), O(운영)
// Within each branch, req chains are sequential (top→bottom)
const UPGRADES = [
  // ── Branch S (구조 · STRUCTURE) ──────────────────────────────
  { id:'basic_prod',   name:'기초 용접술',     icon:'S01', cost:{research:10},                       req:'ops_addon_unlock', time:   8, desc:'광산·생산 시설 잠금 해제',       effect:()=>{},                                                      unlocks:['bld_mine'] },
  { id:'alloy',        name:'CFRP 적층',       icon:'M02', cost:{research:2500,iron:800},            req:'rocket_eng',  time: 720, desc:'부품 비용 -20%',                 effect:()=>{ partCostMult*=0.8; },                                  unlocks:['bld_r_and_d'] },
  { id:'precision_mfg',  name:'정밀 제조 공정',  icon:'M03', cost:{research:6000,electronics:1000}, req:'alloy',       time:1200, desc:'부품 비용 추가 -10%',   effect:()=>{ partCostMult*=0.9; },                                               unlocks:[] },
  { id:'rocket_eng',   name:'로켓 조립 공학', icon:'M01', cost:{research:150},                      req:'ops_addon_unlock', time:  45, desc:'조립동 해금 + 로켓 제조 시작',   effect:()=>{},                                                      unlocks:['tab_assembly'] },
  { id:'copper_mining',name:'구리 채굴 기술',  icon:'S05', cost:{research:200},                     req:'basic_prod',  time:  60, desc:'구리 채굴기 해금 — MK2+ 필수 원자재', effect:()=>{},                                                  unlocks:['bld_extractor'] },
  { id:'mine_expand',    name:'광맥 탐사 기술',  icon:'S06', cost:{research:500},              req:'basic_prod',  time: 360, desc:'철광석 생산 +15%',      effect:()=>{ prodMult.iron=(prodMult.iron||1)*1.15; },                           unlocks:[] },
  { id:'ore_processing', name:'광석 처리 공법',  icon:'S07', cost:{research:1500,iron:1000},   req:'mine_expand', time: 720, desc:'철광석·구리 생산 +20%', effect:()=>{ prodMult.iron=(prodMult.iron||1)*1.20; prodMult.copper=(prodMult.copper||1)*1.20; }, unlocks:[] },
  // ── Branch P (추진 · PROPULSION) ─────────────────────────────
  { id:'fuel_chem',    name:'고압 연소실 I',   icon:'P01', cost:{research:80},                       req:'rocket_eng',  time:  30, desc:'연료 정제 시설 해금',             effect:()=>{},                                                      unlocks:['bld_refinery'] },
  { id:'catalyst',     name:'터보펌프 기초',   icon:'P02', cost:{research:1500,fuel:500},            req:'fuel_chem',   time: 480, desc:'연료 생산 +30%',                 effect:()=>{ prodMult.fuel=(prodMult.fuel||1)*1.3; },               unlocks:['bld_cryo_plant'] },
  { id:'lightweight',  name:'재생 냉각 노즐',  icon:'P03', cost:{research:6000,iron:3000},           req:'catalyst',    time:1500, desc:'건조질량 -10%, 재활용 +8%',     effect:()=>{ /* handled in getRocketScience */ } },
  { id:'fusion',       name:'핀치 연소',       icon:'P04', cost:{research:15000,electronics:3000},  req:'lightweight', time:3600, desc:'Isp +22, 추력 +120kN, 문스톤 +1', effect:()=>{ fusionBonus++; } },
  { id:'cryo_storage',   name:'극저온 저장 기술', icon:'P05', cost:{research:3000,fuel:1000},        req:'catalyst',    time: 720, desc:'연료 생산 +20%',        effect:()=>{ prodMult.fuel=(prodMult.fuel||1)*1.20; },                           unlocks:[] },
  // ── Branch A (항전 · AVIONICS) ───────────────────────────────
  { id:'electronics_basics', name:'자이로 안정화',   icon:'A01', cost:{research:100},                    req:'fuel_chem',           time:  30, desc:'전자 시설 해금',       effect:()=>{},                                                                       unlocks:['bld_elec_lab','bld_supply_depot'] },
  { id:'microchip',          name:'관성 항법 (INS)', icon:'A02', cost:{research:2500,electronics:500},   req:'electronics_basics',  time: 600, desc:'전자부품 +35%',       effect:()=>{ prodMult.electronics=(prodMult.electronics||1)*1.35; },                 unlocks:['bld_fab_plant','bld_r_and_d'] },
  { id:'reliability',        name:'GPS 보정',        icon:'A03', cost:{research:5000},                   req:'microchip',           time:1200, desc:'발사 신뢰도 +15%',   effect:()=>{ reliabilityBonus+=15; } },
  { id:'automation',         name:'자율 비행',       icon:'A04', cost:{research:10000,electronics:2000}, req:'reliability',         time:1800, desc:'전체 생산 ×1.5',     effect:()=>{ globalMult*=1.5; },                                                     unlocks:['bld_solar_array'] },
  { id:'telemetry',       name:'원격 측정 시스템', icon:'A05', cost:{research:6000,electronics:1000}, req:'reliability', time:1200, desc:'신뢰도 +10%, 전자부품 +15%', effect:()=>{ reliabilityBonus+=10; prodMult.electronics=(prodMult.electronics||1)*1.15; }, unlocks:[] },
  // ── Branch T (열보호 · THERMAL) ──────────────────────────────
  { id:'hire_worker_1', name:'기초 절열재',       icon:'T01', cost:{research:200},                   req:'electronics_basics', time:  60, desc:'시민 +1명',            effect:()=>{ gs.citizens=(gs.citizens||0)+1; }, unlocks:[] },
  { id:'launch_ctrl',   name:'삭마 코팅',         icon:'T02', cost:{research:4000,electronics:1000}, req:'hire_worker_1', time:1500, desc:'발사대 + 발사 통제 탭 해금',   effect:()=>{},                                 unlocks:['tab_launch','bld_launch_pad'] },
  { id:'mission_sys',   name:'능동 냉각',         icon:'T03', cost:{research:10000},                 req:'launch_ctrl',   time:2400, desc:'미션 현황 탭 해금',   effect:()=>{},                                 unlocks:['tab_mission'] },
  { id:'multipad',      name:'열차폐 타일',       icon:'T04', cost:{research:20000,iron:5000},       req:'mission_sys',   time:3600, desc:'조립 슬롯 +1',       effect:()=>{ slotBonus++; } },
  { id:'heat_recov',     name:'열 재생 코팅',     icon:'T05', cost:{research:35000,electronics:5000},req:'multipad',    time:5400, desc:'전체 생산 +10%',        effect:()=>{ globalMult*=1.10; },                                                unlocks:[] },
  // ── Branch O (자동화 · AUTOMATION) ───────────────────────────
  { id:'auto_worker_assign',    name:'인원 자동 배치',   icon:'O01', cost:{research:2000,electronics:800,moonstone:2},    req:'hire_worker_1',        time:1800,  desc:'인원 자동 배치 해금',         effect:()=>{ if(!gs.autoEnabled) gs.autoEnabled={}; gs.autoEnabled['auto_worker']=true; if(!gs.msUpgrades) gs.msUpgrades={}; gs.msUpgrades['auto_worker']=true; }, unlocks:[] },
  { id:'auto_assemble_restart', name:'자동 조립 재시작', icon:'O02', cost:{research:5000,electronics:1500,moonstone:3},   req:'auto_worker_assign',   time:2400,  desc:'조립 자동 재시작 해금',       effect:()=>{ if(!gs.autoEnabled) gs.autoEnabled={}; gs.autoEnabled['auto_assemble']=true; if(!gs.msUpgrades) gs.msUpgrades={}; gs.msUpgrades['auto_assemble']=true; }, unlocks:[] },
  { id:'auto_parts_craft',      name:'자동 부품 제작',   icon:'O03', cost:{research:12000,electronics:2500,moonstone:6},  req:'auto_assemble_restart',time:4800,  desc:'자원 충족 시 5종 파트 전부 자동 제작', effect:()=>{ if(!gs.msUpgrades) gs.msUpgrades={}; ['auto_parts_engine','auto_parts_fueltank','auto_parts_control','auto_parts_hull','auto_parts_payload'].forEach(k => { gs.msUpgrades[k]=true; }); }, unlocks:[] },
  { id:'auto_build_manage',     name:'건설 자동 관리',   icon:'O04', cost:{research:30000,electronics:6000,moonstone:12}, req:'auto_parts_craft',     time:9600,  desc:'자금·자원 충족 시 건물 자동 건설 및 인원 자동 배치 패키지', effect:()=>{ if(!gs.msUpgrades) gs.msUpgrades={}; gs.msUpgrades['auto_build']=true; gs.msUpgrades['auto_worker']=true; gs.msUpgrades['auto_housing_upg']=true; }, unlocks:[] },
  { id:'auto_launch_seq',       name:'완전 자동 발사',   icon:'O05', cost:{research:80000,electronics:15000,moonstone:25},req:'auto_build_manage',    time:21600, desc:'조립 완료 즉시 발사 자동 실행 — 최고 단계 자동화', effect:()=>{ if(!gs.msUpgrades) gs.msUpgrades={}; gs.msUpgrades['auto_launch']=true; gs.msUpgrades['auto_assemble']=true; gs.msUpgrades['auto_addon']=true; }, unlocks:[] },
    // ── Branch E (경제 · ECONOMY) ──────────────────────────────────────
  { id:'ops_addon_unlock', name:'운영 확장 프로그램', icon:'E01', cost:{research:50},               req:null,               time:  30, desc:'운영센터 부속 건물 설치 해금',      effect:()=>{},                                                                  unlocks:['addon_ops_center'] },
  { id:'workforce_opt',    name:'인력 운용 최적화',   icon:'E02', cost:{research:400},              req:'ops_addon_unlock', time: 240, desc:'자금 생산 +15%',                   effect:()=>{ prodMult.money=(prodMult.money||1)*1.15; },                        unlocks:[] },
  { id:'market_analysis',  name:'시장 분석 시스템',   icon:'E03', cost:{research:1200,money:2000},  req:'workforce_opt',    time: 480, desc:'자금 생산 +25%',                   effect:()=>{ prodMult.money=(prodMult.money||1)*1.25; },                        unlocks:[] },
  { id:'corp_invest',      name:'기업 투자 전략',     icon:'E04', cost:{research:3000,money:5000},  req:'market_analysis',  time: 900, desc:'전체 생산 +10%',                   effect:()=>{ globalMult*=1.10; },                                               unlocks:[] },
  { id:'housing_welfare',  name:'복지 정책 확립',     icon:'E05', cost:{research:6000,money:15000}, req:'corp_invest',      time:1500, desc:'전체 생산 +10% + 시민 +2명',      effect:()=>{ globalMult*=1.10; gs.citizens=(gs.citizens||0)+2; },               unlocks:[] },
  // ── Branch X (전문화 · SPECIALIZATION) ───────────────────────
  { id:'spec_sales_pro',  name:'영업 전문화 교육',   icon:'X01', cost:{research:5000,money:50000},                              req:'auto_worker_assign', time: 300,  desc:'운영센터 영업 전문가 전직 해금',     effect:()=>{}, unlocks:[] },
  { id:'spec_sysadmin',   name:'시스템 관리 교육',   icon:'X02', cost:{research:8000,electronics:2000,money:80000},              req:'spec_sales_pro',   time: 450,  desc:'운영센터 시스템 관리자 전직 해금',   effect:()=>{}, unlocks:[] },
  { id:'spec_experiment', name:'실험 전문화 교육',   icon:'X03', cost:{research:12000,iron:5000,copper:3000,electronics:1000},    req:'microchip',        time: 600,  desc:'연구소 실험 전문가 전직 해금',       effect:()=>{}, unlocks:[] },
  { id:'spec_analyst',    name:'데이터 분석 교육',   icon:'X04', cost:{research:15000,electronics:5000,fuel:3000,money:100000},   req:'spec_experiment',  time: 600,  desc:'연구소 데이터 분석가 전직 해금',     effect:()=>{}, unlocks:[] },
];

// Research branch definitions for column layout
const RESEARCH_BRANCHES = [
  { id:'E', label:'경제',       nodes:['ops_addon_unlock','workforce_opt','market_analysis','corp_invest','housing_welfare'] },
  { id:'R', label:'채굴·생산', nodes:['basic_prod','copper_mining','mine_expand','ore_processing'] },
  { id:'M', label:'제조·조립', nodes:['rocket_eng','alloy','precision_mfg'] },
  { id:'P', label:'추진',      nodes:['fuel_chem','catalyst','cryo_storage','lightweight','fusion'] },
  { id:'A', label:'항전',      nodes:['electronics_basics','microchip','reliability','automation','telemetry'] },
  { id:'T', label:'열보호',    nodes:['hire_worker_1','launch_ctrl','mission_sys','multipad','heat_recov'] },
  { id:'O', label:'자동화',    nodes:['auto_worker_assign','auto_assemble_restart','auto_parts_craft','auto_build_manage','auto_launch_seq'] },
  { id:'X', label:'전문화',    nodes:['spec_sales_pro','spec_sysadmin','spec_experiment','spec_analyst'] },
  { id:'F', label:'미래 연구', nodes:[], locked:true, lockedItems:[
    { name:'???', desc:'생물학적 개선 — 달 탐사 인원의 생존력 강화' },
    { name:'???', desc:'화학 합성 — 달 현지 자원 활용 기술' },
    { name:'???', desc:'테라포밍 기초 — 달 환경 변화를 위한 초기 기술' },
  ]},
];

// ============================================================
//  BUILDING UPGRADES — per-building purchasable improvements
//  mult: production multiplier (stacks multiplicatively)
//  wkr:  adds to gs.workers when purchased
//  rel:  adds to reliabilityBonus when purchased
//  solarBonus: extra solar bonus per panel
// ============================================================
// ── BUILDING_UPGRADES ─────────────────────────────────────────────────────
// repeatable:true → 여러번 구매 가능. costScale → 단계별 비용 배율.
// premium:true    → 단 1회. 강력한 효과. 텍스트 앰버 강조.
const BUILDING_UPGRADES = {
  housing: [
    { id:'hsg_dorm',       name:'기숙사 증설',          cost:{money:500},                             desc:'직원 수익 +15%/레벨',             moneyBonus:0.15, repeatable:true, costScale:2.0 },
    { id:'hsg_welfare',    name:'복리 후생 강화',        cost:{money:2500},                            desc:'전체 생산량 +8%/레벨',             prodBonus:0.08,  repeatable:true, costScale:2.2, req:'hsg_dorm' },
    { id:'hsg_township',   name:'★ 타운십 조성',        cost:{money:30000},                           desc:'인원 +5명 — 대규모 주거 허브',    wkr:5, premium:true, req:'hsg_welfare' },
    { id:'housing_school', name:'★ 단지 내 학원',       cost:{money:200000},                          desc:'생산 전체 +10%',                  mult:1.10, effect:'specialist_rate', premium:true, req:'hsg_township' },
    { id:'housing_market', name:'★ 단지 내 상가',       cost:{money:1200000},                         desc:'자금 +50/s 수익',                 effect:'passive_income', premium:true, req:'hsg_township' },
  ],
  ops_center: [
    { id:'ops_sales',     name:'영업팀 강화',           cost:{money:400},                             desc:'이 건물 수익 +5%',                mult:1.05, repeatable:true, costScale:1.8 },
    { id:'ops_24h',       name:'★ 24시간 풀가동',      cost:{money:12000},                           desc:'이 건물 수익 ×2.0 — 프리미엄',    mult:2.00, premium:true, req:'ops_sales' },
  ],
  supply_depot: [
    { id:'dep_logistics', name:'물류 최적화',           cost:{money:500},                             desc:'이 건물 수익 +8%',                mult:1.08, repeatable:true, costScale:1.7 },
    { id:'dep_autoware',  name:'★ 자동화 창고',        cost:{money:8000},                            desc:'이 건물 수익 ×2.0 — 프리미엄',    mult:2.00, premium:true, req:'dep_logistics' },
  ],
  mine: [
    { id:'mine_bit',      name:'강화 드릴 비트',        cost:{money:300},                             desc:'이 건물 철광석 생산 +8%',         mult:1.08, repeatable:true, costScale:1.7 },
    { id:'mine_deep',     name:'심층 채굴 기술',        cost:{money:800},                             desc:'전체 철광석 생산 +5%/레벨',       ironBonus:0.05, repeatable:true, costScale:1.9, req:'mine_bit' },
    { id:'mine_robot',    name:'★ 로봇 채굴기',        cost:{money:9000},                            desc:'이 건물 철광석 생산 ×2.0 — 프리미엄', mult:2.00, premium:true, req:'mine_deep' },
  ],
  extractor: [
    { id:'ext_pump',      name:'고속 추출 펌프',        cost:{money:600},                             desc:'이 건물 구리 생산 +8%',           mult:1.08, repeatable:true, costScale:1.7 },
    { id:'ext_filter',    name:'★ 순도 향상 필터',     cost:{money:8000},                            desc:'이 건물 구리 생산 ×2.0 — 프리미엄', mult:2.00, premium:true, req:'ext_pump' },
  ],
  refinery: [
    { id:'ref_catalyst',  name:'촉매 반응로',           cost:{money:500},                             desc:'이 건물 연료 생산 +8%',           mult:1.08, repeatable:true, costScale:1.7 },
    { id:'ref_highpress', name:'★ 고압 정제 시스템',   cost:{money:9000},                            desc:'이 건물 연료 생산 ×2.0 — 프리미엄', mult:2.00, premium:true, req:'ref_catalyst' },
  ],
  cryo_plant: [
    { id:'cry_heatex',    name:'열교환 최적화',         cost:{money:900},                             desc:'이 건물 연료 생산 +8%',           mult:1.08, repeatable:true, costScale:1.7 },
    { id:'cry_supercon',  name:'★ 초전도 냉각 코일',   cost:{money:10000},                           desc:'이 건물 연료 생산 ×2.0 — 프리미엄', mult:2.00, premium:true, req:'cry_heatex' },
  ],
  elec_lab: [
    { id:'elb_smd',       name:'SMD 자동 납땜',         cost:{money:600},                             desc:'이 건물 전자부품 생산 +8%',       mult:1.08, repeatable:true, costScale:1.7 },
    { id:'elb_nano',      name:'★ 나노 패터닝',        cost:{money:8000},                            desc:'이 건물 전자부품 생산 ×2.0 — 프리미엄', mult:2.00, premium:true, req:'elb_smd' },
  ],
  fab_plant: [
    { id:'fab_euv',       name:'EUV 리소그래피',        cost:{money:2500},                            desc:'이 건물 전자부품 생산 +8%',       mult:1.08, repeatable:true, costScale:1.8 },
    { id:'fab_3d',        name:'★ 3D 적층 기술',       cost:{money:20000},                           desc:'이 건물 전자부품 생산 ×2.5 — 프리미엄', mult:2.50, premium:true, req:'fab_euv' },
  ],
  research_lab: [
    { id:'rsh_equip',     name:'최신 장비 도입',        cost:{money:400},                             desc:'이 건물 RP 생산 +10%',            mult:1.10, repeatable:true, costScale:1.8 },
    { id:'rsh_cross',     name:'융합 연구 프로그램',    cost:{money:1500},                            desc:'연구 시간 -10%/레벨',             researchTimeMult:0.10, repeatable:true, costScale:2.0, req:'rsh_equip' },
    { id:'rsh_super',     name:'★ 슈퍼컴퓨터 연결',   cost:{money:20000},                           desc:'이 건물 RP 생산 ×3.0 — 프리미엄', mult:3.00, premium:true, req:'rsh_cross' },
  ],
  r_and_d: [
    { id:'rnd_collab',    name:'외부 연구 협력',        cost:{money:2500},                            desc:'이 건물 RP 생산 +10%',            mult:1.10, repeatable:true, costScale:1.8 },
    { id:'rnd_patent',    name:'★ 특허 풀 구축',       cost:{money:30000},                           desc:'이 건물 RP 생산 ×3.0 — 프리미엄', mult:3.00, premium:true, req:'rnd_collab' },
  ],
  solar_array: [
    { id:'sol_hieff',     name:'고효율 패널',           cost:{money:800},                             desc:'태양광 보너스 +5%/개 추가\n→ +15%/개로 증가', solarBonus:0.05 },
    { id:'sol_tracker',   name:'★ 추적 시스템',        cost:{money:5000},                            desc:'태양광 보너스 추가 +5%/개\n→ +20%/개로 증가 (프리미엄)', solarBonus:0.05, premium:true, req:'sol_hieff' },
  ],
  launch_pad: [
    { id:'pad_reinforce', name:'발사대 보강',           cost:{money:1500},                            desc:'발사 신뢰도 +5%',                 rel:5, repeatable:true, costScale:2.0 },
    { id:'pad_fuelfeed',  name:'★ 연료 공급 가속',     cost:{money:25000},                           desc:'조립 시간 -20% — 프리미엄',       timeMult:0.8, premium:true, req:'pad_reinforce' },
  ],
};

// ============================================================
//  BUILDING ADD-ONS — A/B 선택 가능한 부속 건물
//  각 건물에 1개만 설치 가능. 설치 후 변경 불가.
//  effect: { moneyMult, rpBonus, rel, timeMult, slotBonus, partCostReduct }
// ============================================================
const BUILDING_ADDONS = {
  ops_center: {
    unlockKey: 'addon_ops_center',
    unlockMin: 1,
    options: [
      {
        id: 'addon_inv_bank',
        name: '투자 은행',
        icon: '[INV]',
        cost: { money: 5000 },
        desc: '운영센터 자금 생산 ×2.0\n부속 업그레이드로 추가 수익 배율',
        effect: { moneyMult: 2.0 },
        upgrades: [
          { id:'inv_derivatives', name:'파생상품 운용',  cost:{money:50000},                    desc:'자금 생산 추가 +40%', mult:1.4 },
          { id:'inv_hedge',       name:'헤지펀드 설립',  cost:{money:150000,electronics:2000},  desc:'자금 생산 추가 ×1.8', mult:1.8, req:'inv_derivatives' },
        ],
      },
      {
        id: 'addon_tech_hub',
        name: '기술 스타트업 허브',
        icon: '[HUB]',
        cost: { money: 8000 },
        desc: '운영센터 자금 생산 ×1.5\n연구 포인트 자동 발생 +0.5/s',
        effect: { moneyMult: 1.5, rpBonus: 0.5 },
        upgrades: [
          { id:'hub_incubate', name:'인큐베이팅 프로그램', cost:{money:40000,research:600},   desc:'연구 포인트 +0.3/s 추가', rpBonus:0.3 },
          { id:'hub_unicorn',  name:'유니콘 상장',         cost:{money:120000,research:3000}, desc:'자금 생산 추가 +30%',     mult:1.3, req:'hub_incubate' },
        ],
      },
    ],
  },
  launch_pad: {
    unlockMin: 1,
    options: [
      {
        id: 'addon_launch_ctrl',
        name: '발사 제어 타워',
        icon: '[CTL]',
        cost: { money: 15000, electronics: 1500 },
        desc: '발사 신뢰도 +20%\n조립 시간 -15%',
        effect: { rel: 20, timeMult: 0.85 },
        upgrades: [
          { id:'ctrl_ai',         name:'AI 비행 제어',   cost:{electronics:3000,research:1200},  desc:'신뢰도 +10% 추가', rel:10 },
          { id:'ctrl_autonomous', name:'완전 자율 발사', cost:{electronics:10000,research:5000}, desc:'조립 시간 추가 -20%', timeMult:0.8, req:'ctrl_ai' },
        ],
      },
      {
        id: 'addon_vif',
        name: '수직 통합 시설',
        icon: '[VIF]',
        cost: { money: 15000, iron: 2000 },
        desc: '조립 슬롯 +1\n부품 비용 -15%',
        effect: { slotBonus: 1, partCostReduct: 0.15 },
        upgrades: [
          { id:'vif_print', name:'3D 프린팅 허브', cost:{iron:5000,electronics:2500},   desc:'부품 비용 추가 -10%', partCostReduct:0.10 },
          { id:'vif_auto',  name:'조립 자동화',    cost:{iron:12000,electronics:6000},  desc:'조립 슬롯 추가 +1', slotBonus:1, req:'vif_print' },
        ],
      },
    ],
  },
};

// ============================================================
//  AUTOMATION UPGRADES — 프레스티지(moonstone)로 구매하는 자동화 연구
//  별도 자동화 탭에서 관리. gs.msUpgrades에 저장.
// ============================================================
const AUTOMATION_UPGRADES = [
  // ── 문스톤 초기 업그레이드 (TIER 0) ──────────────────────
  { id:'ms_quick_workers', name:'긴급 인력 지원',   icon:'[HRE]', cost:{moonstone:1}, req:null, tier:0, desc:'인원 상한 +1 영구 추가. 프레스티지 후에도 유지.' },
  { id:'ms_early_boost',   name:'초기 생산 자금',   icon:'[EFD]', cost:{moonstone:2}, req:null, tier:0, desc:'전체 생산 속도 +8% 영구 적용. 프레스티지 후에도 유지.' },
  // ── 건물/생산 자동화 (TIER 0) ─────────────────────────────
  { id:'auto_build',          name:'건물 자동 건설',             icon:'[AB1]', cost:{moonstone:5},  req:null,               tier:0, desc:'자금/자원 조건이 충족되면 잠금 해제된 건물을 자동으로 1개씩 건설. 가장 저렴한 건물부터 우선 건설.' },
  { id:'auto_housing_upg',    name:'주거 시설 자동 업그레이드',   icon:'[AB2]', cost:{moonstone:5},  req:null,               tier:0, desc:'여유 인원이 0명일 때 자동으로 주거 시설 업그레이드를 구매.' },
  { id:'auto_worker',         name:'인원 자동 배치',              icon:'[AB3]', cost:{moonstone:8},  req:'auto_build',       tier:0, desc:'새 건물 건설 또는 인원 증가 시 여유 인원을 현재 배치 비율에 맞춰 자동으로 배치.' },
  { id:'auto_addon',          name:'애드온 자동 설치',            icon:'[AB4]', cost:{moonstone:10}, req:'auto_worker',      tier:1, desc:'건물 건설 후 첫 번째 애드온 옵션을 자동으로 설치.' },
  { id:'auto_addon_upg',      name:'애드온 업그레이드 자동화',    icon:'[AB5]', cost:{moonstone:12}, req:'auto_addon',       tier:1, desc:'자원 충족 시 설치된 애드온의 업그레이드를 자동으로 구매.' },
  // ── 조립재료 자동화 (TIER 0-1) ───────────────────────────
  { id:'auto_parts_engine',   name:'엔진 파트 자동 제작',         icon:'[PA1]', cost:{moonstone:6},  req:null,               tier:0, desc:'자원 충족 시 엔진 파트를 자동으로 제작. 파트가 이미 있으면 건너뜀.' },
  { id:'auto_parts_fueltank', name:'연료탱크 자동 제작',          icon:'[PA2]', cost:{moonstone:6},  req:null,               tier:0, desc:'자원 충족 시 연료탱크를 자동으로 제작.' },
  { id:'auto_parts_control',  name:'제어시스템 자동 제작',        icon:'[PA3]', cost:{moonstone:6},  req:null,               tier:0, desc:'자원 충족 시 제어시스템을 자동으로 제작.' },
  { id:'auto_parts_hull',     name:'선체 자동 제작',              icon:'[PA4]', cost:{moonstone:6},  req:null,               tier:0, desc:'자원 충족 시 선체를 자동으로 제작.' },
  { id:'auto_parts_payload',  name:'탑재체 자동 제작',            icon:'[PA5]', cost:{moonstone:6},  req:null,               tier:0, desc:'자원 충족 시 탑재체를 자동으로 제작.' },
  // ── 조립/발사 자동화 (TIER 1-2) ──────────────────────────
  { id:'auto_assemble',       name:'조립 자동 재시작',            icon:'[AS1]', cost:{moonstone:15}, req:'auto_parts_hull',  tier:1, desc:'빈 슬롯이 있고 모든 파트가 준비된 경우 즉시 조립을 자동으로 시작.' },
  { id:'auto_launch',         name:'발사 자동 실행',              icon:'[AS2]', cost:{moonstone:20}, req:'auto_assemble',    tier:2, desc:'조립 완료 즉시 자동으로 발사를 실행. 발사 오버레이 없이 바로 처리.' },
];

// ============================================================
//  MILESTONES — 달성 조건 + 영구 보상
// ============================================================
const MILESTONES = [
  {
    id:   'first_mine',
    name: '첫 금속 생산',
    icon: '[MIN]',
    desc: '철광석 채굴기 1개 건설',
    reward: 'RP +5 즉시 지급',
    check: gs => (gs.buildings && gs.buildings.mine || 0) >= 1,
  },
  {
    id:   'all_parts',
    name: '로켓 설계도 완성',
    icon: '[◆5]',
    desc: '5종 로켓 부품 전부 제작',
    reward: '조립 시간 -10% 영구',
    check: gs => typeof PARTS !== 'undefined' && PARTS.every(p => gs.parts && gs.parts[p.id]),
  },
  {
    id:   'orbit_200',
    name: '궤도 돌입 (고도 120km)',
    icon: '[ORB]',
    desc: '발사 고도 120km 이상 달성',
    reward: '문스톤 +5 즉시 지급',
    check: gs => Array.isArray(gs.history) && gs.history.some(h => (h.altitude || 0) >= 120),
  },
  {
    id:   'ten_launches',
    name: '달 탐사 시작',
    icon: '[10x]',
    desc: '누적 발사 10회',
    reward: '전체 생산 +10% 영구',
    check: gs => (gs.launches || 0) >= 10,
  },
  {
    id:   'all_buildings',
    name: '산업 단지 완성',
    icon: '[IND]',
    desc: '모든 건물 종류 1개씩 보유',
    reward: '인원 상한 +2 영구',
    check: gs => typeof BUILDINGS !== 'undefined' && BUILDINGS.every(b => (gs.buildings && gs.buildings[b.id] || 0) >= 1),
  },
  {
    id:   'elite_launch',
    name: 'ELITE 클래스 발사',
    icon: '[★]',
    desc: 'ELITE-MK4 품질로 첫 발사',
    reward: '문스톤 획득량 +20% 영구',
    check: gs => Array.isArray(gs.history) && gs.history.some(h => h.qualityId === 'elite'),
  },
];

// ============================================================
//  ROCKET CLASSES — 로켓 클래스별 스펙 (D3-1)
//  totalMassKg: 총중량(kg), thrustKN: 추력(kN),
//  ispSec: 비추력(s), deltaVMs: 델타V(m/s)
//  unlock: 해금 조건 (null = 즉시 해금)
// ============================================================
const ROCKET_CLASSES = [
  { id:'vega',    name:'베가',       nameEn:'VEGA',     icon:'[V1]', totalMassKg:850,    thrustKN:18,    ispSec:285, deltaVMs:2840,  unlock:null,      modelNum:1, desc:'고도 10km 도달. 동체+탱크+엔진 3부품 구성.' },
  { id:'argo',    name:'아르고',     nameEn:'ARGO',     icon:'[V2]', totalMassKg:3200,   thrustKN:78,    ispSec:305, deltaVMs:4200,  unlock:'phase_1', modelNum:2, desc:'카르만 선(100km) 도달. 스러스터 추가 구성.' },
  { id:'hermes',  name:'헤르메스',   nameEn:'HERMES',   icon:'[V3]', totalMassKg:12000,  thrustKN:310,   ispSec:320, deltaVMs:5800,  unlock:'phase_2', modelNum:3, desc:'저궤도(LEO) 진입. 2단 + 페이로드.' },
  { id:'atlas',   name:'아틀라스',   nameEn:'ATLAS',    icon:'[V4]', totalMassKg:45000,  thrustKN:1200,  ispSec:335, deltaVMs:7200,  unlock:'phase_3', modelNum:4, desc:'중궤도(MEO) 진입. 1단 재사용 구조.' },
  { id:'selene',  name:'셀레네',     nameEn:'SELENE',   icon:'[V5]', totalMassKg:120000, thrustKN:3500,  ispSec:350, deltaVMs:9800,  unlock:'phase_4', modelNum:5, desc:'달 궤도 진입(TLI). 3단 + 달 궤도선.' },
  { id:'artemis', name:'아르테미스', nameEn:'ARTEMIS',  icon:'[V6]', totalMassKg:350000, thrustKN:7500,  ispSec:365, deltaVMs:12500, unlock:'phase_5', modelNum:6, desc:'달 착륙. 2단 초대형 완전 재사용.' },
];

// ============================================================
//  ROCKET BOM (Bill of Materials) — 로켓 클래스별 부품 목록 (D3-2)
//  baseBom: NANO 클래스 기준 부품 명세
//  scaleFactor: 다른 클래스는 NANO 기준 중량 비례 스케일링
// ============================================================
const ROCKET_BOM = {
  // NANO 클래스 기준 BOM (기본 부품 목록)
  baseBom: [
    {
      id: 'fuselage_ring',
      name: '기체 구조 링',
      icon: '[RNG]',
      material: 'Al-7075',
      qty: 8,
      unitMassKg: 30,
      totalMassKg: 240,
      category: 'structure',
      desc: '로켓 동체를 구성하는 구조 링. 8개를 적층하여 기체 외벽 형성.',
    },
    {
      id: 'lox_tank_shell',
      name: 'LOX 탱크 쉘',
      icon: '[LOX]',
      material: 'Al-2219',
      qty: 1,
      unitMassKg: 80,
      totalMassKg: 80,
      category: 'propellant',
      desc: '액체 산소 저장 탱크. 극저온 내성 알루미늄 합금 사용.',
    },
    {
      id: 'rp1_tank_shell',
      name: 'RP-1 탱크 쉘',
      icon: '[RP1]',
      material: 'Al-2219',
      qty: 1,
      unitMassKg: 60,
      totalMassKg: 60,
      category: 'propellant',
      desc: '등유(RP-1) 연료 저장 탱크.',
    },
    {
      id: 'propulsion_assembly',
      name: '추진 어셈블리',
      icon: '[PRP]',
      material: 'Inconel-718',
      qty: 1,
      unitMassKg: 34,
      totalMassKg: 34,
      category: 'propulsion',
      desc: '연소실 + 터보펌프 통합 어셈블리. 고온·고압 환경용 초합금.',
      subParts: [
        { id:'combustion_chamber', name:'연소실',          massKg:18, desc:'추진제 연소가 이루어지는 핵심 구성품.' },
        { id:'turbopump_lox',      name:'터보펌프(LOX)',    massKg:8,  desc:'액체 산소를 연소실로 고압 공급.' },
        { id:'turbopump_rp1',      name:'터보펌프(RP-1)',   massKg:8,  desc:'RP-1 연료를 연소실로 고압 공급.' },
      ],
    },
    {
      id: 'avionics',
      name: '항전 장비',
      icon: '[AVI]',
      material: '회로기판',
      qty: 5,
      unitMassKg: 1,
      totalMassKg: 5,
      category: 'electronics',
      desc: '비행 제어 컴퓨터, 관성 항법, 텔레메트리 등 전자 장비.',
    },
    {
      id: 'interstage',
      name: '인터스테이지',
      icon: '[IST]',
      material: 'CFRP',
      qty: 1,
      unitMassKg: 45,
      totalMassKg: 45,
      category: 'structure',
      desc: '단 간 연결 어댑터. 탄소섬유 강화 플라스틱으로 경량화.',
    },
    {
      id: 'payload_fairing',
      name: '페이로드 페어링',
      icon: '[FRG]',
      material: 'Al-7075',
      qty: 1,
      unitMassKg: 28,
      totalMassKg: 28,
      category: 'payload',
      desc: '탑재체 보호용 외피. 발사 후 분리.',
    },
  ],

  // 모델별 스케일 팩터 (Vega 기준 중량 비례)
  scaleFactor: {
    vega:    1,
    argo:    3.5,
    hermes:  12,
    atlas:   45,
    selene:  120,
    artemis: 350,
  },
};

// ============================================================
//  CRAFT MATERIALS — 중간 가공 원자재 (RocketModels_Materials.md 기준)
//  baseRes: 생산에 필요한 기본 자원 종류
//  unlockModel: 이 소재가 처음 필요해지는 로켓 모델 번호
// ============================================================
const CRAFT_MATERIALS = [
  { id:'iron_plate',      name:'철판',         icon:'▤',  unlockModel:1, baseRes:'iron',   desc:'가장 기본적인 구조재. 철을 가공하여 생산.' },
  { id:'copper_block',    name:'구리블록',     icon:'▩',  unlockModel:1, baseRes:'copper',  desc:'엔진 연소실·스러스터 핵심 소재.' },
  { id:'copper_pipe',     name:'구리관',       icon:'◎',  unlockModel:1, baseRes:'copper',  desc:'탱크 배관, 냉각 라인용 구리 파이프.' },
  { id:'aluminum_plate',  name:'알루미늄판',   icon:'▧',  unlockModel:2, baseRes:null,      desc:'경량 구조재. Model 1 철판을 대체.' },
  { id:'cfrp_panel',      name:'CFRP 패널',    icon:'▦',  unlockModel:3, baseRes:null,      desc:'극경량 탄소섬유 복합재. 상단부·페이로드용.' },
  { id:'inconel',         name:'인코넬',       icon:'◈',  unlockModel:3, baseRes:null,      desc:'엔진 고온부(연소실 재킷) 초합금.' },
  { id:'stainless_plate', name:'스테인리스판', icon:'▨',  unlockModel:4, baseRes:null,      desc:'재사용 구조재. 고온·극저온 겸용.' },
  { id:'titanium_rod',    name:'티타늄 봉',    icon:'┃',  unlockModel:4, baseRes:null,      desc:'착륙 다리, 고하중 체결부용.' },
  { id:'niobium_alloy',   name:'니오브 합금',  icon:'⬡',  unlockModel:5, baseRes:null,      desc:'진공 노즐, 극고온 내구 소재.' },
  { id:'insulation',      name:'단열재',       icon:'░',  unlockModel:5, baseRes:null,      desc:'LH2 탱크 극저온 단열용.' },
  { id:'heat_coating',    name:'내열 코팅재',  icon:'▓',  unlockModel:6, baseRes:null,      desc:'대기권 재진입 열차폐.' },
];

// ============================================================
//  ROCKET MODELS — 로켓 모델별 부품·재료 명세 (RocketModels_Materials.md)
//  6개 모델: Vega → Argo → Hermes → Atlas → Selene → Artemis
//  각 모델의 parts 배열: { id, name, qty, materials:{matId:count}, craftTimeSec }
//  materials의 key = CRAFT_MATERIALS.id
// ============================================================
const ROCKET_MODELS = [
  // ── Model 1: 베가 (Vega) ─────────────────────────────
  {
    id:'vega', modelNum:1, name:'베가', nameEn:'Vega',
    goal:'고도 10km 도달',
    composition:'동체 + 탱크 + 엔진',
    totalCraftTime:'~3분 15초',
    totalMaterials:{ iron_plate:30, copper_block:8, copper_pipe:5 },
    parts:[
      { id:'body',   name:'동체', qty:1, materials:{ iron_plate:15 },                   craftTimeSec:60 },
      { id:'tank',   name:'탱크', qty:1, materials:{ iron_plate:10, copper_pipe:5 },     craftTimeSec:45 },
      { id:'engine', name:'엔진', qty:1, materials:{ copper_block:8, iron_plate:5 },     craftTimeSec:90 },
    ],
  },
  // ── Model 2: 아르고 (Argo) ───────────────────────────
  {
    id:'argo', modelNum:2, name:'아르고', nameEn:'Argo',
    goal:'고도 100km 도달 (카르만 선)',
    composition:'동체 + 탱크 + 엔진 + 스러스터×4',
    totalCraftTime:'~15분',
    totalMaterials:{ aluminum_plate:57, iron_plate:5, copper_block:27, copper_pipe:8 },
    parts:[
      { id:'body',     name:'동체',     qty:1, materials:{ aluminum_plate:20, iron_plate:5 },      craftTimeSec:180 },
      { id:'tank',     name:'탱크',     qty:1, materials:{ aluminum_plate:15, copper_pipe:8 },     craftTimeSec:180 },
      { id:'engine',   name:'엔진',     qty:1, materials:{ copper_block:15, aluminum_plate:10 },   craftTimeSec:300 },
      { id:'thruster', name:'스러스터', qty:4, materials:{ copper_block:3, aluminum_plate:3 },     craftTimeSec:60  },
    ],
  },
  // ── Model 3: 헤르메스 (Hermes) ───────────────────────
  {
    id:'hermes', modelNum:3, name:'헤르메스', nameEn:'Hermes',
    goal:'저궤도(LEO) 진입, 소형 위성 투입',
    composition:'2단 + 페이로드',
    totalCraftTime:'~1시간 10분',
    totalMaterials:{ cfrp_panel:45, aluminum_plate:176, iron_plate:15, copper_block:91, copper_pipe:33, inconel:23 },
    parts:[
      { id:'body_s1',      name:'동체 (1단)',           qty:1, materials:{ aluminum_plate:40, iron_plate:15 },           craftTimeSec:600 },
      { id:'body_s2',      name:'동체 (2단)',           qty:1, materials:{ cfrp_panel:20, aluminum_plate:15 },           craftTimeSec:900 },
      { id:'tank_s1',      name:'탱크 (1단)',           qty:1, materials:{ aluminum_plate:30, copper_pipe:15 },          craftTimeSec:600 },
      { id:'tank_s2',      name:'탱크 (2단)',           qty:1, materials:{ aluminum_plate:20, copper_pipe:10 },          craftTimeSec:480 },
      { id:'engine_s1',    name:'엔진 (1단)',           qty:3, materials:{ copper_block:20, inconel:5, aluminum_plate:12 }, craftTimeSec:480 },
      { id:'engine_s2',    name:'엔진 (2단 진공형)',    qty:1, materials:{ copper_block:15, inconel:8 },                 craftTimeSec:720 },
      { id:'thruster',     name:'스러스터',             qty:4, materials:{ copper_block:5, aluminum_plate:5 },           craftTimeSec:120 },
      { id:'payload',      name:'페이로드 (위성)',      qty:1, materials:{ cfrp_panel:25, aluminum_plate:15, copper_pipe:8 }, craftTimeSec:900 },
    ],
  },
  // ── Model 4: 아틀라스 (Atlas) ────────────────────────
  {
    id:'atlas', modelNum:4, name:'아틀라스', nameEn:'Atlas',
    goal:'중궤도(MEO) 진입, 대형 위성 투입 + 1단 귀환',
    composition:'2단 + 재사용 구조',
    totalCraftTime:'~4시간 30분',
    totalMaterials:{ stainless_plate:237, cfrp_panel:90, aluminum_plate:95, iron_plate:20, copper_block:232, copper_pipe:35, inconel:82, titanium_rod:40 },
    parts:[
      { id:'body_s1',      name:'동체 (1단, 재사용)',   qty:1, materials:{ stainless_plate:60, iron_plate:20 },                    craftTimeSec:1200 },
      { id:'body_s2',      name:'동체 (2단)',           qty:1, materials:{ cfrp_panel:40, aluminum_plate:20 },                     craftTimeSec:1200 },
      { id:'tank_s1',      name:'탱크 (1단)',           qty:1, materials:{ stainless_plate:40, copper_pipe:20 },                   craftTimeSec:900 },
      { id:'tank_s2',      name:'탱크 (2단)',           qty:1, materials:{ aluminum_plate:30, copper_pipe:15 },                    craftTimeSec:720 },
      { id:'engine_s1',    name:'엔진 (1단)',           qty:9, materials:{ copper_block:20, inconel:8, stainless_plate:5 },        craftTimeSec:600 },
      { id:'engine_s2',    name:'엔진 (2단 진공형)',    qty:1, materials:{ copper_block:20, inconel:10 },                          craftTimeSec:900 },
      { id:'thruster_s1',  name:'스러스터 (1단 귀환)',  qty:4, materials:{ copper_block:8, stainless_plate:5 },                    craftTimeSec:240 },
      { id:'thruster_s2',  name:'스러스터 (2단 RCS)',   qty:4, materials:{ copper_block:5, aluminum_plate:5 },                     craftTimeSec:120 },
      { id:'landing_leg',  name:'착륙 다리',           qty:4, materials:{ titanium_rod:10, stainless_plate:8 },                   craftTimeSec:480 },
      { id:'payload',      name:'페이로드 (대형 위성)', qty:1, materials:{ cfrp_panel:50, aluminum_plate:25, copper_pipe:15 },     craftTimeSec:1500 },
    ],
  },
  // ── Model 5: 셀레네 (Selene) ─────────────────────────
  {
    id:'selene', modelNum:5, name:'셀레네', nameEn:'Selene',
    goal:'달 궤도 진입 (TLI)',
    composition:'3단 + 달 궤도선',
    totalCraftTime:'~8시간 30분',
    totalMaterials:{ stainless_plate:228, cfrp_panel:180, aluminum_plate:115, copper_block:267, copper_pipe:65, inconel:60, niobium_alloy:35, insulation:45, titanium_rod:20 },
    parts:[
      { id:'body_s1',      name:'동체 (1단)',           qty:1, materials:{ stainless_plate:80 },                                  craftTimeSec:1800 },
      { id:'body_s2',      name:'동체 (2단)',           qty:1, materials:{ cfrp_panel:60, aluminum_plate:30 },                    craftTimeSec:1800 },
      { id:'body_s3',      name:'동체 (3단)',           qty:1, materials:{ cfrp_panel:40, aluminum_plate:20 },                    craftTimeSec:1500 },
      { id:'tank_s1',      name:'탱크 (1단, LH2)',      qty:1, materials:{ stainless_plate:60, insulation:30, copper_pipe:40 },    craftTimeSec:1500 },
      { id:'tank_s2',      name:'탱크 (2단)',           qty:1, materials:{ aluminum_plate:40 },                                   craftTimeSec:1200 },
      { id:'tank_s3',      name:'탱크 (3단)',           qty:1, materials:{ aluminum_plate:25 },                                   craftTimeSec:900 },
      { id:'engine_s1',    name:'엔진 (1단)',           qty:5, materials:{ copper_block:25, inconel:12, stainless_plate:8 },       craftTimeSec:900 },
      { id:'engine_s2',    name:'엔진 (2단)',           qty:2, materials:{ copper_block:20, niobium_alloy:10 },                   craftTimeSec:1200 },
      { id:'engine_s3',    name:'엔진 (3단)',           qty:1, materials:{ copper_block:20, niobium_alloy:15 },                   craftTimeSec:1200 },
      { id:'thruster',     name:'스러스터 (전 단)',     qty:12,materials:{ copper_block:6, stainless_plate:4 },                   craftTimeSec:180 },
      { id:'payload',      name:'페이로드 (달 궤도선)', qty:1, materials:{ cfrp_panel:80, titanium_rod:20, copper_pipe:25, insulation:15 }, craftTimeSec:2400 },
    ],
  },
  // ── Model 6: 아르테미스 (Artemis) ────────────────────
  {
    id:'artemis', modelNum:6, name:'아르테미스', nameEn:'Artemis',
    goal:'달 착륙 (최종 목표)',
    composition:'2단 초대형 + 완전 재사용',
    totalCraftTime:'~2일',
    totalMaterials:{ stainless_plate:1080, cfrp_panel:150, copper_block:1378, copper_pipe:135, inconel:585, niobium_alloy:450, insulation:100, heat_coating:160, titanium_rod:160 },
    parts:[
      { id:'body_s1',      name:'동체 (1단, 부스터)',        qty:1,  materials:{ stainless_plate:200, heat_coating:50 },                          craftTimeSec:3600 },
      { id:'body_s2',      name:'동체 (2단, 우주선)',        qty:1,  materials:{ stainless_plate:150, heat_coating:80 },                          craftTimeSec:3600 },
      { id:'tank_s1',      name:'탱크 (1단, LOX+CH4)',       qty:1,  materials:{ stainless_plate:120, insulation:60, copper_pipe:50 },             craftTimeSec:2700 },
      { id:'tank_s2',      name:'탱크 (2단)',                qty:1,  materials:{ stainless_plate:80, insulation:40, copper_pipe:35 },              craftTimeSec:2400 },
      { id:'engine_s1',    name:'엔진 (1단 Raptor)',         qty:33, materials:{ copper_block:30, inconel:15, niobium_alloy:10, stainless_plate:10 }, craftTimeSec:1200 },
      { id:'engine_s2',    name:'엔진 (2단 진공형)',         qty:6,  materials:{ copper_block:30, niobium_alloy:20, inconel:15 },                 craftTimeSec:1500 },
      { id:'thruster_land',name:'스러스터 (착륙 역추진)',    qty:6,  materials:{ copper_block:20, niobium_alloy:10, stainless_plate:10 },          craftTimeSec:900 },
      { id:'thruster_rcs', name:'스러스터 (RCS)',            qty:16, materials:{ copper_block:8, stainless_plate:5 },                             craftTimeSec:300 },
      { id:'landing_leg',  name:'착륙 다리',                qty:6,  materials:{ titanium_rod:20, stainless_plate:15 },                           craftTimeSec:1200 },
      { id:'payload',      name:'페이로드 (달 착륙선+장비)', qty:1,  materials:{ cfrp_panel:150, titanium_rod:40, heat_coating:30, copper_pipe:50 }, craftTimeSec:5400 },
    ],
  },
];

// ============================================================
//  ASSEMBLY STAGES — 7단계 조립 스테이지 (D3-3)
//  durationSec: 기본 소요 시간(초)
//  reqResearch: 필요 연구 ID (null = 조건 없음)
// ============================================================
const ASSEMBLY_STAGES = [
  { id:'raw_refine',       name:'원자재 정제',     icon:'[1/7]', stage:1, durationSec:60,  reqResearch:null,  desc:'원광석을 항공우주 등급 소재로 정제. 기본 공정.' },
  { id:'structure_fab',    name:'구조물 제작',     icon:'[2/7]', stage:2, durationSec:120, reqResearch:null,  desc:'정제된 소재로 기체 구조 링 및 탱크 쉘 성형.' },
  { id:'propulsion_asm',   name:'추진 계통 조립',  icon:'[3/7]', stage:3, durationSec:180, reqResearch:'P01', desc:'연소실, 터보펌프를 통합하여 추진 어셈블리 완성. 연구 P01 필요.' },
  { id:'avionics_install', name:'항전 탑재',       icon:'[4/7]', stage:4, durationSec:150, reqResearch:'A01', desc:'비행 제어 컴퓨터 및 항법 장비를 기체에 탑재. 연구 A01 필요.' },
  { id:'static_fire',      name:'연소 시험',       icon:'[5/7]', stage:5, durationSec:90,  reqResearch:null,  desc:'지상 고정 연소 시험. 추진 계통 정상 작동 확인.' },
  { id:'stage_integration', name:'단 통합',        icon:'[6/7]', stage:6, durationSec:200, reqResearch:'S02', desc:'1단·2단·인터스테이지를 결합하여 완성체 조립. 연구 S02 필요.' },
  { id:'launch_prep',      name:'발사 준비',       icon:'[7/7]', stage:7, durationSec:60,  reqResearch:null,  desc:'추진제 충전, 최종 점검, 카운트다운 시퀀스.' },
];

// ============================================================
//  ACHIEVEMENTS — 업적 시스템 (D3-4)
//  category: production | research | assembly | launch | mission
//  condition: 프로그래밍팀장이 체크 로직 구현 시 참조할 키
//  reward: { type:'rp'|'moonstone', amount:N }
// ============================================================
const ACHIEVEMENTS = [
  // ── 생산 (Production) ──────────────────────────────────────
  {
    id: 'ach_first_building',
    name: '첫 건물 건설',
    icon: '[P01]',
    category: 'production',
    desc: '건물을 처음으로 1개 건설하라.',
    condition: 'building_count_gte_1',
    reward: { type:'rp', amount:5 },
  },
  {
    id: 'ach_5_buildings',
    name: '소규모 기지',
    icon: '[P02]',
    category: 'production',
    desc: '건물을 총 5개 이상 보유하라.',
    condition: 'building_count_gte_5',
    reward: { type:'rp', amount:15 },
  },
  {
    id: 'ach_resource_10k',
    name: '자원 1만 돌파',
    icon: '[P03]',
    category: 'production',
    desc: '단일 자원 누적 생산량 10,000 이상 달성.',
    condition: 'any_resource_total_gte_10000',
    reward: { type:'rp', amount:25 },
  },
  {
    id: 'ach_resource_100k',
    name: '산업 대국',
    icon: '[P04]',
    category: 'production',
    desc: '전체 자원 누적 생산량 합계 100,000 이상.',
    condition: 'all_resource_total_gte_100000',
    reward: { type:'moonstone', amount:3 },
  },
  {
    id: 'ach_all_bldg_upgraded',
    name: '풀 업그레이드 기지',
    icon: '[P05]',
    category: 'production',
    desc: '모든 건물 종류의 업그레이드를 1단계 이상 구매.',
    condition: 'all_buildings_upgraded',
    reward: { type:'moonstone', amount:5 },
  },

  // ── 연구 (Research) ────────────────────────────────────────
  {
    id: 'ach_first_research',
    name: '호기심의 시작',
    icon: '[R01]',
    category: 'research',
    desc: '연구를 처음으로 1개 완료하라.',
    condition: 'research_count_gte_1',
    reward: { type:'rp', amount:10 },
  },
  {
    id: 'ach_5_research',
    name: '연구 5종 달성',
    icon: '[R02]',
    category: 'research',
    desc: '연구를 총 5개 이상 완료하라.',
    condition: 'research_count_gte_5',
    reward: { type:'rp', amount:30 },
  },
  {
    id: 'ach_10_research',
    name: '기술 선도자',
    icon: '[R03]',
    category: 'research',
    desc: '연구를 총 10개 이상 완료하라.',
    condition: 'research_count_gte_10',
    reward: { type:'moonstone', amount:3 },
  },
  {
    id: 'ach_all_branch_tier2',
    name: '전 분야 Tier 2',
    icon: '[R04]',
    category: 'research',
    desc: '모든 연구 브랜치에서 Tier 2 이상 달성.',
    condition: 'all_branches_tier2',
    reward: { type:'moonstone', amount:5 },
  },
  {
    id: 'ach_rp_10k',
    name: 'RP 10,000 축적',
    icon: '[R05]',
    category: 'research',
    desc: '연구 포인트(RP)를 누적 10,000 이상 획득.',
    condition: 'rp_total_gte_10000',
    reward: { type:'moonstone', amount:2 },
  },

  // ── 조립 (Assembly) ────────────────────────────────────────
  {
    id: 'ach_first_rocket',
    name: '첫 로켓 조립',
    icon: '[A01]',
    category: 'assembly',
    desc: '로켓을 처음으로 1대 조립 완료하라.',
    condition: 'rockets_assembled_gte_1',
    reward: { type:'rp', amount:20 },
  },
  {
    id: 'ach_3_rockets',
    name: '양산 체제',
    icon: '[A02]',
    category: 'assembly',
    desc: '로켓을 총 3대 이상 조립 완료하라.',
    condition: 'rockets_assembled_gte_3',
    reward: { type:'rp', amount:50 },
  },
  {
    id: 'ach_small_class',
    name: 'SMALL 클래스 해금',
    icon: '[A03]',
    category: 'assembly',
    desc: 'SMALL 클래스 로켓을 해금하라.',
    condition: 'rocket_class_small_unlocked',
    reward: { type:'moonstone', amount:3 },
  },
  {
    id: 'ach_bom_complete',
    name: 'BOM 전체 확보',
    icon: '[A04]',
    category: 'assembly',
    desc: '로켓 1대 분량의 BOM 부품을 모두 확보하라.',
    condition: 'bom_all_parts_ready',
    reward: { type:'moonstone', amount:5 },
  },

  // ── 발사 (Launch) ──────────────────────────────────────────
  {
    id: 'ach_first_launch',
    name: '점화!',
    icon: '[L01]',
    category: 'launch',
    desc: '로켓을 처음으로 발사하라.',
    condition: 'launches_gte_1',
    reward: { type:'rp', amount:30 },
  },
  {
    id: 'ach_5_success',
    name: '발사 성공 5회',
    icon: '[L02]',
    category: 'launch',
    desc: '발사 성공을 5회 이상 달성하라.',
    condition: 'launch_success_gte_5',
    reward: { type:'moonstone', amount:3 },
  },
  {
    id: 'ach_100km',
    name: '카르만 라인 돌파',
    icon: '[L03]',
    category: 'launch',
    desc: '발사 고도 100km 이상을 달성하라.',
    condition: 'max_altitude_gte_100',
    reward: { type:'moonstone', amount:5 },
  },
  {
    id: 'ach_retry_after_fail',
    name: '불굴의 의지',
    icon: '[L04]',
    category: 'launch',
    desc: '발사 실패 후 다시 발사에 성공하라.',
    condition: 'success_after_failure',
    reward: { type:'rp', amount:50 },
  },

  // ── 임무 (Mission) ─────────────────────────────────────────
  {
    id: 'ach_phase1_clear',
    name: 'Phase 1 완료',
    icon: '[M01]',
    category: 'mission',
    desc: 'Phase 1의 모든 목표를 달성하라.',
    condition: 'phase_1_complete',
    reward: { type:'moonstone', amount:10 },
  },
  {
    id: 'ach_phase2_clear',
    name: 'Phase 2 완료',
    icon: '[M02]',
    category: 'mission',
    desc: 'Phase 2의 모든 목표를 달성하라.',
    condition: 'phase_2_complete',
    reward: { type:'moonstone', amount:20 },
  },
];

// ============================================================
//  PRESTIGE STAR TREE — 프레스티지 스타 트리 (D4-1)
//  문스톤으로 구매하는 영구 강화 노드. 트리 구조로 선행 조건 존재.
//  tier 0: 비용 1~3, tier 1: 비용 5~8, tier 2: 비용 12~20
//  effect: { type: 'prodSpeed'|'researchSpeed'|'assemblyTime'|
//            'startingMoney'|'moonstoneGain'|'partCost'|
//            'launchReliability'|'globalProd', value: number }
// ============================================================
const PRESTIGE_STAR_TREE = [
  // ── TIER 0 (기초 노드 — 선행 조건 없음) ────────────────────
  {
    id: 'star_prod_boost',
    name: '생산 가속',
    icon: '★',
    tier: 0,
    cost: { moonstone: 2 },
    effect: { type: 'prodSpeed', value: 0.20 },
    requires: [],
    desc: '전체 생산 속도 +20%. 모든 건물의 자원 산출량이 증가한다.',
  },
  {
    id: 'star_research_accel',
    name: '연구 촉진',
    icon: '★',
    tier: 0,
    cost: { moonstone: 2 },
    effect: { type: 'researchSpeed', value: 0.15 },
    requires: [],
    desc: '연구 포인트(RP) 획득 속도 +15%. 기술 해금이 빨라진다.',
  },
  {
    id: 'star_seed_fund',
    name: '시드 머니',
    icon: '★',
    tier: 0,
    cost: { moonstone: 1 },
    effect: { type: 'startingMoney', value: 5000 },
    requires: [],
    desc: '프레스티지 후 시작 자금 $5,000 추가 지급. 초반 성장을 가속한다.',
  },
  {
    id: 'star_part_discount',
    name: '부품 할인',
    icon: '★',
    tier: 0,
    cost: { moonstone: 3 },
    effect: { type: 'partCost', value: -0.10 },
    requires: [],
    desc: '로켓 부품 제작 비용 -10%. 부품 확보가 수월해진다.',
  },

  // ── TIER 1 (중급 노드 — TIER 0 선행 필요) ──────────────────
  {
    id: 'star_assembly_rush',
    name: '조립 단축',
    icon: '★',
    tier: 1,
    cost: { moonstone: 5 },
    effect: { type: 'assemblyTime', value: -0.15 },
    requires: ['star_prod_boost'],
    desc: '조립 소요 시간 -15%. 로켓 완성이 빨라진다.',
  },
  {
    id: 'star_deep_research',
    name: '심층 연구',
    icon: '★',
    tier: 1,
    cost: { moonstone: 6 },
    effect: { type: 'researchSpeed', value: 0.25 },
    requires: ['star_research_accel'],
    desc: '연구 속도 추가 +25%. 고급 기술 해금 시간을 크게 단축.',
  },
  {
    id: 'star_launch_safe',
    name: '발사 안전 강화',
    icon: '★',
    tier: 1,
    cost: { moonstone: 5 },
    effect: { type: 'launchReliability', value: 0.12 },
    requires: ['star_part_discount'],
    desc: '발사 신뢰도 +12%. 발사 실패 확률이 줄어든다.',
  },
  {
    id: 'star_venture_capital',
    name: '벤처 캐피탈',
    icon: '★',
    tier: 1,
    cost: { moonstone: 8 },
    effect: { type: 'startingMoney', value: 20000 },
    requires: ['star_seed_fund'],
    desc: '프레스티지 후 시작 자금 $20,000 추가 지급. 건물 즉시 건설 가능.',
  },

  // ── TIER 2 (최종 노드 — TIER 1 선행 필요) ──────────────────
  {
    id: 'star_mass_production',
    name: '대량 생산 체제',
    icon: '★',
    tier: 2,
    cost: { moonstone: 15 },
    effect: { type: 'globalProd', value: 0.50 },
    requires: ['star_assembly_rush', 'star_deep_research'],
    desc: '전체 생산 ×1.5 배율. 자원, 연구, 조립 모두에 적용.',
  },
  {
    id: 'star_moonstone_magnet',
    name: '문스톤 자석',
    icon: '★',
    tier: 2,
    cost: { moonstone: 12 },
    effect: { type: 'moonstoneGain', value: 0.25 },
    requires: ['star_launch_safe'],
    desc: '프레스티지 시 문스톤 획득량 +25%. 스타 트리 확장이 빨라진다.',
  },
  {
    id: 'star_apollo_legacy',
    name: '아폴로의 유산',
    icon: '★',
    tier: 2,
    cost: { moonstone: 20 },
    effect: { type: 'globalProd', value: 0.30 },
    requires: ['star_mass_production', 'star_moonstone_magnet'],
    desc: '전체 생산 추가 +30% 및 문스톤 +10% 복합 보너스. 최종 강화 노드.',
    bonusEffect: { type: 'moonstoneGain', value: 0.10 },
  },
];

// ============================================================
//  PRESTIGE CONFIG — 프레스티지 리셋/유지 목록 (D4-2)
//  resets: 프레스티지 시 초기화되는 항목
//  keeps: 프레스티지 시 유지되는 항목
//  moonstoneFormula: 문스톤 획득 공식 설명
// ============================================================
const PRESTIGE_CONFIG = {
  resets: [
    { id: 'money',          name: '자금($)',               desc: '보유 자금이 0으로 초기화된다.' },
    { id: 'iron',           name: '철광석(Fe)',             desc: '보유 철광석이 0으로 초기화된다.' },
    { id: 'copper',         name: '구리(Cu)',               desc: '보유 구리가 0으로 초기화된다.' },
    { id: 'fuel',           name: '연료(LOX)',              desc: '보유 연료가 0으로 초기화된다.' },
    { id: 'electronics',    name: '전자부품(PCB)',          desc: '보유 전자부품이 0으로 초기화된다.' },
    { id: 'research',       name: '연구 포인트(RP)',        desc: '보유 RP가 0으로 초기화된다. (구매한 연구는 별도 규칙)' },
    { id: 'buildings',      name: '건물',                   desc: '모든 건물이 철거된다. 건물 업그레이드·애드온도 함께 초기화.' },
    { id: 'parts',          name: '로켓 부품',              desc: '보유 부품 재고가 0으로 초기화된다.' },
    { id: 'assembly_jobs',  name: '조립 작업',              desc: '진행 중인 조립이 모두 취소된다.' },
    { id: 'workers',        name: '인원 배치',              desc: '인원이 기본값(1명)으로 초기화된다. 주거 업그레이드 효과도 리셋.' },
    { id: 'research_basic', name: '기초 연구',              desc: '기초 생산 기술, 드릴 등 tier 0~1 연구가 초기화된다.' },
    { id: 'building_upg',   name: '건물 업그레이드',         desc: '건물별 구매한 업그레이드가 모두 초기화된다.' },
    { id: 'building_addon', name: '건물 애드온',             desc: '설치한 애드온 및 애드온 업그레이드가 초기화된다.' },
  ],

  keeps: [
    { id: 'moonstone',          name: '문스톤',                 desc: '누적 문스톤은 영구 보존된다.' },
    { id: 'prestige_stars',     name: '프레스티지 스타',         desc: '스타 트리에서 구매한 노드는 영구 유지.' },
    { id: 'achievements',       name: '업적',                   desc: '달성한 업적은 프레스티지 후에도 유지된다.' },
    { id: 'milestones',         name: '마일스톤',               desc: '달성한 마일스톤 및 보상은 영구 유지.' },
    { id: 'prestige_count',     name: '프레스티지 횟수',         desc: '누적 프레스티지 횟수가 기록된다.' },
    { id: 'launch_history',     name: '발사 기록',              desc: '누적 발사 히스토리는 보존된다.' },
    { id: 'automation_upgrades',name: '자동화 업그레이드',       desc: '문스톤으로 구매한 자동화 연구는 유지.' },
    { id: 'advanced_research',  name: '고급 연구 (tier 2+)',    desc: '로켓 공학 기초, 발사 제어 등 고급 연구는 유지된다.' },
    { id: 'rocket_classes',     name: '해금된 로켓 클래스',      desc: '해금된 로켓 클래스(SMALL 이상)는 유지.' },
    { id: 'phase_progress',     name: '페이즈 진행도',           desc: '도달한 페이즈 단계는 영구 유지된다.' },
  ],

  moonstoneFormula: {
    desc: '프레스티지 시 획득하는 문스톤 수량 공식',
    formula: 'floor( sqrt(총_발사_고도_합 / 100) + (성공_발사_횟수 * 0.5) + (최고_고도 / 200) )',
    variables: [
      { name: '총_발사_고도_합',  desc: '이번 사이클에서 발사한 모든 로켓의 도달 고도 합계 (km)' },
      { name: '성공_발사_횟수',  desc: '이번 사이클에서 성공한 발사 횟수' },
      { name: '최고_고도',      desc: '이번 사이클에서 달성한 최고 고도 (km)' },
    ],
    bonuses: [
      '스타 트리 "문스톤 자석" 노드: +25%',
      '스타 트리 "아폴로의 유산" 노드: +10%',
      '업적 "ELITE 클래스 발사": +20%',
    ],
    minimumGain: 1,
    note: '최소 1개는 항상 지급. 첫 프레스티지 보너스로 +3 추가 지급.',
  },
};
