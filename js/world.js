// ============================================================
//  WORLD BACKGROUND
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

    layer.appendChild(div);
  });
}

let worldOffset = 0;
function animateWorld() {
  worldOffset = (worldOffset + 0.3) % 1500;
  const scene = document.getElementById('world-scene');
  if (scene) scene.style.transform = `translateX(-${worldOffset}px)`;
  requestAnimationFrame(animateWorld);
}

