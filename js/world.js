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
  if (bld.produces !== 'bonus') {
    const prod = getProduction();
    const rate = bld.baseRate * cnt * (prodMult[bld.produces] || 1) * globalMult * getMoonstoneMult() * getSolarBonus();
    prodLine = `${bld.produces} +${fmtDec(rate, 2)}/s`;
  } else {
    prodLine = bld.id === 'solar_array' ? `전체 생산 +${cnt * 10}%` : `발사 슬롯 +${cnt}`;
  }

  const ovEl = document.getElementById('bld-ov');
  if (!ovEl) return;
  document.getElementById('bov-hd').textContent = `${bld.icon} ${bld.name}  ×${cnt}`;
  document.getElementById('bov-cnt').innerHTML = `설명: <span>${bld.desc}</span>`;
  document.getElementById('bov-prod').innerHTML = `생산: <span>${prodLine}</span>`;
  document.getElementById('bov-cost').innerHTML = `비용: <span style="color:${affordable ? '#00e676' : '#ff1744'}">${costStr}</span>`;

  const buyBtn = document.getElementById('bov-buy');
  if (buyBtn) {
    buyBtn.textContent = affordable ? '[ 구매 ]' : '[ 자원 부족 ]';
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
function initWorldDrag() {
  const wb = document.getElementById('world-bg');
  if (!wb) return;
  let drag = false, dragX = 0, dragSL = 0;
  wb.addEventListener('mousedown', e => {
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
  wb.addEventListener('mousemove', e => {
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
