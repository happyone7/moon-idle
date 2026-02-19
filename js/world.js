// ============================================================
//  WORLD — js/world.js
// ============================================================
const WORLD_POSITIONS = {
  housing: 30,      research_lab: 240, r_and_d: 410,
  ops_center: 590,  supply_depot: 780, mine: 990,
  extractor: 1130,  refinery: 1320,   cryo_plant: 1500,
  elec_lab: 1700,   fab_plant: 1870,  solar_array: 2060,
  launch_pad: 2270,
};

// ─── ASCII BUILDING ART ─────────────────────────────────────
function _bldAscii(bld) {
  switch (bld.wbClass) {

    case 'wb-housing':
      return (
        '╔═══════════╗\n' +
        '║  HOUSING  ║\n' +
        '║ □□ □□ □□  ║\n' +
        '║ □□ □□ □□  ║\n' +
        '╚═══════════╝\n' +
        '  █████████'
      );

    case 'wb-ops': {
      const lbl = bld.id === 'ops_center' ? 'OPS CTR  ' : 'SUPPLY D ';
      return (
        '╔══════════╗\n' +
        '║ ' + lbl + '║\n' +
        '║ ■□■□■□■  ║\n' +
        '║ □■□■□■□  ║\n' +
        '╚══════════╝\n' +
        '  ████████'
      );
    }

    case 'wb-mine':
      return (
        '     ╔═══╗\n' +
        '     ║ ▓ ║\n' +
        '╔════╩═══╩════╗\n' +
        '║   ▒▒▒▒▒▒▒   ║\n' +
        '╚═════════════╝\n' +
        '    ███████████'
      );

    case 'wb-refinery':
      return (
        ' ╔═╗  ╔══╗\n' +
        ' ║▓║  ║▓▓║\n' +
        ' ║▓║  ║▓▓║\n' +
        ' ║▓║  ║▓▓║\n' +
        ' ╚═╝  ╚══╝\n' +
        '███████████'
      );

    case 'wb-eleclab':
      return (
        '╔══════════╗\n' +
        '║ PCB  LAB ║\n' +
        '║▒░▒░▒░▒░▒║\n' +
        '║░▒░▒░▒░▒░║\n' +
        '╚══════════╝\n' +
        '  ████████'
      );

    case 'wb-research':
      return (
        '╔════════════╗\n' +
        '║  RESEARCH  ║\n' +
        '║ ■□■□■□■□   ║\n' +
        '║ □■□■□■□■   ║\n' +
        '╠════════════╣\n' +
        '╚════════════╝\n' +
        '   ██████████'
      );

    case 'wb-solar':
      return (
        ' ╔╗    ╔╗\n' +
        ' ╠╣    ╠╣\n' +
        ' ╚╝    ╚╝\n' +
        '  │     │\n' +
        '  │     │\n' +
        ' ████████'
      );

    case 'wb-launchpad':
      return (
        '      /▲╲\n' +
        '     / ▓ ╲\n' +
        '    /  ▓  ╲\n' +
        '   ╔═══════╗\n' +
        '   ║ [PAD] ║\n' +
        '──╚═════════╝──'
      );

    default: {
      const ic = (bld.icon || '[??]').slice(0, 5).padEnd(5);
      return (
        '╔═══════╗\n' +
        '║ ' + ic + ' ║\n' +
        '╚═══════╝\n' +
        '  █████'
      );
    }
  }
}

function updateWorldBuildings() {
  const layer = document.getElementById('buildings-layer');
  if (!layer) return;
  layer.innerHTML = '';
  BUILDINGS.forEach(b => {
    if ((gs.buildings[b.id] || 0) === 0) return;
    const x = WORLD_POSITIONS[b.id] || 100;
    const pre = document.createElement('pre');
    pre.className = 'world-bld';
    pre.dataset.bid = b.id;
    pre.style.left = x + 'px';
    pre.textContent = _bldAscii(b);

    pre.addEventListener('mouseenter', () => openBldOv(b, pre));
    pre.addEventListener('mouseleave', () => scheduleBldOvClose());
    layer.appendChild(pre);
  });
}

// ─── BUILDING HOVER OVERLAY — 2-panel layout ─────────────────
let _bldOvTimer  = null;
let _bldOvActions = [];
let _bldOvBld    = null;

function openBldOv(bld, el) {
  clearTimeout(_bldOvTimer);
  const ovEl = document.getElementById('bld-ov');
  if (!ovEl) return;

  const cnt      = gs.buildings[bld.id] || 0;
  const assigned = (gs.assignments && gs.assignments[bld.id]) || 0;
  const avail    = getAvailableWorkers();
  const prod     = getProduction();

  // ── Build action list ──────────────────────────────────────
  const actions = [];

  // Worker rows (production buildings only)
  if (bld.produces !== 'bonus') {
    actions.push({
      label: '+ 인원 배치',
      info: `여유 ${avail}명`,
      disabled: avail <= 0 || cnt === 0 || assigned >= cnt,
      desc: `[${bld.name}]에 인원 배치\n현재: ${assigned}명 배치 / 상한: ${cnt}명\n인원 1명 → ${bld.produces === 'money' ? '₩' : ''}+${fmtDec(bld.baseRate * (prodMult[bld.produces]||1) * globalMult * getMoonstoneMult() * getSolarBonus() * getBldProdMult(bld.id) * getBldUpgradeMult(bld.id), 2)}/s`,
      type: 'assign',
    });
    actions.push({
      label: '- 인원 철수',
      info: `배치 ${assigned}명`,
      disabled: assigned <= 0,
      desc: `[${bld.name}]에서 인원 회수\n현재 ${assigned}명 배치 중`,
      type: 'unassign',
    });
  }

  // Named building upgrades
  const bldUpgs = (typeof BUILDING_UPGRADES !== 'undefined' && BUILDING_UPGRADES[bld.id]) || [];
  bldUpgs.forEach(upg => {
    const done     = !!(gs.bldUpgrades && gs.bldUpgrades[upg.id]);
    const reqMet   = !upg.req || !!(gs.bldUpgrades && gs.bldUpgrades[upg.req]);
    const affordable = canAfford(upg.cost);
    const reqName  = upg.req ? (bldUpgs.find(u => u.id === upg.req)?.name || upg.req) : null;
    actions.push({
      label: upg.name,
      info:  done ? '[완료]' : getCostStr(upg.cost),
      done, affordable, reqMet,
      disabled: done || !reqMet || cnt === 0,
      desc:  upg.desc + (reqName && !reqMet ? `\n// 선행 필요: ${reqName}` : '') + (cnt === 0 ? '\n// 건물을 먼저 건설하세요' : ''),
      type: 'upgrade',
      upgId: upg.id,
    });
  });

  _bldOvActions = actions;
  _bldOvBld = bld;

  // ── Build HTML ─────────────────────────────────────────────
  let actRows = '';
  actions.forEach((act, i) => {
    let rowCls = '';
    if (act.done)                        rowCls = 'bov-done';
    else if (act.disabled)               rowCls = 'bov-locked';
    else if (act.type === 'upgrade' && !act.affordable) rowCls = 'bov-need';

    let btnTxt = act.done ? '[완료]' : act.disabled ? '[잠금]' : act.type === 'upgrade' && !act.affordable ? '[부족]' : '[실행]';
    const btnDis = act.done || act.disabled || (act.type === 'upgrade' && !act.affordable);

    actRows += `<div class="bov-act ${rowCls}" data-idx="${i}"
      onmouseenter="bovHover(${i})"
      onclick="bovClick(${i})">
      <span class="bov-act-label">${act.label}</span>
      <button class="bov-act-btn${btnDis ? ' dis' : ''}" tabindex="-1">${btnTxt}</button>
      <span class="bov-act-info${act.type==='upgrade'&&!act.affordable&&!act.done?' red':''}">${act.info}</span>
    </div>`;
  });

  // Construction cost
  const buyCost    = getBuildingCost(bld);
  const buyAfford  = canAfford(buyCost);
  const buyLabel   = cnt > 0 ? (buyAfford ? '건물 추가 건설' : '건물 추가 (자원 부족)') : (buyAfford ? '건설 시작' : '건설 (자원 부족)');

  // Production rate line
  let rateStr = '';
  if (bld.produces !== 'bonus') {
    const rate = bld.baseRate * assigned * (prodMult[bld.produces]||1) * globalMult * getMoonstoneMult() * getSolarBonus() * getBldProdMult(bld.id) * getBldUpgradeMult(bld.id);
    rateStr = assigned > 0 ? `${bld.produces} +${fmtDec(rate,2)}/s` : '인원 미배치';
  } else if (bld.id === 'solar_array') { rateStr = `전체 생산 +${((getSolarBonus()-1)*100).toFixed(0)}%`; }
  else if (bld.id === 'launch_pad')    { rateStr = `발사 슬롯 +${cnt}`; }
  else if (bld.id === 'housing')       { rateStr = `인원 상한 ${gs.workers}명`; }

  ovEl.innerHTML = `
<div class="bov-head">
  <span class="bov-head-name">${bld.icon} ${bld.name}</span>
  <span class="bov-head-meta">×${cnt} &nbsp; <span style="color:var(--green-mid);font-size:11px">${rateStr}</span></span>
</div>
<div class="bov-body">
  <div class="bov-acts-col" id="bov-acts">
    ${actRows || '<div class="bov-act-empty">// 업그레이드 없음</div>'}
  </div>
  <div class="bov-desc-col" id="bov-desc">
    <div class="bov-desc-hint">항목에 마우스를<br>올려 상세 확인</div>
  </div>
</div>
<div class="bov-foot">
  <button class="bov-buy-btn${buyAfford?'':' dis'}" onclick="buyBuilding('${bld.id}')" ${buyAfford?'':'disabled'}>
    [ ${buyLabel} ] <span class="bov-buy-cost">${getCostStr(buyCost)}</span>
  </button>
</div>`;

  // Position
  const r = el.getBoundingClientRect();
  const ovW = 490, ovH = ovEl.offsetHeight || 260;
  let lx = r.left - 10;
  let ty = r.top - ovH - 8;
  if (lx + ovW > window.innerWidth - 6) lx = window.innerWidth - ovW - 6;
  if (lx < 4) lx = 4;
  if (ty < 4) ty = r.bottom + 6;
  ovEl.style.left = lx + 'px';
  ovEl.style.top  = ty + 'px';
  ovEl.style.width = ovW + 'px';
  ovEl.style.display = 'block';
}

function bovHover(idx) {
  const act = _bldOvActions[idx];
  if (!act) return;
  const dp = document.getElementById('bov-desc');
  if (!dp) return;
  dp.innerHTML = `<div class="bov-desc-name">${act.label}</div><div class="bov-desc-body">${act.desc.replace(/\n/g,'<br>')}</div>`;
}

function bovClick(idx) {
  const act = _bldOvActions[idx];
  if (!act || act.done || act.disabled) return;
  if (act.type === 'assign')   assignWorker(_bldOvBld.id);
  else if (act.type === 'unassign') unassignWorker(_bldOvBld.id);
  else if (act.type === 'upgrade') {
    if (!act.affordable) { notify('자원 부족', 'red'); return; }
    buyBldUpgrade(act.upgId, _bldOvBld.id);
  }
}

function buyBldUpgrade(upgId, bldId) {
  const bld  = BUILDINGS.find(b => b.id === bldId);
  const bldUpgList = (typeof BUILDING_UPGRADES !== 'undefined' && BUILDING_UPGRADES[bldId]) || [];
  const upg  = bldUpgList.find(u => u.id === upgId);
  if (!upg || !bld) return;
  if (!gs.bldUpgrades) gs.bldUpgrades = {};
  if (gs.bldUpgrades[upgId]) { notify('이미 완료된 업그레이드', 'amber'); return; }
  if (upg.req && !gs.bldUpgrades[upg.req]) { notify('선행 업그레이드 필요', 'red'); return; }
  if (!canAfford(upg.cost)) { notify('자원 부족', 'red'); return; }
  spend(upg.cost);
  gs.bldUpgrades[upgId] = true;
  // Side-effects
  if (upg.wkr) { gs.workers = (gs.workers || 1) + upg.wkr; syncWorkerDots(); }
  if (upg.rel) reliabilityBonus += upg.rel;
  notify(`${bld.icon} ${upg.name} 완료`);
  playSfx('triangle', 520, 0.1, 0.04, 780);
  // Refresh overlay
  const el = document.querySelector('.world-bld[data-bid="' + bldId + '"]');
  if (el) openBldOv(bld, el);
  renderAll();
}

// ─── WORKER ASSIGNMENT ───────────────────────────────────────
function assignWorker(bldId) {
  if (!gs.assignments) gs.assignments = {};
  const bld      = BUILDINGS.find(b => b.id === bldId);
  if (!bld) return;
  const cnt      = gs.buildings[bldId] || 0;
  const assigned = gs.assignments[bldId] || 0;
  if (cnt === 0)                    { notify('건물이 없습니다', 'red'); return; }
  if (getAvailableWorkers() <= 0)   { notify('여유 인원 없음', 'red'); return; }
  if (assigned >= cnt)              { notify('건물 수용 한도 초과', 'amber'); return; }
  gs.assignments[bldId] = assigned + 1;
  notify(`${bld.icon} ${bld.name} — 인원 배치 (${gs.assignments[bldId]}명)`);
  const pre = document.querySelector('.world-bld[data-bid="' + bldId + '"]');
  if (pre) openBldOv(bld, pre);
  renderAll();
}

function unassignWorker(bldId) {
  if (!gs.assignments || !gs.assignments[bldId]) { notify('배치된 인원 없음', 'amber'); return; }
  const bld = BUILDINGS.find(b => b.id === bldId);
  gs.assignments[bldId] = Math.max(0, gs.assignments[bldId] - 1);
  if (gs.assignments[bldId] === 0) delete gs.assignments[bldId];
  if (bld) notify(`${bld.icon} ${bld.name} — 인원 철수`);
  if (bld) {
    const pre = document.querySelector('.world-bld[data-bid="' + bldId + '"]');
    if (pre) openBldOv(bld, pre);
  }
  renderAll();
}

function scheduleBldOvClose() {
  _bldOvTimer = setTimeout(() => {
    const ov = document.getElementById('bld-ov');
    if (ov && !ov.matches(':hover')) closeBldOv();
  }, 150);
}

function closeBldOv() {
  const ov = document.getElementById('bld-ov');
  if (ov) ov.style.display = 'none';
}

// ─── WORKER DOTS ─────────────────────────────────────────────
let _workerDots = [];

function syncWorkerDots() {
  const layer = document.getElementById('workers-layer');
  if (!layer) return;
  const total = gs.workers || 1;

  while (_workerDots.length > total) {
    const d = _workerDots.pop();
    if (d.el && d.el.parentNode) d.el.parentNode.removeChild(d.el);
  }
  while (_workerDots.length < total) {
    const el = document.createElement('span');
    el.className = 'wkr';
    el.textContent = '●';
    const x = 80 + Math.random() * 2600;
    el.style.left = Math.round(x) + 'px';
    layer.appendChild(el);
    const spd = 0.2 + Math.random() * 0.4;
    _workerDots.push({ el, x, vx: Math.random() < 0.5 ? spd : -spd });
  }
}

function _tickWorkers() {
  _workerDots.forEach(d => {
    d.x += d.vx;
    if (d.x < 20)   { d.x = 20;   d.vx =  Math.abs(d.vx) * (0.85 + Math.random() * 0.3); }
    if (d.x > 3100) { d.x = 3100; d.vx = -Math.abs(d.vx) * (0.85 + Math.random() * 0.3); }
    d.el.style.left = Math.round(d.x) + 'px';
  });
}

// ─── DRAG SCROLL INIT ────────────────────────────────────────
function initWorldDrag() {
  const wb = document.getElementById('world-bg');
  if (!wb) return;
  let drag = false, dragX = 0, dragSL = 0;

  document.addEventListener('mousedown', e => {
    const r = wb.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
    if (e.target.closest('.world-bld')) return;
    drag = true;
    dragX = e.pageX - wb.offsetLeft;
    dragSL = wb.scrollLeft;
    wb.style.cursor = 'grabbing';
  });

  document.addEventListener('mouseup', () => {
    drag = false;
    if (wb) wb.style.cursor = 'grab';
  });

  document.addEventListener('mousemove', e => {
    if (!drag) return;
    e.preventDefault();
    wb.scrollLeft = dragSL - (e.pageX - wb.offsetLeft - dragX) * 1.3;
  });

  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeBldOv(); hideTechTip(); } });

  const bldOv = document.getElementById('bld-ov');
  if (bldOv) {
    bldOv.addEventListener('mouseenter', () => clearTimeout(_bldOvTimer));
    bldOv.addEventListener('mouseleave', closeBldOv);
  }

  setInterval(_tickWorkers, 80);
  syncWorkerDots();
}
