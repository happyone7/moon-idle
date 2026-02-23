
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
  // D6: Branch O 8개 자동화 연구
  auto_worker:   { lines: ['▓▓▓▓▓▓▓▓▓▓ ← 배치 알고리즘', '▓▓▓▓▓▓▓▓▓ ← 인원 최적화', '▓▓▓▓▓▓▓▓ ← 스케줄링'], stat: 'AUTO WORKER' },
  auto_build:    { lines: ['▓▓▓▓▓▓▓▓▓ ← 건설 관리 AI', '▓▓▓▓▓▓▓▓▓▓ ← 우선순위 엔진', '▓▓▓▓▓▓▓▓ ← 예산 최적화'], stat: 'AUTO BUILD' },
  auto_parts:    { lines: ['▓▓▓▓▓▓▓▓▓▓ ← 공정 자동화', '▓▓▓▓▓▓▓▓▓ ← 부품 스케줄러', '▓▓▓▓▓▓▓▓ ← 자원 유보'], stat: 'AUTO PARTS' },
  auto_assembly: { lines: ['▓▓▓▓▓▓▓▓▓ ← 조립 시퀀서', '▓▓▓▓▓▓▓▓▓▓ ← 품질 선택 AI', '▓▓▓▓▓▓▓▓ ← 조건부 규칙'], stat: 'AUTO ASSEMBLY' },
  auto_fuel:     { lines: ['▓▓▓▓▓▓▓▓▓▓ ← 주입 밸브 제어', '▓▓▓▓▓▓▓▓▓ ← 압력 모니터', '▓▓▓▓▓▓▓▓ ← 유보량 관리'], stat: 'AUTO FUEL' },
  auto_launch:   { lines: ['▓▓▓▓▓▓▓▓▓ ← 발사 판정 AI', '▓▓▓▓▓▓▓▓▓▓ ← 성공률 분석', '▓▓▓▓▓▓▓▓ ← 쿨다운 관리'], stat: 'AUTO LAUNCH' },
  auto_research: { lines: ['▓▓▓▓▓▓▓▓▓▓ ← 연구 큐 관리', '▓▓▓▓▓▓▓▓▓ ← 우선순위 엔진', '▓▓▓▓▓▓▓▓ ← 자원 예약'], stat: 'AUTO RESEARCH' },
  auto_prestige: { lines: ['▓▓▓▓▓▓▓▓▓ ← 프레스티지 판정', '▓▓▓▓▓▓▓▓▓▓ ← EP/SS 분석', '▓▓▓▓▓▓▓▓ ← 자동 리셋'], stat: 'AUTO PRESTIGE' },
};

// Legacy compat stubs
const TIER_GROUPS = [];
function buyUpgrade(uid) { startResearch(uid); }
function selectTech2(uid) { /* legacy stub */ }
function _updateTechDetailBtnState() { /* legacy stub */ }
function renderTechDetail(uid) { /* legacy stub */ }

// ─── 기술 선택 함수 ─────────────────────────────────────
function selectTech(uid) {
  if (typeof gs !== 'undefined') gs.selectedTech = uid;
  renderResearchTab();
}

// ─── 연구 취소 함수 (활성 + 예약 큐 모두 처리) ──────────
function cancelResearch(uid) {
  // 활성 연구 취소 — 진행도 보존
  if (gs.researchProgress && gs.researchProgress[uid]) {
    if (!gs.researchPaused) gs.researchPaused = {};
    gs.researchPaused[uid] = gs.researchProgress[uid]; // 진행도 저장
    delete gs.researchProgress[uid];
    if (gs.selectedTech === uid) gs.selectedTech = null;
    notify('연구 일시정지 (진행도 보존)', 'amber');
    // 예약 큐에서 다음 연구 자동 시작
    _startNextQueued();
    renderAll();
    return;
  }
  // 예약 큐 취소
  if (gs.researchQueue && gs.researchQueue.includes(uid)) {
    gs.researchQueue = gs.researchQueue.filter(q => q !== uid);
    notify('예약 취소됨', 'red');
    renderAll();
    return;
  }
}

// ============================================================
//  RENDER: RESEARCH TAB — 3-column full layout
// ============================================================
function renderResearchTab() {
  const layout = document.getElementById('research-layout');
  if (!layout) return;

  const prod = getProduction();
  const rpRate = prod.research || 0;
  const researchedCount = Object.keys(gs.upgrades).filter(k => gs.upgrades[k]).length;
  const activeIds = gs.researchProgress ? Object.keys(gs.researchProgress) : [];
  const researchQueue = Array.isArray(gs.researchQueue) ? gs.researchQueue : [];
  const selectedUid = gs.selectedTech || null;

  // ── 좌측: 연구 현황 (활성 1슬롯 + 예약 큐 3슬롯) ─────────
  let queueHtml = `<div class="rsh-queue-header">// 연구 현황</div>`;

  // 활성 슬롯
  queueHtml += `<div class="rsh-queue-section-label">■ 활성 [${activeIds.length}/1]</div>`;
  if (activeIds.length === 0) {
    queueHtml += `<div class="rsh-queue-empty">대기 중 — 연구 없음</div>`;
  } else {
    activeIds.forEach(uid => {
      const upg = UPGRADES.find(u => u.id === uid);
      if (!upg) return;
      const prog = gs.researchProgress[uid];
      const techTime = (upg.time || 60) * (typeof researchTimeMult !== 'undefined' ? researchTimeMult : 1);
      const timeSpent = prog.timeSpent || 0;
      const pct = Math.min(100, Math.floor((timeSpent / techTime) * 100));

      // branch 이름 찾기
      let branchLabel = '';
      RESEARCH_BRANCHES.forEach(b => { if (b.nodes.includes(uid)) branchLabel = b.label; });

      // ETA
      let etaStr = '';
      if (typeof getResearchETA === 'function') {
        const etaSec = getResearchETA(uid);
        if (!isFinite(etaSec)) etaStr = '일시정지 — RP 없음';
        else {
          const h = Math.floor(etaSec / 3600);
          const m = Math.floor((etaSec % 3600) / 60);
          const s = Math.floor(etaSec % 60);
          etaStr = 'ETA: ' + (h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`);
        }
      }

      // ASCII 아트
      const asciiArt = (RESEARCH_ASCII_ART && (RESEARCH_ASCII_ART[uid] || RESEARCH_ASCII_ART._default)) || '';
      const asciiHtml = asciiArt
        ? `<div class="rsh-ascii-panel"><pre class="rsh-ascii-art">${asciiArt}</pre><div class="rsh-ascii-scanline"></div></div>`
        : '';

      const amberBar = branchLabel === '열보호' ? ' amber-fill' : '';

      queueHtml += `<div class="rsh-queue-item rsh-queue-active">
  <div class="rsh-queue-item-hd">${upg.icon} ${upg.name}</div>
  <div class="rsh-queue-item-branch">${branchLabel} 브랜치</div>
  ${asciiHtml}
  <div class="rsh-bc-bar"><div class="rsh-bc-bar-fill${amberBar}" style="width:${pct}%"></div></div>
  <div style="font-size:10px;color:var(--green-mid);margin-top:3px">${pct}% · ${etaStr}</div>
  <span class="rsh-queue-cancel" onclick="cancelResearch('${uid}')">■ 취소</span>
</div>`;
    });
  }

  // 예약 큐 슬롯
  queueHtml += `<div class="rsh-queue-section-label" style="margin-top:8px">▷ 예약 큐 [${researchQueue.length}/3]</div>`;
  if (researchQueue.length === 0) {
    queueHtml += `<div class="rsh-queue-empty" style="font-size:9px;padding:4px 0">예약된 연구 없음</div>`;
  } else {
    researchQueue.forEach((uid, idx) => {
      const upg = UPGRADES.find(u => u.id === uid);
      if (!upg) return;
      const timeMin = Math.ceil((upg.time || 60) / 60);
      queueHtml += `<div class="rsh-queue-item rsh-queue-reserved">
  <div class="rsh-queue-item-hd"><span style="color:var(--amber);margin-right:4px">${idx + 1}.</span>${upg.icon} ${upg.name}</div>
  <div class="rsh-queue-item-branch" style="color:var(--green-dim)">~${timeMin}분 · 대기 중</div>
  <span class="rsh-queue-cancel" onclick="cancelResearch('${uid}')">■ 취소</span>
</div>`;
    });
    // 빈 슬롯 표시
    for (let i = researchQueue.length; i < 3; i++) {
      queueHtml += `<div class="rsh-queue-slot-empty">[ 빈 슬롯 ${i + 1} ]</div>`;
    }
  }

  // RP 생산 현황
  const labCount = gs.buildings.research_lab || 0;
  queueHtml += `<div class="rsh-rp-panel" style="margin-top:8px">
  RP: <b>${fmt(gs.res.research || 0)}</b> (+${fmtDec(rpRate,2)}/s)<br>
  ${labCount > 0 ? `연구소 ×${labCount}` : '연구소 없음'}
  · 완료 ${researchedCount}/${UPGRADES.length}
</div>`;

  // ── 중앙: 기술 브랜치 컬럼 ───────────────────────────────
  let branchesHtml = '';
  RESEARCH_BRANCHES.forEach(branch => {
    if (branch.locked) return;  // locked 브랜치 전체 스킵

    let cardsHtml = '';

    branch.nodes.forEach((uid, idx) => {
      const upg = UPGRADES.find(u => u.id === uid);
      if (!upg) return;

      const purchased  = !!gs.upgrades[uid];
      const inProgress = !!(gs.researchProgress && gs.researchProgress[uid]);
      const reqMet     = !upg.req || !!gs.upgrades[upg.req];
      const isSelected = uid === selectedUid;

      let cardClass, stateHtml;
      if (purchased) {
        cardClass = 'rsh-bcard-complete';
        stateHtml = `<div class="rsh-bc-status">✓ 완료</div>`;
      } else if (inProgress) {
        // 진행 중은 좌측 큐에서 표시 — 중앙에선 간략히
        const prog = gs.researchProgress[uid];
        const techTime = upg.time || 60;
        const pct = Math.min(100, Math.floor(((prog.timeSpent || 0) / techTime) * 100));
        const amberBar = branch.id === 'T' ? ' amber-fill' : '';
        cardClass = 'rsh-bcard-progress';
        stateHtml = `<div class="rsh-bc-bar" style="margin-top:4px"><div class="rsh-bc-bar-fill${amberBar}" style="width:${pct}%"></div></div>
<div class="rsh-bc-status">${pct}% 진행 중</div>`;
      } else if (reqMet) {
        cardClass = 'rsh-bcard-available' + (isSelected ? ' rsh-bcard-selected' : '');
        const rpCost = upg.cost.research || 0;
        const timeMin = Math.ceil((upg.time || 60) / 60);
        stateHtml = `<div class="rsh-bc-cost">RP ${fmt(rpCost)} · ~${timeMin}분</div>`;
      } else {
        cardClass = 'rsh-bcard-locked';
        stateHtml = `<div class="rsh-bc-status">\u{1F512} 잠금</div>`;
      }

      if (idx > 0) {
        const arrowColor = purchased ? 'var(--green)' : inProgress ? 'var(--amber)' : 'var(--green-dim)';
        cardsHtml += `<div class="rsh-branch-arrow" style="color:${arrowColor}">│</div>`;
      }

      // 클릭: 선택 (구매된 카드 제외)
      const clickAttr = (!purchased) ? `onclick="selectTech('${uid}')" style="cursor:pointer"` : '';

      cardsHtml += `<div class="${cardClass}" ${clickAttr}>
  <div class="rsh-bc-hd"><span class="rsh-bc-id">${upg.icon}</span> ${upg.name}</div>
  <div class="rsh-bc-desc">${upg.desc}</div>
  ${stateHtml}
</div>`;
    });

    branchesHtml += `<div class="rsh-branch-col" data-branch="${branch.id}">
  <div class="rsh-branch-hd">${branch.id} · ${branch.label}</div>
  ${cardsHtml}
</div>`;
  });

  // 완료된 기술 목록 (하단)
  const completedList = UPGRADES.filter(u => gs.upgrades[u.id]);
  let completedHtml = '';
  if (completedList.length > 0) {
    completedHtml = `<div class="rsh-completed-strip">
  <span style="color:var(--green-mid);font-size:10px">// COMPLETED TECHNOLOGIES — ${completedList.length}개 완료</span>
  <div style="margin-top:4px;display:flex;flex-wrap:wrap;gap:4px">
    ${completedList.map(u => `<span style="font-size:9px;color:var(--green);border:1px solid var(--green-dim);padding:1px 5px;border-radius:2px">${u.icon} ${u.name}</span>`).join('')}
  </div>
</div>`;
  }

  // ── 우측: 기술 상세 패널 ──────────────────────────────────
  let detailHtml = '';
  if (selectedUid) {
    const upg = UPGRADES.find(u => u.id === selectedUid);
    if (upg) {
      const purchased  = !!gs.upgrades[selectedUid];
      const inProgress = !!(gs.researchProgress && gs.researchProgress[selectedUid]);
      const inQueue    = researchQueue.includes(selectedUid);
      const reqMet     = !upg.req || !!gs.upgrades[upg.req];

      // 비용 표시
      const costParts = Object.entries(upg.cost).map(([r, v]) => {
        const res = (typeof RESOURCES !== 'undefined' ? RESOURCES : []).find(x => x.id === r);
        const label = res ? res.name : r;
        return `${label}: ${fmt(v)}`;
      }).join(' / ');

      // 소요 시간
      const techTime = upg.time || 60;
      const timeMin = Math.floor(techTime / 60);
      const timeSec = techTime % 60;
      const timeStr = timeMin > 0 ? `${timeMin}분 ${timeSec > 0 ? timeSec + '초' : ''}` : `${timeSec}초`;

      // 선행 기술
      const reqUpgName = upg.req ? (UPGRADES.find(u => u.id === upg.req) || {}).name || upg.req : null;
      const reqHtml = upg.req
        ? `<div class="rsh-detail-value">${reqUpgName} ${gs.upgrades[upg.req] ? '✓' : '✗ 미완료'}</div>`
        : `<div class="rsh-detail-value">없음</div>`;

      // 버튼 상태
      let btnHtml = '';
      if (purchased) {
        btnHtml = `<div class="rsh-detail-btn" disabled style="opacity:0.4;cursor:default">✓ 연구 완료</div>`;
      } else if (inProgress) {
        btnHtml = `<div class="rsh-detail-btn" disabled style="opacity:0.4;cursor:default">▶ 연구 진행 중</div>
<div class="rsh-detail-btn rsh-btn-cancel" onclick="cancelResearch('${selectedUid}')">■ 연구 취소</div>`;
      } else if (inQueue) {
        const qPos = researchQueue.indexOf(selectedUid) + 1;
        btnHtml = `<div class="rsh-detail-btn" disabled style="opacity:0.4;cursor:default">📋 예약 중 (${qPos}번째)</div>
<div class="rsh-detail-btn rsh-btn-cancel" onclick="cancelResearch('${selectedUid}')">■ 예약 취소</div>`;
      } else if (!reqMet) {
        btnHtml = `<div class="rsh-detail-btn" disabled style="opacity:0.4;cursor:default">🔒 선행 기술 필요</div>`;
      } else if (activeIds.length === 0) {
        btnHtml = `<div class="rsh-detail-btn" onclick="startResearch('${selectedUid}');renderAll()">▶ 연구 시작</div>`;
      } else if (researchQueue.length < 3) {
        btnHtml = `<div class="rsh-detail-btn rsh-btn-queue" onclick="startResearch('${selectedUid}');renderAll()">📋 예약 추가 (${researchQueue.length + 1}/3)</div>`;
      } else {
        btnHtml = `<div class="rsh-detail-btn" disabled style="opacity:0.4;cursor:default">예약 슬롯 가득 (3/3)</div>`;
      }

      detailHtml = `<div class="rsh-detail-panel">
  <div class="rsh-detail-title">${upg.name}</div>
  <div class="rsh-detail-id">${upg.icon} — ${upg.desc}</div>

  <div class="rsh-detail-section">
    <div class="rsh-detail-label">비용</div>
    <div class="rsh-detail-value">${costParts}</div>
  </div>

  <div class="rsh-detail-section">
    <div class="rsh-detail-label">소요 시간</div>
    <div class="rsh-detail-value">${timeStr}</div>
  </div>

  <div class="rsh-detail-section">
    <div class="rsh-detail-label">선행 기술</div>
    ${reqHtml}
  </div>

  ${btnHtml}
</div>`;
    }
  } else {
    detailHtml = `<div class="rsh-detail-panel"><div class="rsh-detail-empty">← 기술 트리에서<br>기술을 선택하세요</div></div>`;
  }

  // ── 최종 레이아웃 조합 ────────────────────────────────────
  layout.innerHTML = `<div class="rsh-full-layout">
  <div class="rsh-col-left">${queueHtml}</div>
  <div class="rsh-col-center">
    <div class="rsh-branches-row">${branchesHtml}</div>
    ${completedHtml}
  </div>
  <div class="rsh-col-right">${detailHtml}</div>
</div>`;

  // ── 드래그 스크롤 바인딩 ────────────────────────────────
  requestAnimationFrame(() => initResearchDrag());
}

// ─── 연구 탭 드래그 스크롤 ──────────────────────────────────
function initResearchDrag() {
  const row = document.querySelector('.rsh-branches-row');
  if (!row) return;
  if (row._dragInit) return;  // 중복 바인딩 방지
  row._dragInit = true;

  let drag = false, dragX = 0, dragSL = 0;

  row.addEventListener('mousedown', e => {
    // 버튼/링크 클릭은 무시
    if (e.target.closest('button, a, .rsh-node')) return;
    drag = true;
    dragX = e.pageX;
    dragSL = row.scrollLeft;
    row.style.cursor = 'grabbing';
    row.style.userSelect = 'none';
  });

  document.addEventListener('mouseup', () => {
    if (!drag) return;
    drag = false;
    row.style.cursor = '';
    row.style.userSelect = '';
  });

  document.addEventListener('mousemove', e => {
    if (!drag) return;
    e.preventDefault();
    row.scrollLeft = dragSL - (e.pageX - dragX) * 1.3;
  });
}
