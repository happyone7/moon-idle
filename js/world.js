// ============================================================
//  WORLD — js/world.js
// ============================================================
const WORLD_POSITIONS = {
  research_lab: 30,  r_and_d: 230,
  ops_center: 440,   supply_depot: 630, mine: 850,
  extractor: 1010,   refinery: 1200,   cryo_plant: 1390,
  elec_lab: 1590,    fab_plant: 1760,  solar_array: 1950,
  launch_pad: 2150,
};

// ─── ASCII BUILDING ART ─────────────────────────────────────
function _bldAscii(bld) {
  switch (bld.wbClass) {

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
        '      /▲\\\n' +
        '     / ▓ \\\n' +
        '    /  ▓  \\\n' +
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

// ─── BUILDING HOVER OVERLAY ─────────────────────────────────
let _bldOvTimer = null;

function openBldOv(bld, el) {
  clearTimeout(_bldOvTimer);
  const cnt = gs.buildings[bld.id] || 0;
  const cost = getBuildingCost(bld);
  const costStr = getCostStr(cost);
  const affordable = canAfford(cost);

  // Production rate line
  let prodLine = '';
  const assigned = (gs.assignments && gs.assignments[bld.id]) || 0;
  if (bld.produces !== 'bonus') {
    const rate = bld.baseRate * assigned * (prodMult[bld.produces] || 1) * globalMult * getMoonstoneMult() * getSolarBonus() * getBldProdMult(bld.id);
    prodLine = assigned > 0 ? `${bld.produces} +${fmtDec(rate, 2)}/s` : '인원 미배치';
  } else if (bld.id === 'solar_array') {
    prodLine = `전체 생산 +${cnt * 10}%`;
  } else if (bld.id === 'launch_pad') {
    prodLine = `발사 슬롯 +${cnt}`;
  } else {
    prodLine = bld.desc;
  }

  const ovEl = document.getElementById('bld-ov');
  if (!ovEl) return;

  document.getElementById('bov-hd').textContent = `${bld.icon} ${bld.name}  ×${cnt}`;
  document.getElementById('bov-cnt').innerHTML = `설명: <span>${bld.desc}</span>`;
  document.getElementById('bov-prod').innerHTML = `생산: <span>${prodLine}</span>`;
  document.getElementById('bov-cost').innerHTML = `다음 건설: <span style="color:${affordable ? 'var(--green)' : 'var(--red)'}">${costStr}</span>`;

  // Worker assignment row (생산 건물만)
  const workerRow = document.getElementById('bov-workers');
  if (workerRow && bld.produces !== 'bonus') {
    const avail = getAvailableWorkers();
    workerRow.style.display = 'block';
    workerRow.innerHTML = `인원: <span>${assigned}명 배치 (여유 ${avail}명)</span>`;
  } else if (workerRow) {
    workerRow.style.display = 'none';
  }

  // Building level + upgrade (생산 건물이 1개 이상 있을 때만)
  const lvRow = document.getElementById('bov-level');
  const upgCostRow = document.getElementById('bov-upg-cost');
  const upgBtn = document.getElementById('bov-upg');
  if (cnt > 0 && bld.produces !== 'bonus') {
    const lv = getBldLevel(bld.id);
    const mult = getBldProdMult(bld.id);
    if (lvRow) {
      lvRow.style.display = 'block';
      lvRow.innerHTML = `레벨: <span>Lv.${lv + 1}  (+${Math.round((mult - 1) * 100)}% 생산)</span>`;
    }
    const upgCost = getBldUpgradeCost(bld.id);
    const upgAfford = canAfford(upgCost);
    if (upgCostRow) {
      upgCostRow.style.display = 'block';
      upgCostRow.innerHTML = `업그레이드: <span style="color:${upgAfford ? 'var(--green)' : 'var(--red)'}">${getCostStr(upgCost)}</span>`;
    }
    if (upgBtn) {
      upgBtn.style.display = '';
      upgBtn.className = 'bov-btn amber' + (upgAfford ? '' : ' disabled');
      upgBtn.onclick = () => upgBuilding(bld.id);
    }
  } else {
    if (lvRow) lvRow.style.display = 'none';
    if (upgCostRow) upgCostRow.style.display = 'none';
    if (upgBtn) upgBtn.style.display = 'none';
  }

  // Worker assignment buttons (생산 건물만)
  const wBtns = document.getElementById('bov-worker-btns');
  if (wBtns && bld.produces !== 'bonus') {
    const avail = getAvailableWorkers();
    wBtns.style.display = 'flex';
    wBtns.innerHTML =
      `<button class="bov-btn${avail <= 0 ? ' disabled' : ''}" onclick="assignWorker('${bld.id}')">+ 배치</button>` +
      `<button class="bov-btn amber${assigned <= 0 ? ' disabled' : ''}" onclick="unassignWorker('${bld.id}')">- 철수</button>`;
  } else if (wBtns) {
    wBtns.style.display = 'none';
  }

  const buyBtn = document.getElementById('bov-buy');
  if (buyBtn) {
    buyBtn.textContent = affordable ? '[ 건물 추가 ]' : '[ 자원 부족 ]';
    buyBtn.className = affordable ? 'bov-btn' : 'bov-btn disabled';
    buyBtn.onclick = () => { buyBuilding(bld.id); };
  }

  // Position overlay above building
  const r = el.getBoundingClientRect();
  const ovW = 290, ovH = 220;
  let lx = r.left - 10;
  let ty = r.top - ovH - 8;
  if (lx + ovW > window.innerWidth - 6) lx = window.innerWidth - ovW - 6;
  if (lx < 4) lx = 4;
  if (ty < 4) ty = r.bottom + 6;
  ovEl.style.left = lx + 'px';
  ovEl.style.top = ty + 'px';
  ovEl.style.display = 'block';
}

// ─── WORKER ASSIGNMENT ───────────────────────────────────────
function assignWorker(bldId) {
  if (!gs.assignments) gs.assignments = {};
  const bld = BUILDINGS.find(b => b.id === bldId);
  if (!bld) return;
  const cnt = gs.buildings[bldId] || 0;
  const assigned = gs.assignments[bldId] || 0;
  if (cnt === 0) { notify('건물이 없습니다', 'red'); return; }
  if (getAvailableWorkers() <= 0) { notify('여유 인원 없음', 'red'); return; }
  if (assigned >= cnt) { notify('건물 수용 한도 초과', 'amber'); return; }
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

  // Remove excess dots
  while (_workerDots.length > total) {
    const d = _workerDots.pop();
    if (d.el && d.el.parentNode) d.el.parentNode.removeChild(d.el);
  }

  // Add missing dots
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

  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeBldOv(); });

  const bldOv = document.getElementById('bld-ov');
  if (bldOv) {
    bldOv.addEventListener('mouseenter', () => clearTimeout(_bldOvTimer));
    bldOv.addEventListener('mouseleave', closeBldOv);
  }

  // Worker dot animation loop
  setInterval(_tickWorkers, 80);
  syncWorkerDots();
}
