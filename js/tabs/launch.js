
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
//  ROCKET ASCII ART HELPER — per-part color HTML
// ============================================================
function _lcRocketArtHtml() {
  const p = gs.parts || {};
  const jobs = (gs.assembly && gs.assembly.jobs) || [];
  const now = Date.now();

  // Find first ready job
  let readyJob = null;
  jobs.forEach(j => { if (j && j.ready && !readyJob) readyJob = j; });

  // Find first in-progress job
  let inProgressJob = null;
  jobs.forEach(j => { if (j && !j.ready && j.endAt && !inProgressJob) inProgressJob = j; });

  // Part-level color: green = all parts assembled (ready), amber = part built, dim = not built
  const col = (partKey) => {
    if (readyJob) return 'var(--green)';
    return (p[partKey]) ? 'var(--amber)' : '#1f3520';
  };

  // Parts built count for % indicator
  const partsDone  = PARTS.filter(pt => p[pt.id]).length;
  const totalParts = PARTS.length;
  const partsPct   = Math.round((partsDone / totalParts) * 100);

  // Assembly job progress
  let asmPct = 0;
  if (readyJob) {
    asmPct = 100;
  } else if (inProgressJob) {
    const elapsed = Math.max(0, now - inProgressJob.startAt);
    const total   = Math.max(1, inProgressJob.endAt - inProgressJob.startAt);
    asmPct = Math.min(100, (elapsed / total) * 100);
  }

  const payC  = col('payload');
  const ctlC  = col('control');
  const hulC  = col('hull');
  const ftkC  = col('fueltank');
  const engC  = col('engine');

  const span = (color, text) => `<span style="color:${color}">${text}</span>`;

  const lines = [
    span('var(--green-dim)', '       *        '),
    span(payC,               '      /|\\       '),
    span(payC,               '     / | \\      '),
    span(payC,               '    /--+--\\     '),
    span(payC,               '   | PAYLD |    '),
    span(hulC,               '   |-------|    '),
    span(ctlC,               readyJob ? '   | READY |    ' : '   | CTRL  |    '),
    span(hulC,               '   |-------|    '),
    span(hulC,               '   | HULL  |    '),
    span(hulC,               '   |       |    '),
    span(ftkC,               '   |[=LOX=]|    '),
    span(ftkC,               '   |[=RP1=]|    '),
    span(engC,               '   |-------|    '),
    span(engC,               '  /| ENGNE |\\   '),
    span(engC,               ' / |_______| \\  '),
    span('var(--green-dim)', '   *   |   *    '),
    span(engC,               '      |||       '),
    span('var(--green-dim)', '     [PAD]      '),
  ];

  // Progress indicators
  const barLen = 10;
  const filledP = Math.round(partsPct  / 100 * barLen);
  const filledA = Math.round(asmPct    / 100 * barLen);
  const barColor = readyJob ? 'var(--green)' : 'var(--amber)';

  let progressHtml = `<div style="font-size:10px;color:var(--green-dim);text-align:center;margin-top:6px;font-family:'Courier New',Consolas,monospace;">`;
  progressHtml += `<span style="color:var(--green-dim)">부품: </span><span style="color:${barColor}">${'█'.repeat(filledP)}${'░'.repeat(barLen - filledP)}</span> <span style="color:${barColor}">${partsPct}%</span>`;
  if (inProgressJob || readyJob) {
    const asmColor = readyJob ? 'var(--green)' : 'var(--amber)';
    progressHtml += `<br><span style="color:var(--green-dim)">조립: </span><span style="color:${asmColor}">${'█'.repeat(filledA)}${'░'.repeat(barLen - filledA)}</span> <span style="color:${asmColor}">${Math.round(asmPct)}%</span>`;
  }
  if (readyJob) {
    progressHtml += `<br><span style="color:var(--green);text-shadow:0 0 8px #00e676;">&#9654; LAUNCH READY</span>`;
  }
  progressHtml += `</div>`;

  return `<div style="font-family:'Courier New',Consolas,monospace;font-size:11px;line-height:1.35;white-space:pre;text-align:left;display:inline-block;">${lines.join('\n')}</div>${progressHtml}`;
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
    { key: 'chk_pad',  go: launchPadBuilt },
    { key: 'chk_prop', go: hasFuel },
    { key: 'chk_veh',  go: hasReady },
    { key: 'chk_nav',  go: hasElec || hasReady },
    { key: 'chk_eng',  go: launchPadBuilt },
    { key: 'chk_wx',   go: true },
  ];
  const allGo = hasReady && launchPadBuilt && hasFuel;
  let chkHtml = checks.map(c =>
    `<div class="chk-row"><span class="chk-name">${t(c.key)}</span><span class="chk-badge${c.go ? '' : ' nogo'}">${c.go ? 'GO &#10003;' : 'NO-GO &#10007;'}</span></div>`
  ).join('');
  chkHtml += allGo
    ? `<div class="chk-all-go">&#9654;&#9654; ALL SYSTEMS GO &#9664;&#9664;<br><span style="font-size:10px;color:var(--green-dim)">${checks.filter(c=>c.go).length}/${checks.length} GO</span></div>`
    : `<div class="chk-no-go">${t('chk_ng')}</div>`;
  const lc_checklist = document.getElementById('lc-checklist');
  if (lc_checklist) lc_checklist.innerHTML = chkHtml;

  // ── 2. 온보딩 퀘스트 ────────────────────────────────────
  _renderLcQuest();

  // ── 3. ASCII 로켓 (per-part 색상 HTML) ──────────────────────
  const rocketPre = document.getElementById('lc-rocket-pre');
  if (rocketPre) rocketPre.innerHTML = _lcRocketArtHtml();

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
        { key: 'fail_engine',   pct: fb * 0.40 },
        { key: 'fail_gyro',     pct: fb * 0.25 },
        { key: 'fail_maxq',     pct: fb * 0.20 },
        { key: 'fail_lox',      pct: fb * 0.10 },
        { key: 'fail_guidance', pct: fb * 0.05 },
      ];
      failWrap.innerHTML = MODES.map(m => {
        const p    = Math.min(99, m.pct).toFixed(1);
        const bars = '█'.repeat(Math.max(0, Math.round(m.pct / 3)));
        const lvl  = m.pct > 10 ? 'high' : m.pct > 4 ? 'mid' : 'low';
        return `<div class="lc-fail-row"><span class="lc-fail-name">${t(m.key)}</span><span class="lc-fail-bar">${bars}</span><span class="lc-fail-pct">${p}%</span><span class="lc-fail-lvl ${lvl}">${lvl.toUpperCase()}</span></div>`;
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
  // ── 발사 버튼 상태 ───────────────────────────────────────
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

  // ── ABORT 버튼: 조립 진행 중일 때만 표시 ────────────────
  const hasInProgress = gs.assembly && gs.assembly.jobs &&
    gs.assembly.jobs.some(j => j && !j.ready && j.endAt);
  const abortBtn = document.getElementById('lc-btn-abort');
  if (abortBtn) abortBtn.style.display = hasInProgress ? '' : 'none';

  // ── 조립 현황 패널 (LEFT 컬럼) ──────────────────────────
  const lcAsmSlots = document.getElementById('lc-asm-slots');
  if (lcAsmSlots) {
    const now2 = Date.now();
    const pd   = gs.parts || {};
    const qSel = getQuality(gs.assembly.selectedQuality);
    const asmCost = getAssemblyCost(qSel.id);
    let asmHtml = '';
    gs.assembly.jobs.forEach((job, idx) => {
      if (!job) {
        const canStart = PARTS.every(p2 => pd[p2.id]) && canAfford(asmCost);
        asmHtml += `<div class="lc-asm-slot">
          <div class="lc-asm-slot-hd">// 슬롯 ${idx + 1} — <span style="color:var(--green-dim)">대기</span></div>
          <button class="btn btn-sm${canStart ? '' : ' btn-amber'}" onclick="startAssembly(${idx})" ${canStart ? '' : 'disabled'} style="width:100%;margin-top:4px;">
            ${canStart ? '[ ▶ 조립 시작 ]' : '[ 부품/자원 부족 ]'}
          </button>
        </div>`;
      } else if (job.ready) {
        asmHtml += `<div class="lc-asm-slot lc-asm-ready">
          <div class="lc-asm-slot-hd">// 슬롯 ${idx + 1} — <span style="color:var(--green);text-shadow:var(--glow);">발사 준비!</span></div>
          <div style="font-size:10px;color:var(--green-dim);margin-bottom:4px;">${getQuality(job.qualityId).name}</div>
          <button class="btn btn-sm" onclick="launchFromSlot(${idx})" style="width:100%;color:var(--amber);border-color:var(--amber);">[ ▶▶ 발사 ]</button>
        </div>`;
      } else {
        const remain = Math.max(0, Math.floor((job.endAt - now2) / 1000));
        const total2 = Math.max(1, Math.floor((job.endAt - job.startAt) / 1000));
        const pct2   = Math.min(100, ((total2 - remain) / total2) * 100);
        asmHtml += `<div class="lc-asm-slot lc-asm-busy">
          <div class="lc-asm-slot-hd">// 슬롯 ${idx + 1} — <span style="color:var(--amber);">조립 중</span></div>
          <div style="font-size:10px;color:var(--green-dim);margin-bottom:3px;">${getQuality(job.qualityId).name} — 잔여 ${fmtTime(remain)}</div>
          <div class="lc-asm-prog-wrap"><div class="lc-asm-prog-fill" style="width:${pct2.toFixed(0)}%"></div></div>
          <div style="font-size:10px;color:var(--amber);margin-top:2px;">${pct2.toFixed(0)}% 완료</div>
        </div>`;
      }
    });

    // Parts status summary
    const partsDone2 = PARTS.filter(pt => pd[pt.id]).length;
    asmHtml += `<div class="lc-parts-status">
      <div class="lc-pnl-title" style="margin-top:6px;">// 부품 현황 ${partsDone2}/${PARTS.length}</div>`;
    PARTS.forEach(pt => {
      const done = pd[pt.id];
      asmHtml += `<div style="font-size:10px;color:${done ? 'var(--green)' : 'var(--green-dim)'};padding:2px 0;">
        <span style="min-width:28px;display:inline-block;">${done ? '[✓]' : '[○]'}</span>${pt.name}
      </div>`;
    });
    asmHtml += `</div>`;
    lcAsmSlots.innerHTML = asmHtml;
  }

  // ── 8. 발사 이력 ────────────────────────────────────────
  const histEl = document.getElementById('lc-history');
  if (histEl) {
    if (gs.history.length === 0) {
      histEl.innerHTML = `<div style="color:var(--green-dim);font-size:11px;line-height:1.8">${t('hist_none')}</div>`;
    } else {
      histEl.innerHTML = `<table class="lc-hist-table">
        <thead><tr><th>${t('hist_col_no')}</th><th>${t('hist_col_veh')}</th><th>${t('hist_col_alt')}</th><th>${t('hist_col_rel')}</th></tr></thead>
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
      `<div class="lc-stat-row"><span>${t('stat_launches')}</span><span class="sv">${gs.launches}</span></div>` +
      `<div class="lc-stat-row"><span>${t('stat_max_alt')}</span><span class="sv">${maxAlt} km</span></div>` +
      `<div class="lc-stat-row"><span>${t('stat_moonstone')}</span><span class="sva">&#9670; ${gs.moonstone}</span></div>` +
      `<div class="lc-stat-row"><span>${t('stat_bonus')}</span><span class="sv">+${gs.moonstone * 5}%</span></div>`;
  }
}


// ── 온보딩 퀘스트 렌더링 ─────────────────────────────────
function _renderLcQuest() {
  const el = document.getElementById('lc-quest');
  if (!el) return;

  const bld  = gs.buildings || {};
  const upgs = gs.upgrades || {};
  const jobs = (gs.assembly && gs.assembly.jobs) || [];
  const hasLaunched = (gs.launches || 0) >= 1;

  // ── MAIN MISSION (발사 완료 여부)
  const mainDone = hasLaunched;

  // ── SUB MISSIONS 조건 (ASCII bracket 아이콘, 이모지 없음)
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

  // ── MAIN MISSION 블록
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

  // ── SUB MISSIONS 블록 (메인 미션 미완료 시만 표시)
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

