
const FUEL_LOAD_REQ = 500; // 로켓 연료 주입에 필요한 LOX 최소량

let _prevAllGo = false; // ALL SYSTEMS GO 전환 감지용

// 연료 수동 주입
function loadFuelToRocket() {
  const stored = Math.floor(gs.res.fuel || 0);
  if (stored < FUEL_LOAD_REQ) { notify('LOX 부족 — 연료를 더 생산하세요', 'red'); return; }
  gs.res.fuel = (gs.res.fuel || 0) - FUEL_LOAD_REQ;
  gs.fuelLoaded = true;
  if (typeof playSfx === 'function') playSfx('sine', 330, 0.06, 0.03, 440);
  notify('연료 주입 완료 — 발사 준비 시작', 'green');
  saveGame();
  renderAll();
}

function launchFromSlot(slotIdx) {
  // 레거시 호환 — 새 시스템에서는 executeLaunch() 사용
  executeLaunch();
}

// ── 단계별 실패 모드 (각 비행 단계 고유 실패 메시지) ──
const STAGE_FAILURES = {
  4:  { event: '!! ENGINE STARTUP FAILURE !!',  desc: '엔진 점화 실패' },
  5:  { event: '!! MAX-Q STRUCTURAL FAIL !!',   desc: '최대 동압에서 기체 파손' },
  6:  { event: '!! MECO ANOMALY !!',            desc: '메인 엔진 차단 이상' },
  7:  { event: '!! SEPARATION FAILURE !!',      desc: '단계 분리 실패' },
  8:  { event: '!! ORBIT INSERT FAIL !!',       desc: '궤도 진입 실패' },
  9:  { event: '!! TLI BURN ANOMALY !!',        desc: '달 전이 궤도 점화 실패' },
  10: { event: '!! LOI CAPTURE FAIL !!',        desc: '달 궤도 포획 실패' },
  11: { event: '!! LANDING ABORT !!',           desc: '착륙 실패 — 충돌' },
};

// 단계별 이름 매핑
const STAGE_NAMES = {
  4: 'LIFTOFF', 5: 'MAX-Q', 6: 'MECO', 7: 'STG SEP',
  8: 'ORBIT', 9: 'TLI', 10: 'LOI', 11: 'LANDING'
};

// 단계별 타이밍 (성공 시 총 ~8초)
const STAGE_TIMING = {
  4:  { delay: 0,    duration: 800  },
  5:  { delay: 800,  duration: 1000 },
  6:  { delay: 1800, duration: 800  },
  7:  { delay: 2600, duration: 800  },
  8:  { delay: 3400, duration: 1000 },
  9:  { delay: 4400, duration: 1000 },
  10: { delay: 5400, duration: 1000 },
  11: { delay: 6400, duration: 1200 },
};

// 단계별 텔레메트리 라벨
const STAGE_TELEM = {
  4: 'T+0',  5: 'T+3',  6: 'T+8',  7: 'T+12',
  8: 'T+20', 9: 'T+28', 10: 'T+38', 11: 'T+50'
};

// 단계별 성공 이벤트 메시지
const STAGE_SUCCESS_EVENT = {
  4: 'LIFTOFF',
  5: 'MAX-Q 통과',
  6: 'MECO — 1단 엔진 종료',
  7: '단계분리 / 2단 점화',
  8: '지구 궤도 진입',
  9: 'TLI — 달 전이 궤도 점화',
  10: 'LOI — 달 궤도 진입',
  11: '달 착륙 성공 ◆ TOUCHDOWN',
};

// 단계별 진행률 (%)
const STAGE_PCT = { 4: 5, 5: 18, 6: 35, 7: 50, 8: 65, 9: 78, 10: 90, 11: 100 };

// 단계별 실패 ASCII 폭발 프레임 (실패 위치에 따라 다른 아트)
const FAIL_FRAMES_BY_ZONE = {
  // LIFTOFF/MAX-Q 실패: 지상 근처 폭발
  ground: [
    '       *\n     /\\!\\  GYRO ALERT\n    / !! \\\n   / WARN \\\n  |  ROLL  |\n  |__+47°__|',
    '    \\  * . /\n  . * \u2554\u2550\u2557 * .\n * \u2591\u2591\u2591\u2551!\u2551\u2591\u2591\u2591 *\n  \u2591\u2592\u2593\u2593\u2588\u2588\u2588\u2593\u2593\u2592\u2591\n   \u2591\u2592\u2593\u2588\u2588\u2588\u2588\u2593\u2592\u2591\n  ~~ FIRE ~~',
    '     .   \u00b7   .\n   \u00b7   .   \u00b7\n    \u2591  \u2592\u2593\u2592  \u2591\n  \u2591\u2591\u2592\u2593\u2588\u2588\u2588\u2588\u2588\u2593\u2592\u2591\u2591\n  \u2500\u2500\u2500\u2550\u2550\u2564\u2550\u2550\u2500\u2500\u2500\n  \u2593\u2593 DAMAGED \u2593\u2593',
  ],
  // MECO/STG_SEP 실패: 고고도 분리 실패
  high_atm: [
    '       /|\\\n      / | \\\n     /  |! \\\n    / ALERT \\\n   |  SEPAR  |\n   |  FAIL   |',
    '     .  *  .\n    * . | . *\n   / * .|. * \\\n  *\u2591\u2591\u2592\u2593\u2588|\u2588\u2593\u2592\u2591\u2591*\n   \u2591\u2592\u2593\u2588\u2588\u2588\u2588\u2593\u2592\u2591\n ~~ BREAKUP ~~',
    '   .  \u00b7  .  \u00b7  .\n  \u00b7  . \u00b7 . \u00b7  .\n    \u2591 . \u2592 . \u2591\n   \u2591  \u2592\u2593\u2592  \u2591\n    .  \u00b7  .  \u00b7\n  // DEBRIS //\n   .  .  .  .',
  ],
  // ORBIT/TLI 실패: 우주 공간 엔진 고장
  space: [
    '    .  *  .\n   *       *\n  . [ENGINE] .\n  . [CUTOFF] .\n   *   !   *\n    .  *  .',
    '    .  \u00b7  .\n  \u00b7         \u00b7\n   . \u2591\u2592\u2593\u2592\u2591 .\n   \u2591\u2591 !! \u2591\u2591\n  \u00b7         \u00b7\n ~~ DRIFT ~~',
    '   \u00b7    .    \u00b7\n .    \u00b7    .\n    . \u00b7 . \u00b7\n  \u00b7    .    \u00b7\n .    \u00b7    .\n // LOST //\n   .    .    .',
  ],
  // LOI/LANDING 실패: 달 표면 충돌
  lunar: [
    '    . * .\n   *     *\n  .  \\|/  .\n  . --*-- .\n  .  /|\\  .\n   *     *\n  ~IMPACT~',
    '  \u2591\u2592\u2593\u2588\u2588\u2588\u2593\u2592\u2591\n \u2591\u2592\u2593\u2588\u2588\u2588\u2588\u2588\u2593\u2592\u2591\n\u2591\u2592\u2593\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2593\u2592\u2591\n \u2591\u2592\u2593\u2588\u2588\u2588\u2588\u2588\u2593\u2592\u2591\n  \u2591\u2592\u2593\u2588\u2588\u2588\u2593\u2592\u2591\n ~~ CRASH ~~',
    '    .  \u00b7  .\n  _____________\n /  .  \u00b7  .  \\\n/ \u00b7   RUD   . \\\n\\ .  \u00b7  .  \u00b7 /\n \\_____\u25cf_____/\n  // MOON //',
  ],
};

function _getFailZone(stageIdx) {
  if (stageIdx <= 5) return 'ground';
  if (stageIdx <= 7) return 'high_atm';
  if (stageIdx <= 9) return 'space';
  return 'lunar';
}

function executeLaunch() {
  if (launchInProgress) return;
  // 발사 가능 조건: 부품+연료 100%
  const canLaunch = (typeof getRocketCompletion === 'function' && getRocketCompletion() >= 100);
  if (!canLaunch) { notify('로켓 완성도 100% 필요', 'red'); return; }

  const q = getQuality(gs.assembly.selectedQuality || 'proto');
  const sci = getRocketScience(q.id);

  // ── 단계별 성공 확률 계산 ──
  // 전체 reliability를 8단계에 분배: perStageProb = reliability^(1/8)
  // 첫 발사(gs.launches === 0)는 전 단계 자동 성공
  const isFirstLaunch = gs.launches === 0;
  const perStageProb = isFirstLaunch ? 100 : Math.pow(sci.reliability / 100, 1 / 8) * 100;

  const stageRolls = [];
  let firstFailStage = -1;
  for (let i = 4; i <= 11; i++) {
    const success = Math.random() * 100 < perStageProb;
    stageRolls.push({ stage: i, success });
    if (!success && firstFailStage === -1) firstFailStage = i;
  }
  const rollSuccess = firstFailStage === -1; // 전 단계 통과 시 성공
  const earned = rollSuccess ? getMoonstoneReward(q.id) : 0;

  // 발사 후 항상 부품+연료 전체 초기화 (성공/실패 무관)
  gs.parts = { hull:0, engine:0, propellant:0, pump_chamber:0 };
  gs.fuelInjection = 0;
  gs.fuelLoaded = false;
  gs.fuelInjecting = false;
  // 진행 중인 제작 공정도 초기화
  gs.mfgActive = {};

  gs.launches++;
  if (rollSuccess) gs.successfulLaunches = (gs.successfulLaunches || 0) + 1;

  gs.history.push({
    no: gs.launches,
    quality: q.name,
    qualityId: q.id,
    rocketClass: gs.assembly.selectedClass || 'vega',
    deltaV: sci.deltaV.toFixed(2),
    altitude: rollSuccess ? Math.floor(sci.altitude) : 0,
    reliability: sci.reliability.toFixed(1),
    success: rollSuccess,
    earned: earned,
    failStage: firstFailStage,
    failDesc: firstFailStage >= 0 ? STAGE_FAILURES[firstFailStage].desc : null,
    date: `D+${gs.launches * 2}`,
  });
  pendingLaunchMs = earned;
  pendingLaunchData = { q, sci, earned, success: rollSuccess, firstFailStage };

  switchMainTab('launch');
  _runLaunchAnimation(q, sci, earned, rollSuccess, stageRolls, firstFailStage);
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
    el.classList.remove('phase-active', 'phase-done', 'phase-fail');
    if (isFail) {
      // activeIdx = 실패 단계 (4~11)
      if (activeIdx > ph.end) {
        el.classList.add('phase-done');  // 실패 이전 완료 페이즈
      } else if (activeIdx >= ph.start) {
        el.classList.add('phase-fail');  // 실패가 발생한 페이즈
      }
      // 실패 이후 페이즈: 그대로 dim
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

function _setLcStageFail(failStageIdx) {
  // failStageIdx: 실패가 발생한 단계 (4~11)
  // 실패 단계 이전까지 done, 실패 단계부터 fail
  document.querySelectorAll('.lc-stage-seg').forEach(seg => {
    const idx = parseInt(seg.dataset.idx, 10);
    seg.classList.remove('active', 'done', 'fail');
    if (idx < failStageIdx) seg.classList.add('done');
    else                    seg.classList.add('fail');
  });
  _updateLcPhaseHeaders(failStageIdx, true);
}

// ============================================================
//  LAUNCH ANIMATION — 단계별 성공/실패 판정 시스템
// ============================================================
function _runLaunchAnimation(q, sci, earned, success, stageRolls, firstFailStage) {
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

  const _rcAnim = (typeof ROCKET_CLASSES !== 'undefined')
    ? ROCKET_CLASSES.find(c => c.id === (gs.assembly.selectedClass || 'vega')) || ROCKET_CLASSES[0]
    : null;
  const _rcName = _rcAnim ? _rcAnim.name : 'NANO';
  const _rcThrust = _rcAnim ? String(_rcAnim.thrustKN) + ' kN' : '18 kN';
  const _rcTPad = (_rcAnim && _rcAnim.thrustKN >= 100) ? '' : ' ';
  animWrap.innerHTML = `
<div id="launch-rocket-cnt" style="text-align:center;position:relative;">
<pre class="launch-rocket-ascii" id="launch-rocket-pre" style="color:#00e676;text-shadow:0 0 8px rgba(0,230,118,0.6)">           *
          /|\\
         / | \\
        /  |  \\
       /   |   \\
      / ${_rcName.padEnd(8)} \\
     /______________\\
   |  [PAYLOAD]    |
   |   _________   |
   |  |  NAV    |  |
   |  |  SYS    |  |
   |  |_________|  |
   |               |
   |  [AVIONICS]   |
   |  _________    |
   | | O  O  O |   |
   | |  GYRO   |   |
   | |_________|   |
   |               |
   | [PROPULSION]  |
   |  _________    |
   | |         |   |
   | | ${_rcThrust} ${_rcTPad}|   |
   | |_________|   |
   |_______________|
  / [LOX]  [RP-1]  \\
 /___________________\\</pre>
<pre class="exhaust-anim" id="exhaust-art" style="display:none;color:#00e676">       |   |   |
      /|   |   |\\
     /_|___|___|_\\</pre>
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

  // ── 라이브 속도/고도 게이지 (단계별 연동) ──
  const maxSpeed = Math.round(sci.deltaV * 3600);
  const maxAlt   = Math.floor(sci.altitude);
  // 실패 시: 실패 단계까지의 진행비율로 peak 계산
  const failProgress = firstFailStage >= 0 ? (STAGE_PCT[firstFailStage] || 50) / 100 : 1;
  // 실패 발생 시점 (ms) — 실패 단계 시작 + duration 절반
  const failTimeMs = firstFailStage >= 0
    ? STAGE_TIMING[firstFailStage].delay + STAGE_TIMING[firstFailStage].duration * 0.6
    : 99999;
  // 성공 시 총 애니메이션 시간
  const totalAnimMs = success ? (STAGE_TIMING[11].delay + STAGE_TIMING[11].duration) : (failTimeMs + 2000);

  let gaugeFailTriggered = false;
  const gaugeInterval = setInterval(() => {
    const elapsed   = Date.now() - launchTime;
    const speedEl   = document.getElementById('lc-speed-val');
    const altEl     = document.getElementById('lc-alt-val');
    const speedBar  = document.getElementById('lc-speed-bar');
    const altBar    = document.getElementById('lc-alt-bar');

    if (success) {
      // 성공: 전 단계에 걸쳐 점진 증가
      const t = Math.min(1, elapsed / totalAnimMs);
      const easedSpeed = t * t;
      const easedAlt   = t < 0.7 ? (t / 0.7) * (t / 0.7) : 1;
      const curSpeed   = Math.round(easedSpeed * maxSpeed);
      const curAlt     = Math.round(easedAlt   * maxAlt);
      if (speedEl)  speedEl.textContent  = curSpeed.toLocaleString();
      if (altEl)    altEl.textContent    = curAlt.toLocaleString();
      if (speedBar) speedBar.style.width = Math.min(100, (curSpeed / (maxSpeed || 1)) * 100).toFixed(1) + '%';
      if (altBar)   altBar.style.width   = Math.min(100, (curAlt   / (maxAlt   || 1)) * 100).toFixed(1) + '%';
    } else {
      // 실패: 실패 시점까지 증가 후 빨갛게 감소
      if (elapsed < failTimeMs) {
        const t2  = elapsed / failTimeMs;
        const spd = Math.round(t2 * t2 * maxSpeed * failProgress);
        const alt = Math.round(t2 * maxAlt * failProgress);
        if (speedEl)  speedEl.textContent  = spd.toLocaleString();
        if (altEl)    altEl.textContent    = alt.toLocaleString();
        if (speedBar) speedBar.style.width = Math.min(100, (spd / (maxSpeed || 1)) * 100).toFixed(1) + '%';
        if (altBar)   altBar.style.width   = Math.min(100, (alt  / (maxAlt   || 1)) * 100).toFixed(1) + '%';
      } else {
        if (!gaugeFailTriggered) {
          gaugeFailTriggered = true;
          // 게이지 빨간색 전환
          if (speedEl) speedEl.classList.add('gauge-fail');
          if (altEl)   altEl.classList.add('gauge-fail');
        }
        const t3      = Math.min(1, (elapsed - failTimeMs) / 1200);
        const peakSpd = Math.round(maxSpeed * failProgress);
        const peakAlt = Math.round(maxAlt * failProgress);
        const spd     = Math.round(peakSpd * (1 - t3));
        const alt     = Math.round(peakAlt * (1 - t3));
        if (speedEl)  speedEl.textContent  = Math.max(0, spd).toLocaleString();
        if (altEl)    altEl.textContent    = Math.max(0, alt).toLocaleString();
        if (speedBar) { speedBar.style.width = Math.max(0, (1 - t3) * failProgress * 100).toFixed(1) + '%'; speedBar.style.background = 'var(--red)'; }
        if (altBar)   { altBar.style.width   = Math.max(0, (1 - t3) * failProgress * 100).toFixed(1) + '%'; altBar.style.background   = 'var(--red)'; }
      }
    }
  }, 50);

  setTimeout(() => clearInterval(gaugeInterval), totalAnimMs + 1500);

  // ── 텔레메트리 로그 ──
  const telemWrap = document.getElementById('telem-wrap');
  if (telemWrap) telemWrap.innerHTML =
    '<div style="color:var(--green-dim);font-size:9px;letter-spacing:.15em;padding:3px 0;border-bottom:1px solid var(--green-dim);margin-bottom:3px;">// TELEMETRY LOG</div>';

  const telemDiv = document.createElement('div');
  telemDiv.className = 'telemetry-wrap';
  if (telemWrap) telemWrap.appendChild(telemDiv);

  // ── 단계별 순차 처리 ──
  const stageIds = [4, 5, 6, 7, 8, 9, 10, 11];

  stageIds.forEach((stageIdx, i) => {
    const timing = STAGE_TIMING[stageIdx];
    const roll = stageRolls[i];
    const isFailStage = (stageIdx === firstFailStage);
    const isAfterFail = (firstFailStage >= 0 && stageIdx > firstFailStage);

    // 실패 이후 단계는 스킵 (표시만)
    if (isAfterFail) return;

    // 1. 단계 시작: active 표시 + 텔레메트리
    setTimeout(() => {
      _setLcStage(stageIdx);
      if (statusTextEl) statusTextEl.textContent = `// ${STAGE_NAMES[stageIdx]}`;

      // 단계 시작 SFX
      playSfx('triangle', 300 + i * 40, 0.06, 0.02, 400 + i * 30);

      // 텔레메트리 로그: 단계 시작
      const line = document.createElement('div');
      line.className = 'telem-line';
      line.innerHTML =
        `<span class="telem-time">${STAGE_TELEM[stageIdx]}</span>` +
        `<span class="telem-event">${STAGE_SUCCESS_EVENT[stageIdx]}</span>` +
        `<span class="telem-pct">${STAGE_PCT[stageIdx]}%</span>`;
      telemDiv.appendChild(line);

      const hudBody = document.getElementById('lc-hud-body');
      if (hudBody) hudBody.scrollTop = hudBody.scrollHeight;
    }, timing.delay);

    // 2. 단계 결과 (시작 후 duration*0.6 — 긴장감 유지)
    const resultDelay = timing.delay + Math.round(timing.duration * 0.6);

    if (isFailStage) {
      // ── 실패 처리 ──
      setTimeout(() => {
        const failInfo = STAGE_FAILURES[stageIdx];

        // 텔레메트리: ANOMALY DETECTED
        const anomalyLine = document.createElement('div');
        anomalyLine.className = 'telem-line telem-fail';
        anomalyLine.innerHTML =
          `<span class="telem-time">${STAGE_TELEM[stageIdx]}</span>` +
          `<span class="telem-event">!! ANOMALY DETECTED !!</span>` +
          `<span class="telem-pct">---</span>`;
        telemDiv.appendChild(anomalyLine);

        if (statusTextEl) statusTextEl.textContent = '// ANOMALY';
        playSfx('sawtooth', 180, 0.14, 0.05, 80);

        const hudBody = document.getElementById('lc-hud-body');
        if (hudBody) hudBody.scrollTop = hudBody.scrollHeight;
      }, resultDelay);

      // 실패 메시지 (anomaly 후 0.6초)
      setTimeout(() => {
        const failInfo = STAGE_FAILURES[stageIdx];

        const failLine = document.createElement('div');
        failLine.className = 'telem-line telem-fail';
        failLine.innerHTML =
          `<span class="telem-time">${STAGE_TELEM[stageIdx]}</span>` +
          `<span class="telem-event">${failInfo.event}</span>` +
          `<span class="telem-pct">FAIL</span>`;
        telemDiv.appendChild(failLine);

        playSfx('sawtooth', 140, 0.18, 0.06, 60);

        // 단계 바: 실패 단계부터 전부 fail
        _setLcStageFail(stageIdx);

        if (statusTextEl) statusTextEl.textContent = `// ${failInfo.desc}`;

        const hudBody = document.getElementById('lc-hud-body');
        if (hudBody) hudBody.scrollTop = hudBody.scrollHeight;
      }, resultDelay + 600);

      // MISSION LOST 메시지 (실패 후 1.2초)
      setTimeout(() => {
        const missionLostLine = document.createElement('div');
        missionLostLine.className = 'telem-line telem-fail';
        missionLostLine.innerHTML =
          `<span class="telem-time">---</span>` +
          `<span class="telem-event">// MISSION LOST — RUD</span>` +
          `<span class="telem-pct">0%</span>`;
        telemDiv.appendChild(missionLostLine);

        playSfx('sawtooth', 100, 0.22, 0.05, 50);

        const hudBody = document.getElementById('lc-hud-body');
        if (hudBody) hudBody.scrollTop = hudBody.scrollHeight;
      }, resultDelay + 1200);

      // 실패 로켓 폭발 프레임
      const zone = _getFailZone(stageIdx);
      const failFrames = FAIL_FRAMES_BY_ZONE[zone];
      failFrames.forEach((frame, fi) => {
        setTimeout(() => {
          const rocketEl = document.getElementById('launch-rocket-pre');
          if (rocketEl) {
            rocketEl.classList.remove('launching');
            rocketEl.classList.add('exploding');
            rocketEl.style.color = 'var(--red)';
            rocketEl.style.textShadow = '0 0 12px rgba(255,23,68,0.8)';
            rocketEl.textContent = frame;
          }
          const exhaustEl = document.getElementById('exhaust-art');
          if (exhaustEl) exhaustEl.style.display = 'none';
        }, resultDelay + 600 + fi * 700);
      });
    }
  });

  // ── 결과 패널 표시 ──
  // 성공: 마지막 단계 완료 후
  // 실패: 실패 단계의 애니메이션 완료 후
  const failAnimEndMs = firstFailStage >= 0
    ? STAGE_TIMING[firstFailStage].delay + Math.round(STAGE_TIMING[firstFailStage].duration * 0.6) + 2800
    : 0;
  const resultPanelDelay = success
    ? (STAGE_TIMING[11].delay + STAGE_TIMING[11].duration + 200)
    : failAnimEndMs;
  const overlayDelay = resultPanelDelay + 600;

  const failDesc = firstFailStage >= 0 ? STAGE_FAILURES[firstFailStage].desc : '';
  const failStageName = firstFailStage >= 0 ? STAGE_NAMES[firstFailStage] : '';

  setTimeout(() => {
    const lr = document.getElementById('launch-result');
    if (lr) {
      lr.classList.add('show');
      const lrTitle = document.getElementById('lr-title');
      if (lrTitle) {
        lrTitle.textContent = success
          ? '// 달 착륙 성공'
          : `// 발사 실패 — ${failStageName}`;
      }
      const lrStats = document.getElementById('lr-stats');
      if (lrStats) lrStats.innerHTML =
        `<span class="launch-result-stat-lbl">기체</span><span class="launch-result-stat-val">${q.name}</span>` +
        `<span class="launch-result-stat-lbl">\u0394v</span><span class="launch-result-stat-val">${sci.deltaV.toFixed(2)} km/s</span>` +
        `<span class="launch-result-stat-lbl">TWR</span><span class="launch-result-stat-val">${sci.twr.toFixed(2)}</span>` +
        `<span class="launch-result-stat-lbl">최고도</span><span class="launch-result-stat-val">${success ? Math.floor(sci.altitude) : '---'} km</span>` +
        `<span class="launch-result-stat-lbl">신뢰도</span><span class="launch-result-stat-val">${sci.reliability.toFixed(1)}%</span>` +
        (success ? '' : `<span class="launch-result-stat-lbl">실패 단계</span><span class="launch-result-stat-val" style="color:var(--red)">${failStageName} — ${failDesc}</span>`);
      const lrMs = document.getElementById('lr-ms');
      if (lrMs) {
        if (success) {
          lrMs.textContent = `문스톤 보상: +${earned}개`;
          lrMs.style.color = 'var(--amber)';
        } else {
          lrMs.textContent = `${failStageName}에서 실패 — ${failDesc}`;
          lrMs.style.color = 'var(--red)';
        }
      }
    }
    if (statusTextEl) statusTextEl.textContent = success ? '// MISSION COMPLETE' : '// MISSION LOST';
    if (success) _setLcStage(12); // 모든 단계 done (LANDING 포함)
    clearInterval(timerInterval);
  }, resultPanelDelay);

  setTimeout(() => {
    launchInProgress = false;
    if (success) {
      playLaunchSfx();
    } else {
      if (typeof playSfx_launchFail === 'function') playSfx_launchFail();
    }
    if (typeof BGM !== 'undefined' && gs.settings.sound) BGM.stopEvent();
    _showLaunchOverlay(q, sci, earned, success, firstFailStage);
  }, overlayDelay);
}

function _showLaunchOverlay(q, sci, earned, success, firstFailStage) {
  const failStageName = firstFailStage >= 0 ? STAGE_NAMES[firstFailStage] : '';
  const failDesc = firstFailStage >= 0 ? STAGE_FAILURES[firstFailStage].desc : '';

  const loTitle = document.getElementById('lo-title');
  if (loTitle) {
    loTitle.textContent = success
      ? '// 달 착륙 성공'
      : `// 발사 실패 — ${failStageName}`;
  }
  const loRocket = document.getElementById('lo-rocket-art');
  if (loRocket) {
    if (success) {
      const _rcOv = (typeof ROCKET_CLASSES !== 'undefined')
        ? ROCKET_CLASSES.find(c => c.id === (gs.assembly.selectedClass || 'vega')) || ROCKET_CLASSES[0]
        : null;
      const _rvN = _rcOv ? _rcOv.name : 'NANO';
      loRocket.style.color = '';
      loRocket.style.textShadow = '';
      loRocket.textContent =
`           *
          /|\\
         / | \\
        /  |  \\
       /   |   \\
      / ${_rvN.padEnd(8)} \\
     /______________\\
   |  [PAYLOAD]    |
   |   _________   |
   |  |  NAV    |  |
   |  |  SYS    |  |
   |  |_________|  |
   |               |
   |  [AVIONICS]   |
   |  _________    |
   | | O  O  O |   |
   | |  GYRO   |   |
   | |_________|   |
   |_______________|
  / [LOX]  [RP-1]  \\
 /___________________\\
       |   |   |
      /|   |   |\\
     /_|___|___|_\\`;
    } else {
      // 실패 오버레이: 실패 존 ASCII 아트
      const zone = _getFailZone(firstFailStage);
      const frames = FAIL_FRAMES_BY_ZONE[zone];
      loRocket.style.color = 'var(--red)';
      loRocket.style.textShadow = '0 0 10px rgba(255,23,68,0.6)';
      loRocket.textContent = frames[frames.length - 1]; // 마지막 프레임
    }
  }
  const loStats = document.getElementById('lo-stats');
  if (loStats) {
    let statsHtml = `기체: ${q.name}  |  \u0394v: ${sci.deltaV.toFixed(2)} km/s  |  고도: ${success ? Math.floor(sci.altitude) : '---'} km<br>TWR: ${sci.twr.toFixed(2)}  |  신뢰도: ${sci.reliability.toFixed(1)}%`;
    if (!success) {
      statsHtml += `<br><span style="color:var(--red)">실패: ${failStageName} — ${failDesc}</span>`;
    }
    loStats.innerHTML = statsHtml;
  }
  const loMs = document.getElementById('lo-ms');
  if (loMs) {
    if (success) {
      loMs.textContent = '\u2713 달 착륙 성공 \u2014 문스톤 +' + earned + '개';
      loMs.style.color = 'var(--green)';
      playSfx('sine', 1200, 0.10, 0.03, 1600);
    } else {
      loMs.textContent = '\u2717 ' + failStageName + '에서 실패 \u2014 ' + failDesc;
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
  executeLaunch();
}

// ============================================================
//  ROCKET ASCII ART — 공유 함수 사용 (조립동과 동일한 아트)
// ============================================================
function _lcRocketArtHtml() {
  const canLaunch = (typeof getRocketCompletion === 'function' && getRocketCompletion() >= 100);
  return getRocketArtHtml({ allGreen: canLaunch });
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
    if (speedEl)  { speedEl.textContent = '0'; speedEl.classList.remove('gauge-fail'); }
    if (altEl)    { altEl.textContent = '0'; altEl.classList.remove('gauge-fail'); }
    if (speedBar) { speedBar.style.width = '0%'; speedBar.style.background = ''; }
    if (altBar)   { altBar.style.width   = '0%'; altBar.style.background   = ''; }

    const timerEl  = document.getElementById('lc-t-timer');
    const statusEl = document.getElementById('lc-status-text');
    if (timerEl)  timerEl.textContent  = 'T+ 00:00';
    if (statusEl) statusEl.textContent = '// PRE-LAUNCH';
  } else {
    return; // 발사 중 리렌더 방지 (BUG-007)
  }

  // 발사 가능 여부: 부품+연료 100% (조립 프로세스 제거됨)
  const canLaunch = (typeof getRocketCompletion === 'function' && getRocketCompletion() >= 100);
  let q = null, sci = null, earned = 0;
  if (canLaunch) {
    q      = getQuality(gs.assembly.selectedQuality || 'proto');
    sci    = getRocketScience(q.id);
    earned = getMoonstoneReward(q.id);
  }

  // 미션 번호
  const missionNumEl = document.getElementById('lc-mission-num');
  if (missionNumEl) missionNumEl.textContent = String((gs.launches || 0) + 1).padStart(3, '0');

  // ALL GO 체크 — 부품+연료 100% = 즉시 발사 가능 (조립 프로세스 제거됨)
  const allGo = canLaunch;
  if (allGo && !_prevAllGo) {
    playSfx('sine', 440, 0.08, 0.04, 660);
    setTimeout(() => playSfx('sine', 660, 0.08, 0.04, 880), 100);
  }
  _prevAllGo = allGo;

  // 프리론치 단계 바 — PARTS(0)→FUEL(1)→T-MINUS(3) (ASSY 단계 제거)
  const reqPartsAll = _getRequiredParts();
  const allPartsDone = reqPartsAll.every(pt => (gs.parts[pt.id] || 0) >= pt.cycles);
  const fuelFull = (gs.fuelInjection || 0) >= 100;
  if (allGo)                          _setLcStage(3); // T-MINUS active (0-2 done)
  else if (allPartsDone && fuelFull)  _setLcStage(3); // 부품+연료 완료 = 발사 준비 완료
  else if (allPartsDone)              _setLcStage(1); // FUEL active — 부품 완료, 연료 진행
  else                                _setLcStage(0); // PARTS active — 부품 제작 중

  // 프리-플라이트 체크리스트 + 완성도 표시 — 조립동 기준
  const p2 = gs.parts || {};
  const reqParts2 = _getRequiredParts();

  // 조립동 기준 진행 항목
  const items = [];
  reqParts2.forEach(pt => {
    const cur = p2[pt.id] || 0;
    const done = cur >= pt.cycles;
    items.push({ done, label: `${pt.name} (${cur}/${pt.cycles})`, short: pt.name });
  });
  // 연료 주입 (조립동에서도 관리)
  const fuelPctVal = gs.fuelInjection || 0;
  items.push({ done: fuelPctVal >= 100, label: `연료 (${Math.round(fuelPctVal)}%)`, short: '연료' });
  // 발사 준비 상태 (부품+연료 100%)
  items.push({ done: canLaunch, label: '발사 준비', short: '준비' });

  // 완성도 — 조립동의 getRocketCompletion() 사용
  const readinessPct = typeof getRocketCompletion === 'function' ? getRocketCompletion() : 0;

  // 완성도 바
  const readinessEl = document.getElementById('lc-readiness');
  if (readinessEl) {
    const rColor = readinessPct === 100 ? 'var(--amber)' : readinessPct >= 60 ? 'var(--green)' : 'var(--green-mid)';
    const badges = items.map(it =>
      `<span class="lc-rd-badge${it.done ? ' done' : ''}">${it.done ? '✓' : '○'} ${it.short}</span>`
    ).join('');
    readinessEl.innerHTML =
      `<div class="lc-rd-row">` +
      `<span class="lc-rd-pct" style="color:${rColor}">${readinessPct}<span class="lc-rd-pct-unit">%</span></span>` +
      `<span class="lc-rd-label">완성도</span>` +
      `<span class="lc-rd-sep">|</span>` +
      `${badges}` +
      `</div>`;
  }

  // 체크리스트: 아래 상태 패널과 중복되므로 숨김
  const checklistEl = document.getElementById('lc-checklist');
  if (checklistEl) checklistEl.innerHTML = '';

  // ASCII 로켓
  const rocketPre = document.getElementById('lc-rocket-pre');
  if (rocketPre) rocketPre.innerHTML = _lcRocketArtHtml();

  // 커밋 박스 상태: allGo → 앰버 활성, 아닐 때 → 회색 비활성
  const commitBox = document.getElementById('lc-commit-box');
  if (commitBox) commitBox.classList.toggle('lc-commit-ready', allGo);
  // 커밋 스탯: 로켓 완성 시만 표시
  const commitStatsEl = document.getElementById('lc-commit-stats');
  if (commitStatsEl) commitStatsEl.style.display = canLaunch ? '' : 'none';

  // 상태 패널 — 각 부품 진행바 + 연료 (조립 상태 제거됨)
  const statusPanel = document.getElementById('lc-status-panel');
  if (statusPanel) {
    const p3        = gs.parts || {};
    const reqParts3 = _getRequiredParts();

    let spHtml = '';

    // 각 부품별 진행바
    reqParts3.forEach(pt => {
      const cur = p3[pt.id] || 0;
      const pct = Math.round((Math.min(cur, pt.cycles) / pt.cycles) * 100);
      const clr = cur >= pt.cycles ? '' : 'amber';
      spHtml += `<div class="lc-sp-row"><span class="lc-sp-label">${pt.name}</span><div class="lc-sp-bar-wrap"><div class="lc-sp-bar-fill ${clr}" style="width:${pct}%"></div></div><span class="lc-sp-pct ${clr}">${cur}/${pt.cycles}</span></div>`;
    });

    // 연료 주입 진행바
    const fuelInjPct = Math.round(gs.fuelInjection || 0);
    const fuelClr = fuelInjPct >= 100 ? '' : 'amber';
    spHtml += `<div class="lc-sp-row"><span class="lc-sp-label">연료 주입</span><div class="lc-sp-bar-wrap"><div class="lc-sp-bar-fill ${fuelClr}" style="width:${fuelInjPct}%"></div></div><span class="lc-sp-pct ${fuelClr}">${fuelInjPct}%</span></div>`;

    statusPanel.innerHTML = spHtml;
  }

  // 미션 파라미터 (HUD)
  const missionParams = document.getElementById('lc-mission-params');
  if (missionParams) {
    if (canLaunch) {
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
    if (canLaunch) {
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

  // 안내 — 완성도 100% 미만일 때 조립동 이동 안내
  const lcGuideEl = document.getElementById('lc-assembly-guide');
  if (lcGuideEl) {
    if (!canLaunch && readinessPct < 100) {
      lcGuideEl.style.display = '';
      lcGuideEl.innerHTML =
        `<div style="font-size:11px;color:var(--cyan);margin-bottom:6px;">` +
        `&#9654; 조립동에서 부품 제작과 연료 주입을 완료하세요.</div>` +
        `<button class="btn btn-sm" onclick="switchMainTab('assembly')" style="font-size:11px;padding:4px 12px;">` +
        `&#9881; 조립동으로 이동</button>`;
    } else {
      lcGuideEl.style.display = 'none';
      lcGuideEl.innerHTML = '';
    }
  }

  // ABORT 버튼 — 조립 프로세스 제거로 항상 숨김
  const abortBtn = document.getElementById('lc-btn-abort');
  if (abortBtn) abortBtn.style.display = 'none';
}


// ── 온보딩 퀘스트 렌더링 (DOM 없으면 early-return) ────────────
function _renderLcQuest() {
  const el = document.getElementById('lc-quest');
  if (!el) return;

  const bld = gs.buildings || {}, upgs = gs.upgrades || {};
  const hasLaunched = (gs.launches || 0) >= 1;
  const mainDone = hasLaunched;
  const rktReady = (typeof getRocketCompletion === 'function' && getRocketCompletion() >= 100);

  const subs = [
    { icon:'[OPS]', key:'q_sub_ops',      done: (gs.assignments && (gs.assignments.ops_center||0)>=1) },
    { icon:'[FND]', key:'q_sub_money',    done: (gs.res.money||0)>=1000 },
    { icon:'[MIN]', key:'q_sub_mine',     done: (bld.mine||0)>=1 },
    { icon:'[RSH]', key:'q_sub_lab',      done: (bld.research_lab||0)>=1 },
    { icon:'[TEC]', key:'q_sub_research', done: Object.keys(upgs).length>=1 },
    { icon:'[PAD]', key:'q_sub_pad',      done: (bld.launch_pad||0)>=1 },
    { icon:'[ASM]', key:'q_sub_assemble', done: rktReady || hasLaunched },
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
