
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
];

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
//  RENDER: RESEARCH TAB — vertical scroll card list
// ============================================================
function renderResearchTab() {
  const layout = document.getElementById('research-layout');
  if (!layout) return;

  // Preserve scroll position of parent tab-area
  const tabArea = document.getElementById('tab-area');
  const savedScroll = tabArea ? tabArea.scrollTop : 0;

  // ── LEFT SIDEBAR ────────────────────────────────────────────
  const prod = getProduction();
  const rpRate = prod.research || 0;
  const researchedCount = Object.keys(gs.upgrades).filter(k => gs.upgrades[k]).length;

  // RP sources
  const researchBldgs = BUILDINGS.filter(b => b.produces === 'research');
  let rpSourcesHtml = '';
  researchBldgs.forEach(b => {
    const cnt = gs.buildings[b.id] || 0;
    if (cnt === 0) return;
    const assigned = (gs.assignments && gs.assignments[b.id]) || 0;
    const rate = b.baseRate * assigned * (prodMult.research || 1) * globalMult * getMoonstoneMult() * getSolarBonus();
    rpSourcesHtml += `<div class="rsh-src-row">
      <span>${b.icon} ${b.name} ×${cnt}</span>
      <span>+${fmtDec(rate, 2)}/s</span>
    </div>`;
  });
  if (!rpSourcesHtml) rpSourcesHtml = '<div class="rsh-empty">// 연구 시설 없음</div>';

  // Recent researches — last 5
  const recent5 = recentResearches.slice(-5).reverse();
  const recentHtml = recent5.length === 0
    ? '<div class="rsh-empty">// 연구 기록 없음</div>'
    : recent5.map(r => {
        const ago = Math.floor((Date.now() - r.ts) / 1000);
        return `<div class="rsh-recent-row"><span>${r.name}</span><span>${fmtTime(ago)} 전</span></div>`;
      }).join('');

  const sidebarHtml = `
<div class="rsh-sidebar">
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

  // ── TECH CARDS ───────────────────────────────────────────────
  let tiersHtml = '';
  TIER_GROUPS.forEach(tier => {
    let cardsHtml = '';
    tier.nodes.forEach(uid => {
      const upg = UPGRADES.find(u => u.id === uid);
      if (!upg) return;

      const purchased = !!gs.upgrades[uid];
      const reqMet    = !upg.req || !!gs.upgrades[upg.req];
      const affordable = canAfford(upg.cost);
      const isOpen     = selectedTechId === uid;

      // Status badge
      let statusText, statusCls;
      if (purchased)        { statusText = '[완료]';     statusCls = 'rsh-ok'; }
      else if (!reqMet)     { statusText = '[잠금]';     statusCls = 'rsh-lock'; }
      else if (affordable)  { statusText = '[연구가능]'; statusCls = 'rsh-rdy'; }
      else                  { statusText = '[자원부족]'; statusCls = 'rsh-need'; }

      // Cost pills
      const costPills = Object.entries(upg.cost).map(([r, v]) => {
        const res = RESOURCES.find(x => x.id === r);
        const have = gs.res[r] || 0;
        return `<span class="${have >= v ? 'rsh-cost-ok' : 'rsh-cost-ng'}">${res ? res.symbol : r}:${fmt(v)}</span>`;
      }).join(' ');

      // Expanded detail (only when open)
      let expandHtml = '';
      if (isOpen) {
        const reqUpg = upg.req ? UPGRADES.find(u => u.id === upg.req) : null;
        const prereqHtml = reqUpg
          ? `<div class="rsh-det-row">선행: <span style="color:${gs.upgrades[upg.req] ? 'var(--green)' : 'var(--red)'}">${reqUpg.name} ${gs.upgrades[upg.req] ? '[완료]' : '[미완료]'}</span></div>`
          : '<div class="rsh-det-row" style="color:var(--green-dim);">선행: 없음</div>';

        const costRows = Object.entries(upg.cost).map(([r, v]) => {
          const res = RESOURCES.find(x => x.id === r);
          const have = gs.res[r] || 0;
          return `<div class="rsh-det-cost">
            <span>${res ? res.symbol + ' ' + res.name : r}</span>
            <span style="color:${have >= v ? 'var(--green)' : 'var(--red)'}">${fmt(have)} / ${fmt(v)}</span>
          </div>`;
        }).join('');

        const unlocksHtml = (upg.unlocks && upg.unlocks.length > 0)
          ? '<div class="rsh-det-sub">잠금 해제</div>' +
            upg.unlocks.map(key =>
              `<div class="rsh-det-row" style="color:var(--green);">▶ ${key.replace('bld_', '').replace('tab_', '[탭] ')}</div>`
            ).join('')
          : '';

        const viz = TECH_VIZ[uid];
        const vizHtml = viz ? `
<div class="rsh-viz-box">
  <div class="rsh-viz-hd">// TECH VISUALIZATION</div>
  ${viz.lines.map(l => `<div class="rsh-viz-bar">${l}</div>`).join('')}
  <div class="rsh-viz-stat">${viz.stat}</div>
</div>` : '';

        const btnDisabled = purchased || !reqMet || !affordable;
        const btnText = purchased ? '[ 연구 완료 ]'
          : !reqMet   ? '[ 선행 필요 ]'
          : !affordable ? '[ 자원 부족 ]'
          : '[ 연구 실행 ]';

        expandHtml = `<div class="rsh-expand" onclick="event.stopPropagation()">
  <div class="rsh-det-desc">${upg.desc}</div>
  ${prereqHtml}
  <div class="rsh-det-sub">비용</div>
  ${costRows}
  ${unlocksHtml}
  ${vizHtml}
  <button class="btn btn-full btn-sm${purchased||!reqMet||!affordable?' btn-amber':''}"
    onclick="buyUpgrade('${uid}');selectTech('${uid}');" ${btnDisabled ? 'disabled' : ''}>
    ${btnText}
  </button>
</div>`;
      }

      cardsHtml += `
<div class="rsh-card${isOpen ? ' open' : ''}${purchased ? ' done' : ''}" onclick="selectTech('${uid}')">
  <div class="rsh-card-row">
    <span class="rsh-icon">${upg.icon}</span>
    <span class="rsh-name">${upg.name}</span>
    <span class="rsh-pills">${costPills}</span>
    <span class="rsh-status ${statusCls}">${statusText}</span>
    <span class="rsh-arrow">${isOpen ? '▲' : '▼'}</span>
  </div>
  ${expandHtml}
</div>`;
    });

    tiersHtml += `
<div class="rsh-tier">
  <div class="rsh-tier-hd">${tier.label}</div>
  ${cardsHtml}
</div>`;
  });

  layout.innerHTML = `
<div class="rsh-layout">
  ${sidebarHtml}
  <div class="rsh-cards-area" id="rsh-cards-area">
    ${tiersHtml}
  </div>
</div>`;

  // Restore scroll
  if (tabArea) tabArea.scrollTop = savedScroll;
}

function selectTech(uid) {
  // Toggle: clicking same card closes it
  selectedTechId = (selectedTechId === uid) ? null : uid;
  renderResearchTab();
}
