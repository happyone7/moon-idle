
// ─── P4-5: RESEARCH ASCII ART PANELS (embedded from mockups/ascii-art/research/) ──
const RESEARCH_ASCII_ART = {
  // Structure branch
  basic_prod: `    ___  WELDING ARC  ___
   |   |     *      |   |
   | W |    /|\\     | W |
   | O |   / | \\    | O |
   | R |  *  |  *   | R |
   | K |.'*'.|.'*'. | K |
   |   |=====+=====||   |
   |___|  BASEPLATE |___|
    )))  SPARK  (((
   *  * TEMP: 3200C *  *`,
  drill: `   +--- CNC MILL ----+
   |  [SPINDLE]  RPM  |
   |    ||    ||  14000  |
   |    ||====||         |
   |  --||----||--       |
   |    ||####||  cut    |
   |  +-||====||-+       |
   |  |AL-6061 | feed->  |
   |  |########|         |
   |  +--------+         |
   +-------------------+
   TOLERANCE: +/-0.02mm`,
  alloy: `  ///////  <- 0 deg ply
 ///////
///////
=======  <- 90 deg ply
=======
=======
 \\\\\\\\\\  <- +/-45 deg ply
  \\\\\\\\
-----------------------
 LAYUP: 8 plies  RESIN
 VACUUM BAG  -0.9 bar
[CURE 140C ####-- 67%]`,

  // Propulsion branch
  fuel_chem: `  +==================+
  ||  COMBUSTION CHMB ||
  ||   +----------+   ||
  ||   | O2 -> <- |   ||
  ||   |    **    F|   ||
  ||   |   *##*   U|   ||
  ||   |  *####*  E|   ||
  ||   | *######* L|   ||
  ||   +----||-----+   ||
  ||        ||  THROAT  ||
  +==========+=========+
  PRESS: 210 bar  FLAME`,
  catalyst: `     +-----------+
     | TURBOPUMP |
  ---|  .  *  .  |---
  IN | * \\|/ *   |OUT
  >> |  --O--    |>>
     | * /|\\ *   |
  ---|  *  .  *  |---
     | IMPELLER  |
     +-----||----+
       +=====+===+
       | SHAFT   |
       +=========+
  RPM: 34,000  FLOW OK`,

  // Electronics branch
  electronics_basics: `      +----------+
      |  GIMBAL  |
   +==|===+===|==+
   |  | +---+ |  |
   |--| | O | |--|
   |  | +---+ |  |
   +==|===+===|==+
      |  ROTOR |
      +----||--+
        +==++==+
        |AXIS  |
        +=====+
  SPIN: 12,000 RPM LOCK`,
  microchip: `  ======================
  .... OUTER SHIELD ....
  ----------------------
  #### AEROGEL ########
  #### BLANKET ########
  ----------------------
  .... INNER SKIN .....
  ======================
  HEAT FLUX >>> BLOCKED
  K = 0.015 W/(m*K)`,

  // Advanced
  rocket_eng: `       +===+
      +|   |+  COOLANT
     +| ~  ~|+ CHANNELS
    +|~ || ~ |+   vv
   +| ~ || ~  |+
  |  ~  ||  ~   |<- wall
  |~ IN || OUT ~|
   +| ~ +| ~ |+
    +|~  v  ~|+
     +| vvv|+ EXHAUST
      +======+
  REGEN TEMP DELTA: 820C`,
  launch_ctrl: `        /\\
       /  \\    RADAR
      / /\\ \\   DISH
     / /  \\ \\
    /-/----\\-\\
   +==+====+==+
   |  +----+  |
   |  | RX |  |
   |  | TX |  |
   |  +----+  |
   +==========+
  TRACK: 2.4GHz  LOCK
  RANGE: 384,400 km`,

  // Default lab visualization for techs without specific art
  _default: `  RESEARCH LABORATORY
  ========================
  +============+ +======+
  | TERMINAL A | |SAMPLE|
  | >_ RUN SIM | | {##} |
  | >_ COMPILE | +======+
  +============+
  [CPU 94%]  [POWER: 4.2kW]
  STATUS: IN PROGRESS`,
};

// ─── ASCII TECH VISUALIZATIONS ──────────────────────────────
const TECH_VIZ = {
  hire_worker_1:      { lines: ['▓▓▓▓▓▓▓▓▓ ← 인력 풀', '▓▓▓▓▓▓▓ ← 교육 기간', '▓▓▓▓▓▓▓▓▓▓ ← 역량'],   stat: '+1 WORKER' },
  basic_prod:         { lines: ['▓▓▓▓▓▓▓▓▓▓ ← 기초 인프라', '▓▓▓▓▓▓▓▓ ← 생산 라인', '▓▓▓▓▓ ← 자동화'], stat: 'MINE UNLOCK' },
  drill:              { lines: ['▓▓▓▓▓▓▓▓▓▓ ← 드릴 강도', '▓▓▓▓▓▓▓▓ ← 관통력', '▓▓▓▓▓▓▓▓▓ ← 굴착 속도'], stat: '+25% METAL' },
  fuel_chem:          { lines: ['▓▓▓▓▓▓▓▓▓ ← 반응 효율', '▓▓▓▓▓▓▓ ← 촉매량', '▓▓▓▓▓▓▓▓ ← 정제율'], stat: 'REFINERY UNLOCK' },
  electronics_basics: { lines: ['▓▓▓▓▓▓▓▓▓ ← 회로 설계', '▓▓▓▓▓▓▓ ← 납땜 기술', '▓▓▓▓▓▓▓▓ ← QC 기준'], stat: 'PCB LAB UNLOCK' },
  catalyst:           { lines: ['▓▓▓▓▓▓▓▓▓▓ ← 촉매 농도', '▓▓▓▓▓▓▓▓▓ ← 반응기 효율', '▓▓▓▓▓▓▓▓ ← 순도'], stat: '+30% FUEL' },
  microchip:          { lines: ['▓▓▓▓▓▓▓▓▓▓ ← 트랜지스터', '▓▓▓▓▓▓▓▓▓ ← 집적도', '▓▓▓▓▓▓▓ ← 전력 소비'], stat: '+35% ELECTRONICS' },
  automation:         { lines: ['▓▓▓▓▓▓▓▓▓▓ ← 자동화율', '▓▓▓▓▓▓▓▓▓▓ ← 처리량', '▓▓▓▓▓▓▓▓▓ ← 효율'], stat: '×1.5 ALL OUTPUT' },
  alloy:              { lines: ['▓▓▓▓▓▓▓▓▓▓ ← 인장 강도', '▓▓▓▓▓▓▓▓ ← 내열성', '▓▓▓▓▓▓▓▓▓ ← 경량비'], stat: '-20% PART COST' },
  rocket_eng:         { lines: ['▓▓▓▓▓▓▓▓▓ ← 추진 설계', '▓▓▓▓▓▓▓▓▓▓ ← 구조 해석', '▓▓▓▓▓▓▓ ← 시험 횟수'], stat: 'ASSEMBLY UNLOCK' },
  launch_ctrl:        { lines: ['▓▓▓▓▓▓▓▓▓ ← 텔레메트리', '▓▓▓▓▓▓▓▓▓ ← 비행 S/W', '▓▓▓▓▓▓▓▓ ← GO/NOGO'], stat: 'LAUNCH TAB UNLOCK' },
  mission_sys:        { lines: ['▓▓▓▓▓▓▓▓▓▓ ← 궤도 계산', '▓▓▓▓▓▓▓▓ ← 탑재체 최적화', '▓▓▓▓▓▓▓▓▓ ← 임무 계획'], stat: 'MISSION TAB UNLOCK' },
  lightweight:        { lines: ['▓▓▓▓▓▓▓▓▓▓ ← 티타늄 구조', '▓▓▓▓▓▓▓▓▓ ← MLI 레이어', '▓▓▓▓▓▓▓▓ ← 구조재'], stat: '-10% DRY MASS' },
  fusion:             { lines: ['▓▓▓▓▓▓▓▓▓▓▓ ← 플라즈마', '▓▓▓▓▓▓▓▓▓▓ ← 자기 봉입', '▓▓▓▓▓▓▓▓▓ ← 중성자'], stat: '+22 ISP / +120kN' },
  reliability:        { lines: ['▓▓▓▓▓▓▓▓▓▓ ← 배선 품질', '▓▓▓▓▓▓▓▓▓ ← 이중화', '▓▓▓▓▓▓▓▓▓▓ ← 테스트 커버'], stat: '+15% RELIABILITY' },
  multipad:           { lines: ['▓▓▓▓▓▓▓▓▓ ← 발사대 추가', '▓▓▓▓▓▓▓▓▓▓ ← 가트리 시스템', '▓▓▓▓▓▓▓▓ ← 연결부'], stat: '+1 ASSEMBLY SLOT' },
  auto_worker_assign: { lines: ['▓▓▓▓▓▓▓▓▓▓ ← 배치 알고리즘', '▓▓▓▓▓▓▓▓▓ ← 인원 최적화', '▓▓▓▓▓▓▓▓ ← 스케줄링'], stat: 'AUTO WORKER' },
  auto_assemble_restart: { lines: ['▓▓▓▓▓▓▓▓▓ ← 공정 자동화', '▓▓▓▓▓▓▓▓▓▓ ← 조립 시퀀서', '▓▓▓▓▓▓▓▓ ← 재시작 로직'], stat: 'AUTO ASSEMBLE' },
};

// Legacy compat stubs
const TIER_GROUPS = [];
function buyUpgrade(uid) { startResearch(uid); }
function selectTech(uid) { /* legacy stub */ }
function selectTech2(uid) { /* legacy stub */ }
function _updateTechDetailBtnState() { /* legacy stub */ }
function renderTechDetail(uid) { /* legacy stub */ }

// ============================================================
//  RENDER: RESEARCH TAB — branch column layout
// ============================================================
function renderResearchTab() {
  const layout = document.getElementById('research-layout');
  if (!layout) return;

  const prod = getProduction();
  const rpRate = prod.research || 0;
  const researchedCount = Object.keys(gs.upgrades).filter(k => gs.upgrades[k]).length;
  const activeCount = gs.researchProgress ? Object.keys(gs.researchProgress).length : 0;

  // ── TOP BAR: RP 현황 ────────────────────────────────────
  const topbarHtml = `<div class="rsh-topbar">
  <span>RP <b>${fmt(gs.res.research || 0)}</b></span>
  <span>+${fmtDec(rpRate,2)}/s</span>
  <span>완료 ${researchedCount}/${UPGRADES.length}</span>
  ${activeCount > 0 ? `<span style="color:var(--amber)">진행 중 ${activeCount}</span>` : ''}
</div>`;

  // ── BRANCH COLUMNS ──────────────────────────────────────
  let branchesHtml = '';
  RESEARCH_BRANCHES.forEach(branch => {
    let cardsHtml = '';

    branch.nodes.forEach((uid, idx) => {
      const upg = UPGRADES.find(u => u.id === uid);
      if (!upg) return;

      const purchased  = !!gs.upgrades[uid];
      const inProgress = !!(gs.researchProgress && gs.researchProgress[uid]);
      const reqMet     = !upg.req || !!gs.upgrades[upg.req];

      // Card state
      let cardClass, stateHtml;
      if (purchased) {
        cardClass = 'rsh-bcard-complete';
        stateHtml = `<div class="rsh-bc-status">✓ 완료</div>`;
      } else if (inProgress) {
        const prog = gs.researchProgress[uid];
        const rpTotal = upg.cost.research || 1;
        const pct = Math.min(100, Math.floor((prog.rpSpent / rpTotal) * 100));
        cardClass = 'rsh-bcard-progress';
        stateHtml = `<div class="rsh-bc-bar"><div class="rsh-bc-bar-fill" style="width:${pct}%"></div></div>
<div class="rsh-bc-status">${pct}% · RP ${fmt(prog.rpSpent)}/${fmt(rpTotal)}</div>`;
      } else if (reqMet) {
        const rpCost = upg.cost.research || 0;
        cardClass = 'rsh-bcard-available';
        stateHtml = `<div class="rsh-bc-cost">RP ${fmt(rpCost)}</div>`;
      } else {
        cardClass = 'rsh-bcard-locked';
        stateHtml = `<div class="rsh-bc-status">\u{1F512} 잠금</div>`;
      }

      // Display ID (e.g. S01, P02)
      const displayId = upg.icon;

      // Arrow before card (except first)
      if (idx > 0) {
        const arrowColor = purchased ? 'var(--green)' : inProgress ? 'var(--amber)' : 'var(--green-dim)';
        cardsHtml += `<div class="rsh-branch-arrow" style="color:${arrowColor}">│</div>`;
      }

      const clickAttr = (!purchased && !inProgress && reqMet)
        ? `onclick="startResearch('${uid}')" style="cursor:pointer"`
        : '';

      cardsHtml += `<div class="${cardClass}" ${clickAttr}>
  <div class="rsh-bc-hd"><span class="rsh-bc-id">${displayId}</span> ${upg.name}</div>
  <div class="rsh-bc-desc">${upg.desc}</div>
  ${stateHtml}
</div>`;
    });

    branchesHtml += `<div class="rsh-branch-col">
  <div class="rsh-branch-hd">${branch.id} · ${branch.label}</div>
  ${cardsHtml}
</div>`;
  });

  layout.innerHTML = `${topbarHtml}
<div class="rsh-branches-row">
  ${branchesHtml}
</div>`;
}
