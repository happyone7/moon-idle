
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
//  RENDER: RESEARCH TAB — v7b 3-column layout
// ============================================================

// Tech tree node layout by tier
const TECH_TIERS = [
  { x: 50,  nodes: ['basic_prod'] },
  { x: 220, nodes: ['drill', 'fuel_chem', 'electronics_basics'] },
  { x: 390, nodes: ['catalyst', 'microchip', 'alloy'] },
  { x: 560, nodes: ['automation', 'rocket_eng', 'reliability'] },
  { x: 730, nodes: ['fusion', 'multipad', 'lightweight', 'launch_ctrl'] },
  { x: 900, nodes: ['mission_sys'] },
];

// Pre-compute Y positions for each node
function _buildNodePositions() {
  const pos = {};
  TECH_TIERS.forEach(tier => {
    tier.nodes.forEach((uid, i) => {
      pos[uid] = { x: tier.x, y: 30 + i * 70 };
    });
  });
  return pos;
}

function renderResearchTab() {
  const nodePos = _buildNodePositions();

  // --- LEFT PANEL ---
  const researchedCount = Object.keys(gs.upgrades).filter(k => gs.upgrades[k]).length;
  const prod = getProduction();
  const rpRate = prod.research || 0;

  // Build research buildings list for RP sources
  const researchBldgs = BUILDINGS.filter(b => b.produces === 'research');
  let rpSourcesHtml = '';
  researchBldgs.forEach(b => {
    const cnt = gs.buildings[b.id] || 0;
    if (cnt === 0) return;
    const rate = b.baseRate * cnt * (prodMult.research || 1) * globalMult * getMoonstoneMult() * getSolarBonus();
    rpSourcesHtml += `<div style="display:flex;justify-content:space-between;padding:2px 0;font-size:12px;">
      <span style="color:var(--green-mid)">${b.icon} ${b.name} ×${cnt}</span>
      <span style="color:var(--green-mid)">+${fmtDec(rate, 2)}/s</span>
    </div>`;
  });
  if (!rpSourcesHtml) rpSourcesHtml = '<div style="color:#1a3a1a;font-size:12px;">// 연구 시설 없음</div>';

  // Recent researches — last 5
  let recentHtml = '';
  const recent5 = recentResearches.slice(-5).reverse();
  if (recent5.length === 0) {
    recentHtml = '<div style="color:#1a3a1a;font-size:12px;">// 연구 기록 없음</div>';
  } else {
    recent5.forEach(r => {
      const ago = Math.floor((Date.now() - r.ts) / 1000);
      recentHtml += `<div style="display:flex;justify-content:space-between;padding:2px 0;font-size:12px;border-bottom:1px solid #0a1a0a;">
        <span style="color:var(--green)">${r.name}</span>
        <span style="color:var(--green-dim)">${fmtTime(ago)} 전</span>
      </div>`;
    });
  }

  const leftHtml = `
<div class="panel" style="margin-bottom:8px;">
  <div class="panel-header">연구 현황</div>
  <div class="overview-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px;margin-bottom:8px;">
    <div style="border:var(--border);padding:6px;">
      <div style="color:var(--green-mid)">완료된 연구</div>
      <div style="color:var(--green);font-size:16px;">${researchedCount}</div>
    </div>
    <div style="border:var(--border);padding:6px;">
      <div style="color:var(--green-mid)">총 연구</div>
      <div style="color:var(--green);font-size:16px;">${UPGRADES.length}</div>
    </div>
    <div style="border:var(--border);padding:6px;">
      <div style="color:var(--green-mid)">RP 수입</div>
      <div style="color:var(--green-mid);font-size:14px;">+${fmtDec(rpRate, 2)}/s</div>
    </div>
    <div style="border:var(--border);padding:6px;">
      <div style="color:var(--green-mid)">문스톤</div>
      <div style="color:var(--amber);font-size:14px;">${gs.moonstone}</div>
    </div>
  </div>
</div>
<div class="panel" style="margin-bottom:8px;">
  <div class="panel-header">최근 연구</div>
  ${recentHtml}
</div>
<div class="panel">
  <div class="panel-header">RP 수입원</div>
  ${rpSourcesHtml}
</div>`;

  const leftContent = document.getElementById('research-left-content');
  if (leftContent) leftContent.innerHTML = leftHtml;

  // --- CENTER PANEL: SVG tech tree ---
  const svgWidth = 1060;
  const svgHeight = 360;

  // Draw connector lines first (behind nodes)
  let linesHtml = '';
  UPGRADES.forEach(upg => {
    if (!upg.req) return;
    const from = nodePos[upg.req];
    const to = nodePos[upg.id];
    if (!from || !to) return;
    const purchased = gs.upgrades[upg.id];
    const reqMet = gs.upgrades[upg.req];
    const lineColor = purchased ? '#1a5c34' : reqMet ? '#0d4020' : '#0a1a0a';
    linesHtml += `<line x1="${from.x + 65}" y1="${from.y + 25}" x2="${to.x}" y2="${to.y + 25}" stroke="${lineColor}" stroke-width="1.5"/>`;
  });

  // Draw nodes
  let nodesHtml = '';
  UPGRADES.forEach(upg => {
    const p = nodePos[upg.id];
    if (!p) return;
    const purchased = !!gs.upgrades[upg.id];
    const reqMet = !upg.req || !!gs.upgrades[upg.req];
    const affordable = canAfford(upg.cost);
    const isSelected = selectedTechId === upg.id;

    let fill, stroke, textColor;
    if (purchased) {
      fill = '#011a0a'; stroke = 'var(--green)'; textColor = '#00e676';
    } else if (reqMet && affordable) {
      fill = '#010f04'; stroke = '#00994d'; textColor = '#00e676';
    } else if (reqMet) {
      fill = '#010f04'; stroke = '#1a4020'; textColor = '#1a6030';
    } else {
      fill = '#0d1a0d'; stroke = '#1a2a1a'; textColor = '#2a3a2a';
    }
    if (isSelected) stroke = 'var(--amber)';

    const statusMark = purchased ? ' [OK]' : '';
    // Truncate name for display
    const displayName = upg.name.length > 10 ? upg.name.slice(0, 9) + '…' : upg.name;

    nodesHtml += `<g class="tech-node" onclick="selectTech('${upg.id}')" style="cursor:pointer;">
  <rect x="${p.x}" y="${p.y}" width="130" height="50" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
  <text x="${p.x + 65}" y="${p.y + 18}" text-anchor="middle" font-family="'Share Tech Mono',monospace" font-size="10" fill="${textColor}">${displayName}${statusMark}</text>
  <text x="${p.x + 65}" y="${p.y + 32}" text-anchor="middle" font-family="'Share Tech Mono',monospace" font-size="9" fill="${textColor === '#00e676' ? '#00994d' : '#1a3a2a'}">${upg.icon}</text>
</g>`;
  });

  // Branch column headers
  const BRANCH_LABELS = ['기초', '자원', '화학/전자', '고급', '최고급', '임무'];
  let headerHtml = '';
  TECH_TIERS.forEach((tier, i) => {
    headerHtml += `<div style="position:absolute;left:${tier.x}px;width:130px;text-align:center;font-size:10px;color:var(--green-dim);letter-spacing:2px;text-transform:uppercase;">${BRANCH_LABELS[i] || ''}</div>`;
  });

  const branchHeaders = document.getElementById('branch-headers');
  if (branchHeaders) {
    branchHeaders.style.cssText = `position:relative;height:18px;min-width:${svgWidth}px;margin-bottom:4px;`;
    branchHeaders.innerHTML = headerHtml;
  }

  const treeSvg = document.getElementById('tree-svg');
  if (treeSvg) {
    treeSvg.setAttribute('width', svgWidth);
    treeSvg.setAttribute('height', svgHeight);
    treeSvg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
    treeSvg.style.cssText = `display:block;min-width:${svgWidth}px;`;
    treeSvg.innerHTML = linesHtml + nodesHtml;
  }

  // --- RIGHT PANEL: tech detail ---
  renderTechDetail();
}

function selectTech(uid) {
  selectedTechId = uid;
  renderTechDetail();
}

function renderTechDetail() {
  const panel = document.getElementById('tech-detail-panel');
  if (!panel) return;

  if (!selectedTechId) {
    panel.innerHTML = '<div style="color:var(--green-dim);font-size:12px;padding:8px;">// 기술 노드를 선택하세요</div>';
    return;
  }

  const upg = UPGRADES.find(u => u.id === selectedTechId);
  if (!upg) return;

  const purchased = !!gs.upgrades[upg.id];
  const reqMet = !upg.req || !!gs.upgrades[upg.req];
  const affordable = canAfford(upg.cost);

  let statusBadge = '';
  let statusColor = 'var(--green-dim)';
  if (purchased) {
    statusBadge = '[연구 완료]'; statusColor = 'var(--green)';
  } else if (!reqMet) {
    statusBadge = '[잠금]'; statusColor = '#2a3a2a';
  } else if (affordable) {
    statusBadge = '[연구 가능]'; statusColor = 'var(--amber)';
  } else {
    statusBadge = '[자원 부족]'; statusColor = '#1a4020';
  }

  let costHtml = '';
  Object.entries(upg.cost).forEach(([r, v]) => {
    const res = RESOURCES.find(x => x.id === r);
    const have = gs.res[r] || 0;
    const enough = have >= v;
    costHtml += `<div style="display:flex;justify-content:space-between;font-size:12px;padding:2px 0;">
      <span style="color:var(--green-mid)">${res ? res.symbol : r}</span>
      <span style="color:${enough ? 'var(--green)' : 'var(--red)'}">${fmt(have)} / ${fmt(v)}</span>
    </div>`;
  });

  let unlocksHtml = '';
  if (upg.unlocks && upg.unlocks.length > 0) {
    unlocksHtml = `<div style="margin-top:8px;font-size:11px;color:var(--green-mid);">잠금 해제:</div>`;
    upg.unlocks.forEach(key => {
      unlocksHtml += `<div style="font-size:11px;color:var(--green);padding:1px 0;">▶ ${key.replace('bld_', '').replace('tab_', '[탭] ')}</div>`;
    });
  }

  const reqUpg = upg.req ? UPGRADES.find(u => u.id === upg.req) : null;
  const prereqHtml = reqUpg
    ? `<div style="font-size:11px;color:var(--green-mid);margin-top:6px;">선행: <span style="color:${gs.upgrades[upg.req] ? 'var(--green)' : 'var(--red)'}">${reqUpg.name} ${gs.upgrades[upg.req] ? '[완료]' : '[미완료]'}</span></div>`
    : '<div style="font-size:11px;color:var(--green-mid);margin-top:6px;">선행: 없음</div>';

  const btnDisabled = purchased || !reqMet || !affordable;
  const btnText = purchased ? '[ 연구 완료 ]' : !reqMet ? '[ 선행 필요 ]' : !affordable ? '[ 자원 부족 ]' : '[ 연구 실행 ]';

  // ASCII Tech Visualization
  const viz = TECH_VIZ[upg.id];
  let vizHtml = '';
  if (viz) {
    const linesHtml = viz.lines.map(line =>
      `<div style="color:var(--amber);font-size:12px;font-family:var(--font);letter-spacing:0;margin:2px 0;">${line}</div>`
    ).join('');
    vizHtml = `
<div style="margin-top:10px;border:1px solid #3a2800;background:rgba(255,171,0,0.04);padding:8px 10px;">
  <div style="font-size:10px;color:#7a5100;letter-spacing:2px;margin-bottom:6px;">// TECH VISUALIZATION</div>
  ${linesHtml}
  <div style="color:var(--amber);font-size:13px;margin-top:6px;letter-spacing:1px;text-shadow:var(--amber-glow);">${viz.stat}</div>
</div>`;
  }

  panel.innerHTML = `
<div style="font-size:10px;color:var(--green-dim);letter-spacing:2px;margin-bottom:4px;">${upg.id}</div>
<div style="font-size:14px;color:var(--green);margin-bottom:4px;">${upg.icon} ${upg.name}</div>
<div style="font-size:12px;color:${statusColor};margin-bottom:8px;">${statusBadge}</div>
<hr style="border:none;border-top:var(--border);margin:6px 0;">
<div style="font-size:11px;color:var(--green-mid);margin-bottom:4px;">비용</div>
${costHtml}
<hr style="border:none;border-top:var(--border);margin:6px 0;">
<div style="font-size:12px;color:var(--green-mid);margin-bottom:6px;">${upg.desc}</div>
${unlocksHtml}
${prereqHtml}
${vizHtml}
<div style="margin-top:12px;">
  <button class="btn btn-full btn-sm${purchased ? '' : !reqMet || !affordable ? ' btn-amber' : ''}" onclick="buyUpgrade('${upg.id}');renderTechDetail();" ${btnDisabled ? 'disabled' : ''}>
    ${btnText}
  </button>
</div>`;
}

