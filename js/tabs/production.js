
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

  // Show unlocked buildings as compact rows (hover world for upgrade menus)
  let cardsHtml = '<div style="color:var(--green-mid);font-size:12px;margin-bottom:8px;">// 건물을 마우스로 오버하면 업그레이드 메뉴가 열립니다</div>';
  BUILDINGS.forEach(b => {
    if (!gs.unlocks['bld_' + b.id]) return;
    const cnt = gs.buildings[b.id] || 0;
    const cost = getBuildingCost(b);
    const costStr = getCostStr(cost);
    const affordable = canAfford(cost);
    let rateStr = '';
    if (b.produces !== 'bonus') {
      const rate = b.baseRate * cnt * (prodMult[b.produces] || 1) * globalMult * getMoonstoneMult() * getSolarBonus();
      rateStr = `+${fmtDec(rate, 2)}/s`;
    } else {
      rateStr = b.id === 'solar_array' ? `+${cnt * 10}%` : `+${cnt} 슬롯`;
    }
    cardsHtml += `
<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid #0a1a0a;">
  <span style="color:var(--green-mid);min-width:40px">${b.icon}</span>
  <span style="flex:1;color:var(--green)">${b.name} <span style="color:var(--green-dim)">×${cnt}</span></span>
  <span style="color:var(--green-mid);font-size:12px;min-width:70px;text-align:right">${rateStr}</span>
  <button class="btn btn-sm${affordable ? '' : ' btn-amber'}" style="min-width:64px" onclick="buyBuilding('${b.id}')" ${affordable ? '' : 'disabled'}>
    ${affordable ? '+구매' : '부족'}
  </button>
</div>`;
  });
  const bldGrid = document.getElementById('bld-grid');
  if (bldGrid) bldGrid.innerHTML = cardsHtml;
}

