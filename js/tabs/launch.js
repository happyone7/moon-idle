
let _prevAllGo = false; // ALL SYSTEMS GO 전환 감지용

function launchFromSlot(slotIdx) {
  if (launchInProgress) return;
  ensureAssemblyState();
  const job = gs.assembly.jobs[slotIdx];
  if (!job || !job.ready) return;
  const q = getQuality(job.qualityId);
  const sci = getRocketScience(q.id);

  const rollSuccess = gs.launches === 0 || Math.random() * 100 < sci.reliability;
  const earned = rollSuccess ? getMoonstoneReward(q.id) : 0;

  if (!rollSuccess) {
    PARTS.forEach(p => {
      if (gs.parts[p.id] && Math.random() < 0.5) gs.parts[p.id] = 0;
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

  switchMainTab('launch');
  _runLaunchAnimation(q, sci, earned, rollSuccess);
}

// ============================================================
//  HUD 토글
// ============================================================
function lcHudToggle(btn) {
  const body = document.getElementById('lc-hud-body');
  if (!body) return;
  const collapsed = body.style.display === 'none';
  body.style.display = collapsed ? '' : 'none';
  btn.innerHTML = collapsed ? '&#8722;' : '+';
}

// ============================================================
//  STAGE BAR HELPERS (11단계: 0-10)
// ============================================================

// 페이즈 헤더 상태 업데이트 (phase-active / phase-done)
function _updateLcPhaseHeaders(activeIdx, isFail = false) {
  const phases = [
    { sel: '.lc-phase-pre',    start: 0, end: 3  },  // PROD,ASSY,FUEL,T-MINUS
    { sel: '.lc-phase-ascent', start: 4, end: 8  },  // LIFTOFF~ORBIT
    { sel: '.lc-phase-lunar',  start: 9, end: 11 },  // TLI,LOI,LANDING
  ];
  phases.forEach(ph => {
    const el = document.querySelector(ph.sel);
    if (!el) return;
    el.classList.remove('phase-active', 'phase-done');
    if (isFail) {
      if (ph.sel === '.lc-phase-pre')    el.classList.add('phase-done');
      else if (ph.sel === '.lc-phase-ascent') el.classList.add('phase-active');
      // lunar: 그대로 dim
    } else if (activeIdx > ph.end) {
      el.classList.add('phase-done');
    } else if (activeIdx >= ph.start) {
      el.classList.add('phase-active');
    }
  });
}

function _setLcStage(activeIdx) {
  document.querySelectorAll('.lc-stage-seg').forEach(seg => {
    const idx = parseInt(seg.dataset.idx, 10);
    seg.classList.remove('active', 'done', 'fail');
    if (idx === activeIdx) seg.classList.add('active');
    else if (activeIdx >= 0 && idx < activeIdx) seg.classList.add('done');
  });
  _updateLcPhaseHeaders(activeIdx);
}

function _setLcStageFail() {
  // 실패 시: MAX-Q(5)까지 done, MECO(6)부터 fail
  document.querySelectorAll('.lc-stage-seg').forEach(seg => {
    const idx = parseInt(seg.dataset.idx, 10);
    seg.classList.remove('active', 'done', 'fail');
    if (idx <= 5) seg.classList.add('done');
    else          seg.classList.add('fail');
  });
  _updateLcPhaseHeaders(-1, true);
}

// ============================================================
//  LAUNCH ANIMATION
// ============================================================
function _runLaunchAnimation(q, sci, earned, success = true) {
  launchInProgress = true;
  if (typeof BGM !== 'undefined' && gs.settings.sound) BGM.playEvent('launch');

  const missionNumEl = document.getElementById('lc-mission-num');
  if (missionNumEl) missionNumEl.textContent = String(gs.launches).padStart(3, '0');
  const statusTextEl = document.getElementById('lc-status-text');
  if (statusTextEl) statusTextEl.textContent = '// LAUNCHING';

  // 발사 시작 전 카운트다운 단계(3)를 done으로 표시
  _setLcStage(4); // LIFTOFF active, 0-3 done

  const preLaunch = document.getElementById('lc-pre-launch');
  const animZone  = document.getElementById('lc-anim-zone');
  if (preLaunch) preLaunch.style.display = 'none';
  if (animZone)  animZone.classList.add('active');

  const animWrap = document.getElementById('launch-anim-wrap');
  if (!animWrap) return;

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
  const maxSpeed = Math.round(sci.deltaV * 3600);
  const maxAlt   = Math.floor(sci.altitude);
  const animEndMs = success ? 4300 : 2600;

  const gaugeInterval = setInterval(() => {
    const elapsed   = Date.now() - launchTime;
    const speedEl   = document.getElementById('lc-speed-val');
    const altEl     = document.getElementById('lc-alt-val');
    const speedBar  = document.getElementById('lc-speed-bar');
    const altBar    = document.getElementById('lc-alt-bar');

    if (success) {
      const t = Math.min(1, elapsed / animEndMs);
      const easedSpeed = t * t;
      const easedAlt   = t < 0.7 ? (t / 0.7) * (t / 0.7) : 1;
      const curSpeed   = Math.round(easedSpeed * maxSpeed);
      const curAlt     = Math.round(easedAlt   * maxAlt);
      if (speedEl)  speedEl.textContent  = curSpeed.toLocaleString();
      if (altEl)    altEl.textContent    = curAlt.toLocaleString();
      if (speedBar) speedBar.style.width = Math.min(100, (curSpeed / (maxSpeed || 1)) * 100).toFixed(1) + '%';
      if (altBar)   altBar.style.width   = Math.min(100, (curAlt   / (maxAlt   || 1)) * 100).toFixed(1) + '%';
    } else {
      const anomalyT = 1200;
      if (elapsed < anomalyT) {
        const t2  = elapsed / anomalyT;
        const spd = Math.round(t2 * t2 * maxSpeed * 0.45);
        const alt = Math.round(t2 * maxAlt * 0.35);
        if (speedEl)  speedEl.textContent  = spd.toLocaleString();
        if (altEl)    altEl.textContent    = alt.toLocaleString();
        if (speedBar) speedBar.style.width = Math.min(100, (spd / (maxSpeed || 1)) * 100).toFixed(1) + '%';
        if (altBar)   altBar.style.width   = Math.min(100, (alt  / (maxAlt   || 1)) * 100).toFixed(1) + '%';
      } else {
        const t3      = Math.min(1, (elapsed - anomalyT) / 600);
        const peakSpd = Math.round(maxSpeed * 0.45);
        const peakAlt = Math.round(maxAlt * 0.35);
        const spd     = Math.round(peakSpd * (1 - t3));
        const alt     = Math.round(peakAlt * (1 - t3));
        if (speedEl)  speedEl.textContent  = Math.max(0, spd).toLocaleString();
        if (altEl)    altEl.textContent    = Math.max(0, alt).toLocaleString();
        if (speedBar) { speedBar.style.width = '0%'; speedBar.style.background = 'var(--red)'; }
        if (altBar)   { altBar.style.width   = '0%'; altBar.style.background   = 'var(--red)'; }
      }
    }
  }, 50);

  setTimeout(() => clearInterval(gaugeInterval), animEndMs + 800);

  // 텔레메트리 로그
  const telemWrap = document.getElementById('telem-wrap');
  if (telemWrap) telemWrap.innerHTML =
    '<div style="color:var(--green-dim);font-size:9px;letter-spacing:.15em;padding:3px 0;border-bottom:1px solid var(--green-dim);margin-bottom:3px;">// TELEMETRY LOG</div>';

  const telemDiv = document.createElement('div');
  telemDiv.className = 'telemetry-wrap';
  if (telemWrap) telemWrap.appendChild(telemDiv);

  // 성공: 8단계 비행 시퀀스 (index 3-10)
  // 실패: 3단계 이후 이상징후
  const steps = success ? [
    { delay: 0,    label: 'T+0',  event: 'LIFTOFF',                    pct: 5,   stage: 4  },
    { delay: 500,  label: 'T+3',  event: 'MAX-Q 통과',                  pct: 18,  stage: 5  },
    { delay: 1000, label: 'T+8',  event: 'MECO — 1단 엔진 종료',        pct: 35,  stage: 6  },
    { delay: 1500, label: 'T+12', event: '단계분리 / 2단 점화',          pct: 50,  stage: 7  },
    { delay: 2000, label: 'T+20', event: '지구 궤도 진입',              pct: 65,  stage: 8  },
    { delay: 2600, label: 'T+28', event: 'TLI — 달 전이 궤도 점화',    pct: 78,  stage: 9  },
    { delay: 3200, label: 'T+38', event: 'LOI — 달 궤도 진입',         pct: 90,  stage: 10 },
    { delay: 3800, label: 'T+50', event: `달 착륙 성공 ◆ TOUCHDOWN`,    pct: 100, stage: 11 },
  ] : [
    { delay: 0,    label: 'T+0',  event: 'LIFTOFF',                     pct: 5,   stage: 4  },
    { delay: 600,  label: 'T+3',  event: 'MAX-Q 통과',                   pct: 18,  stage: 5  },
    { delay: 1200, label: 'T+7',  event: '!! ANOMALY DETECTED !!',      pct: 35,  stage: -1, fail: true },
    { delay: 1800, label: 'T+8',  event: '!! STRUCTURAL FAILURE !!',    pct: 35,  stage: -1, fail: true },
    { delay: 2400, label: 'T+14', event: '// MISSION LOST — RUD',       pct: 0,   stage: -1, fail: true },
  ];

  steps.forEach((step, i) => {
    setTimeout(() => {
      if (step.fail) _setLcStageFail();
      else           _setLcStage(step.stage);

      if (statusTextEl) {
        statusTextEl.textContent = step.fail
          ? '// ANOMALY'
          : `// ${step.event.split('◆')[0].replace(/!+/g,'').trim().toUpperCase()}`;
      }

      const line = document.createElement('div');
      line.className = 'telem-line' + (step.fail ? ' telem-fail' : '');
      line.innerHTML =
        `<span class="telem-time">${step.label}</span>` +
        `<span class="telem-event">${step.event}</span>` +
        `<span class="telem-pct">${step.pct}%</span>`;
      telemDiv.appendChild(line);

      // HUD 자동 스크롤
      const hudBody = document.getElementById('lc-hud-body');
      if (hudBody) hudBody.scrollTop = hudBody.scrollHeight;

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
      '       *\n     /\\!\\  GYRO ALERT\n    / !! \\\n   / WARN \\\n  |  ROLL  |\n  |__+47°__|',
      '    \\  * . /\n  . * \u2554\u2550\u2557 * .\n * \u2591\u2591\u2591\u2551!\u2551\u2591\u2591\u2591 *\n  \u2591\u2592\u2593\u2593\u2588\u2588\u2588\u2593\u2593\u2592\u2591\n   \u2591\u2592\u2593\u2588\u2588\u2588\u2588\u2593\u2592\u2591\n  ~~ FIRE ~~',
      '     .   \u00b7   .\n   \u00b7   .   \u00b7\n    \u2591  \u2592\u2593\u2592  \u2591\n  \u2591\u2591\u2592\u2593\u2588\u2588\u2588\u2588\u2588\u2593\u2592\u2591\u2591\n  \u2500\u2500\u2500\u2550\u2550\u2564\u2550\u2550\u2500\u2500\u2500\n  \u2593\u2593 DAMAGED \u2593\u2593',
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

  // 결과 패널 표시
  const resultDelay  = success ? 4300 : 3000;
  const overlayDelay = success ? 4800 : 3500;

  setTimeout(() => {
    const lr = document.getElementById('launch-result');
    if (lr) {
      lr.classList.add('show');
      const lrTitle = document.getElementById('lr-title');
      if (lrTitle) lrTitle.textContent = success ? '// 달 착륙 성공' : '// 발사 실패';
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
    if (success) _setLcStage(11); // LANDING done
    clearInterval(timerInterval);
  }, resultDelay);

  setTimeout(() => {
    launchInProgress = false;
    if (success) {
      playLaunchSfx();
    } else {
      if (typeof playSfx_launchFail === 'function') playSfx_launchFail();
    }
    if (typeof BGM !== 'undefined' && gs.settings.sound) BGM.stopEvent();
    _showLaunchOverlay(q, sci, earned, success);
  }, overlayDelay);
}

function _showLaunchOverlay(q, sci, earned, success = true) {
  const loTitle = document.getElementById('lo-title');
  if (loTitle) loTitle.textContent = success ? '// 달 착륙 성공' : '// 발사 실패';
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
      loMs.textContent = `✓ 달 착륙 성공 — 문스톤 +${earned}개`;
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
//  LAUNCH READY
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
//  ROCKET ASCII ART — per-part color
// ============================================================
function _lcRocketArtHtml() {
  const p    = gs.parts || {};
  const jobs = (gs.assembly && gs.assembly.jobs) || [];
  const now  = Date.now();

  let readyJob = null;
  jobs.forEach(j => { if (j && j.ready && !readyJob) readyJob = j; });
  let inProgressJob = null;
  jobs.forEach(j => { if (j && !j.ready && j.endAt && !inProgressJob) inProgressJob = j; });

  // 4단계 색상: 완성=밝은녹색, 조립중=노란색, 파트보유=주황색, 미획득=어두운주황
  const col = (key) => {
    if (readyJob)      return '#00e676';  // 완성 — 밝은 녹색
    if (inProgressJob) return '#ffd700';  // 조립 진행 중 — 노란색
    if (p[key])        return '#ff9000';  // 파트 보유(미조립) — 주황색
    return '#b06800';                     // 미획득 — 주황 (윤곽 명확하게 보임)
  };

  const partsDone  = PARTS.filter(pt => p[pt.id]).length;
  const partsPct   = Math.round((partsDone / PARTS.length) * 100);

  let asmPct = 0;
  if (readyJob) {
    asmPct = 100;
  } else if (inProgressJob) {
    const el = Math.max(0, now - inProgressJob.startAt);
    const to = Math.max(1, inProgressJob.endAt - inProgressJob.startAt);
    asmPct = Math.min(100, (el / to) * 100);
  }

  const payC = col('payload'), ctlC = col('control'), hulC = col('hull');
  const ftkC = col('fueltank'), engC = col('engine');
  const sp   = (c, t) => `<span style="color:${c}">${t}</span>`;

  const lines = [
    sp('var(--green-dim)', '         *          '),
    sp(payC,               '        /|\\         '),
    sp(payC,               '       / | \\        '),
    sp(payC,               '      /  |  \\       '),
    sp(payC,               '     / PYLD  \\      '),
    sp(payC,               '    |---------|      '),
    sp(payC,               '    | PAYLOAD |      '),
    sp(hulC,               '    |=========|      '),
    sp(ctlC,               readyJob ? '    | [READY] |      ' : '    | CONTROL |      '),
    sp(hulC,               '    |=========|      '),
    sp(hulC,               '    |  HULL   |      '),
    sp(hulC,               '    |         |      '),
    sp(hulC,               '    |  HULL   |      '),
    sp(hulC,               '    |=========|      '),
    sp(ftkC,               '    |   LOX   |      '),
    sp(ftkC,               '    |   RP1   |      '),
    sp(ftkC,               '    |=========|      '),
    sp(engC,               '   /| ENGINE  |\\     '),
    sp(engC,               '  / |_________|\\     '),
    sp('var(--green-dim)', ' *     |  |  |   *  '),
    sp(engC,               '       | ||  |       '),
    sp(engC,               '      |||||||         '),
    sp('var(--green-dim)', '     [== PAD ==]      '),
  ];

  return `<div style="font-family:'Courier New',Consolas,monospace;font-size:15px;line-height:1.3;white-space:pre;text-align:left;display:inline-block;">${lines.join('\n')}</div>`;
}

// ============================================================
//  RENDER: LAUNCH TAB
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

    const timerEl  = document.getElementById('lc-t-timer');
    const statusEl = document.getElementById('lc-status-text');
    if (timerEl)  timerEl.textContent  = 'T+ 00:00';
    if (statusEl) statusEl.textContent = '// PRE-LAUNCH';
  } else {
    return; // 발사 중 리렌더 방지 (BUG-007)
  }

  // 준비된 슬롯 탐색
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

  // 미션 번호
  const missionNumEl = document.getElementById('lc-mission-num');
  if (missionNumEl) missionNumEl.textContent = String((gs.launches || 0) + 1).padStart(3, '0');

  // ALL GO 체크
  const launchPadBuilt = (gs.buildings.launch_pad || 0) >= 1;
  const hasFuel        = (gs.res.fuel || 0) > 50;
  const allGo = hasReady && launchPadBuilt && hasFuel;
  if (allGo && !_prevAllGo) {
    playSfx('sine', 440, 0.08, 0.04, 660);
    setTimeout(() => playSfx('sine', 660, 0.08, 0.04, 880), 100);
  }
  _prevAllGo = allGo;

  // 프리론치 단계 바 — PROD(0)→ASSY(1)→FUEL(2)→T-MINUS(3)
  const hasProdSetup = Object.keys(gs.buildings).some(k => k !== 'housing' && (gs.buildings[k] || 0) >= 1);
  if (allGo)             _setLcStage(3); // T-MINUS active (0-2 done)
  else if (hasReady)     _setLcStage(2); // FUEL active (0-1 done)
  else if (hasProdSetup) _setLcStage(1); // ASSY active (0 done)
  else                   _setLcStage(0); // PROD active

  // 프리-플라이트 체크리스트
  const checklistEl = document.getElementById('lc-checklist');
  if (checklistEl) {
    const p2 = gs.parts || {};
    const pdone = PARTS.filter(pt => p2[pt.id]).length;
    const items = [
      { done: hasProdSetup,               label: `생산 가동` },
      { done: pdone === PARTS.length,     label: `부품 조달 (${pdone}/${PARTS.length})` },
      { done: !!hasReady,                 label: `조립 완료` },
      { done: (gs.buildings.launch_pad || 0) >= 1, label: `발사대 건설` },
      { done: (gs.res.fuel || 0) > 50,   label: `연료 충전` },
    ];
    checklistEl.innerHTML = items.map(it =>
      `<div class="lc-cl-item${it.done ? ' done' : ''}">` +
      `<span class="lc-cl-chk">${it.done ? '✓' : '○'}</span>` +
      `<span class="lc-cl-text">${it.label}</span>` +
      `</div>`
    ).join('');
  }

  // ASCII 로켓
  const rocketPre = document.getElementById('lc-rocket-pre');
  if (rocketPre) rocketPre.innerHTML = _lcRocketArtHtml();

  // 커밋 박스 상태: allGo → 앰버 활성, 아닐 때 → 회색 비활성
  const commitBox = document.getElementById('lc-commit-box');
  if (commitBox) commitBox.classList.toggle('lc-commit-ready', allGo);
  // 커밋 스탯: 로켓 완성 시만 표시
  const commitStatsEl = document.getElementById('lc-commit-stats');
  if (commitStatsEl) commitStatsEl.style.display = hasReady ? '' : 'none';

  // 조립/연료 상태 패널
  const statusPanel = document.getElementById('lc-status-panel');
  if (statusPanel) {
    const p2        = gs.parts || {};
    const jobs2     = (gs.assembly && gs.assembly.jobs) || [];
    const now2      = Date.now();
    const partsDone = PARTS.filter(pt => p2[pt.id]).length;
    const partsPct  = Math.round((partsDone / PARTS.length) * 100);
    let asmPct = 0;
    const readyJob2  = jobs2.find(j => j && j.ready);
    const inProgJob2 = jobs2.find(j => j && !j.ready && j.endAt);
    if (readyJob2) {
      asmPct = 100;
    } else if (inProgJob2) {
      const el2 = Math.max(0, now2 - inProgJob2.startAt);
      const to2 = Math.max(1, inProgJob2.endAt - inProgJob2.startAt);
      asmPct = Math.min(100, (el2 / to2) * 100);
    }
    const fuelVal   = gs.res.fuel || 0;
    const fuelOk    = fuelVal > 50;
    const fuelPct   = Math.min(100, Math.round((fuelVal / Math.max(500, fuelVal)) * 100));
    const partsClr  = partsPct === 100 ? '' : 'amber';
    const asmClr    = asmPct  === 100 ? '' : 'amber';
    const fuelClr   = fuelOk          ? '' : 'red';

    let spHtml = `<div class="lc-sp-row"><span class="lc-sp-label">부품 조달</span><div class="lc-sp-bar-wrap"><div class="lc-sp-bar-fill ${partsClr}" style="width:${partsPct}%"></div></div><span class="lc-sp-pct ${partsClr}">${partsDone}/${PARTS.length}</span></div>`;
    if (asmPct > 0 || readyJob2) {
      spHtml += `<div class="lc-sp-row"><span class="lc-sp-label">조립 진행</span><div class="lc-sp-bar-wrap"><div class="lc-sp-bar-fill ${asmClr}" style="width:${asmPct}%"></div></div><span class="lc-sp-pct ${asmClr}">${Math.round(asmPct)}%</span></div>`;
    }
    spHtml += `<div class="lc-sp-row"><span class="lc-sp-label">연료 충전</span><div class="lc-sp-bar-wrap"><div class="lc-sp-bar-fill ${fuelClr}" style="width:${fuelPct}%"></div></div><span class="lc-sp-pct ${fuelClr}">${fuelVal.toLocaleString()}</span></div>`;
    statusPanel.innerHTML = spHtml;
  }

  // 미션 파라미터 (HUD)
  const missionParams = document.getElementById('lc-mission-params');
  if (missionParams) {
    if (hasReady) {
      const rc = sci.reliability > 80 ? 'green' : sci.reliability > 60 ? 'amber' : 'red';
      missionParams.innerHTML =
        `<div class="lc-mp-block"><div class="lc-mp-val green">${sci.deltaV.toFixed(1)}</div><div class="lc-mp-label">Δv (km/s)</div></div>` +
        `<div class="lc-mp-block"><div class="lc-mp-val">${sci.twr.toFixed(2)}</div><div class="lc-mp-label">TWR</div></div>` +
        `<div class="lc-mp-block"><div class="lc-mp-val ${rc}">${sci.reliability.toFixed(0)}%</div><div class="lc-mp-label">신뢰도</div></div>` +
        `<div class="lc-mp-block"><div class="lc-mp-val amber">+${earned}</div><div class="lc-mp-label">문스톤</div></div>` +
        `<div class="lc-mp-block"><div class="lc-mp-val">${Math.floor(sci.altitude)}</div><div class="lc-mp-label">목표고도 km</div></div>` +
        `<div class="lc-mp-block"><div class="lc-mp-val" style="color:var(--green-dim)">&#9670;${gs.moonstone||0}</div><div class="lc-mp-label">문스톤 보유</div></div>`;
    } else {
      missionParams.innerHTML =
        `<div class="lc-mp-block"><div class="lc-mp-val" style="color:#334433">--</div><div class="lc-mp-label">Δv (km/s)</div></div>` +
        `<div class="lc-mp-block"><div class="lc-mp-val" style="color:#334433">--</div><div class="lc-mp-label">TWR</div></div>` +
        `<div class="lc-mp-block"><div class="lc-mp-val" style="color:#334433">--</div><div class="lc-mp-label">신뢰도</div></div>` +
        `<div class="lc-mp-block"><div class="lc-mp-val" style="color:#334433">--</div><div class="lc-mp-label">문스톤</div></div>` +
        `<div class="lc-mp-block"><div class="lc-mp-val" style="color:#334433">--</div><div class="lc-mp-label">목표고도</div></div>` +
        `<div class="lc-mp-block"><div class="lc-mp-val" style="color:var(--green-dim)">&#9670;${gs.moonstone||0}</div><div class="lc-mp-label">문스톤 보유</div></div>`;
    }
  }

  // 커밋 박스
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

  // 발사 버튼
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

  // ABORT 버튼
  const hasInProgress = gs.assembly && gs.assembly.jobs &&
    gs.assembly.jobs.some(j => j && !j.ready && j.endAt);
  const abortBtn = document.getElementById('lc-btn-abort');
  if (abortBtn) abortBtn.style.display = hasInProgress ? '' : 'none';
}


// ── 온보딩 퀘스트 렌더링 (DOM 없으면 early-return) ────────────
function _renderLcQuest() {
  const el = document.getElementById('lc-quest');
  if (!el) return;

  const bld = gs.buildings || {}, upgs = gs.upgrades || {};
  const jobs = (gs.assembly && gs.assembly.jobs) || [];
  const hasLaunched = (gs.launches || 0) >= 1;
  const mainDone = hasLaunched;

  const subs = [
    { icon:'[OPS]', key:'q_sub_ops',      done: (gs.assignments && (gs.assignments.ops_center||0)>=1) },
    { icon:'[FND]', key:'q_sub_money',    done: (gs.res.money||0)>=1000 },
    { icon:'[MIN]', key:'q_sub_mine',     done: (bld.mine||0)>=1 },
    { icon:'[RSH]', key:'q_sub_lab',      done: (bld.research_lab||0)>=1 },
    { icon:'[TEC]', key:'q_sub_research', done: Object.keys(upgs).length>=1 },
    { icon:'[PAD]', key:'q_sub_pad',      done: (bld.launch_pad||0)>=1 },
    { icon:'[ASM]', key:'q_sub_assemble', done: jobs.some(j=>j&&(j.ready||j.endAt)) },
  ];
  const doneCount = subs.filter(s=>s.done).length;

  let html = '';
  if (mainDone) {
    html += `<div class="lc-quest-main-done"><div class="lc-quest-main-title">&#9632; MISSION COMPLETE</div><div class="lc-quest-main-desc">${t('q_done_desc')}</div></div>`;
  } else {
    html += `<div class="lc-quest-main"><div class="qs-section-hd">// MAIN MISSION</div><div class="lc-quest-main-row"><span class="qs-icon-bracket">[GO!]</span><span class="qs-main-text">${t('q_main_desc')}</span><span class="qs-chk todo">&#9675;</span></div></div>`;
    const pct = (doneCount/subs.length*100).toFixed(0);
    html += `<div class="qs-section-hd qs-sub-hd">// SUB MISSIONS <span class="qs-cnt">${doneCount}/${subs.length}</span></div>`;
    html += `<div class="qs-progress-bar"><div class="qs-progress-fill" style="width:${pct}%"></div></div>`;
    html += `<div class="lc-quest-subs">`;
    subs.forEach(s => {
      html += `<div class="lc-quest-sub${s.done?' sub-done':''}"><span class="qs-icon-bracket${s.done?' done':''}">${s.icon}</span><span class="qs-text${s.done?' done':''}">${t(s.key)}</span><span class="qs-chk ${s.done?'done':'todo'}">${s.done?'&#10003;':'&#9675;'}</span></div>`;
    });
    html += `</div>`;
    if (doneCount===subs.length) html += `<div class="qs-all-ready">&gt;&gt; ${t('q_ready')}</div>`;
  }
  el.innerHTML = html;
}
