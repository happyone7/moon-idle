// ============================================================
//  WORLD BACKGROUND — js/world.js
// ============================================================
const WORLD_POSITIONS = {
  research_lab: 60,  r_and_d: 220,    ops_center: 420,  supply_depot: 600,
  mine: 820,         extractor: 960,   refinery: 1150,   cryo_plant: 1320,
  elec_lab: 1530,    fab_plant: 1700,  solar_array: 1880, launch_pad: 2100,
};

function updateWorldBuildings() {
  const layer = document.getElementById('buildings-layer');
  if (!layer) return;
  layer.innerHTML = '';
  BUILDINGS.forEach(b => {
    if ((gs.buildings[b.id] || 0) === 0) return;
    const x = WORLD_POSITIONS[b.id] || 100;
    const div = document.createElement('div');
    div.className = 'world-building ' + b.wbClass;
    div.style.left = x + 'px';

    if (b.wbClass === 'wb-refinery') {
      div.innerHTML = '<div class="refinery-tank tall"></div><div class="refinery-tank short"></div>';
    } else if (b.wbClass === 'wb-research') {
      div.innerHTML = '<div class="research-windows">'
        + Array(8).fill(0).map((_, i) => `<div class="research-win${i % 3 === 0 ? ' lit' : ''}"></div>`).join('')
        + '</div>';
    } else if (b.wbClass === 'wb-ops') {
      div.innerHTML = '<div class="ops-windows">'
        + Array(10).fill(0).map((_, i) => `<div class="ops-win${i % 2 === 0 ? ' lit' : ''}"></div>`).join('')
        + '</div><div class="ops-sign"></div>';
    } else if (b.wbClass === 'wb-mine') {
      div.innerHTML = '<div class="mine-light"></div><div class="conveyor"></div>';
    } else if (b.wbClass === 'wb-solar') {
      const count = Math.min(gs.buildings[b.id], 5);
      div.innerHTML = Array(count).fill(0).map(() => '<div class="solar-pole"></div><div class="solar-panel"></div>').join('');
    } else if (b.wbClass === 'wb-launchpad') {
      div.innerHTML = '<div class="lp-gantry"></div><div class="lp-rocket"></div><div class="lp-base"></div>';
    }

    // Hover events for building overlay
    div.addEventListener('mouseenter', () => openBldOv(b, div));
    div.addEventListener('mouseleave', () => scheduleBldOvClose());

    layer.appendChild(div);
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
    const rate = bld.baseRate * assigned * (prodMult[bld.produces] || 1) * globalMult * getMoonstoneMult() * getSolarBonus();
    prodLine = assigned > 0 ? `${bld.produces} +${fmtDec(rate, 2)}/s` : '인원 미배치';
  } else {
    prodLine = bld.id === 'solar_array' ? `전체 생산 +${cnt * 10}%` : `발사 슬롯 +${cnt}`;
  }

  const ovEl = document.getElementById('bld-ov');
  if (!ovEl) return;

  document.getElementById('bov-hd').textContent = `${bld.icon} ${bld.name}  ×${cnt}`;
  document.getElementById('bov-cnt').innerHTML = `설명: <span>${bld.desc}</span>`;
  document.getElementById('bov-prod').innerHTML = `생산: <span>${prodLine}</span>`;
  document.getElementById('bov-cost').innerHTML = `비용: <span style="color:${affordable ? 'var(--green)' : 'var(--red)'}">${costStr}</span>`;

  // Worker assignment row (생산 건물만)
  const workerRow = document.getElementById('bov-workers');
  if (workerRow && bld.produces !== 'bonus') {
    const avail = getAvailableWorkers();
    workerRow.style.display = 'block';
    workerRow.innerHTML = `인원: <span>${assigned}명 배치 (여유 ${avail}명)</span>`;
  } else if (workerRow) {
    workerRow.style.display = 'none';
  }

  // Worker assignment buttons
  const wBtns = document.getElementById('bov-worker-btns');
  if (wBtns && bld.produces !== 'bonus') {
    const avail = getAvailableWorkers();
    wBtns.style.display = 'flex';
    wBtns.innerHTML = `
      <button class="bov-btn${avail <= 0 ? ' disabled' : ''}" onclick="assignWorker('${bld.id}')">+ 배치</button>
      <button class="bov-btn amber${assigned <= 0 ? ' disabled' : ''}" onclick="unassignWorker('${bld.id}')">- 철수</button>`;
  } else if (wBtns) {
    wBtns.style.display = 'none';
  }

  const buyBtn = document.getElementById('bov-buy');
  if (buyBtn) {
    buyBtn.textContent = affordable ? '[ 건물 추가 ]' : '[ 자원 부족 ]';
    buyBtn.className = affordable ? 'bov-btn' : 'bov-btn disabled';
    buyBtn.onclick = () => { buyBuilding(bld.id); };
  }

  // Position overlay above the building
  const r = el.getBoundingClientRect();
  const ovW = 280, ovH = 160;
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
  // 오버레이 갱신
  const el = document.querySelector('.world-building.' + bld.wbClass);
  if (el) openBldOv(bld, el);
  renderAll();
}

function unassignWorker(bldId) {
  if (!gs.assignments || !gs.assignments[bldId]) { notify('배치된 인원 없음', 'amber'); return; }
  const bld = BUILDINGS.find(b => b.id === bldId);
  gs.assignments[bldId] = Math.max(0, gs.assignments[bldId] - 1);
  if (gs.assignments[bldId] === 0) delete gs.assignments[bldId];
  if (bld) notify(`${bld.icon} ${bld.name} — 인원 철수`);
  // 오버레이 갱신
  if (bld) {
    const el = document.querySelector('.world-building.' + bld.wbClass);
    if (el) openBldOv(bld, el);
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

// ─── DRAG SCROLL INIT ────────────────────────────────────────
// document 레벨에서 이벤트 캡처 — #app(z-index:10)이 world-bg(z-index:1)를 덮는 문제 우회
function initWorldDrag() {
  const wb = document.getElementById('world-bg');
  if (!wb) return;
  let drag = false, dragX = 0, dragSL = 0;

  document.addEventListener('mousedown', e => {
    const r = wb.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
    if (e.target.closest('.world-building')) return;
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

  // Close overlay on escape
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeBldOv(); });

  // Overlay hover: keep open
  const bldOv = document.getElementById('bld-ov');
  if (bldOv) {
    bldOv.addEventListener('mouseenter', () => clearTimeout(_bldOvTimer));
    bldOv.addEventListener('mouseleave', closeBldOv);
  }
}
