
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
  const workers = getTotalWorkers();
  const statusEl = document.getElementById('prod-status');
  if (statusEl) statusEl.textContent = `[ 총 수입: ₩${fmtDec(totalIncome, 1)}/s ]  [ 가동 시설: ${workers}개 ]`;

  let cardsHtml = '';
  BUILDINGS.forEach(b => {
    if (!gs.unlocks['bld_' + b.id]) return;
    const cnt = gs.buildings[b.id] || 0;
    const cost = getBuildingCost(b);
    const costStr = getCostStr(cost);
    const affordable = canAfford(cost);
    let rateStr = '';
    if (b.produces !== 'bonus') {
      const rate = b.baseRate * cnt * (prodMult[b.produces] || 1) * globalMult * getMoonstoneMult() * getSolarBonus();
      rateStr = `${b.produces} +${fmtDec(rate, 2)}/s`;
    } else {
      rateStr = b.id === 'solar_array' ? `전체 생산 +${cnt * 10}%` : `발사 슬롯 +${cnt}`;
    }
    cardsHtml += `
<div class="bld-card">
  <div class="bld-card-top">
    <span class="bld-name">${b.icon} ${b.name}</span>
    <span class="bld-cnt">×${cnt}</span>
  </div>
  <div class="bld-desc">${b.desc}</div>
  <div class="bld-rate">${rateStr}</div>
  <div class="bld-cost">비용: ${costStr}</div>
  <button class="btn btn-sm btn-full${affordable ? '' : ' btn-amber'}" onclick="buyBuilding('${b.id}')" ${affordable ? '' : 'disabled'}>
    ${affordable ? '[ 구매 ]' : '[ 자원 부족 ]'}
  </button>
</div>`;
  });
  const bldGrid = document.getElementById('bld-grid');
  if (bldGrid) bldGrid.innerHTML = cardsHtml;
}

