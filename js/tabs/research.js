
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
};

// Tech tier groupings for vertical layout
const TIER_GROUPS = [
  { label: 'TIER-0  //  기초 시스템',  nodes: ['hire_worker_1', 'basic_prod'] },
  { label: 'TIER-1  //  자원 기술',    nodes: ['drill', 'fuel_chem', 'electronics_basics'] },
  { label: 'TIER-2  //  화학 / 전자',  nodes: ['catalyst', 'microchip', 'alloy'] },
  { label: 'TIER-3  //  고급 공학',    nodes: ['automation', 'rocket_eng', 'reliability', 'lightweight'] },
  { label: 'TIER-4  //  우주 공학',    nodes: ['fusion', 'multipad', 'launch_ctrl'] },
  { label: 'TIER-5  //  임무 시스템',  nodes: ['mission_sys'] },
]; // TIER-6 제거: auto_worker_assign/auto_assemble_restart는 효과 없어 삭제됨 (DESIGN-002)

function buyUpgrade(uid) {
  const upg = UPGRADES.find(u => u.id === uid);
  if (!upg || gs.upgrades[uid]) return;
  if (upg.req && !gs.upgrades[upg.req]) { notify('선행 연구 필요', 'red'); return; }
  if (!canAfford(upg.cost)) { notify('연구 포인트 부족', 'red'); return; }
  spend(upg.cost);
  gs.upgrades[uid] = true;
  upg.effect();
  if (upg.unlocks) applyUnlocks(upg.unlocks);
  recentResearches.push({ name: upg.name, ts: Date.now() });
  notify(`${upg.icon} ${upg.name} 연구 완료`);
  playSfx('sawtooth', 440, 0.1, 0.028, 700);
  renderAll();
}

// ============================================================
//  RENDER: RESEARCH TAB v2 — horizontal card tree + detail panel
// ============================================================

function selectTech2(uid) {
  selectedTechId = uid;
  // 기술 카드 선택음
  playSfx('sine', 380, 0.05, 0.018);
  // Highlight selected card
  document.querySelectorAll('.rsh-card2').forEach(c => {
    c.classList.toggle('selected', c.dataset.uid === uid);
  });
  renderTechDetail(uid);
}

let _researchDetailRenderedFor = null; // 더블클릭 방지: 마지막으로 전체 렌더된 tech ID

/** 기술 상세 패널 버튼 상태만 업데이트 (DOM 재생성 없이) */
function _updateTechDetailBtnState() {
  const uid = selectedTechId;
  if (!uid) return;
  const panel = document.getElementById('rsh-detail-panel');
  if (!panel) return;
  const btn = panel.querySelector('.rdp-btn');
  if (!btn) return;
  const upg = UPGRADES.find(u => u.id === uid);
  if (!upg) return;
  const purchased = !!gs.upgrades[uid];
  const reqMet    = !upg.req || !!gs.upgrades[upg.req];
  const affordable = canAfford(upg.cost);
  btn.disabled    = purchased || !reqMet || !affordable;
  btn.textContent = purchased ? '연구 완료' : !reqMet ? '선행 필요' : !affordable ? '자원 부족' : '연구 실행';
}

function renderTechDetail(uid) {
  _researchDetailRenderedFor = uid;
  const panel = document.getElementById('rsh-detail-panel');
  if (!panel) return;

  if (!uid) {
    panel.innerHTML = `<div class="rdp-hd">기술 상세</div>
<div class="rdp-empty">// 기술 카드를 클릭하면<br>상세 정보가 표시됩니다</div>`;
    return;
  }

  const upg = UPGRADES.find(u => u.id === uid);
  if (!upg) return;

  const purchased  = !!gs.upgrades[uid];
  const reqMet     = !upg.req || !!gs.upgrades[upg.req];
  const affordable = canAfford(upg.cost);
  const reqUpg     = upg.req ? UPGRADES.find(u => u.id === upg.req) : null;

  let statusTxt, statusColor;
  if (purchased)        { statusTxt = '[ 연구 완료 ]'; statusColor = 'var(--green)'; }
  else if (!reqMet)     { statusTxt = '[ 잠금 ]';     statusColor = '#2a3a2a'; }
  else if (affordable)  { statusTxt = '[ 연구 가능 ]'; statusColor = 'var(--amber)'; }
  else                  { statusTxt = '[ 자원 부족 ]'; statusColor = '#1a5a2a'; }

  const costHtml = Object.entries(upg.cost).map(([r, v]) => {
    const res = RESOURCES.find(x => x.id === r);
    const have = gs.res[r] || 0;
    return `<div class="rdp-cost-row">
      <span>${res ? res.symbol + ' ' + res.name : r}</span>
      <span style="color:${have>=v?'var(--green)':'var(--red)'}">${fmt(have)}/${fmt(v)}</span>
    </div>`;
  }).join('');

  const prereqHtml = reqUpg
    ? `<div class="rdp-sub">선행 연구</div>
<div style="font-size:11px;color:${gs.upgrades[upg.req]?'var(--green)':'var(--red)'}">
  ${reqUpg.icon} ${reqUpg.name} ${gs.upgrades[upg.req]?'[완료]':'[필요]'}
</div>`
    : '';

  const unlocksHtml = (upg.unlocks && upg.unlocks.length > 0)
    ? `<div class="rdp-sub">잠금 해제</div>` + upg.unlocks.map(k =>
        `<div style="font-size:11px;color:var(--green)">▶ ${k.replace('bld_','').replace('tab_','[탭] ')}</div>`
      ).join('')
    : '';

  const viz = TECH_VIZ[uid];
  const vizHtml = viz ? `<div class="rdp-viz">
  <div class="rdp-viz-hd">// TECH ANALYSIS</div>
  ${viz.lines.map(l=>`<div class="rdp-viz-bar">${l}</div>`).join('')}
  <div class="rdp-viz-stat">${viz.stat}</div>
</div>` : '';

  // P4-5: Research ASCII art panel
  const asciiArt = (typeof RESEARCH_ASCII_ART !== 'undefined')
    ? (RESEARCH_ASCII_ART[uid] || RESEARCH_ASCII_ART._default)
    : null;
  const asciiHtml = asciiArt ? `<div class="rdp-ascii-panel">
  <div class="rdp-ascii-hd">// SCHEMATIC</div>
  <pre class="rdp-ascii-art">${asciiArt}</pre>
</div>` : '';

  const btnDis = purchased || !reqMet || !affordable;
  const btnTxt = purchased ? '연구 완료' : !reqMet ? '선행 필요' : !affordable ? '자원 부족' : '연구 실행';

  panel.innerHTML = `<div class="rdp-hd">기술 상세</div>
<div class="rdp-icon">${upg.icon}</div>
<div class="rdp-name">${upg.name}</div>
<div class="rdp-status" style="color:${statusColor}">${statusTxt}</div>
<div class="rdp-desc">${upg.desc}</div>
${asciiHtml}
<div class="rdp-sub">연구 비용</div>
${costHtml}
${prereqHtml}
${unlocksHtml}
${vizHtml}
<button class="rdp-btn" onclick="buyUpgrade('${uid}')" ${btnDis?'disabled':''}>${btnTxt}</button>`;
}

function renderResearchTab() {
  const layout = document.getElementById('research-layout');
  if (!layout) return;

  // ── LEFT SIDEBAR ────────────────────────────────────────────
  const prod = getProduction();
  const rpRate = prod.research || 0;
  const researchedCount = Object.keys(gs.upgrades).filter(k => gs.upgrades[k]).length;

  const researchBldgs = BUILDINGS.filter(b => b.produces === 'research');
  let rpSourcesHtml = '';
  researchBldgs.forEach(b => {
    const cnt = gs.buildings[b.id] || 0;
    if (cnt === 0) return;
    const assigned = (gs.assignments && gs.assignments[b.id]) || 0;
    const rate = b.baseRate * assigned * (prodMult.research || 1) * globalMult * getMoonstoneMult() * getSolarBonus() * getBldProdMult(b.id) * getBldUpgradeMult(b.id) * getAddonMult(b.id);
    rpSourcesHtml += `<div class="rsh-src-row">
      <span>${b.icon} ${b.name} ×${cnt}</span>
      <span>+${fmtDec(rate, 2)}/s</span>
    </div>`;
  });
  if (!rpSourcesHtml) rpSourcesHtml = '<div class="rsh-empty">// 연구 시설 없음</div>';

  const recent5 = recentResearches.slice(-5).reverse();
  const recentHtml = recent5.length === 0
    ? '<div class="rsh-empty">// 연구 기록 없음</div>'
    : recent5.map(r => {
        const ago = Math.floor((Date.now() - r.ts) / 1000);
        return `<div class="rsh-recent-row"><span>${r.name}</span><span>${fmtTime(ago)} 전</span></div>`;
      }).join('');

  const sidebarHtml = `
<div class="rsh-sidebar" style="overflow-y:auto;">
  <div class="rsh-sb-hd">연구 현황</div>
  <div class="rsh-stat-grid">
    <div class="rsh-stat"><div class="rsh-stat-l">완료</div><div class="rsh-stat-v">${researchedCount}</div></div>
    <div class="rsh-stat"><div class="rsh-stat-l">전체</div><div class="rsh-stat-v">${UPGRADES.length}</div></div>
    <div class="rsh-stat rsh-stat-full"><div class="rsh-stat-l">RP 수입</div><div class="rsh-stat-v" style="color:var(--green-mid)">+${fmtDec(rpRate, 2)}/s</div></div>
    <div class="rsh-stat rsh-stat-full"><div class="rsh-stat-l">RP 보유</div><div class="rsh-stat-v" style="color:var(--green-mid)">${fmt(gs.res.research || 0)}</div></div>
    <div class="rsh-stat rsh-stat-full"><div class="rsh-stat-l">문스톤</div><div class="rsh-stat-v" style="color:var(--amber)">${gs.moonstone}</div></div>
  </div>
  <div class="rsh-sb-sub">RP 수입원</div>
  ${rpSourcesHtml}
  <div class="rsh-sb-sub">최근 연구</div>
  ${recentHtml}
</div>`;

  // ── HORIZONTAL TECH TREE ─────────────────────────────────────
  let tierColsHtml = '';
  TIER_GROUPS.forEach((tier, ti) => {
    if (ti > 0) {
      tierColsHtml += '<div class="rsh-tier-arrow">→</div>';
    }

    let cardsInCol = '';
    // Short tier label (strip TIER-N prefix for compact display)
    const shortLabel = tier.label.split('//')[1]?.trim() || tier.label;

    tier.nodes.forEach(uid => {
      const upg = UPGRADES.find(u => u.id === uid);
      if (!upg) return;

      const purchased  = !!gs.upgrades[uid];
      const reqMet     = !upg.req || !!gs.upgrades[upg.req];
      const affordable = canAfford(upg.cost);

      let cardCls = '';
      let statusTxt, statusCls;
      if (purchased)        { cardCls = 'done';      statusTxt = '[완료]';   statusCls = 'rsh-ok'; }
      else if (!reqMet)     { cardCls = 'locked';    statusTxt = '[잠금]';   statusCls = 'rsh-lock'; }
      else if (affordable)  { cardCls = 'available'; statusTxt = '[가능]';   statusCls = 'rsh-rdy'; }
      else                  {                         statusTxt = '[부족]';   statusCls = 'rsh-need'; }

      const isSelected = selectedTechId === uid;

      cardsInCol += `<div class="rsh-card2 ${cardCls}${isSelected?' selected':''}" data-uid="${uid}" onclick="selectTech2('${uid}')">
  <div class="rsh-c2-icon">${upg.icon}</div>
  <div class="rsh-c2-name">${upg.name}</div>
  <div class="rsh-c2-status ${statusCls}">${statusTxt}</div>
</div>`;
    });

    tierColsHtml += `<div class="rsh-tier-col">
  <div class="rsh-tier-label2">T${ti} · ${shortLabel}</div>
  ${cardsInCol}
</div>`;
  });

  // ── DETAIL PANEL (right side) ─────────────────────────────────
  // 기존 패널 엘리먼트를 미리 저장 (innerHTML 교체 시 제거되지만 JS 참조는 유지됨)
  // 이렇게 하면 mousedown → renderAll → mouseup 사이클에서 click 이벤트가 끊기지 않음
  const savedPanel = document.getElementById('rsh-detail-panel');

  layout.innerHTML = `<div class="rsh-layout2">
  ${sidebarHtml}
  <div class="rsh-tree-area">
    <div class="rsh-tier-row">${tierColsHtml}</div>
  </div>
  <div class="rsh-detail-panel" id="rsh-detail-panel">
    <div class="rdp-hd">기술 상세</div>
    <div class="rdp-empty">// 기술 카드를 클릭하면<br>상세 정보가 표시됩니다</div>
  </div>
</div>`;

  if (savedPanel && _researchDetailRenderedFor === selectedTechId && selectedTechId) {
    // 같은 기술 선택 유지: 기존 패널 재부착 + 버튼 상태만 갱신 (DOM 재생성 금지 — 클릭 이벤트 보존)
    const newPanel = document.getElementById('rsh-detail-panel');
    if (newPanel) newPanel.replaceWith(savedPanel);
    _updateTechDetailBtnState();
  } else if (selectedTechId) {
    // 기술이 바뀌었거나 최초 렌더: 전체 상세 패널 렌더
    renderTechDetail(selectedTechId);
  }
}

function selectTech(uid) {
  // legacy alias: 자동 구매 대신 상세 패널만 표시 (BUG-014)
  selectedTechId = uid;
  if (typeof renderTechDetail === 'function') renderTechDetail(uid);
}
