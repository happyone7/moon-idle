
function launchFromSlot(slotIdx) {
  ensureAssemblyState();
  const job = gs.assembly.jobs[slotIdx];
  if (!job || !job.ready) return;
  const q = getQuality(job.qualityId);
  const sci = getRocketScience(q.id);
  const earned = getMoonstoneReward(q.id);
  gs.assembly.jobs[slotIdx] = null;
  gs.launches++;
  gs.history.push({
    no: gs.launches,
    quality: q.name,
    deltaV: sci.deltaV.toFixed(2),
    altitude: Math.floor(sci.altitude),
    reliability: sci.reliability.toFixed(1),
    date: `D+${gs.launches * 2}`,
  });
  pendingLaunchMs = earned;
  pendingLaunchData = { q, sci, earned };

  // Switch to launch tab
  switchMainTab('launch');

  // Run animation sequence
  _runLaunchAnimation(q, sci, earned);
}

function _runLaunchAnimation(q, sci, earned) {
  launchInProgress = true;

  const animWrap = document.getElementById('launch-anim-wrap');
  if (!animWrap) return;

  // Build ASCII rocket + exhaust
  animWrap.innerHTML = `
<div id="launch-rocket-cnt" style="text-align:center;position:relative;">
<pre class="launch-rocket-ascii" id="launch-rocket-pre">    *
   /|\\
  / | \\
 /  |  \\
|ENGINE |
|_______|</pre>
<pre class="exhaust-anim" id="exhaust-art" style="display:none;">  |||
 |||||
  |||</pre>
</div>`;

  // Add 'launching' class after short delay
  setTimeout(() => {
    const rocketEl = document.getElementById('launch-rocket-pre');
    if (rocketEl) rocketEl.classList.add('launching');
    const exhaustEl = document.getElementById('exhaust-art');
    if (exhaustEl) exhaustEl.style.display = 'block';
  }, 100);

  // Telemetry lines
  const telemWrap = document.getElementById('telem-wrap');
  if (telemWrap) telemWrap.innerHTML = '<div class="panel-header">텔레메트리</div>';

  const telemDiv = document.createElement('div');
  telemDiv.className = 'telemetry-wrap';
  if (telemWrap) telemWrap.appendChild(telemDiv);

  const steps = [
    { delay: 0,    label: 'T+0',  event: 'IGNITION',             pct: 15 },
    { delay: 600,  label: 'T+3',  event: 'MAX-Q 통과',            pct: 35 },
    { delay: 1200, label: 'T+8',  event: 'MECO',                 pct: 60 },
    { delay: 1800, label: 'T+12', event: '단계 분리',              pct: 78 },
    { delay: 2400, label: 'T+20', event: `목표 고도 달성 ${Math.floor(sci.altitude)}km`, pct: 100 },
  ];

  steps.forEach((step, i) => {
    setTimeout(() => {
      const line = document.createElement('div');
      line.className = 'telem-line';
      line.innerHTML = `
        <span class="telem-time">${step.label}</span>
        <span class="telem-event">${step.event}</span>
        <div class="telem-bar"><div class="telem-bar-fill" style="width:${step.pct}%"></div></div>
        <span class="telem-pct">${step.pct}%</span>`;
      telemDiv.appendChild(line);
      playSfx('triangle', 300 + i * 40, 0.06, 0.02, 400 + i * 30);
    }, step.delay);
  });

  // After last telemetry (3000ms), show result panel
  setTimeout(() => {
    const lr = document.getElementById('launch-result');
    if (lr) {
      lr.classList.add('show');
      const lrStats = document.getElementById('lr-stats');
      if (lrStats) lrStats.innerHTML = `
        <span class="launch-result-stat-lbl">기체</span><span class="launch-result-stat-val">${q.name}</span>
        <span class="launch-result-stat-lbl">Δv</span><span class="launch-result-stat-val">${sci.deltaV.toFixed(2)} km/s</span>
        <span class="launch-result-stat-lbl">TWR</span><span class="launch-result-stat-val">${sci.twr.toFixed(2)}</span>
        <span class="launch-result-stat-lbl">최고도</span><span class="launch-result-stat-val">${Math.floor(sci.altitude)} km</span>
        <span class="launch-result-stat-lbl">신뢰도</span><span class="launch-result-stat-val">${sci.reliability.toFixed(1)}%</span>
      `;
      const lrMs = document.getElementById('lr-ms');
      if (lrMs) lrMs.textContent = `문스톤 보상: +${earned}개`;
    }
  }, 3000);

  // After 3.5s show overlay
  setTimeout(() => {
    launchInProgress = false;
    playLaunchSfx();
    _showLaunchOverlay(q, sci, earned);
  }, 3500);
}

function _showLaunchOverlay(q, sci, earned) {
  const loRocket = document.getElementById('lo-rocket-art');
  if (loRocket) loRocket.textContent =
`    *
   /|\\
  / | \\
 /  |  \\
|ENGINE |
|_______|`;
  const loStats = document.getElementById('lo-stats');
  if (loStats) loStats.innerHTML =
    `기체: ${q.name}  |  Δv: ${sci.deltaV.toFixed(2)} km/s  |  고도: ${Math.floor(sci.altitude)} km<br>TWR: ${sci.twr.toFixed(2)}  |  신뢰도: ${sci.reliability.toFixed(1)}%`;
  const loMs = document.getElementById('lo-ms');
  if (loMs) loMs.textContent = `문스톤 +${earned}개 획득 예정`;
  const overlay = document.getElementById('launch-overlay');
  if (overlay) overlay.classList.add('show');
}
// ============================================================
//  RENDER: LAUNCH TAB
// ============================================================
function renderLaunchTab() {
  ensureAssemblyState();
  let readyHtml = '';
  gs.assembly.jobs.forEach((job, idx) => {
    if (!job) return;
    if (job.ready) {
      const ms = getMoonstoneReward(job.qualityId);
      readyHtml += `<div class="ready-slot-row">
        <span style="color:var(--green);">슬롯 ${idx + 1}: ${getQuality(job.qualityId).name}</span>
        <span style="color:var(--green);font-size:12px;">[준비 완료]</span>
        <button class="btn btn-sm btn-amber" onclick="launchFromSlot(${idx})">[ ▶▶ 발사 ]</button>
      </div>`;
    } else {
      const remain = Math.max(0, Math.floor((job.endAt - Date.now()) / 1000));
      readyHtml += `<div class="ready-slot-row">
        <span style="color:var(--amber);">슬롯 ${idx + 1}: ${getQuality(job.qualityId).name}</span>
        <span style="color:var(--amber);font-size:12px;">조립 중 ${fmtTime(remain)}</span>
      </div>`;
    }
  });
  if (!readyHtml) {
    readyHtml = '<div style="color:var(--green-dim);font-size:13px;">// 준비된 로켓이 없습니다. 조립동에서 로켓을 조립하세요.</div>';
  }
  const readyWrap = document.getElementById('ready-list-wrap');
  if (readyWrap) readyWrap.innerHTML = readyHtml;
}

