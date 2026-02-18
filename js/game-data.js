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
  { id:'ops_center',   name:'운영 센터',        icon:'[OPS]', produces:'money',       baseRate:20,  baseCost:{metal:50},                            desc:'수익 창출 허브',    wbClass:'wb-ops' },
  { id:'supply_depot', name:'보급 창고',        icon:'[DEP]', produces:'money',       baseRate:60,  baseCost:{metal:200,electronics:50},             desc:'물류 수익',         wbClass:'wb-ops' },
  { id:'mine',         name:'철광석 채굴기',    icon:'[MIN]', produces:'metal',       baseRate:1.2, baseCost:{money:100},                            desc:'기본 금속 생산',    wbClass:'wb-mine' },
  { id:'extractor',    name:'보크사이트 추출기', icon:'[EXT]', produces:'metal',       baseRate:3.5, baseCost:{money:500,metal:200},                  desc:'고급 금속 추출',    wbClass:'wb-mine' },
  { id:'refinery',     name:'연료 정제소',      icon:'[REF]', produces:'fuel',        baseRate:0.8, baseCost:{money:300,metal:100},                  desc:'LOX/RP-1 생산',    wbClass:'wb-refinery' },
  { id:'cryo_plant',   name:'극저온 플랜트',    icon:'[CRY]', produces:'fuel',        baseRate:2.0, baseCost:{money:1000,metal:400,electronics:100}, desc:'고순도 극저온 연료', wbClass:'wb-refinery' },
  { id:'elec_lab',     name:'전자공학 연구소',  icon:'[PCB]', produces:'electronics', baseRate:0.5, baseCost:{money:400,metal:150},                  desc:'회로 부품 생산',    wbClass:'wb-eleclab' },
  { id:'fab_plant',    name:'반도체 공장',      icon:'[FAB]', produces:'electronics', baseRate:1.8, baseCost:{money:2000,metal:800,electronics:200},  desc:'고급 반도체',       wbClass:'wb-eleclab' },
  { id:'research_lab', name:'연구소',           icon:'[RSH]', produces:'research',    baseRate:0.4, baseCost:{money:500,electronics:100},             desc:'기술 연구 포인트',  wbClass:'wb-research' },
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
  { id:'proto',    name:'PROTO-MK1', icon:'[P1]', costMult:1.0, timeSec:30,  ispBonus:0,  dryMassMult:1.0,  relBonus:0,  reuseBonus:0,  rewardMult:1.0 },
  { id:'standard', name:'STD-MK2',  icon:'[S2]', costMult:2.0, timeSec:60,  ispBonus:15, dryMassMult:0.95, relBonus:8,  reuseBonus:5,  rewardMult:1.5 },
  { id:'advanced', name:'ADV-MK3',  icon:'[A3]', costMult:4.0, timeSec:120, ispBonus:35, dryMassMult:0.88, relBonus:18, reuseBonus:12, rewardMult:2.5 },
  { id:'elite',    name:'ELITE-MK4',icon:'[E4]', costMult:8.0, timeSec:240, ispBonus:65, dryMassMult:0.78, relBonus:32, reuseBonus:22, rewardMult:4.5 },
];

// Each upgrade has optional 'unlocks' array: strings matching keys in gs.unlocks
const UPGRADES = [
  { id:'basic_prod',         name:'기초 생산 기술',   icon:'[BAS]', cost:{research:10},                    req:null,                 desc:'생산 시설 잠금 해제',          effect:()=>{},                                                                       unlocks:['bld_mine','bld_ops_center'] },
  { id:'drill',              name:'정밀 드릴',         icon:'[DRL]', cost:{research:50},                    req:'basic_prod',         desc:'금속 생산 +25%',               effect:()=>{ prodMult.metal=(prodMult.metal||1)*1.25; },                             unlocks:['bld_extractor'] },
  { id:'fuel_chem',          name:'연료 화학',         icon:'[FUL]', cost:{research:60,metal:50},           req:'basic_prod',         desc:'연료 정제 시설 해금',           effect:()=>{},                                                                       unlocks:['bld_refinery'] },
  { id:'electronics_basics', name:'전자공학 기초',     icon:'[ELB]', cost:{research:80},                    req:'basic_prod',         desc:'전자 시설 해금',               effect:()=>{},                                                                       unlocks:['bld_elec_lab','bld_supply_depot'] },
  { id:'catalyst',           name:'촉매 정제',         icon:'[CAT]', cost:{research:80,fuel:100},           req:'fuel_chem',          desc:'연료 생산 +30%',               effect:()=>{ prodMult.fuel=(prodMult.fuel||1)*1.3; },                               unlocks:['bld_cryo_plant'] },
  { id:'microchip',          name:'마이크로칩',        icon:'[MCH]', cost:{research:100,electronics:80},    req:'electronics_basics', desc:'전자부품 +35%',               effect:()=>{ prodMult.electronics=(prodMult.electronics||1)*1.35; },                 unlocks:['bld_fab_plant'] },
  { id:'automation',         name:'자동화 시스템',     icon:'[AUT]', cost:{research:200,electronics:200},   req:'microchip',          desc:'전체 생산 ×1.5',              effect:()=>{ globalMult*=1.5; },                                                     unlocks:['bld_solar_array'] },
  { id:'alloy',              name:'고강도 합금',       icon:'[ALY]', cost:{research:150,metal:500},         req:'drill',              desc:'부품 비용 -20%',               effect:()=>{ partCostMult*=0.8; },                                                   unlocks:['bld_r_and_d'] },
  { id:'rocket_eng',         name:'로켓 공학 기초',    icon:'[RKT]', cost:{research:200,metal:300},         req:'alloy',              desc:'조립동 해금 + 로켓 제조 시작',  effect:()=>{},                                                                       unlocks:['tab_assembly','bld_launch_pad'] },
  { id:'launch_ctrl',        name:'발사 제어 시스템',  icon:'[LCH]', cost:{research:300,electronics:200},   req:'rocket_eng',         desc:'발사 통제 탭 해금',             effect:()=>{},                                                                       unlocks:['tab_launch'] },
  { id:'mission_sys',        name:'임무 분석 시스템',  icon:'[MIS]', cost:{research:400},                   req:'launch_ctrl',        desc:'미션 현황 탭 해금',             effect:()=>{},                                                                       unlocks:['tab_mission'] },
  { id:'lightweight',        name:'경량 구조',         icon:'[LGT]', cost:{research:250,metal:800},         req:'alloy',              desc:'건조질량 -10%, 재활용 +8%',    effect:()=>{ /* handled in getRocketScience */ } },
  { id:'fusion',             name:'핵융합 엔진',       icon:'[FSN]', cost:{research:500,electronics:400},   req:'automation',         desc:'Isp +22, 추력 +120kN, 문스톤 +1', effect:()=>{ fusionBonus++; } },
  { id:'reliability',        name:'신뢰도 강화',       icon:'[REL]', cost:{research:300},                   req:'microchip',          desc:'발사 신뢰도 +15%',             effect:()=>{ reliabilityBonus+=15; } },
  { id:'multipad',           name:'복수 발사대',       icon:'[MUL]', cost:{research:400,metal:1000},        req:'alloy',              desc:'조립 슬롯 +1',                 effect:()=>{ slotBonus++; } },
];

