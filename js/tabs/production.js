
function buyBuilding(bid) {
  const bld = BUILDINGS.find(b => b.id === bid);
  if (!bld) return;
  if (!gs.unlocks['bld_' + bid]) { notify('잠금 해제 필요', 'red'); return; }
  const cost = getBuildingCost(bld);
  if (!canAfford(cost)) { notify('자원 부족', 'red'); return; }
  spend(cost);
  gs.buildings[bid] = (gs.buildings[bid] || 0) + 1;
  notify(`${bld.icon} ${bld.name} 건설 완료 (×${gs.buildings[bid]})`);
  playSfx('triangle', 360, 0.08, 0.03, 520);
  renderAll();
}
// ============================================================
//  RENDER: PRODUCTION TAB
// ============================================================
function renderProductionTab() {
  const prod = getProduction();
  const totalIncome = prod.money;
  const totalW = getTotalWorkers();
  const assignedW = getTotalAssigned();
  const statusEl = document.getElementById('prod-status');
  if (statusEl) statusEl.textContent = `[ 수입: ₩${fmtDec(totalIncome, 1)}/s ]  [ 인원: ${assignedW}/${totalW}명 배치 ]`;

  // Show unlocked buildings as compact rows (hover world buildings for worker assignment)
  let cardsHtml = '<div style="color:var(--green-mid);font-size:12px;margin-bottom:8px;">// 세계관 건물에 마우스를 오버하면 인원 배치 메뉴가 열립니다</div>';
  BUILDINGS.forEach(b => {
    if (!gs.unlocks['bld_' + b.id]) return;
    const cnt = gs.buildings[b.id] || 0;
    const cost = getBuildingCost(b);
    const costStr = getCostStr(cost);
    const affordable = canAfford(cost);
    const assigned = (gs.assignments && gs.assignments[b.id]) || 0;
    let rateStr = '';
    if (b.produces !== 'bonus') {
      const rate = b.baseRate * assigned * (prodMult[b.produces] || 1) * globalMult * getMoonstoneMult() * getSolarBonus();
      rateStr = cnt > 0
        ? (assigned > 0 ? `${assigned}명 → +${fmtDec(rate, 2)}/s` : '<span style="color:var(--amber)">인원 미배치</span>')
        : '<span style="color:var(--green-dim)">미건설</span>';
    } else {
      rateStr = b.id === 'solar_array' ? `+${cnt * 10}%` : `+${cnt} 슬롯`;
    }
    cardsHtml += `
<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid #0a1a0a;">
  <span style="color:var(--green-mid);min-width:40px">${b.icon}</span>
  <span style="flex:1;color:var(--white)">${b.name} <span style="color:var(--green-dim)">×${cnt}</span></span>
  <span style="color:var(--green-mid);font-size:12px;min-width:120px;text-align:right">${rateStr}</span>
  <button class="btn btn-sm${affordable ? '' : ''}" style="min-width:56px;font-size:12px" onclick="buyBuilding('${b.id}')" ${affordable ? '' : 'disabled'}>
    ${cnt > 0 ? (affordable ? '+1동' : '부족') : (affordable ? '건설' : '부족')}
  </button>
</div>`;
  });
  const bldGrid = document.getElementById('bld-grid');
  if (bldGrid) bldGrid.innerHTML = cardsHtml;
}

