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

const BUILDINGS = [
  { id:'housing',      name:'주거 시설',        icon:'[HSG]', produces:'bonus',       baseRate:0,   baseCost:{money:150},                            desc:'인원 상한 +1',      wbClass:'wb-housing' },
  { id:'ops_center',   name:'운영 센터',        icon:'[OPS]', produces:'money',       baseRate:30,  baseCost:{metal:50},                            desc:'수익 창출 허브',    wbClass:'wb-ops' },
  { id:'supply_depot', name:'보급 창고',        icon:'[DEP]', produces:'money',       baseRate:60,  baseCost:{metal:200,electronics:50},             desc:'물류 수익',         wbClass:'wb-ops' },
  { id:'mine',         name:'철광석 채굴기',    icon:'[MIN]', produces:'metal',       baseRate:2.0, baseCost:{money:100},                            desc:'기본 금속 생산',    wbClass:'wb-mine' },
  { id:'extractor',    name:'보크사이트 추출기', icon:'[EXT]', produces:'metal',       baseRate:3.5, baseCost:{money:500,metal:200},                  desc:'고급 금속 추출',    wbClass:'wb-mine' },
  { id:'refinery',     name:'연료 정제소',      icon:'[REF]', produces:'fuel',        baseRate:0.8, baseCost:{money:300,metal:100},                  desc:'LOX/RP-1 생산',    wbClass:'wb-refinery' },
  { id:'cryo_plant',   name:'극저온 플랜트',    icon:'[CRY]', produces:'fuel',        baseRate:2.0, baseCost:{money:1000,metal:400,electronics:100}, desc:'고순도 극저온 연료', wbClass:'wb-refinery' },
  { id:'elec_lab',     name:'전자공학 연구소',  icon:'[PCB]', produces:'electronics', baseRate:0.5, baseCost:{money:400,metal:150},                  desc:'회로 부품 생산',    wbClass:'wb-eleclab' },
  { id:'fab_plant',    name:'반도체 공장',      icon:'[FAB]', produces:'electronics', baseRate:1.8, baseCost:{money:2000,metal:800,electronics:200},  desc:'고급 반도체',       wbClass:'wb-eleclab' },
  { id:'research_lab', name:'연구소',           icon:'[RSH]', produces:'research',    baseRate:0.8, baseCost:{money:300},                             desc:'기술 연구 포인트',  wbClass:'wb-research' },
  { id:'r_and_d',      name:'R&D 센터',         icon:'[RND]', produces:'research',    baseRate:1.2, baseCost:{money:3000,electronics:500},            desc:'고급 연구 가속',    wbClass:'wb-research' },
  { id:'solar_array',  name:'태양광 어레이',    icon:'[SOL]', produces:'bonus',       baseRate:0.1, baseCost:{money:800,electronics:200},             desc:'전체 생산 +10%/개', wbClass:'wb-solar' },
  { id:'launch_pad',   name:'발사대',           icon:'[PAD]', produces:'bonus',       baseRate:0,   baseCost:{money:5000,metal:2000,electronics:500}, desc:'발사 슬롯 +1',     wbClass:'wb-launchpad' },
];

const PARTS = [
  { id:'engine',   name:'엔진',        icon:'[ENG]', cost:{metal:80,fuel:40,electronics:20} },
  { id:'fueltank', name:'연료 탱크',   icon:'[TNK]', cost:{metal:60,fuel:60} },
  { id:'control',  name:'제어 시스템', icon:'[CTL]', cost:{electronics:80,research:30} },
  { id:'hull',     name:'기체 선체',   icon:'[HUL]', cost:{metal:100} },
  { id:'payload',  name:'탑재체',      icon:'[PLD]', cost:{electronics:40,research:50} },
];

const QUALITIES = [
  { id:'proto',    name:'PROTO-MK1', icon:'[P1]', costMult:1.0, timeSec:20,  ispBonus:0,  dryMassMult:1.0,  relBonus:0,  reuseBonus:0,  rewardMult:1.0 },
  { id:'standard', name:'STD-MK2',  icon:'[S2]', costMult:2.0, timeSec:60,  ispBonus:15, dryMassMult:0.95, relBonus:8,  reuseBonus:5,  rewardMult:1.5 },
  { id:'advanced', name:'ADV-MK3',  icon:'[A3]', costMult:4.0, timeSec:120, ispBonus:35, dryMassMult:0.88, relBonus:18, reuseBonus:12, rewardMult:2.5 },
  { id:'elite',    name:'ELITE-MK4',icon:'[E4]', costMult:8.0, timeSec:240, ispBonus:65, dryMassMult:0.78, relBonus:32, reuseBonus:22, rewardMult:4.5 },
];

// Each upgrade has optional 'unlocks' array: strings matching keys in gs.unlocks
const UPGRADES = [
  { id:'hire_worker_1',      name:'기초 인원 채용',   icon:'[HR1]', cost:{research:20},                    req:null,                 desc:'추가 인원 +1명',                effect:()=>{ gs.workers=(gs.workers||1)+1; },                                        unlocks:[] },
  { id:'basic_prod',         name:'기초 생산 기술',   icon:'[BAS]', cost:{research:10},                    req:null,                 desc:'광산·생산 시설 잠금 해제',     effect:()=>{},                                                                       unlocks:['bld_mine'] },
  { id:'drill',              name:'정밀 드릴',         icon:'[DRL]', cost:{research:50},                    req:'basic_prod',         desc:'금속 생산 +25%',               effect:()=>{ prodMult.metal=(prodMult.metal||1)*1.25; },                             unlocks:['bld_extractor'] },
  { id:'fuel_chem',          name:'연료 화학',         icon:'[FUL]', cost:{research:60,metal:50},           req:'basic_prod',         desc:'연료 정제 시설 해금',           effect:()=>{},                                                                       unlocks:['bld_refinery'] },
  { id:'electronics_basics', name:'전자공학 기초',     icon:'[ELB]', cost:{research:80},                    req:'basic_prod',         desc:'전자 시설 해금',               effect:()=>{},                                                                       unlocks:['bld_elec_lab','bld_supply_depot'] },
  { id:'catalyst',           name:'촉매 정제',         icon:'[CAT]', cost:{research:80,fuel:100},           req:'fuel_chem',          desc:'연료 생산 +30%',               effect:()=>{ prodMult.fuel=(prodMult.fuel||1)*1.3; },                               unlocks:['bld_cryo_plant'] },
  { id:'microchip',          name:'마이크로칩',        icon:'[MCH]', cost:{research:100,electronics:80},    req:'electronics_basics', desc:'전자부품 +35%',               effect:()=>{ prodMult.electronics=(prodMult.electronics||1)*1.35; },                 unlocks:['bld_fab_plant','bld_r_and_d'] },
  { id:'automation',         name:'자동화 시스템',     icon:'[AUT]', cost:{research:200,electronics:200},   req:'microchip',          desc:'전체 생산 ×1.5',              effect:()=>{ globalMult*=1.5; },                                                     unlocks:['bld_solar_array'] },
  { id:'alloy',              name:'고강도 합금',       icon:'[ALY]', cost:{research:150,metal:300},         req:'drill',              desc:'부품 비용 -20%',               effect:()=>{ partCostMult*=0.8; },                                                   unlocks:['bld_r_and_d'] },
  { id:'rocket_eng',         name:'로켓 공학 기초',    icon:'[RKT]', cost:{research:200,metal:300},         req:'alloy',              desc:'조립동 해금 + 로켓 제조 시작',  effect:()=>{},                                                                       unlocks:['tab_assembly','bld_launch_pad'] },
  { id:'launch_ctrl',        name:'발사 제어 시스템',  icon:'[LCH]', cost:{research:300,electronics:200},   req:'rocket_eng',         desc:'발사 통제 탭 해금',             effect:()=>{},                                                                       unlocks:['tab_launch'] },
  { id:'mission_sys',        name:'임무 분석 시스템',  icon:'[MIS]', cost:{research:400},                   req:'launch_ctrl',        desc:'미션 현황 탭 해금',             effect:()=>{},                                                                       unlocks:['tab_mission'] },
  { id:'lightweight',        name:'경량 구조',         icon:'[LGT]', cost:{research:250,metal:800},         req:'alloy',              desc:'건조질량 -10%, 재활용 +8%',    effect:()=>{ /* handled in getRocketScience */ } },
  { id:'fusion',             name:'핵융합 엔진',       icon:'[FSN]', cost:{research:500,electronics:400},   req:'automation',         desc:'Isp +22, 추력 +120kN, 문스톤 +1', effect:()=>{ fusionBonus++; } },
  { id:'reliability',        name:'신뢰도 강화',       icon:'[REL]', cost:{research:300},                   req:'microchip',          desc:'발사 신뢰도 +15%',             effect:()=>{ reliabilityBonus+=15; } },
  { id:'multipad',           name:'복수 발사대',       icon:'[MUL]', cost:{research:400,metal:1000},        req:'alloy',              desc:'조립 슬롯 +1',                 effect:()=>{ slotBonus++; } },
  { id:'auto_worker_assign',    name:'인원 자동 재배치',     icon:'[AWA]', cost:{research:150,electronics:100},  req:'automation', desc:'인원 배치 설정을 저장하고 자동으로 최적 배치',   effect:()=>{},                                                                       unlocks:[] },
  { id:'auto_assemble_restart', name:'조립 자동 재시작',     icon:'[AAR]', cost:{research:200,electronics:150},  req:'automation', desc:'발사 후 즉시 다음 조립을 자동으로 시작',          effect:()=>{},                                                                       unlocks:[] },
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
        desc: '운영센터 자금 생산 ×2.0\n부속 업그레이드로 추가 수익 배율',
        effect: { moneyMult: 2.0 },
        upgrades: [
          { id:'inv_derivatives', name:'파생상품 운용',  cost:{money:8000},                   desc:'자금 생산 추가 +40%', mult:1.4 },
          { id:'inv_hedge',       name:'헤지펀드 설립',  cost:{money:25000,electronics:300},  desc:'자금 생산 추가 ×1.8', mult:1.8, req:'inv_derivatives' },
        ],
      },
      {
        id: 'addon_tech_hub',
        name: '기술 스타트업 허브',
        icon: '[HUB]',
        desc: '운영센터 자금 생산 ×1.5\n연구 포인트 자동 발생 +0.5/s',
        effect: { moneyMult: 1.5, rpBonus: 0.5 },
        upgrades: [
          { id:'hub_incubate', name:'인큐베이팅 프로그램', cost:{money:6000,research:100},   desc:'연구 포인트 +0.3/s 추가', rpBonus:0.3 },
          { id:'hub_unicorn',  name:'유니콘 상장',         cost:{money:20000,research:500},  desc:'자금 생산 추가 +30%',     mult:1.3, req:'hub_incubate' },
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
        desc: '발사 신뢰도 +20%\n조립 시간 -15%',
        effect: { rel: 20, timeMult: 0.85 },
        upgrades: [
          { id:'ctrl_ai',         name:'AI 비행 제어',   cost:{electronics:500,research:200},  desc:'신뢰도 +10% 추가', rel:10 },
          { id:'ctrl_autonomous', name:'완전 자율 발사', cost:{electronics:1500,research:800}, desc:'조립 시간 추가 -20%', timeMult:0.8, req:'ctrl_ai' },
        ],
      },
      {
        id: 'addon_vif',
        name: '수직 통합 시설',
        icon: '[VIF]',
        desc: '조립 슬롯 +1\n부품 비용 -15%',
        effect: { slotBonus: 1, partCostReduct: 0.15 },
        upgrades: [
          { id:'vif_print', name:'3D 프린팅 허브', cost:{metal:800,electronics:400},  desc:'부품 비용 추가 -10%', partCostReduct:0.10 },
          { id:'vif_auto',  name:'조립 자동화',    cost:{metal:2000,electronics:1000}, desc:'조립 슬롯 추가 +1', slotBonus:1, req:'vif_print' },
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
    name: '궤도 돌입',
    icon: '[ORB]',
    desc: '발사 고도 200km 이상 달성',
    reward: '문스톤 +5 즉시 지급',
    check: gs => Array.isArray(gs.history) && gs.history.some(h => (h.altitude || 0) >= 200),
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
