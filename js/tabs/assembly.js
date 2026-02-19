
function abortAssembly() {
  ensureAssemblyState();
  let aborted = false;
  gs.assembly.jobs = gs.assembly.jobs.map(j => {
    if (j && !j.ready) { aborted = true; return null; }
    return j;
  });
  if (aborted) {
    notify('조립 취소됨', 'red');
    playSfx('triangle', 220, 0.08, 0.05, 180);
    renderAll();
  }
}

function craftPart(pid) {
  const part = PARTS.find(p => p.id === pid);
  if (!part) return;
  if (gs.parts[pid]) { notify('이미 제작됨'); return; }
  const cost = getPartCost(part);
  if (!canAfford(cost)) { notify('자원 부족', 'red'); return; }
  spend(cost);
  gs.parts[pid] = 1;
  notify(`${part.icon} ${part.name} 제작 완료`);
  playSfx('square', 520, 0.11, 0.03, 760);
  renderAll();
}

function selectQuality(qid) {
  gs.assembly.selectedQuality = qid;
  renderAssemblyTab();
}

function startAssembly(slotIdx) {
  ensureAssemblyState();
  if (!PARTS.every(p => gs.parts[p.id])) { notify('부품을 모두 제작하세요', 'red'); return; }
  if (gs.assembly.jobs[slotIdx]) { notify('슬롯이 사용 중'); return; }
  const q = getQuality(gs.assembly.selectedQuality);
  const cost = getAssemblyCost(q.id);
  if (!canAfford(cost)) { notify('자원 부족', 'red'); return; }
  spend(cost);
  const now = Date.now();
  gs.assembly.jobs[slotIdx] = {
    qualityId: q.id,
    startAt: now,
    endAt: now + q.timeSec * 1000
      * (typeof getAddonTimeMult === 'function' ? getAddonTimeMult() : 1)
      * (typeof getMilestoneAssemblyMult === 'function' ? getMilestoneAssemblyMult() : 1),
    ready: false,
  };
  notify(`슬롯 ${slotIdx + 1}: ${q.name} 조립 시작 (${fmtTime(q.timeSec)})`);
  playSfx('triangle', 310, 0.09, 0.03, 430);
  renderAll();
}

function updateAssemblyJobs(now=Date.now()) {
  ensureAssemblyState();
  for (let i = 0; i < gs.assembly.jobs.length; i++) {
    const job = gs.assembly.jobs[i];
    if (!job || job.ready) continue;
    if (now >= job.endAt) {
      job.ready = true;
      notify(`슬롯 ${i + 1}: ${getQuality(job.qualityId).name} 조립 완료`);
    }
  }
}
// ============================================================
//  RENDER: ASSEMBLY TAB
// ============================================================
function renderAssemblyTab() {
  ensureAssemblyState();
  const pd = gs.parts;

  // Rocket ASCII art with color-coded sections
  const noseClass   = 'r-nose'    + (pd.hull    ? ' done' : '');
  const payClass    = 'r-payload' + (pd.payload  ? ' done' : '');
  const aviClass    = 'r-avionics'+ (pd.control  ? ' done' : '');
  const engClass    = 'r-engine'  + (pd.engine   ? ' done' : '');
  const exhClass    = 'r-exhaust' + ((pd.fueltank && pd.engine) ? ' done' : '');

  const rocketInner = `<span class="${noseClass}">           *
          /|╲
         / | ╲
        /  |  ╲
       /   |   ╲
      /  BETA   ╲
     /   mk.2    ╲
    /______________╲</span>
<span class="${payClass}">   |  [PAYLOAD]    |
   |   _________   |
   |  |  NAV    |  |
   |  |  SYS    |  |
   |  |_________|  |</span>
<span class="${aviClass}">   |               |
   |  [AVIONICS]   |
   |  _________    |
   | | O  O  O |   |
   | |  GYRO   |   |
   | |_________|   |</span>
<span class="${engClass}">   |               |
   | [PROPULSION]  |
   |  _________    |
   | |         |   |
   | | 156 kN  |   |
   | |_________|   |
   |_______________|</span>
<span class="${exhClass}">  / [LOX]  [RP-1]  ╲
 /___________________╲
       |   |   |
      /|   |   |╲
     /_|___|___|_╲</span>`;

  const artDisplay = document.getElementById('rocket-art-display');
  if (artDisplay) artDisplay.innerHTML = rocketInner;

  // Parts checklist
  let partsHtml = '';
  PARTS.forEach(p => {
    const done = gs.parts[p.id];
    const cost = getPartCost(p);
    const costStr = getCostStr(cost);
    const affordable = canAfford(cost);
    partsHtml += `<div class="parts-list-item">
      <span class="part-check ${done ? 'part-done' : 'part-pending'}">${done ? '[✓]' : '[✗]'}</span>
      <span style="flex:1;color:${done ? 'var(--green)' : 'var(--green-dim)'};">${p.icon} ${p.name}</span>
      ${done
        ? '<span style="color:var(--green);font-size:12px;">완료</span>'
        : `<button class="btn btn-sm${affordable ? '' : ' btn-amber'}" onclick="craftPart('${p.id}')" ${affordable ? '' : 'disabled'}>제작</button>`}
    </div>
    ${!done ? `<div style="font-size:11px;color:var(--green-mid);padding:2px 0 4px 22px;">비용: ${costStr}</div>` : ''}`;
  });
  const checklist = document.getElementById('parts-checklist');
  if (checklist) checklist.innerHTML = partsHtml;

  // Quality selector
  let qualHtml = '';
  QUALITIES.forEach(q => {
    const active = gs.assembly.selectedQuality === q.id;
    qualHtml += `<button class="btn q-btn${active ? ' selected' : ''}" onclick="selectQuality('${q.id}')">${q.icon} ${q.name}</button>`;
  });
  const qualSel = document.getElementById('quality-selector');
  if (qualSel) qualSel.innerHTML = qualHtml;

  // Science box
  const q = getQuality(gs.assembly.selectedQuality);
  const sci = getRocketScience(q.id);
  const reward = getMoonstoneReward(q.id);
  const asmCost = getAssemblyCost(q.id);
  const asmCostStr = getCostStr(asmCost);
  const sciBox = document.getElementById('science-box');
  if (sciBox) sciBox.innerHTML = `
    <div class="label-sm">// 로켓 제원 — ${q.name}</div>
    <div>Δv: <span class="val">${sci.deltaV.toFixed(2)} km/s</span>  TWR: <span class="val">${sci.twr.toFixed(2)}</span></div>
    <div>신뢰도: <span class="val">${sci.reliability.toFixed(1)}%</span>  예상 고도: <span class="val">${Math.floor(sci.altitude)} km</span></div>
    <div>조립 시간: <span class="val">${fmtTime(q.timeSec)}</span>  조립 비용: <span class="ms-val">${asmCostStr}</span></div>
    <div>예상 문스톤 보상: <span class="ms-val">+${reward}개</span></div>
  `;

  // Assembly slots
  let slotsHtml = '';
  const now = Date.now();
  gs.assembly.jobs.forEach((job, idx) => {
    if (!job) {
      const canStart = PARTS.every(p => gs.parts[p.id]) && canAfford(asmCost);
      slotsHtml += `<div class="slot-card">
        <div class="slot-card-header">
          <span class="slot-title">// 조립 슬롯 ${idx + 1}</span>
          <span class="slot-state idle">대기 중</span>
        </div>
        <div style="font-size:12px;color:var(--green-mid);margin-bottom:6px;">선택: ${q.name}  |  비용: ${asmCostStr}</div>
        <button class="btn btn-full btn-sm${canStart ? '' : ' btn-amber'}" onclick="startAssembly(${idx})" ${canStart ? '' : 'disabled'}>
          ${canStart ? '[ ▶ 조립 시작 ]' : '[ 부품/자원 부족 ]'}
        </button>
      </div>`;
    } else if (job.ready) {
      const ms = getMoonstoneReward(job.qualityId);
      slotsHtml += `<div class="slot-card" style="border-color:var(--green);">
        <div class="slot-card-header">
          <span class="slot-title glow">// 슬롯 ${idx + 1} — ${getQuality(job.qualityId).name}</span>
          <span class="slot-state ready">발사 준비!</span>
        </div>
        <div style="font-size:12px;color:var(--green-mid);margin-bottom:6px;">예상 문스톤: +${ms}개</div>
        <button class="btn btn-full btn-sm btn-amber" onclick="launchFromSlot(${idx})">[ ▶▶ 발사 실행 ]</button>
      </div>`;
    } else {
      const remain = Math.max(0, Math.floor((job.endAt - now) / 1000));
      const total = Math.max(1, Math.floor((job.endAt - job.startAt) / 1000));
      const pct = Math.min(100, ((total - remain) / total) * 100);
      slotsHtml += `<div class="slot-card" style="border-color:var(--amber);">
        <div class="slot-card-header">
          <span class="slot-title">// 슬롯 ${idx + 1} — ${getQuality(job.qualityId).name}</span>
          <span class="slot-state busy">조립 중 ${fmtTime(remain)}</span>
        </div>
        <div class="prog-wrap"><div class="prog-fill amber" style="width:${pct}%"></div></div>
        <div style="font-size:11px;color:var(--green-mid);">${pct.toFixed(0)}% 완료</div>
      </div>`;
    }
  });
  const slotsWrap = document.getElementById('assembly-slots-wrap');
  if (slotsWrap) slotsWrap.innerHTML = slotsHtml;
}

