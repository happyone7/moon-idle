
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

  // 중앙 컬럼: 정적 패널 숨기고 애니메이션 존 표시
  const preLaunch = document.getElementById('lc-pre-launch');
  const animZone  = document.getElementById('lc-anim-zone');
  if (preLaunch) preLaunch.style.display = 'none';
  if (animZone)  animZone.classList.add('active');

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
//  ROCKET ASCII ART HELPER
// ============================================================
function _lcRocketArt(qualId) {
  if (qualId === 'standby') {
    return [
      '       *       ',
      '      /|\\      ',
      '    /  |  \\    ',
      '   | STBY  |   ',
      '   |       |   ',
      '   | [   ] |   ',
      '  /|       |\\  ',
      ' / |_______|  \\',
      '     /| |\\     ',
      '      | |      ',
      '     [PAD]     ',
    ].join('\n');
  }
  const lbl = { proto:'P-MK1', standard:'S-MK2', advanced:'A-MK3', elite:'E-MK4' }[qualId] || 'MOON';
  return [
    '       *        ',
    '      /|\\       ',
    '     / | \\      ',
    '    /--+--\\     ',
    '   | PAYLD |    ',
    '   |-------|    ',
    `   |${lbl.padStart(5,' ').slice(0,5).padEnd(7,' ')}|    `,
    '   |-------|    ',
    '   | HULL  |    ',
    '   |       |    ',
    '   |[=LOX=]|    ',
    '   |[=RP1=]|    ',
    '   |-------|    ',
    '  /| ENGNE |\\   ',
    ' / |_______| \\  ',
    '   *   |   *    ',
    '      |||       ',
    '     [PAD]      ',
  ].join('\n');
}

// ============================================================
//  RENDER: LAUNCH TAB (v7d 3-column)
// ============================================================
function renderLaunchTab() {
  ensureAssemblyState();

  // 애니메이션 존 리셋 (발사 후 renderAll 호출 시 복원)
  const preLaunch = document.getElementById('lc-pre-launch');
  const animZone  = document.getElementById('lc-anim-zone');
  if (!launchInProgress) {
    if (preLaunch) preLaunch.style.display = '';
    if (animZone)  animZone.classList.remove('active');
  }

  // ── 준비된 슬롯 탐색 ────────────────────────────────────
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

  // ── 1. GO/NO-GO 체크리스트 ───────────────────────────────
  const launchPadBuilt = (gs.buildings.launch_pad || 0) >= 1;
  const hasFuel        = (gs.res.fuel || 0) > 50;
  const hasElec        = (gs.buildings.elec_lab || 0) >= 1;
  const checks = [
    { name: '발사대 구조',   go: launchPadBuilt },
    { name: '추진제 주입',   go: hasFuel },
    { name: '기체 조립',     go: hasReady },
    { name: '항법 장치',     go: hasElec || hasReady },
    { name: '엔진 계통',     go: launchPadBuilt },
    { name: '기상 조건',     go: true },
  ];
  const allGo = hasReady && launchPadBuilt && hasFuel;
  let chkHtml = checks.map(c =>
    `<div class="chk-row"><span class="chk-name">${c.name}</span><span class="chk-badge${c.go ? '' : ' nogo'}">${c.go ? 'GO &#10003;' : 'NO-GO &#10007;'}</span></div>`
  ).join('');
  chkHtml += allGo
    ? `<div class="chk-all-go">&#9654;&#9654; ALL SYSTEMS GO &#9664;&#9664;<br><span style="font-size:10px;color:var(--green-dim)">${checks.filter(c=>c.go).length}/${checks.length} GO</span></div>`
    : `<div class="chk-no-go">// 발사 전 확인 필요</div>`;
  const lc_checklist = document.getElementById('lc-checklist');
  if (lc_checklist) lc_checklist.innerHTML = chkHtml;

  // ── 2. 발사 데이터 ───────────────────────────────────────
  const lc_launchData = document.getElementById('lc-launch-data');
  if (lc_launchData) {
    lc_launchData.innerHTML = hasReady
      ? `<div class="lc-drow"><span>기체</span><span class="v">${q.name}</span></div>
         <div class="lc-drow"><span>목표 고도</span><span class="v">${Math.floor(sci.altitude)} km</span></div>
         <div class="lc-drow"><span>Δv</span><span class="v">${sci.deltaV.toFixed(2)} km/s</span></div>
         <div class="lc-drow"><span>TWR</span><span class="v">${sci.twr.toFixed(2)}</span></div>
         <div class="lc-drow"><span>신뢰도</span><span class="v">${sci.reliability.toFixed(1)}%</span></div>
         <div class="lc-drow"><span>문스톤 예상</span><span class="va">+${earned}</span></div>`
      : `<div style="color:var(--green-dim);font-size:11px;line-height:1.8">// 조립동에서 로켓을 조립하세요</div>`;
  }

  // ── 3. 조립 대기 큐 ──────────────────────────────────────
  const lc_queue = document.getElementById('lc-queue');
  if (lc_queue) {
    let qHtml = '';
    gs.assembly.jobs.forEach((job, idx) => {
      if (!job) return;
      if (job.ready) {
        qHtml += `<div class="lc-drow"><span>슬롯 ${idx+1}</span><span class="v">${getQuality(job.qualityId).name} [대기]</span></div>`;
      } else {
        const remain = Math.max(0, Math.floor((job.endAt - Date.now()) / 1000));
        qHtml += `<div class="lc-drow"><span>슬롯 ${idx+1}</span><span class="va">${getQuality(job.qualityId).name} ${fmtTime(remain)}</span></div>`;
      }
    });
    if (!qHtml) qHtml = `<div style="color:var(--green-dim);font-size:11px;">// 조립 중인 로켓 없음</div>`;
    lc_queue.innerHTML = qHtml;
  }

  // ── 4. ASCII 로켓 ────────────────────────────────────────
  const rocketPre = document.getElementById('lc-rocket-pre');
  if (rocketPre) rocketPre.textContent = _lcRocketArt(hasReady ? q.id : 'standby');

  // ── 5. 상태 바 ───────────────────────────────────────────
  const sbarWrap = document.getElementById('lc-sbar-wrap');
  if (sbarWrap) {
    if (hasReady) {
      const dvPct  = Math.min(100, (sci.deltaV / 10) * 100);
      const relPct = sci.reliability;
      const twrPct = Math.min(100, (sci.twr / 5) * 100);
      const dvC    = dvPct  > 60 ? '' : dvPct  > 30 ? ' amber' : ' red';
      const relC   = relPct > 70 ? '' : relPct > 50 ? ' amber' : ' red';
      sbarWrap.innerHTML =
        `<div class="lc-sbar-row"><span class="lc-sbar-lbl">Δv (km/s)</span><div class="lc-sbar-track"><div class="lc-sbar-fill${dvC}" style="width:${dvPct.toFixed(0)}%"></div></div><span class="lc-sbar-pct">${sci.deltaV.toFixed(1)}</span></div>` +
        `<div class="lc-sbar-row"><span class="lc-sbar-lbl">신뢰도</span><div class="lc-sbar-track"><div class="lc-sbar-fill${relC}" style="width:${relPct.toFixed(0)}%"></div></div><span class="lc-sbar-pct">${relPct.toFixed(0)}%</span></div>` +
        `<div class="lc-sbar-row"><span class="lc-sbar-lbl">TWR</span><div class="lc-sbar-track"><div class="lc-sbar-fill" style="width:${twrPct.toFixed(0)}%"></div></div><span class="lc-sbar-pct">${sci.twr.toFixed(2)}</span></div>`;
    } else {
      sbarWrap.innerHTML = `<div style="color:var(--green-dim);font-size:11px;text-align:center;padding:6px 0">// 데이터 없음</div>`;
    }
  }

  // ── 6. 실패 확률 분석 ────────────────────────────────────
  const failWrap = document.getElementById('lc-fail-wrap');
  if (failWrap) {
    if (hasReady) {
      const fb = 100 - sci.reliability;
      const MODES = [
        { name: '엔진 정지',    pct: fb * 0.40 },
        { name: '자이로 오작동', pct: fb * 0.25 },
        { name: 'MaxQ 과부하', pct: fb * 0.20 },
        { name: 'LOX 차단',    pct: fb * 0.10 },
        { name: '유도 계통',   pct: fb * 0.05 },
      ];
      failWrap.innerHTML = MODES.map(m => {
        const p    = Math.min(99, m.pct).toFixed(1);
        const bars = '█'.repeat(Math.max(0, Math.round(m.pct / 3)));
        const lvl  = m.pct > 10 ? 'high' : m.pct > 4 ? 'mid' : 'low';
        return `<div class="lc-fail-row"><span class="lc-fail-name">${m.name}</span><span class="lc-fail-bar">${bars}</span><span class="lc-fail-pct">${p}%</span><span class="lc-fail-lvl ${lvl}">${lvl.toUpperCase()}</span></div>`;
      }).join('');
    } else {
      failWrap.innerHTML = `<div style="color:var(--green-dim);font-size:11px;text-align:center;padding:6px 0">// 데이터 없음</div>`;
    }
  }

  // ── 7. 커밋 박스 ────────────────────────────────────────
  const commitStats = document.getElementById('lc-commit-stats');
  if (commitStats) {
    if (hasReady) {
      const rc = sci.reliability > 80 ? 'green' : sci.reliability > 60 ? 'amber' : 'red';
      commitStats.innerHTML =
        `<div class="lc-cs"><span class="lc-cs-val ${rc}">${sci.reliability.toFixed(0)}%</span><span class="lc-cs-label">성공률</span></div>` +
        `<div class="lc-cs"><span class="lc-cs-val green">${Math.floor(sci.altitude)}<span style="font-size:11px">km</span></span><span class="lc-cs-label">목표 고도</span></div>` +
        `<div class="lc-cs"><span class="lc-cs-val amber">+${earned}</span><span class="lc-cs-label">문스톤</span></div>`;
    } else {
      commitStats.innerHTML =
        `<div class="lc-cs"><span class="lc-cs-val" style="color:var(--green-dim)">--</span><span class="lc-cs-label">성공률</span></div>` +
        `<div class="lc-cs"><span class="lc-cs-val" style="color:var(--green-dim)">--</span><span class="lc-cs-label">목표 고도</span></div>` +
        `<div class="lc-cs"><span class="lc-cs-val" style="color:var(--green-dim)">--</span><span class="lc-cs-label">문스톤</span></div>`;
    }
  }
  const launchBtn = document.getElementById('lc-btn-launch');
  if (launchBtn) launchBtn.disabled = !allGo;

  // ── 8. 발사 이력 ────────────────────────────────────────
  const histEl = document.getElementById('lc-history');
  if (histEl) {
    if (gs.history.length === 0) {
      histEl.innerHTML = `<div style="color:var(--green-dim);font-size:11px;line-height:1.8">// 발사 기록 없음</div>`;
    } else {
      histEl.innerHTML = `<table class="lc-hist-table">
        <thead><tr><th>NO.</th><th>기체</th><th>고도</th><th>신뢰도</th></tr></thead>
        <tbody>${gs.history.slice(-10).reverse().map(h =>
          `<tr><td>${String(h.no).padStart(3,'0')}</td><td>${h.quality}</td><td>${h.altitude}km</td><td>${h.reliability}%</td></tr>`
        ).join('')}</tbody></table>`;
    }
  }

  // ── 9. 통계 ────────────────────────────────────────────
  const statsEl = document.getElementById('lc-stats-panel');
  if (statsEl) {
    const maxAlt = gs.history.length ? Math.max(...gs.history.map(h => Number(h.altitude) || 0)) : 0;
    statsEl.innerHTML =
      `<div class="lc-stat-row"><span>총 발사</span><span class="sv">${gs.launches}회</span></div>` +
      `<div class="lc-stat-row"><span>최고 고도</span><span class="sv">${maxAlt} km</span></div>` +
      `<div class="lc-stat-row"><span>문스톤 보유</span><span class="sva">&#9670; ${gs.moonstone}</span></div>` +
      `<div class="lc-stat-row"><span>생산 보너스</span><span class="sv">+${gs.moonstone * 5}%</span></div>`;
  }
}

