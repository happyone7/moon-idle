
let _prevAllGo = false; // ALL SYSTEMS GO 전환 감지용

function launchFromSlot(slotIdx) {
  if (launchInProgress) return; // 중복 발사 방지
  ensureAssemblyState();
  const job = gs.assembly.jobs[slotIdx];
  if (!job || !job.ready) return;
  const q = getQuality(job.qualityId);
  const sci = getRocketScience(q.id);

  // 신뢰도 기반 성공/실패 판정 (첫 발사는 무조건 성공 — DESIGN-005)
  const rollSuccess = gs.launches === 0 || Math.random() * 100 < sci.reliability;
  const earned = rollSuccess ? getMoonstoneReward(q.id) : 0;

  // P5-1: 실패 시 부품 일부 손실 (50% 확률로 각 부품 소실)
  if (!rollSuccess) {
    PARTS.forEach(p => {
      if (gs.parts[p.id] && Math.random() < 0.5) {
        gs.parts[p.id] = 0;
      }
    });
  }

  gs.assembly.jobs[slotIdx] = null;
  gs.launches++;
  if (rollSuccess) gs.successfulLaunches = (gs.successfulLaunches || 0) + 1;

  gs.history.push({
    no: gs.launches,
    quality: q.name,
    qualityId: job.qualityId,
    deltaV: sci.deltaV.toFixed(2),
    altitude: rollSuccess ? Math.floor(sci.altitude) : 0,
    reliability: sci.reliability.toFixed(1),
    success: rollSuccess,
    earned: earned,
    date: `D+${gs.launches * 2}`,
  });
  pendingLaunchMs = earned;
  pendingLaunchData = { q, sci, earned, success: rollSuccess };

  // Switch to launch tab
  switchMainTab('launch');

  // Run animation sequence
  _runLaunchAnimation(q, sci, earned, rollSuccess);
}

// ============================================================
//  STAGE BAR HELPERS
// ============================================================
function _setLcStage(activeIdx) {
  document.querySelectorAll('.lc-stage-seg').forEach(seg => {
    const idx = parseInt(seg.dataset.idx, 10);
    seg.classList.remove('active', 'done', 'fail');
    if (idx === activeIdx) seg.classList.add('active');
    else if (activeIdx >= 0 && idx < activeIdx) seg.classList.add('done');
  });
}

function _setLcStageFail() {
  document.querySelectorAll('.lc-stage-seg').forEach(seg => {
    const idx = parseInt(seg.dataset.idx, 10);
    seg.classList.remove('active', 'done', 'fail');
    if (idx === 0) seg.classList.add('done');
    if (idx === 1 || idx === 2) seg.classList.add('done');
    if (idx >= 3) seg.classList.add('fail');
  });
}

// ============================================================
//  LAUNCH ANIMATION
// ============================================================
function _runLaunchAnimation(q, sci, earned, success = true) {
  launchInProgress = true;
  if (typeof BGM !== 'undefined' && gs.settings.sound) BGM.playEvent('launch');

  // 헤더 업데이트
  const missionNumEl = document.getElementById('lc-mission-num');
  if (missionNumEl) missionNumEl.textContent = String(gs.launches).padStart(3, '0');
  const statusTextEl = document.getElementById('lc-status-text');
  if (statusTextEl) statusTextEl.textContent = '// LAUNCHING';

  // Stage bar: T+0 이전에는 PRE-LAUNCH 표시
  _setLcStage(0);

  // 중앙 존 토글
  const preLaunch = document.getElementById('lc-pre-launch');
  const animZone  = document.getElementById('lc-anim-zone');
  if (preLaunch) preLaunch.style.display = 'none';
  if (animZone)  animZone.classList.add('active');

  const animWrap = document.getElementById('launch-anim-wrap');
  if (!animWrap) return;

  // ASCII 로켓 + 배기
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

  setTimeout(() => {
    const rocketEl = document.getElementById('launch-rocket-pre');
    if (rocketEl) rocketEl.classList.add('launching');
    const exhaustEl = document.getElementById('exhaust-art');
    if (exhaustEl) exhaustEl.style.display = 'block';
  }, 100);

  // T+ 타이머
  const launchTime = Date.now();
  const timerEl = document.getElementById('lc-t-timer');
  const timerInterval = setInterval(() => {
    if (!timerEl) { clearInterval(timerInterval); return; }
    const elapsed = Math.floor((Date.now() - launchTime) / 1000);
    const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const ss = String(elapsed % 60).padStart(2, '0');
    timerEl.textContent = `T+ ${mm}:${ss}`;
  }, 1000);

  // 라이브 속도/고도 게이지
  const maxSpeed = Math.round(sci.deltaV * 3600); // km/s → km/h
  const maxAlt   = Math.floor(sci.altitude);
  const animDuration = success ? 3000 : 2000;

  const gaugeInterval = setInterval(() => {
    const elapsed = Date.now() - launchTime;
    const speedEl  = document.getElementById('lc-speed-val');
    const altEl    = document.getElementById('lc-alt-val');
    const speedBar = document.getElementById('lc-speed-bar');
    const altBar   = document.getElementById('lc-alt-bar');

    if (success) {
      const t = Math.min(1, elapsed / animDuration);
      const easedSpeed = t * t;
      const easedAlt   = t < 0.8 ? (t / 0.8) * (t / 0.8) : 1;
      const curSpeed = Math.round(easedSpeed * maxSpeed);
      const curAlt   = Math.round(easedAlt   * maxAlt);
      if (speedEl)  speedEl.textContent  = curSpeed.toLocaleString();
      if (altEl)    altEl.textContent    = curAlt.toLocaleString();
      if (speedBar) speedBar.style.width = Math.min(100, (curSpeed / (maxSpeed || 1)) * 100).toFixed(1) + '%';
      if (altBar)   altBar.style.width   = Math.min(100, (curAlt   / (maxAlt   || 1)) * 100).toFixed(1) + '%';
    } else {
      const anomalyT = 1200;
      if (elapsed < anomalyT) {
        const t2 = elapsed / anomalyT;
        const spd = Math.round(t2 * t2 * maxSpeed * 0.45);
        const alt = Math.round(t2 * maxAlt * 0.35);
        if (speedEl)  speedEl.textContent  = spd.toLocaleString();
        if (altEl)    altEl.textContent    = alt.toLocaleString();
        if (speedBar) speedBar.style.width = Math.min(100, (spd / (maxSpeed || 1)) * 100).toFixed(1) + '%';
        if (altBar)   altBar.style.width   = Math.min(100, (alt  / (maxAlt   || 1)) * 100).toFixed(1) + '%';
      } else {
        // 폭발 후 드롭
        const t3 = Math.min(1, (elapsed - anomalyT) / 600);
        const peakSpd = Math.round(maxSpeed * 0.45 * 1);
        const peakAlt = Math.round(maxAlt * 0.35);
        const spd = Math.round(peakSpd * (1 - t3));
        const alt = Math.round(peakAlt * (1 - t3));
        if (speedEl)  speedEl.textContent  = Math.max(0, spd).toLocaleString();
        if (altEl)    altEl.textContent    = Math.max(0, alt).toLocaleString();
        if (speedBar) { speedBar.style.width = '0%'; speedBar.style.background = 'var(--red)'; }
        if (altBar)   { altBar.style.width   = '0%'; altBar.style.background   = 'var(--red)'; }
      }
    }
  }, 50);

  // 게이지 인터벌 해제
  setTimeout(() => clearInterval(gaugeInterval), success ? 4000 : 3500);

  // 텔레메트리 로그
  const telemWrap = document.getElementById('telem-wrap');
  if (telemWrap) telemWrap.innerHTML = '<div style="color:var(--green-dim);font-size:10px;letter-spacing:.15em;padding:4px 0 4px;border-bottom:1px solid var(--green-dim);margin-bottom:4px;">// TELEMETRY LOG</div>';

  const telemDiv = document.createElement('div');
  telemDiv.className = 'telemetry-wrap';
  if (telemWrap) telemWrap.appendChild(telemDiv);

  const steps = success ? [
    { delay: 0,    label: 'T+0',  event: 'IGNITION',                              pct: 15,  stage: 1 },
    { delay: 600,  label: 'T+3',  event: 'MAX-Q 통과',                             pct: 35,  stage: 2 },
    { delay: 1200, label: 'T+8',  event: 'MECO',                                  pct: 60,  stage: 3 },
    { delay: 1800, label: 'T+12', event: '단계 분리',                               pct: 78,  stage: 4 },
    { delay: 2400, label: 'T+20', event: `목표 고도 달성 ${Math.floor(sci.altitude)}km`, pct: 100, stage: 5 },
  ] : [
    { delay: 0,    label: 'T+0',  event: 'IGNITION',                              pct: 15,  stage: 1 },
    { delay: 600,  label: 'T+3',  event: 'MAX-Q 통과',                             pct: 35,  stage: 2 },
    { delay: 1200, label: 'T+7',  event: '!! ANOMALY DETECTED !!',                pct: 48,  stage: -1, fail: true },
    { delay: 1800, label: 'T+8',  event: '!! STRUCTURAL FAILURE !!',              pct: 48,  stage: -1, fail: true },
    { delay: 2400, label: 'T+14', event: '// MISSION LOST — RUD',                 pct: 0,   stage: -1, fail: true },
  ];

  steps.forEach((step, i) => {
    setTimeout(() => {
      // 단계 바 갱신
      if (step.fail) _setLcStageFail();
      else _setLcStage(step.stage);

      // 상태 텍스트
      if (statusTextEl) {
        statusTextEl.textContent = step.fail ? '// ANOMALY' : `// ${step.event.replace(/!+/g, '').trim().toUpperCase()}`;
      }

      const line = document.createElement('div');
      line.className = 'telem-line' + (step.fail ? ' telem-fail' : '');
      line.innerHTML =
        `<span class="telem-time">${step.label}</span>` +
        `<span class="telem-event">${step.event}</span>` +
        `<span class="telem-pct">${step.pct}%</span>`;
      telemDiv.appendChild(line);

      if (step.fail) {
        playSfx('sawtooth', 180 - i * 20, 0.14, 0.05, 80);
      } else {
        playSfx('triangle', 300 + i * 40, 0.06, 0.02, 400 + i * 30);
      }
    }, step.delay);
  });

  // 실패 프레임
  if (!success) {
    const FAIL_FRAMES = [
      '       *\n' +
      '     /\\!\\  GYRO ALERT\n' +
      '    / !! \\\n' +
      '   / WARN \\\n' +
      '  |  ROLL  |\n' +
      '  |__+47°__|',
      '    \\  * . /\n' +
      '  . * \u2554\u2550\u2557 * .\n' +
      ' * \u2591\u2591\u2591\u2551!\u2551\u2591\u2591\u2591 *\n' +
      '  \u2591\u2592\u2593\u2593\u2588\u2588\u2588\u2593\u2593\u2592\u2591\n' +
      '   \u2591\u2592\u2593\u2588\u2588\u2588\u2588\u2593\u2592\u2591\n' +
      '  ~~ FIRE ~~',
      '     .   \u00b7   .\n' +
      '   \u00b7   .   \u00b7\n' +
      '    \u2591  \u2592\u2593\u2592  \u2591\n' +
      '  \u2591\u2591\u2592\u2593\u2588\u2588\u2588\u2588\u2588\u2593\u2592\u2591\u2591\n' +
      '  \u2500\u2500\u2500\u2550\u2550\u2564\u2550\u2550\u2500\u2500\u2500\n' +
      '  \u2593\u2593 DAMAGED \u2593\u2593',
    ];
    FAIL_FRAMES.forEach((frame, fi) => {
      setTimeout(() => {
        const rocketEl = document.getElementById('launch-rocket-pre');
        if (rocketEl) {
          rocketEl.classList.remove('launching');
          rocketEl.style.color = 'var(--red)';
          rocketEl.textContent = frame;
        }
      }, 1400 + fi * 700);
    });
  }

  // 3000ms: 결과 패널 표시
  setTimeout(() => {
    const lr = document.getElementById('launch-result');
    if (lr) {
      lr.classList.add('show');
      const lrTitle = document.getElementById('lr-title');
      if (lrTitle) lrTitle.textContent = success ? '// 발사 성공' : '// 발사 실패';
      const lrStats = document.getElementById('lr-stats');
      if (lrStats) lrStats.innerHTML =
        `<span class="launch-result-stat-lbl">기체</span><span class="launch-result-stat-val">${q.name}</span>` +
        `<span class="launch-result-stat-lbl">Δv</span><span class="launch-result-stat-val">${sci.deltaV.toFixed(2)} km/s</span>` +
        `<span class="launch-result-stat-lbl">TWR</span><span class="launch-result-stat-val">${sci.twr.toFixed(2)}</span>` +
        `<span class="launch-result-stat-lbl">최고도</span><span class="launch-result-stat-val">${success ? Math.floor(sci.altitude) : '---'} km</span>` +
        `<span class="launch-result-stat-lbl">신뢰도</span><span class="launch-result-stat-val">${sci.reliability.toFixed(1)}%</span>`;
      const lrMs = document.getElementById('lr-ms');
      if (lrMs) {
        if (success) {
          lrMs.textContent = `문스톤 보상: +${earned}개`;
          lrMs.style.color = 'var(--amber)';
        } else {
          lrMs.textContent = `발사 실패 — 문스톤 0 / 부품 일부 손실`;
          lrMs.style.color = 'var(--red)';
        }
      }
    }
    if (statusTextEl) statusTextEl.textContent = success ? '// MISSION COMPLETE' : '// MISSION LOST';
    if (success) _setLcStage(5);
    clearInterval(timerInterval);
  }, 3000);

  // 3500ms: 오버레이 + 완료 처리
  setTimeout(() => {
    launchInProgress = false;
    if (success) {
      playLaunchSfx();
    } else {
      if (typeof playSfx_launchFail === 'function') playSfx_launchFail();
    }
    if (typeof BGM !== 'undefined' && gs.settings.sound) BGM.stopEvent();
    _showLaunchOverlay(q, sci, earned, success);
  }, 3500);
}

function _showLaunchOverlay(q, sci, earned, success = true) {
  const loTitle = document.getElementById('lo-title');
  if (loTitle) loTitle.textContent = success ? '// 달 탐사 성공' : '// 발사 실패';
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
    `기체: ${q.name}  |  Δv: ${sci.deltaV.toFixed(2)} km/s  |  고도: ${success ? Math.floor(sci.altitude) : '---'} km<br>TWR: ${sci.twr.toFixed(2)}  |  신뢰도: ${sci.reliability.toFixed(1)}%`;
  const loMs = document.getElementById('lo-ms');
  if (loMs) {
    if (success) {
      loMs.textContent = `✓ 발사 성공 — 문스톤 +${earned}개`;
      loMs.style.color = 'var(--green)';
      playSfx('sine', 1200, 0.10, 0.03, 1600);
    } else {
      loMs.textContent = `✗ 발사 실패 — 신뢰도 부족 (${sci.reliability.toFixed(1)}%)`;
      loMs.style.color = 'var(--red)';
      playSfx('sawtooth', 220, 0.20, 0.06, 80);
      setTimeout(() => playSfx('sawtooth', 160, 0.22, 0.05, 60), 200);
    }
  }
  const overlay = document.getElementById('launch-overlay');
  if (overlay) overlay.classList.add('show');
}

// ============================================================
//  LAUNCH READY — 첫 번째 완성 슬롯 발사
// ============================================================
function launchReady() {
  ensureAssemblyState();
  let readySlot = -1;
  gs.assembly.jobs.forEach((job, idx) => {
    if (job && job.ready && readySlot === -1) readySlot = idx;
  });
  if (readySlot >= 0) launchFromSlot(readySlot);
}

// ============================================================
//  ROCKET ASCII ART HELPER — per-part color HTML
// ============================================================
function _lcRocketArtHtml() {
  const p = gs.parts || {};
  const jobs = (gs.assembly && gs.assembly.jobs) || [];
  const now = Date.now();

  let readyJob = null;
  jobs.forEach(j => { if (j && j.ready && !readyJob) readyJob = j; });
  let inProgressJob = null;
  jobs.forEach(j => { if (j && !j.ready && j.endAt && !inProgressJob) inProgressJob = j; });

  const col = (partKey) => {
    if (readyJob) return 'var(--green)';
    return (p[partKey]) ? 'var(--amber)' : '#1f3520';
  };

  const partsDone  = PARTS.filter(pt => p[pt.id]).length;
  const totalParts = PARTS.length;
  const partsPct   = Math.round((partsDone / totalParts) * 100);

  let asmPct = 0;
  if (readyJob) {
    asmPct = 100;
  } else if (inProgressJob) {
    const elapsed = Math.max(0, now - inProgressJob.startAt);
    const total   = Math.max(1, inProgressJob.endAt - inProgressJob.startAt);
    asmPct = Math.min(100, (elapsed / total) * 100);
  }

  const payC = col('payload');
  const ctlC = col('control');
  const hulC = col('hull');
  const ftkC = col('fueltank');
  const engC = col('engine');

  const span = (color, text) => `<span style="color:${color}">${text}</span>`;

  const lines = [
    span('var(--green-dim)', '         *          '),
    span(payC,               '        /|\\         '),
    span(payC,               '       / | \\        '),
    span(payC,               '      /  |  \\       '),
    span(payC,               '     / PYLD \\       '),
    span(payC,               '    |---------|      '),
    span(payC,               '    | PAYLOAD |      '),
    span(hulC,               '    |=========|      '),
    span(ctlC,               readyJob ? '    | [READY] |      ' : '    | CONTROL |      '),
    span(hulC,               '    |=========|      '),
    span(hulC,               '    |  HULL   |      '),
    span(hulC,               '    |         |      '),
    span(hulC,               '    |  HULL   |      '),
    span(hulC,               '    |=========|      '),
    span(ftkC,               '    |[== LOX ==]|    '),
    span(ftkC,               '    |[== RP1 ==]|    '),
    span(ftkC,               '    |===========|    '),
    span(engC,               '   /|   ENGINE  |\\   '),
    span(engC,               '  / |___________|\\   '),
    span('var(--green-dim)', ' *     |  |  |   *  '),
    span(engC,               '       | ||  |       '),
    span(engC,               '      |||||||         '),
    span('var(--green-dim)', '     [== PAD ==]      '),
  ];

  const barLen = 12;
  const filledP = Math.round(partsPct / 100 * barLen);
  const filledA = Math.round(asmPct   / 100 * barLen);
  const barColor = readyJob ? 'var(--green)' : 'var(--amber)';

  let progressHtml = `<div style="font-size:10px;color:var(--green-dim);text-align:center;margin-top:8px;font-family:'Courier New',Consolas,monospace;">`;
  progressHtml += `<span style="color:var(--green-dim)">부품: </span><span style="color:${barColor}">${'█'.repeat(filledP)}${'░'.repeat(barLen - filledP)}</span> <span style="color:${barColor}">${partsPct}%</span>`;
  if (inProgressJob || readyJob) {
    const asmColor = readyJob ? 'var(--green)' : 'var(--amber)';
    progressHtml += `<br><span style="color:var(--green-dim)">조립: </span><span style="color:${asmColor}">${'█'.repeat(filledA)}${'░'.repeat(barLen - filledA)}</span> <span style="color:${asmColor}">${Math.round(asmPct)}%</span>`;
  }
  if (readyJob) {
    progressHtml += `<br><span style="color:var(--green);text-shadow:0 0 8px #00e676;">&#9654; LAUNCH READY</span>`;
  }
  progressHtml += `</div>`;

  return `<div style="font-family:'Courier New',Consolas,monospace;font-size:13px;line-height:1.3;white-space:pre;text-align:left;display:inline-block;">${lines.join('\n')}</div>${progressHtml}`;
}

// ============================================================
//  RENDER: LAUNCH TAB (SpaceX style)
// ============================================================
function renderLaunchTab() {
  ensureAssemblyState();

  const preLaunch = document.getElementById('lc-pre-launch');
  const animZone  = document.getElementById('lc-anim-zone');
  if (!launchInProgress) {
    if (preLaunch) preLaunch.style.display = '';
    if (animZone)  animZone.classList.remove('active');

    // 게이지 리셋
    const speedEl  = document.getElementById('lc-speed-val');
    const altEl    = document.getElementById('lc-alt-val');
    const speedBar = document.getElementById('lc-speed-bar');
    const altBar   = document.getElementById('lc-alt-bar');
    if (speedEl)  speedEl.textContent  = '0';
    if (altEl)    altEl.textContent    = '0';
    if (speedBar) { speedBar.style.width = '0%'; speedBar.style.background = ''; }
    if (altBar)   { altBar.style.width   = '0%'; altBar.style.background   = ''; }

    // 타이머 + 상태 리셋
    const timerEl  = document.getElementById('lc-t-timer');
    const statusEl = document.getElementById('lc-status-text');
    if (timerEl)  timerEl.textContent  = 'T+ 00:00';
    if (statusEl) statusEl.textContent = '// PRE-LAUNCH';

    // 단계 바 리셋
    _setLcStage(0);
  } else {
    return; // 발사 애니메이션 중 DOM 재렌더링 방지 (BUG-007)
  }

  // ── 준비된 슬롯 탐색 ──────────────────────────────────────
  let readySlot = -1, readyJob = null;
  gs.assembly.jobs.forEach((job, idx) => {
    if (job && job.ready && readySlot === -1) { readySlot = idx; readyJob = job; }
  });
  const hasReady = readySlot >= 0;
  let q = null, sci = null, earned = 0;
  if (hasReady) {
    q      = getQuality(readyJob.qualityId);
    sci    = getRocketScience(q.id);
    earned = getMoonstoneReward(q.id);
  }

  // ── 미션 번호 ──────────────────────────────────────────────
  const missionNumEl = document.getElementById('lc-mission-num');
  if (missionNumEl) missionNumEl.textContent = String((gs.launches || 0) + 1).padStart(3, '0');

  // ── ALL SYSTEMS GO 전환 감지 → 알림음 ─────────────────────
  const launchPadBuilt = (gs.buildings.launch_pad || 0) >= 1;
  const hasFuel        = (gs.res.fuel || 0) > 50;
  const allGo = hasReady && launchPadBuilt && hasFuel;
  if (allGo && !_prevAllGo) {
    playSfx('sine', 440, 0.08, 0.04, 660);
    setTimeout(() => playSfx('sine', 660, 0.08, 0.04, 880), 100);
  }
  _prevAllGo = allGo;

  // ── ASCII 로켓 ────────────────────────────────────────────
  const rocketPre = document.getElementById('lc-rocket-pre');
  if (rocketPre) rocketPre.innerHTML = _lcRocketArtHtml();

  // ── 미션 파라미터 (텔레메트리 존) ──────────────────────────
  const missionParams = document.getElementById('lc-mission-params');
  if (missionParams) {
    if (hasReady) {
      const rc = sci.reliability > 80 ? 'green' : sci.reliability > 60 ? 'amber' : 'red';
      missionParams.innerHTML =
        `<div class="lc-mp-block"><div class="lc-mp-val green">${sci.deltaV.toFixed(1)}<span style="font-size:9px"> km/s</span></div><div class="lc-mp-label">Delta-V</div></div>` +
        `<div class="lc-mp-block"><div class="lc-mp-val">${sci.twr.toFixed(2)}</div><div class="lc-mp-label">TWR</div></div>` +
        `<div class="lc-mp-block"><div class="lc-mp-val ${rc}">${sci.reliability.toFixed(0)}%</div><div class="lc-mp-label">신뢰도</div></div>` +
        `<div class="lc-mp-block"><div class="lc-mp-val amber">+${earned}</div><div class="lc-mp-label">문스톤 보상</div></div>` +
        `<div class="lc-mp-block"><div class="lc-mp-val">${Math.floor(sci.altitude)}<span style="font-size:9px"> km</span></div><div class="lc-mp-label">목표 고도</div></div>` +
        `<div class="lc-mp-block"><div class="lc-mp-val" style="color:var(--green-dim)">&#9670; ${gs.moonstone || 0}</div><div class="lc-mp-label">보유 문스톤</div></div>`;
    } else {
      missionParams.innerHTML =
        `<div class="lc-mp-block"><div class="lc-mp-val" style="color:#334433">--</div><div class="lc-mp-label">Delta-V</div></div>` +
        `<div class="lc-mp-block"><div class="lc-mp-val" style="color:#334433">--</div><div class="lc-mp-label">TWR</div></div>` +
        `<div class="lc-mp-block"><div class="lc-mp-val" style="color:#334433">--</div><div class="lc-mp-label">신뢰도</div></div>` +
        `<div class="lc-mp-block"><div class="lc-mp-val" style="color:#334433">--</div><div class="lc-mp-label">문스톤 보상</div></div>` +
        `<div class="lc-mp-block"><div class="lc-mp-val" style="color:#334433">--</div><div class="lc-mp-label">목표 고도</div></div>` +
        `<div class="lc-mp-block"><div class="lc-mp-val" style="color:var(--green-dim)">&#9670; ${gs.moonstone || 0}</div><div class="lc-mp-label">보유 문스톤</div></div>`;
    }
  }

  // ── 커밋 박스 통계 ──────────────────────────────────────────
  const commitStats = document.getElementById('lc-commit-stats');
  if (commitStats) {
    if (hasReady) {
      const rc = sci.reliability > 80 ? 'green' : sci.reliability > 60 ? 'amber' : 'red';
      commitStats.innerHTML =
        `<div class="lc-cs"><span class="lc-cs-val ${rc}">${sci.reliability.toFixed(0)}%</span><span class="lc-cs-label">${t('lc_success_pct')}</span></div>` +
        `<div class="lc-cs"><span class="lc-cs-val green">${Math.floor(sci.altitude)}<span style="font-size:11px">km</span></span><span class="lc-cs-label">${t('lc_target_alt')}</span></div>` +
        `<div class="lc-cs"><span class="lc-cs-val amber">+${earned}</span><span class="lc-cs-label">${t('lc_moonstone')}</span></div>`;
    } else {
      commitStats.innerHTML =
        `<div class="lc-cs"><span class="lc-cs-val" style="color:var(--green-dim)">--</span><span class="lc-cs-label">${t('lc_success_pct')}</span></div>` +
        `<div class="lc-cs"><span class="lc-cs-val" style="color:var(--green-dim)">--</span><span class="lc-cs-label">${t('lc_target_alt')}</span></div>` +
        `<div class="lc-cs"><span class="lc-cs-val" style="color:var(--green-dim)">--</span><span class="lc-cs-label">${t('lc_moonstone')}</span></div>`;
    }
  }

  // ── 발사 버튼 상태 ──────────────────────────────────────────
  const launchBtn = document.getElementById('lc-btn-launch');
  if (launchBtn) {
    if (allGo) {
      launchBtn.disabled = false;
      launchBtn.textContent = '[ ▶▶ 발사 실행 ]';
      launchBtn.className = 'lc-btn-launch-go';
    } else {
      launchBtn.disabled = true;
      launchBtn.textContent = '[ ··· 발사 준비 중 ··· ]';
      launchBtn.className = 'lc-btn-launch-standby';
    }
  }

  // ── ABORT 버튼 ──────────────────────────────────────────────
  const hasInProgress = gs.assembly && gs.assembly.jobs &&
    gs.assembly.jobs.some(j => j && !j.ready && j.endAt);
  const abortBtn = document.getElementById('lc-btn-abort');
  if (abortBtn) abortBtn.style.display = hasInProgress ? '' : 'none';
}


// ── 온보딩 퀘스트 렌더링 (레거시 — DOM 미존재 시 early-return) ─────────
function _renderLcQuest() {
  const el = document.getElementById('lc-quest');
  if (!el) return;

  const bld  = gs.buildings || {};
  const upgs = gs.upgrades || {};
  const jobs = (gs.assembly && gs.assembly.jobs) || [];
  const hasLaunched = (gs.launches || 0) >= 1;

  const mainDone = hasLaunched;

  const subs = [
    { icon: '[OPS]', key: 'q_sub_ops',      done: (gs.assignments && (gs.assignments.ops_center || 0) >= 1) },
    { icon: '[FND]', key: 'q_sub_money',    done: (gs.res.money || 0) >= 1000 },
    { icon: '[MIN]', key: 'q_sub_mine',     done: (bld.mine || 0) >= 1 },
    { icon: '[RSH]', key: 'q_sub_lab',      done: (bld.research_lab || 0) >= 1 },
    { icon: '[TEC]', key: 'q_sub_research', done: Object.keys(upgs).length >= 1 },
    { icon: '[PAD]', key: 'q_sub_pad',      done: (bld.launch_pad || 0) >= 1 },
    { icon: '[ASM]', key: 'q_sub_assemble', done: jobs.some(j => j && (j.ready || j.endAt)) },
  ];
  const doneCount   = subs.filter(s => s.done).length;
  const allSubsDone = doneCount === subs.length;

  let html = '';
  if (mainDone) {
    html += `<div class="lc-quest-main-done">
      <div class="lc-quest-main-title">&#9632; MISSION COMPLETE</div>
      <div class="lc-quest-main-desc">${t('q_done_desc')}</div>
    </div>`;
  } else {
    html += `<div class="lc-quest-main">
      <div class="qs-section-hd">// MAIN MISSION</div>
      <div class="lc-quest-main-row">
        <span class="qs-icon-bracket">[GO!]</span>
        <span class="qs-main-text">${t('q_main_desc')}</span>
        <span class="qs-chk todo">&#9675;</span>
      </div>
    </div>`;
  }

  if (!mainDone) {
    const pct = (doneCount / subs.length * 100).toFixed(0);
    html += `<div class="qs-section-hd qs-sub-hd">// SUB MISSIONS <span class="qs-cnt">${doneCount}/${subs.length}</span></div>`;
    html += `<div class="qs-progress-bar"><div class="qs-progress-fill" style="width:${pct}%"></div></div>`;
    html += `<div class="lc-quest-subs">`;
    subs.forEach(s => {
      html += `<div class="lc-quest-sub${s.done ? ' sub-done' : ''}">
        <span class="qs-icon-bracket${s.done ? ' done' : ''}">${s.icon}</span>
        <span class="qs-text${s.done ? ' done' : ''}">${t(s.key)}</span>
        <span class="qs-chk ${s.done ? 'done' : 'todo'}">${s.done ? '&#10003;' : '&#9675;'}</span>
      </div>`;
    });
    html += `</div>`;
    if (allSubsDone) {
      html += `<div class="qs-all-ready">&gt;&gt; ${t('q_ready')}</div>`;
    }
  }

  el.innerHTML = html;
}
