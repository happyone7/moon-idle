
// ============================================================
//  RENDER: 우주선 제작 탭 — 항상 열려있는 첫 번째 탭
// ============================================================
function renderRocketTab() {
  const innerEl = document.getElementById('rc-inner');
  if (!innerEl) return;

  const parts       = gs.parts || {};
  const builtParts  = PARTS.filter(p => (parts[p.id] || 0) > 0).length;
  const totalParts  = PARTS.length;
  const researchDone  = Object.keys(gs.upgrades || {}).filter(k => gs.upgrades[k]).length;
  const researchTotal = UPGRADES.length;
  const hasMine     = gs.unlocks && gs.unlocks['bld_mine'];
  const hasAssembly = gs.unlocks && gs.unlocks['tab_assembly'];
  const hasLaunch   = gs.unlocks && gs.unlocks['tab_launch'];
  const launchCount = gs.launches || 0;

  // ── Rocket ASCII art — changes with mission phase ──────────
  let rocketArt, phaseLabel, phaseColor;
  if (hasLaunch) {
    rocketArt  = '      *\n     ╱|╲\n    ╱▓|▓╲\n   ╱▓▓|▓▓╲\n  ╔══╧══╗\n  ║READY║\n  ║     ║\n  ╚═════╝\n   █████';
    phaseLabel = '[ 발사 준비 완료 ]';
    phaseColor = 'var(--green)';
  } else if (hasAssembly) {
    rocketArt  = '      ?\n     ╱|╲\n    ╱░|░╲\n   ╱░░|░░╲\n  ╔══╧══╗\n  ║ WIP ║\n  ║ ░░░ ║\n  ╚═════╝\n   ▒▒▒▒▒';
    phaseLabel = '[ 조립 진행 중 ]';
    phaseColor = 'var(--amber)';
  } else if (hasMine) {
    rocketArt  = '      ?\n     ╱X╲\n    ╱X|X╲\n   ╱XX|XX╲\n  ╔══╧══╗\n  ║BUILD║\n  ║XXXXX║\n  ╚═════╝\n   ░░░░░';
    phaseLabel = '[ 기술 연구 중 ]';
    phaseColor = 'var(--green-mid)';
  } else {
    rocketArt  = '      ?\n     ╱X╲\n    ╱XXX╲\n   ╱XXXXX╲\n  ╔══╧══╗\n  ║START║\n  ║     ║\n  ╚═════╝\n   ░░░░░';
    phaseLabel = '[ 기초 연구 필요 ]';
    phaseColor = 'var(--green-dim)';
  }

  // ── Text bar helper ─────────────────────────────────────────
  function bar10(pct) {
    pct = Math.min(100, Math.max(0, pct));
    const f = Math.round(pct / 10);
    return '█'.repeat(f) + '░'.repeat(10 - f);
  }

  // ── Mission phase progress ──────────────────────────────────
  const maxAlt = (gs.history && gs.history.length)
    ? Math.max(...gs.history.map(h => Number(h.altitude) || 0))
    : 0;

  let phasesHtml = '';
  let prevDone   = true;
  PHASES.forEach((ph, i) => {
    const pct    = Math.min(100, (maxAlt / ph.targetAlt) * 100);
    const done   = maxAlt >= ph.targetAlt && gs.launches >= ph.targetLaunches;
    const locked = !prevDone && i > 0;
    if (done) prevDone = true; else prevDone = false;

    const pctLabel = locked ? '잠금' : done ? '완료 ✓' : `${Math.floor(pct)}%`;
    const pctColor = done ? 'var(--green)' : locked ? '#0f1a0f' : 'var(--green-mid)';
    phasesHtml += `<div class="rc-phase-row">
  <div class="rc-phase-name">${ph.name}</div>
  <div class="rc-phase-bar-wrap"><div class="rc-phase-bar-fill${done ? ' done' : ''}" style="width:${locked ? 0 : pct}%"></div></div>
  <div class="rc-phase-pct" style="color:${pctColor}">${pctLabel}</div>
</div>`;
  });

  // ── Next objective ──────────────────────────────────────────
  let nextObj;
  if (!hasMine)
    nextObj = '→ 연구소를 건설하고 <strong>기초 생산 기술</strong>을 연구하세요';
  else if (!hasAssembly)
    nextObj = '→ <strong>합금 + 로켓공학</strong> 기술 연구 시 조립동이 해금됩니다';
  else if (builtParts < totalParts)
    nextObj = `→ 조립동에서 <strong>부품 제작</strong> 진행 중 (${builtParts}/${totalParts})`;
  else if (!hasLaunch)
    nextObj = '→ <strong>발사 제어 시스템</strong> 연구 후 발사 탭이 해금됩니다';
  else
    nextObj = '→ <strong>발사 통제</strong> 탭에서 로켓을 발사하세요!';

  const techPct   = researchTotal > 0 ? (researchDone / researchTotal * 100) : 0;
  const partPct   = totalParts   > 0 ? (builtParts   / totalParts   * 100) : 0;
  const launchPct = Math.min(100, launchCount / 12 * 100);
  const msBonus   = gs.moonstone > 0 ? `+${gs.moonstone * 5}%` : '없음';
  const bldTotal  = Object.values(gs.buildings || {}).reduce((a, b) => a + b, 0);

  innerEl.innerHTML = `<div class="rc-layout">

  <div class="rc-art-col">
    <div class="rc-art-label">ROCKET STATUS</div>
    <pre class="rc-art">${rocketArt}</pre>
    <div class="rc-phase-badge" style="color:${phaseColor}">${phaseLabel}</div>
  </div>

  <div class="rc-main-col">
    <div class="rc-section-hd">// MISSION: 달 탐사 로켓 발사</div>
    <div class="rc-build-rows">
      <div class="rc-build-row">
        <span class="rc-bl">기술 연구</span>
        <span class="rc-bar">[${bar10(techPct)}]</span>
        <span class="rc-bv">${researchDone}/${researchTotal}</span>
      </div>
      <div class="rc-build-row">
        <span class="rc-bl">부품 제작</span>
        <span class="rc-bar">[${bar10(partPct)}]</span>
        <span class="rc-bv">${builtParts}/${totalParts}</span>
      </div>
      <div class="rc-build-row">
        <span class="rc-bl">발사 기록</span>
        <span class="rc-bar" style="color:var(--amber)">[${bar10(launchPct)}]</span>
        <span class="rc-bv" style="color:var(--amber)">${launchCount}/12</span>
      </div>
    </div>
    <div class="rc-next-obj">${nextObj}</div>
    <div class="rc-section-hd" style="margin-top:14px">// 미션 단계</div>
    <div class="rc-phases">${phasesHtml}</div>
  </div>

  <div class="rc-stats-col">
    <div class="rc-stat-hd">// 현황</div>
    <div class="rc-stat-row"><span class="rc-sl">문스톤</span><span class="rc-sv" style="color:var(--amber)">${gs.moonstone > 0 ? '◆ ' + gs.moonstone : '—'}</span></div>
    <div class="rc-stat-row"><span class="rc-sl">생산 보너스</span><span class="rc-sv" style="color:var(--amber)">${msBonus}</span></div>
    <div class="rc-stat-row"><span class="rc-sl">총 발사</span><span class="rc-sv">${launchCount}회</span></div>
    <div class="rc-stat-row"><span class="rc-sl">연구 완료</span><span class="rc-sv">${researchDone}종</span></div>
    <div class="rc-stat-row"><span class="rc-sl">건물 수</span><span class="rc-sv">${bldTotal}동</span></div>
    <div class="rc-stat-row"><span class="rc-sl">배치 인원</span><span class="rc-sv">${getTotalAssigned()}/${gs.workers || 1}명</span></div>
  </div>

</div>`;
}
