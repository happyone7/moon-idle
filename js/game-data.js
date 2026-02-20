// ============================================================
//  GAME DATA
// ============================================================
const RESOURCES = [
  { id:'money',       name:'돈',       symbol:'₩',  color:'var(--amber)' },
  { id:'metal',       name:'금속',     symbol:'Fe', color:'var(--green)' },
  { id:'fuel',        name:'연료',     symbol:'LOX',color:'var(--green)' },
  { id:'electronics', name:'전자부품', symbol:'PCB',color:'var(--green)' },
  { id:'research',    name:'연구',     symbol:'RP', color:'var(--green-mid)' },
];

const OPS_ROLES = [
  { id: 'sales',      name: '영업팀 직원',  maxSlotsPerBld: 3 },
  { id: 'accounting', name: '회계팀 직원',  maxSlotsPerBld: 3 },
  { id: 'consulting', name: '상담팀 직원',  maxSlotsPerBld: 3 },
];

const BLD_STAFF_NAMES = {
  supply_depot:  '물류 직원',
  mine:          '채굴 직원',
  extractor:     '추출 직원',
  refinery:      '정제 직원',
  cryo_plant:    '냉각 직원',
  elec_lab:      '전자 기술자',
  fab_plant:     '제작 기술자',
  research_lab:  '연구원',
  r_and_d:       '수석 연구원',
  solar_array:   '패널 관리자',
  launch_pad:    '발사 기술자',
};

const BUILDINGS = [
  { id:'housing',      name:'주거 시설',        icon:'[HSG]', produces:'bonus',       baseRate:0,   baseCost:{money:200},                                    desc:'인원 상한 +1',      wbClass:'wb-housing' },
  { id:'ops_center',   name:'운영 센터',        icon:'[OPS]', produces:'money',       baseRate:35,  baseCost:{metal:150},                                    desc:'수익 창출 허브',    wbClass:'wb-ops' },
  { id:'supply_depot', name:'보급 창고',        icon:'[DEP]', produces:'money',       baseRate:25,  baseCost:{money:3000,metal:500,electronics:150},         desc:'물류 수익',         wbClass:'wb-ops' },
  { id:'mine',         name:'철광석 채굴기',    icon:'[MIN]', produces:'metal',       baseRate:25,  baseCost:{money:800},                                    desc:'기본 금속 생산',    wbClass:'wb-mine' },
  { id:'extractor',    name:'보크사이트 추출기', icon:'[EXT]', produces:'metal',       baseRate:40,  baseCost:{money:6000,metal:1500},                        desc:'고급 금속 추출',    wbClass:'wb-mine' },
  { id:'refinery',     name:'연료 정제소',      icon:'[REF]', produces:'fuel',        baseRate:20,  baseCost:{money:10000,metal:2500},                       desc:'LOX/RP-1 생산',    wbClass:'wb-refinery' },
  { id:'cryo_plant',   name:'극저온 플랜트',    icon:'[CRY]', produces:'fuel',        baseRate:35,  baseCost:{money:15000,metal:4000,electronics:800},       desc:'고순도 극저온 연료', wbClass:'wb-refinery' },
  { id:'elec_lab',     name:'전자공학 연구소',  icon:'[PCB]', produces:'electronics', baseRate:18,  baseCost:{money:18000,metal:4000},                       desc:'회로 부품 생산',    wbClass:'wb-eleclab' },
  { id:'fab_plant',    name:'반도체 공장',      icon:'[FAB]', produces:'electronics', baseRate:35,  baseCost:{money:25000,metal:6000,electronics:1500},      desc:'고급 반도체',       wbClass:'wb-eleclab' },
  { id:'research_lab', name:'연구소',           icon:'[RSH]', produces:'research',    baseRate:15,  baseCost:{money:20000},                                  desc:'기술 연구 포인트',  wbClass:'wb-research' },
  { id:'r_and_d',      name:'R&D 센터',         icon:'[RND]', produces:'research',    baseRate:25,  baseCost:{money:40000,electronics:3000},                 desc:'고급 연구 가속',    wbClass:'wb-research' },
  { id:'solar_array',  name:'태양광 어레이',    icon:'[SOL]', produces:'bonus',       baseRate:0.1, baseCost:{money:35000,electronics:4000},                 desc:'전체 생산 +10%/개', wbClass:'wb-solar' },
  { id:'launch_pad',   name:'발사대',           icon:'[PAD]', produces:'bonus',       baseRate:0,   baseCost:{money:120000,metal:25000,electronics:10000},   desc:'발사 슬롯 +1',     wbClass:'wb-launchpad' },
];

const PARTS = [
  { id:'engine',   name:'엔진',        icon:'[ENG]', cost:{metal:2500,fuel:1500,electronics:800} },
  { id:'fueltank', name:'연료 탱크',   icon:'[TNK]', cost:{metal:3000,fuel:3000} },
  { id:'control',  name:'제어 시스템', icon:'[CTL]', cost:{electronics:4000,metal:1500} },
  { id:'hull',     name:'기체 선체',   icon:'[HUL]', cost:{metal:3500} },
  { id:'payload',  name:'탑재체',      icon:'[PLD]', cost:{electronics:3000,metal:1000} },
];

const QUALITIES = [
  { id:'proto',    name:'PROTO-MK1', icon:'[P1]', costMult:1.0, timeSec:20,  ispBonus:0,  dryMassMult:1.0,  relBonus:5,  reuseBonus:0,  rewardMult:1.0 },
  { id:'standard', name:'STD-MK2',  icon:'[S2]', costMult:2.0, timeSec:40,  ispBonus:15, dryMassMult:0.95, relBonus:8,  reuseBonus:5,  rewardMult:2.0 },
  { id:'advanced', name:'ADV-MK3',  icon:'[A3]', costMult:4.0, timeSec:80, ispBonus:35, dryMassMult:0.88, relBonus:18, reuseBonus:12, rewardMult:3.5 },
  { id:'elite',    name:'ELITE-MK4',icon:'[E4]', costMult:8.0, timeSec:160, ispBonus:65, dryMassMult:0.78, relBonus:32, reuseBonus:22, rewardMult:6.0 },
];

// Each upgrade has optional 'unlocks' array: strings matching keys in gs.unlocks
// Organized by RESEARCH BRANCHES — S(구조), P(추진), A(항전), T(열보호), O(운영)
// Within each branch, req chains are sequential (top→bottom)
const UPGRADES = [
  // ── Branch S (구조 · STRUCTURE) ──────────────────────────────
  { id:'basic_prod',   name:'기초 용접술',     icon:'S01', cost:{research:10},                   req:null,          time:  60, desc:'광산·생산 시설 잠금 해제',       effect:()=>{},                                                      unlocks:['bld_mine'] },
  { id:'drill',        name:'알루미늄 가공',   icon:'S02', cost:{research:50},                   req:'basic_prod',  time: 180, desc:'금속 생산 +25%',                 effect:()=>{ prodMult.metal=(prodMult.metal||1)*1.25; },            unlocks:['bld_extractor'] },
  { id:'alloy',        name:'CFRP 적층',       icon:'S03', cost:{research:150,metal:300},        req:'drill',       time: 360, desc:'부품 비용 -20%',                 effect:()=>{ partCostMult*=0.8; },                                  unlocks:['bld_r_and_d'] },
  { id:'rocket_eng',   name:'티타늄 가공',     icon:'S04', cost:{research:200,metal:300},        req:'alloy',       time: 480, desc:'조립동 해금 + 로켓 제조 시작',   effect:()=>{},                                                      unlocks:['tab_assembly','bld_launch_pad'] },
  // ── Branch P (추진 · PROPULSION) ─────────────────────────────
  { id:'fuel_chem',    name:'고압 연소실 I',   icon:'P01', cost:{research:60,metal:50},          req:null,          time: 180, desc:'연료 정제 시설 해금',             effect:()=>{},                                                      unlocks:['bld_refinery'] },
  { id:'catalyst',     name:'터보펌프 기초',   icon:'P02', cost:{research:80,fuel:100},          req:'fuel_chem',   time: 240, desc:'연료 생산 +30%',                 effect:()=>{ prodMult.fuel=(prodMult.fuel||1)*1.3; },               unlocks:['bld_cryo_plant'] },
  { id:'lightweight',  name:'재생 냉각 노즐',  icon:'P03', cost:{research:250,metal:800},        req:'catalyst',    time: 600, desc:'건조질량 -10%, 재활용 +8%',     effect:()=>{ /* handled in getRocketScience */ } },
  { id:'fusion',       name:'핀치 연소',       icon:'P04', cost:{research:500,electronics:400},  req:'lightweight', time:1200, desc:'Isp +22, 추력 +120kN, 문스톤 +1', effect:()=>{ fusionBonus++; } },
  // ── Branch A (항전 · AVIONICS) ───────────────────────────────
  { id:'electronics_basics', name:'자이로 안정화',   icon:'A01', cost:{research:80},                  req:null,                  time: 240, desc:'전자 시설 해금',       effect:()=>{},                                                                       unlocks:['bld_elec_lab','bld_supply_depot'] },
  { id:'microchip',          name:'관성 항법 (INS)', icon:'A02', cost:{research:100,electronics:80},  req:'electronics_basics',  time: 300, desc:'전자부품 +35%',       effect:()=>{ prodMult.electronics=(prodMult.electronics||1)*1.35; },                 unlocks:['bld_fab_plant','bld_r_and_d'] },
  { id:'reliability',        name:'GPS 보정',        icon:'A03', cost:{research:300},                 req:'microchip',           time: 720, desc:'발사 신뢰도 +15%',   effect:()=>{ reliabilityBonus+=15; } },
  { id:'automation',         name:'자율 비행',       icon:'A04', cost:{research:200,electronics:200}, req:'reliability',         time: 480, desc:'전체 생산 ×1.5',     effect:()=>{ globalMult*=1.5; },                                                     unlocks:['bld_solar_array'] },
  // ── Branch T (열보호 · THERMAL) ──────────────────────────────
  { id:'hire_worker_1', name:'기초 절열재',       icon:'T01', cost:{research:20},                  req:null,            time: 120, desc:'추가 인원 +1명',       effect:()=>{ gs.workers=(gs.workers||1)+1; },  unlocks:[] },
  { id:'launch_ctrl',   name:'삭마 코팅',         icon:'T02', cost:{research:300,electronics:200}, req:'hire_worker_1', time: 720, desc:'발사 통제 탭 해금',   effect:()=>{},                                 unlocks:['tab_launch'] },
  { id:'mission_sys',   name:'능동 냉각',         icon:'T03', cost:{research:400},                 req:'launch_ctrl',   time: 900, desc:'미션 현황 탭 해금',   effect:()=>{},                                 unlocks:['tab_mission'] },
  { id:'multipad',      name:'열차폐 타일',       icon:'T04', cost:{research:400,metal:1000},      req:'mission_sys',   time: 900, desc:'조립 슬롯 +1',       effect:()=>{ slotBonus++; } },
  // ── Branch O (운영 · OPERATIONS) ─────────────────────────────
  { id:'auto_worker_assign',    name:'인원 자동 배치',   icon:'O01', cost:{research:500,electronics:300},  req:null,                  time:1200, desc:'인원 자동 배치 해금',   effect:()=>{ if(!gs.autoEnabled) gs.autoEnabled={}; gs.autoEnabled['auto_worker']=true; if(!gs.msUpgrades) gs.msUpgrades={}; gs.msUpgrades['auto_worker']=true; }, unlocks:[] },
  { id:'auto_assemble_restart', name:'자동 조립 재시작', icon:'O02', cost:{research:600,electronics:400},  req:'auto_worker_assign',  time:1500, desc:'조립 자동 재시작 해금', effect:()=>{ if(!gs.autoEnabled) gs.autoEnabled={}; gs.autoEnabled['auto_assemble']=true; if(!gs.msUpgrades) gs.msUpgrades={}; gs.msUpgrades['auto_assemble']=true; }, unlocks:[] },
];

// Research branch definitions for column layout
const RESEARCH_BRANCHES = [
  { id:'S', label:'구조',   nodes:['basic_prod','drill','alloy','rocket_eng'] },
  { id:'P', label:'추진',   nodes:['fuel_chem','catalyst','lightweight','fusion'] },
  { id:'A', label:'항전',   nodes:['electronics_basics','microchip','reliability','automation'] },
  { id:'T', label:'열보호', nodes:['hire_worker_1','launch_ctrl','mission_sys','multipad'] },
  { id:'O', label:'운영',   nodes:['auto_worker_assign','auto_assemble_restart'] },
];

// ============================================================
//  BUILDING UPGRADES — per-building purchasable improvements
//  mult: production multiplier (stacks multiplicatively)
//  wkr:  adds to gs.workers when purchased
//  rel:  adds to reliabilityBonus when purchased
//  solarBonus: extra solar bonus per panel
// ============================================================
const BUILDING_UPGRADES = {
  housing: [
    { id:'hsg_dorm',      name:'기숙사 증설',          cost:{money:250},                          desc:'인원 상한 +2명 추가',              wkr:2 },
    { id:'hsg_welfare',   name:'복리 후생 강화',        cost:{money:800,metal:50},                 desc:'인원 +3명 추가',                   wkr:3,  req:'hsg_dorm' },
    { id:'hsg_township',  name:'타운십 조성',           cost:{money:3000,metal:200},               desc:'인원 +5명 대규모 주거 허브',       wkr:5,  req:'hsg_welfare' },
  ],
  ops_center: [
    { id:'ops_sales',     name:'영업팀 강화',           cost:{money:400},                          desc:'이 건물 수익 +35%',                mult:1.35 },
    { id:'ops_24h',       name:'24시간 운영',           cost:{money:1500,electronics:50},          desc:'이 건물 수익 추가 +50%',           mult:1.50, req:'ops_sales' },
    { id:'ops_premium',   name:'프리미엄 서비스',       cost:{money:4000,electronics:200},         desc:'이 건물 수익 ×1.8 증폭',           mult:1.80, req:'ops_24h' },
  ],
  supply_depot: [
    { id:'dep_logistics', name:'물류 최적화',           cost:{money:600,metal:100},                desc:'이 건물 수익 +40%',                mult:1.40 },
    { id:'dep_autoware',  name:'자동화 창고',           cost:{money:2000,electronics:100},         desc:'이 건물 수익 +60%',                mult:1.60, req:'dep_logistics' },
  ],
  mine: [
    { id:'mine_bit',      name:'강화 드릴 비트',        cost:{money:300,metal:50},                 desc:'이 건물 금속 생산 +30%',           mult:1.30 },
    { id:'mine_deep',     name:'심층 채굴 기술',        cost:{money:900,metal:200},                desc:'이 건물 금속 생산 +50%',           mult:1.50, req:'mine_bit' },
    { id:'mine_robot',    name:'로봇 채굴기',           cost:{money:2500,electronics:100},         desc:'이 건물 금속 생산 ×2.0',           mult:2.00, req:'mine_deep' },
  ],
  extractor: [
    { id:'ext_pump',      name:'고속 추출 펌프',        cost:{money:500,metal:100},                desc:'이 건물 금속 생산 +40%',           mult:1.40 },
    { id:'ext_filter',    name:'순도 향상 필터',        cost:{money:1500,metal:300},               desc:'이 건물 금속 생산 +60%',           mult:1.60, req:'ext_pump' },
  ],
  refinery: [
    { id:'ref_catalyst',  name:'촉매 반응로',           cost:{money:400,metal:80},                 desc:'이 건물 연료 생산 +35%',           mult:1.35 },
    { id:'ref_highpress', name:'고압 정제 시스템',      cost:{money:1200,metal:200},               desc:'이 건물 연료 생산 +55%',           mult:1.55, req:'ref_catalyst' },
  ],
  cryo_plant: [
    { id:'cry_heatex',    name:'열교환 최적화',         cost:{money:800,electronics:50},           desc:'이 건물 연료 생산 +40%',           mult:1.40 },
    { id:'cry_supercon',  name:'초전도 냉각 코일',      cost:{money:2500,electronics:200},         desc:'이 건물 연료 생산 +70%',           mult:1.70, req:'cry_heatex' },
  ],
  elec_lab: [
    { id:'elb_smd',       name:'SMD 자동 납땜',         cost:{money:600,metal:100},                desc:'이 건물 전자부품 +35%',            mult:1.35 },
    { id:'elb_nano',      name:'나노 패터닝',           cost:{money:1800,electronics:100},         desc:'이 건물 전자부품 +55%',            mult:1.55, req:'elb_smd' },
  ],
  fab_plant: [
    { id:'fab_euv',       name:'EUV 리소그래피',        cost:{money:2000,electronics:200},         desc:'이 건물 전자부품 +50%',            mult:1.50 },
    { id:'fab_3d',        name:'3D 적층 기술',          cost:{money:5000,electronics:500},         desc:'이 건물 전자부품 ×2.0',            mult:2.00, req:'fab_euv' },
  ],
  research_lab: [
    { id:'rsh_equip',     name:'최신 장비 도입',        cost:{money:500},                          desc:'이 건물 RP +40%',                  mult:1.40 },
    { id:'rsh_cross',     name:'융합 연구 프로그램',    cost:{money:1500,electronics:100},         desc:'이 건물 RP +60%',                  mult:1.60, req:'rsh_equip' },
    { id:'rsh_super',     name:'슈퍼컴퓨터 연결',      cost:{money:4000,electronics:400},         desc:'이 건물 RP ×2.0',                  mult:2.00, req:'rsh_cross' },
  ],
  r_and_d: [
    { id:'rnd_collab',    name:'외부 연구 협력',        cost:{money:2000,electronics:200},         desc:'이 건물 RP +50%',                  mult:1.50 },
    { id:'rnd_patent',    name:'특허 풀 구축',          cost:{money:5000,electronics:500},         desc:'이 건물 RP ×1.8',                  mult:1.80, req:'rnd_collab' },
  ],
  solar_array: [
    { id:'sol_hieff',     name:'고효율 패널',           cost:{money:600,electronics:50},           desc:'태양광 보너스 +5%/개 추가\n→ +15%/개로 증가', solarBonus:0.05 },
    { id:'sol_tracker',   name:'추적 시스템',           cost:{money:1500,electronics:100},         desc:'태양광 보너스 추가 +5%/개\n→ +20%/개로 증가', solarBonus:0.05, req:'sol_hieff' },
  ],
  launch_pad: [
    { id:'pad_reinforce', name:'발사대 보강',           cost:{money:1000,metal:500},               desc:'발사 신뢰도 +10%',                 rel:10 },
    { id:'pad_fuelfeed',  name:'연료 공급 가속',        cost:{money:3000,metal:1000,electronics:200}, desc:'조립 시간 -20% (발사대 필요)',   timeMult:0.8, req:'pad_reinforce' },
  ],
};

// ============================================================
//  BUILDING ADD-ONS — A/B 선택 가능한 부속 건물
//  각 건물에 1개만 설치 가능. 설치 후 변경 불가.
//  effect: { moneyMult, rpBonus, rel, timeMult, slotBonus, partCostReduct }
// ============================================================
const BUILDING_ADDONS = {
  ops_center: {
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
        cost: { money: 15000, metal: 2000 },
        desc: '조립 슬롯 +1\n부품 비용 -15%',
        effect: { slotBonus: 1, partCostReduct: 0.15 },
        upgrades: [
          { id:'vif_print', name:'3D 프린팅 허브', cost:{metal:5000,electronics:2500},  desc:'부품 비용 추가 -10%', partCostReduct:0.10 },
          { id:'vif_auto',  name:'조립 자동화',    cost:{metal:12000,electronics:6000}, desc:'조립 슬롯 추가 +1', slotBonus:1, req:'vif_print' },
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
  { id:'nano',        name:'NANO',        icon:'[N]',  totalMassKg:850,    thrustKN:18,    ispSec:285, deltaVMs:2840,  unlock:null,            desc:'초소형 실험 로켓. 해금 조건 없이 즉시 사용 가능.' },
  { id:'small',       name:'SMALL',       icon:'[S]',  totalMassKg:3200,   thrustKN:78,    ispSec:305, deltaVMs:4200,  unlock:'phase_2',       desc:'소형 발사체. Phase 2 완료 시 해금.' },
  { id:'medium',      name:'MEDIUM',      icon:'[M]',  totalMassKg:12000,  thrustKN:310,   ispSec:320, deltaVMs:5800,  unlock:'phase_3',       desc:'중형 발사체. Phase 3 완료 시 해금.' },
  { id:'heavy',       name:'HEAVY',       icon:'[H]',  totalMassKg:45000,  thrustKN:1200,  ispSec:335, deltaVMs:7200,  unlock:'phase_4',       desc:'대형 발사체. Phase 4 완료 시 해금.' },
  { id:'super_heavy', name:'SUPER HEAVY', icon:'[SH]', totalMassKg:120000, thrustKN:3500,  ispSec:350, deltaVMs:9800,  unlock:'phase_5',       desc:'초대형 발사체. Phase 5 완료 시 해금.' },
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

  // 클래스별 스케일 팩터 (NANO 기준 중량 비례)
  scaleFactor: {
    nano:        1,
    small:       3.5,
    medium:      12,
    heavy:       45,
    super_heavy: 120,
  },
};

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
    desc: '프레스티지 후 시작 자금 ₩5,000 추가 지급. 초반 성장을 가속한다.',
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
    desc: '프레스티지 후 시작 자금 ₩20,000 추가 지급. 건물 즉시 건설 가능.',
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
    { id: 'money',          name: '자금(₩)',               desc: '보유 자금이 0으로 초기화된다.' },
    { id: 'metal',          name: '금속(Fe)',               desc: '보유 금속이 0으로 초기화된다.' },
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

// ============================================================
//  PHASE SCENES — 페이즈별 ASCII 씬 콘텐츠 (D4-3)
//  5개 페이즈: 프로토타입 → 준궤도 → 궤도 → 시스루나 → 달 표면
//  asciiScene: 미션 현황 탭에 표시되는 ASCII 아트
//  flavorText: 페이즈 분위기 텍스트
//  unlockCondition: 해금 조건 설명 (프로그래밍팀장이 로직 구현 시 참조)
// ============================================================
const PHASE_SCENES = [
  {
    id: 'phase_1',
    name: '프로토타입 연구소',
    phase: 1,
    subtitle: 'PROTOTYPE LAB',
    desc: '허름한 작업장에서 첫 번째 로켓을 조립하는 단계. 모든 것이 여기서 시작된다.',
    flavorText: '"작은 한 걸음이 위대한 도약의 시작이다."',
    unlockCondition: '게임 시작 시 즉시 활성화',
    targetDesc: '첫 로켓 발사 성공',
    asciiScene: [
      '      /\\',
      '     /  \\         간이 연구소',
      '    /____\\',
      '   | LAB  |',
      '   |______|',
      '                     |',
      '               /─────┴─────\\',
      '              |   ALPHA      |',
      '              |   mk.1       |',
      '              |______________|',
      '                   | | |',
    ].join('\n'),
  },
  {
    id: 'phase_2',
    name: '준궤도 시설',
    phase: 2,
    subtitle: 'SUBORBITAL FACILITY',
    desc: '공장과 조립동이 갖춰진 발사 기지. 카르만 라인(100km)을 목표로 한다.',
    flavorText: '"대기권 경계를 넘어, 우주의 문턱에 서다."',
    unlockCondition: '첫 발사 성공 (launches >= 1)',
    targetDesc: '고도 100km 돌파 (카르만 라인)',
    asciiScene: [
      '  ┌──────────┐   ┌──────────┐',
      '  │  FORGE   │   │ ASSEMBLY │   공장 시설',
      '  │  ░░░░░░  │   │   ████   │',
      '  │  ──────  │   │   ████   │',
      '  └──────────┘   └──────────┘',
      '                    ║',
      '                 ───╫───   ← 발사 레일',
      '                    ║',
      '                 /──┴──\\',
      '                / BETA  \\',
      '               /__mk.2___\\',
      '                 | | |',
    ].join('\n'),
  },
  {
    id: 'phase_3',
    name: '궤도 복합체',
    phase: 3,
    subtitle: 'ORBITAL COMPLEX',
    desc: '안정적인 지구 궤도 진입을 달성한 단계. 궤도 인프라를 구축한다.',
    flavorText: '"지구가 창문 너머로 푸르게 빛나고 있다."',
    unlockCondition: '최고 고도 100km 이상 달성 (카르만선 돌파)',
    targetDesc: '궤도 안정화 (고도 200km+ 발사 3회)',
    asciiScene: [
      '  ═══════════════════════════',
      '    ┌──┐  ┌──────┐  ┌──┐',
      '    │☼ │──│ CORE │──│☼ │  ← 태양 전지판',
      '    └──┘  │ ──── │  └──┘',
      '          │ ▓▓▓▓ │',
      '          └──────┘',
      '              │',
      '           ───┼───  ← 도킹 포트',
      '              │',
      '          ┌───┴───┐',
      '          │HABITAT│',
      '          └───────┘',
      '  ═══════════════════════════',
    ].join('\n'),
  },
  {
    id: 'phase_4',
    name: '시스루나 작전',
    phase: 4,
    subtitle: 'CISLUNAR OPS',
    desc: '달 궤도로 향하는 전이 궤도 진입 단계. 달의 중력권에 도달한다.',
    flavorText: '"달이 점점 가까워진다. 크레이터가 눈에 보인다."',
    unlockCondition: '궤도 안정화 완료 (phase_3 목표 달성)',
    targetDesc: '달 전이 궤도 진입 (고도 384,400km)',
    asciiScene: [
      '    .  *  .  .  *',
      '  *    .    .    *',
      '       .  (  )  .        달 실루엣',
      '      .  (    )  .',
      '        (  ○  )',
      '         (  )',
      '          ()',
      '  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─',
      '       ←  전이 궤도  →',
      '  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─',
      '            ▲',
      '           /|\\   발사체',
      '          / | \\',
    ].join('\n'),
  },
  {
    id: 'phase_5',
    name: '달 표면',
    phase: 5,
    subtitle: 'LUNAR SURFACE',
    desc: '달 표면 착륙을 달성하는 최종 단계. 인류의 새로운 전초기지를 건설한다.',
    flavorText: '"한 사람에게는 작은 한 걸음이지만, 인류에게는 위대한 도약이다."',
    unlockCondition: '달 전이 궤도 진입 (phase_4 목표 달성)',
    targetDesc: '달 표면 착륙 성공',
    asciiScene: [
      '        ___',
      '    ___/   \\___    ← 달 표면 지평선',
      '   /   crater  \\',
      '  /_____________\\',
      '',
      '    /\\     /\\      ← 착륙 다리',
      '   /  \\___/  \\',
      '  | LUNAR BASE |',
      '   \\__________/',
      '  ░░░░░░░░░░░░░░░',
      '  ░░ 달 표면 ░░░░',
      '  ░░░░░░░░░░░░░░░',
    ].join('\n'),
  },
];

// ============================================================
//  TICKER MESSAGES — 티커(뉴스 바) 메시지 (D4-4)
//  category: idle | production | research | assembly | launch | phase | alert
//  condition: null이면 항상 표시 가능, 문자열이면 프로그래밍팀장이 조건 체크
//  text 내 {변수} 플레이스홀더는 런타임에 치환
// ============================================================
const TICKER_MESSAGES = [
  // ── 기본 (idle) — 조건 없이 항상 표시 가능 ─────────────────
  { id: 'tk_idle_01', category: 'idle', text: '>> 시스템 정상 가동 중 — 모든 설비 운영 상태 양호', condition: null },
  { id: 'tk_idle_02', category: 'idle', text: '>> 관제 센터 대기 중 — 다음 발사 지시를 기다리는 중', condition: null },
  { id: 'tk_idle_03', category: 'idle', text: '>> 우주 날씨 양호 — 발사 창(window) 확보 가능', condition: null },
  { id: 'tk_idle_04', category: 'idle', text: '>> 지구 저궤도 위성 트래픽 모니터링 중', condition: null },

  // ── 생산 (production) ─────────────────────────────────────
  { id: 'tk_prod_01', category: 'production', text: '>> 금속 생산량 안정 궤도 진입 — 일일 산출량 증가 추세', condition: 'has_mine' },
  { id: 'tk_prod_02', category: 'production', text: '>> LOX 재고 부족 경고 — 추진제 저장고 보충 필요', condition: 'fuel_low' },
  { id: 'tk_prod_03', category: 'production', text: '>> 전자부품 공급 라인 가동률 {elecEfficiency}% 달성', condition: 'has_elec_lab' },
  { id: 'tk_prod_04', category: 'production', text: '>> 태양광 어레이 출력 정상 — 전체 생산 보너스 적용 중', condition: 'has_solar' },
  { id: 'tk_prod_05', category: 'production', text: '>> 합금공장 효율 업그레이드 가능 — 자원 조건 확인 요망', condition: 'upgrade_available' },

  // ── 연구 (research) ───────────────────────────────────────
  { id: 'tk_res_01', category: 'research', text: '>> 새로운 연구 분야 해금됨 — 연구소에서 확인하세요', condition: 'new_research_available' },
  { id: 'tk_res_02', category: 'research', text: '>> RP 축적 속도 향상 — 현재 {rpRate}/초', condition: 'has_research_lab' },
  { id: 'tk_res_03', category: 'research', text: '>> 핵융합 엔진 연구 데이터 수집 중 — 기대 추력 증가폭 120kN', condition: 'research_near_fusion' },

  // ── 조립 (assembly) ───────────────────────────────────────
  { id: 'tk_asm_01', category: 'assembly', text: '>> 로켓 조립 {assemblyProgress}% 진행 중 — 완성까지 약 {assemblyEta}', condition: 'assembly_in_progress' },
  { id: 'tk_asm_02', category: 'assembly', text: '>> 부품 5종 확보 완료 — 조립 시작 가능', condition: 'all_parts_ready' },
  { id: 'tk_asm_03', category: 'assembly', text: '>> 조립동 슬롯 여유 있음 — 추가 로켓 제작 가능', condition: 'assembly_slot_free' },

  // ── 발사 (launch) ─────────────────────────────────────────
  { id: 'tk_lch_01', category: 'launch', text: '>> 발사 카운트다운 대기 중 — 추진제 충전 완료', condition: 'rocket_ready' },
  { id: 'tk_lch_02', category: 'launch', text: '>> 최근 발사 성공! 도달 고도 {lastAltitude}km 기록', condition: 'last_launch_success' },
  { id: 'tk_lch_03', category: 'launch', text: '>> 누적 발사 {totalLaunches}회 — 기지 명성 상승 중', condition: 'launches_gte_3' },
  { id: 'tk_lch_04', category: 'launch', text: '>> 발사 실패 보고 — 원인 분석 중. 신뢰도 개선 필요', condition: 'last_launch_failed' },

  // ── 페이즈 전환 (phase) ───────────────────────────────────
  { id: 'tk_ph_01', category: 'phase', text: '>> [PHASE 2] 준궤도 시설 가동 개시 — 카르만 라인을 목표로', condition: 'phase_gte_2' },
  { id: 'tk_ph_02', category: 'phase', text: '>> [PHASE 3] 궤도 복합체 건설 진행 — 안정 궤도 확보', condition: 'phase_gte_3' },
  { id: 'tk_ph_03', category: 'phase', text: '>> [PHASE 4] 시스루나 전이 궤도 계산 완료 — 달을 향해', condition: 'phase_gte_4' },
  { id: 'tk_ph_04', category: 'phase', text: '>> [PHASE 5] 달 표면 접근 중 — 착륙 시퀀스 준비', condition: 'phase_gte_5' },

  // ── 경고 (alert) ──────────────────────────────────────────
  { id: 'tk_alert_01', category: 'alert', text: '>> ⚠ 인원 부족 — 건물 가동률 저하. 주거 시설 증설 권장', condition: 'workers_shortage' },
  { id: 'tk_alert_02', category: 'alert', text: '>> ⚠ 자금 고갈 임박 — 운영 센터 추가 건설 또는 발사 수익 확보 필요', condition: 'money_critical' },
];
