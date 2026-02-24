// ============================================================
//  GAME DATA
// ============================================================
const RESOURCES = [
  { id:'money',       name:'돈',       symbol:'$',  icon:'$',  color:'var(--amber)',     iconColor:'var(--amber)' },
  { id:'iron',        name:'철',       symbol:'Fe', icon:'⛏',  color:'var(--green)',     iconColor:'#8899aa' },
  { id:'copper',      name:'구리',     symbol:'Cu', icon:'◎',  color:'#b87333',         iconColor:'#b87333' },
  { id:'fuel',        name:'연료',     symbol:'LOX',icon:'◆',  color:'var(--green)',     iconColor:'#00ccdd' },
  { id:'electronics', name:'전자부품', symbol:'PCB',icon:'⚡', color:'var(--green)',     iconColor:'#ffcc00' },
  { id:'research',    name:'연구',     symbol:'RP', icon:'◇',  color:'var(--green-mid)', iconColor:'#aa88ff' },
  { id:'spaceScore',  name:'탐사 점수', symbol:'★',  icon:'★',  color:'var(--amber)',     iconColor:'var(--amber)' },
];

const OPS_ROLES = [
  { id: 'sales',      name: '영업팀 직원',  maxSlotsPerBld: 3 },
  { id: 'accounting', name: '회계팀 직원',  maxSlotsPerBld: 3 },
  { id: 'consulting', name: '상담팀 직원',  maxSlotsPerBld: 3 },
];

const BLD_STAFF_NAMES = {
  supply_depot:  '물류 직원',
  mine:          '제철 직원',
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

const BLD_STAFF_ICONS = {
  housing:      '<span class="wk-icon wk-housing">&#x1F465;</span>',
  ops_center:   '<span class="wk-icon wk-ops">&#x229E;</span>',
  supply_depot: '<span class="wk-icon wk-supply">&#x25A4;</span>',
  mine:         '<span class="wk-icon wk-mine">&#x25C8;</span>',
  extractor:    '<span class="wk-icon wk-extract">&#x2B21;</span>',
  refinery:     '<span class="wk-icon wk-refinery">&#x2699;</span>',
  cryo_plant:   '<span class="wk-icon wk-cryo">&#x2745;</span>',
  elec_lab:     '<span class="wk-icon wk-elec">&#x26A1;</span>',
  fab_plant:    '<span class="wk-icon wk-fab">&#x2B1B;</span>',
  research_lab: '<span class="wk-icon wk-rsc">&#x2B21;</span>',
  r_and_d:      '<span class="wk-icon wk-rnd">&#x2605;</span>',
  solar_array:  '<span class="wk-icon wk-solar">&#x25CE;</span>',
  launch_pad:   '<span class="wk-icon wk-launch">&#x25B2;</span>',
};

const SPECIALIST_ROLES = {
  research_lab: [
    { id:'experiment', name:'실험 전문가',   iconCls:'sp-exp',  desc:'연구 포인트 생산 +25%/명',    effect:'res_research_mult', val:0.25, unlockResearch:'spec_experiment', cost:{money:50000} },
    { id:'analyst',    name:'데이터 분석가', iconCls:'sp-data', desc:'모든 자원 생산 +8%/명',       effect:'all_prod_mult',     val:0.08, unlockResearch:'spec_analyst',    cost:{money:80000} },
  ],
  ops_center: [
    { id:'sales_pro',  name:'영업 전문가',   iconCls:'sp-sales', desc:'자금 수입 +20%/명',          effect:'money_mult',    val:0.20, unlockResearch:'spec_sales_pro', cost:{money:30000} },
    { id:'sysadmin',   name:'시스템 관리자', iconCls:'sp-sys',   desc:'(미구현) 건물 유지비 -15%/명', effect:'upkeep_reduce', val:0.15, unlockResearch:'spec_sysadmin',  cost:{money:40000} },
  ],
};

const BUILDINGS = [
  { id:'housing',      name:'주거 시설',        icon:'[HSG]', produces:'bonus',       baseRate:0,   baseCost:{money:200},                                    desc:'인원 상한 +1',      wbClass:'wb-housing' },
  { id:'ops_center',   name:'운영 센터',        icon:'[OPS]', produces:'money',       baseRate:35,  baseCost:{money:300},                                   desc:'수익 창출 허브',    wbClass:'wb-ops' },
  { id:'supply_depot', name:'보급 창고',        icon:'[DEP]', produces:'money',       baseRate:25,  baseCost:{money:3000,iron:500,electronics:150},          desc:'물류 수익',         wbClass:'wb-ops' },
  { id:'mine',         name:'제철소',           icon:'[MIN]', produces:'iron',        baseRate:25,  baseCost:{money:800},                                    desc:'철 생산',           wbClass:'wb-mine' },
  { id:'extractor',    name:'구리 채굴기',      icon:'[EXT]', produces:'copper',      baseRate:40,  baseCost:{money:6000,iron:1500},                         desc:'구리 채굴 — MK2+ 필요', wbClass:'wb-mine' },
  { id:'refinery',     name:'연료 정제소',      icon:'[REF]', produces:'fuel',        baseRate:20,  baseCost:{money:10000,iron:2500},                        desc:'LOX/RP-1 생산',    wbClass:'wb-refinery' },
  { id:'cryo_plant',   name:'극저온 플랜트',    icon:'[CRY]', produces:'fuel',        baseRate:35,  baseCost:{money:15000,iron:4000,electronics:800},        desc:'고순도 극저온 연료', wbClass:'wb-refinery' },
  { id:'elec_lab',     name:'전자공학 연구소',  icon:'[PCB]', produces:'electronics', baseRate:18,  baseCost:{money:18000,iron:4000},                        desc:'회로 부품 생산',    wbClass:'wb-eleclab' },
  { id:'fab_plant',    name:'반도체 공장',      icon:'[FAB]', produces:'electronics', baseRate:35,  baseCost:{money:25000,iron:6000,electronics:1500},       desc:'고급 반도체',       wbClass:'wb-eleclab' },
  { id:'research_lab', name:'연구소',           icon:'[RSH]', produces:'research',    baseRate:1,   baseCost:{money:2000},                                   desc:'기술 연구 포인트',  wbClass:'wb-research' },
  { id:'r_and_d',      name:'R&D 센터',         icon:'[RND]', produces:'research',    baseRate:25,  baseCost:{money:40000,electronics:3000},                 desc:'고급 연구 가속',    wbClass:'wb-research' },
  { id:'solar_array',  name:'태양광 어레이',    icon:'[SOL]', produces:'bonus',       baseRate:0.1, baseCost:{money:35000,electronics:4000},                 desc:'전체 생산 +10%/개', wbClass:'wb-solar' },
  { id:'launch_pad',   name:'발사대',           icon:'[PAD]', produces:'bonus',       baseRate:0,   baseCost:{money:120000,iron:25000,electronics:10000},    desc:'발사 슬롯 +1',     wbClass:'wb-launchpad' },
];

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
