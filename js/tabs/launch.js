
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
  4: { event: '!! ENGINE STARTUP FAILURE !!', desc: '엔진 점화 실패' },
  5: { event: '!! MAX-Q STRUCTURAL FAIL !!', desc: '최대 동압에서 기체 파손' },
  6: { event: '!! MECO ANOMALY !!', desc: '메인 엔진 차단 이상' },
  7: { event: '!! SEPARATION FAILURE !!', desc: '단계 분리 실패' },
  8: { event: '!! ORBIT INSERT FAIL !!', desc: '궤도 진입 실패' },
  9: { event: '!! TLI BURN ANOMALY !!', desc: '달 전이 궤도 점화 실패' },
  10: { event: '!! LOI CAPTURE FAIL !!', desc: '달 궤도 포획 실패' },
  11: { event: '!! LANDING ABORT !!', desc: '착륙 실패 — 충돌' },
};

// 단계별 이름 매핑
const STAGE_NAMES = {
  4: 'LIFTOFF', 5: 'MAX-Q', 6: 'MECO', 7: 'STG SEP',
  8: 'ORBIT', 9: 'TLI', 10: 'LOI', 11: 'LANDING'
};

// 단계별 타이밍 — 각 단계 최소 5000ms (총괄PD 지시: 단계별 최소 5초)
// 8단계 전체 = 최소 40초 발사 시퀀스
const STAGE_TIMING = {
  4: { delay: 0, duration: 5000 },  // LIFTOFF  (0~5s)
  5: { delay: 5000, duration: 5000 },  // MAX-Q    (5~10s)
  6: { delay: 10000, duration: 5000 },  // MECO     (10~15s)
  7: { delay: 15000, duration: 5000 },  // STG SEP  (15~20s)
  8: { delay: 20000, duration: 5500 },  // ORBIT    (20~25.5s)
  9: { delay: 25500, duration: 5500 },  // TLI      (25.5~31s)
  10: { delay: 31000, duration: 5500 },  // LOI      (31~36.5s)
  11: { delay: 36500, duration: 6000 },  // LANDING  (36.5~42.5s)
};

// 단계별 텔레메트리 라벨
const STAGE_TELEM = {
  4: 'T+0', 5: 'T+3', 6: 'T+8', 7: 'T+12',
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

// 클래스별 성취 메시지 (성공 오버레이 / 결과 패널용)
const CLASS_ACHIEVEMENTS = {
  vega: {
    title: '// FIRST FLIGHT',
    flavor: '인류의 첫 비행이 성공했습니다\n고도 10km — 우주를 향한 첫걸음',
    next: '다음 목표: 카르만 선 돌파 (Argo 클래스)',
  },
  argo: {
    title: '// KÁRMÁN LINE CROSSED',
    flavor: '카르만 선을 돌파했습니다\n100km — 우주의 경계를 넘었습니다',
    next: '다음 목표: 지구 궤도 진입 (Hermes 클래스)',
  },
  hermes: {
    title: '// EARTH ORBIT ACHIEVED',
    flavor: '중력의 사슬을 끊어냈습니다\n인류가 처음으로 지구 궤도에 올랐습니다',
    next: '다음 목표: 달 전이 궤도 점화 (Atlas 클래스)',
  },
  atlas: {
    title: '// TLI — LUNAR TRANSFER',
    flavor: '달을 향한 대장정이 시작됩니다\n전이 궤도 점화 성공 — 달까지 3일',
    next: '다음 목표: 달 궤도 포획 (Selene 클래스)',
  },
  selene: {
    title: '// LUNAR ORBIT INSERTION',
    flavor: '달의 품에 안겼습니다\n달 궤도 포획 성공 — 착륙 준비 완료',
    next: '다음 목표: 달 착륙 성공 (Artemis 클래스)',
  },
  artemis: {
    title: '// TOUCHDOWN — MOON LANDING',
    flavor: '"THE EAGLE HAS LANDED"\n인류가 달에 첫 발을 내딛었습니다',
    next: '다음 목표: 달 기지 건설 (Coming Soon)',
  },
};

// (레거시 FAIL_FRAMES_BY_ZONE 제거됨 — D5: STAGE_FAIL_FRAMES로 통합)

function _getFailZone(stageIdx) {
  if (stageIdx <= 5) return 'ground';
  if (stageIdx <= 7) return 'high_atm';
  if (stageIdx <= 9) return 'space';
  return 'lunar';
}

// ============================================================
//  PARALLAX BACKGROUND — 카메라 고정, 배경 지상→우주 스크롤
// ============================================================
function _buildParallaxBg(wrapEl, totalMs) {
  // 배경 내용 블록 (위 = 우주, 아래 = 지상)
  const L = [
    // ① 별/우주 (맨 위, 마지막에 보임)
    '  *   .   *   .   *   .   *   .   *   .  ',
    ' .   *   .   *   .   *   .   *   .   *   ',
    '  *   .   *   .   *   .   *   .   *   .  ',
    ' .   *   .   .   *   .   *   .   .   *   ',
  ];
  const U = [
    // ② 고층 대기 (점)
    '  ·   ·   ·   ·   ·   ·   ·   ·   ·   · ',
    ' ·   ·   ·   ·   ·   ·   ·   ·   ·   ·  ',
    '  ·   ·   ·   ·   ·   ·   ·   ·   ·   · ',
  ];
  const C = [
    // ③ 구름
    '  ~~~  ~~   ~~~  ~~   ~~~  ~~   ~~~  ~~  ',
    ' ~~   ~~~  ~~   ~~~  ~~   ~~~  ~~   ~~~  ',
    '  ~~~  ~~   ~~~  ~~   ~~~  ~~   ~~~  ~~  ',
    ' ~~   ~~~  ~~   ~~~  ~~   ~~~  ~~   ~~~  ',
  ];
  const A = [
    // ④ 저층 대기
    '  · * · * · * · * · * · * · * · * · * ·  ',
    ' * · * · * · * · * · * · * · * · * · * ·  ',
    '  · * · * · * · * · * · * · * · * · * ·  ',
  ];
  const G = [
    // ⑤ 지상/발사대 (맨 아래, 처음에 보임)
    '  [T]  |   [T]  |   [T]  |   [T]  |  [T]',
    ' ─────────────────────────────────────────',
    ' ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
    ' █████████████████████████████████████████',
  ];

  const rep = (lines, n) => Array.from({ length: n }, () => lines.join('\n')).join('\n');

  // 색상 구간별 분리 (3개 레이어: 속도 다름 — 빠른 지상→느린 우주)
  const layerDefs = [
    // near: 지상·구름 — 매우 빠름 (지상 러시감)
    { content: rep(G, 15) + '\n\n' + rep(A, 15) + '\n\n' + rep(C, 12), color: '#1f4a1f', speed: 2.5 },
    // mid: 구름·대기 — 빠름
    { content: rep(C, 12) + '\n\n' + rep(A, 12) + '\n\n' + rep(U, 15), color: '#1a3a3a', speed: 1.8 },
    // far: 별 — 보통
    { content: rep(U, 15) + '\n\n' + rep(L, 30), color: '#0f2a1a', speed: 1.0 },
  ];

  const bg = document.createElement('div');
  bg.id = 'launch-parallax';

  const strips = layerDefs.map(def => {
    const pre = document.createElement('pre');
    pre.className = 'lp-strip';
    pre.textContent = def.content;
    pre.style.color = def.color;
    bg.appendChild(pre);
    return { pre, speed: def.speed };
  });

  // 씬 컨테이너 앞에 삽입 (z-index로 배경이 뒤로)
  const sceneContainer = wrapEl.querySelector('#launch-scene');
  if (sceneContainer) wrapEl.insertBefore(bg, sceneContainer);
  else wrapEl.prepend(bg);

  const startTime = Date.now();
  let stopped = false;

  function tick() {
    if (stopped) return;
    const elapsed = Date.now() - startTime;
    const progress = Math.min(1, elapsed / totalMs);
    const wrapH = wrapEl.offsetHeight || 280;

    // Ease-out: 빠른 시작(지상 러시) → 우주에서 감속
    const easedProgress = 1 - Math.pow(1 - progress, 2);

    strips.forEach(({ pre, speed }) => {
      const stripH = pre.scrollHeight || 1000;
      const maxY = Math.max(0, stripH - wrapH);
      const effectiveProgress = Math.min(1, easedProgress * speed);
      // 시작: -maxY (스트립 위로 올려 하단=지상 보이게), 끝: 0 (상단=우주 보이게)
      pre.style.transform = `translateY(${-maxY * (1 - effectiveProgress)}px)`;
    });

    if (progress < 1) requestAnimationFrame(tick);
  }

  // DOM 반영 후 초기 위치 세팅 → 다음 rAF에서 애니 시작
  requestAnimationFrame(() => {
    const wrapH = wrapEl.offsetHeight || 280;
    strips.forEach(({ pre }) => {
      const stripH = pre.scrollHeight || 1000;
      pre.style.transform = `translateY(${-Math.max(0, stripH - wrapH)}px)`;
    });
    requestAnimationFrame(tick);
  });

  return { stop: () => { stopped = true; } };
}

// ============================================================
//  PRE-LAUNCH IGNITION SEQUENCE (T-3 → T=0)
//  발사 전 엔진 스타트업 연출: 하단 UI 숨기고 점화 애니메이션
// ============================================================
function _runPreLaunchIgnition(onComplete) {
  // 1. 하단 UI 즉시 숨기기 (체크리스트, 상태, 스펙, 완성도, 커밋박스 — stagebar는 유지)
  ['lc-checklist', 'lc-status-panel', 'lc-spec-panel', 'lc-readiness', 'lc-commit-box'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  // 2. 로켓 아트 아래에 배기구 + 지상 삽입
  const preLaunch = document.getElementById('lc-pre-launch');
  if (!preLaunch) { onComplete(); return; }

  const extras = document.createElement('div');
  extras.id = 'ign-extras';
  extras.style.cssText = 'display:flex;flex-direction:column;align-items:center;overflow:hidden;';
  extras.innerHTML =
    '<pre id="ign-exhaust" style="font-family:\'Courier New\',Consolas,monospace;' +
    'font-size:13px;line-height:1.3;white-space:pre;color:var(--amber);' +
    'text-shadow:0 0 8px var(--amber);margin:0;text-align:center;' +
    'animation:exhaust-flicker 0.15s step-start infinite;min-height:18px;' +
    '"></pre>' +
    '<pre style="font-family:\'Courier New\',Consolas,monospace;font-size:11px;' +
    'line-height:1.2;white-space:pre;color:#1a4a1a;margin:0;width:100%;text-align:center;">' +
    '─────────────────────────────────\n' +
    '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓</pre>';
  preLaunch.appendChild(extras);

  const statusEl = document.getElementById('lc-status-text');
  const timerEl = document.getElementById('lc-t-timer');
  const exhaustEl = document.getElementById('ign-exhaust');
  const rocketPre = document.getElementById('lc-rocket-pre');

  // 점화 시퀀스 (0 → 3초)
  const STEPS = [
    { ms: 0, timer: 'T - 3', status: '// ENGINE START', exhaust: '  ◦  ', shake: false },
    { ms: 1000, timer: 'T - 2', status: '// THROTTLE UP', exhaust: ' *|* \n  ◦  ', shake: false },
    { ms: 2000, timer: 'T - 1', status: '// FULL THRUST', exhaust: '*!|!*\n *|* \n  ◦  ', shake: true },
    { ms: 3000, timer: 'T - 0', status: '// LIFTOFF', exhaust: '*!|!*\n*!|!*\n *|* \n  ◦  ', shake: true },
  ];

  STEPS.forEach((step, i) => {
    setTimeout(() => {
      if (statusEl) statusEl.textContent = step.status;
      if (timerEl) timerEl.textContent = step.timer;
      if (exhaustEl) exhaustEl.textContent = step.exhaust;
      if (step.shake && rocketPre) {
        rocketPre.style.animation = i === 3 ? 'shake-md 0.05s infinite' : 'shake-sm 0.05s infinite';
        rocketPre.style.color = 'var(--amber)';
        rocketPre.style.textShadow = i === 3 ? '0 0 18px var(--amber)' : '0 0 10px var(--amber)';
      }
      if (typeof playSfx === 'function') {
        playSfx('sine', 160 + i * 55, 0.03 + i * 0.02, 0.05, 210 + i * 55);
      }
    }, step.ms);
  });

  // T=0 이후 0.4초 후 메인 발사 애니메이션 전환
  setTimeout(() => {
    const extEl = document.getElementById('ign-extras');
    if (extEl) extEl.remove();
    if (rocketPre) {
      rocketPre.style.animation = '';
      rocketPre.style.color = '';
      rocketPre.style.textShadow = '';
    }
    onComplete();
  }, 3400);
}

// 클래스별 maxStage 조회 헬퍼
function _getClassMaxStage(classId) {
  if (typeof ROCKET_CLASSES !== 'undefined') {
    const cls = ROCKET_CLASSES.find(c => c.id === classId);
    if (cls && cls.maxStage) return cls.maxStage;
  }
  return 11; // fallback: LANDING까지
}

function executeLaunch() {
  if (launchInProgress) return;
  // 발사 가능 조건: 부품+연료 100%
  const canLaunch = (typeof getRocketCompletion === 'function' && getRocketCompletion() >= 100);
  if (!canLaunch) { notify('로켓 완성도 100% 필요', 'red'); return; }

  const q = getQuality(gs.assembly.selectedQuality || 'proto');
  const classId = gs.assembly.selectedClass || 'vega';
  // D5: 저장된 rollVariance 사용 (없으면 안전 생성)
  if (!gs.assembly.rollVariance) gs.assembly.rollVariance = generateRollVariance(q.id);
  const rv = gs.assembly.rollVariance;
  const sci = getRocketScience(q.id, classId, rv);

  // 클래스별 최대 도달 단계
  const maxStage = _getClassMaxStage(classId);

  // ── D5: 단계별 성공 확률 계산 (4대 스펙 기반) ──
  // 첫 발사(gs.launches === 0)는 전 단계 자동 성공
  const isFirstLaunch = gs.launches === 0;
  const stageRolls = [];
  let firstFailStage = -1;
  for (let i = 4; i <= maxStage; i++) {
    const rate = isFirstLaunch ? 100 : sci.stageRates[i];
    const success = Math.random() * 100 < rate;
    stageRolls.push({ stage: i, success, rate });
    if (!success && firstFailStage === -1) firstFailStage = i;
  }
  const rollSuccess = firstFailStage === -1; // maxStage까지 전부 통과 시 성공
  const earned = rollSuccess ? getExplorationReward(q.id) : 0;

  // 발사 후 항상 부품+연료 전체 초기화 (성공/실패 무관)
  gs.parts = { hull: 0, engine: 0, propellant: 0, pump_chamber: 0 };
  gs.fuelInjection = 0;
  gs.fuelLoaded = false;
  gs.fuelInjecting = false;
  // D5: rollVariance 초기화 — 다음 로켓에서 새로 생성
  if (gs.assembly) gs.assembly.rollVariance = null;
  // 진행 중인 제작 공정도 초기화
  gs.mfgActive = {};

  gs.launches++;
  if (rollSuccess) gs.successfulLaunches = (gs.successfulLaunches || 0) + 1;

  gs.history.push({
    no: gs.launches,
    quality: q.name,
    qualityId: q.id,
    rocketClass: classId,
    deltaV: sci.deltaV.toFixed(2),
    altitude: rollSuccess ? Math.floor(sci.altitude) : 0,
    reliability: sci.reliability.toFixed(1),
    overallRate: sci.overallRate.toFixed(1),
    specs: sci.specs,
    rollVariance: sci.rollVariance,  // D5 9.4: 발사 기록에 편차 저장
    stageRates: sci.stageRates,
    success: rollSuccess,
    earned: earned,
    failStage: firstFailStage,
    failDesc: firstFailStage >= 0 ? STAGE_FAILURES[firstFailStage].desc : null,
    date: `D+${gs.launches * 2}`,
  });
  pendingLaunchEp = earned;  // D6: EP 적립 (프레스티지 시 SS로 전환)
  pendingLaunchData = { q, sci, earned, success: rollSuccess, firstFailStage };

  launchInProgress = true; // 점화 시작 즉시 잠금 (중복 발사 방지)
  switchMainTab('launch');
  _runPreLaunchIgnition(() => {
    _runLaunchAnimation(q, sci, earned, rollSuccess, stageRolls, firstFailStage);
  });
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
    { sel: '.lc-phase-pre', start: 0, end: 3 },  // PROD,ASSY,FUEL,T-MINUS
    { sel: '.lc-phase-ascent', start: 4, end: 8 },  // LIFTOFF~ORBIT
    { sel: '.lc-phase-lunar', start: 9, end: 11 },  // TLI,LOI,LANDING
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
    else seg.classList.add('fail');
  });
  _updateLcPhaseHeaders(failStageIdx, true);
}

// ============================================================
//  LAUNCH ANIMATION — 단계별 프레임 기반 성공/실패 시스템
//  각 단계 최소 5초 (총괄PD 지시), 8단계 전체 = 최소 40초
// ============================================================

/**
 * 단계 프레임 아트를 씬 영역에 표시하는 헬퍼
 * rocketEl: 로켓 <pre>, stageInfoEl: 텔레메트리 보조 <pre>
 */
function _getGlowColor(color) {
  if (color === '--cyan') return 'rgba(0,229,255,0.5)';
  if (color === '--amber') return 'rgba(255,171,0,0.6)';
  if (color === '--red') return 'rgba(255,23,68,0.6)';
  return 'rgba(0,230,118,0.4)';
}

function _applyStageFrame(frame, rocketEl, stageInfoEl) {
  if (!frame) return;

  const frameColor = frame.color.startsWith('--') ? `var(${frame.color})` : frame.color;
  const glowColor = _getGlowColor(frame.color);

  // ── fullScene 프레임: 로켓 숨기고 #launch-scene 전체를 씬 아트로 교체 ──
  if (frame.fullScene) {
    if (rocketEl) rocketEl.style.display = 'none';
    const sceneEl = document.getElementById('launch-scene');
    if (sceneEl) {
      sceneEl.innerHTML = `<pre class="rocket-art-core launch-rocket-ascii"
        style="font-size:13px;line-height:1.4;white-space:pre;color:${frameColor};
               text-shadow:0 0 8px ${glowColor};text-align:center;">${frame.art.join('\n')}</pre>`;
    }
    return;
  }

  // ── 비-fullScene: 로켓 유지 + 프레임 아트를 로켓 아래에 통합 표시 ──
  if (rocketEl) rocketEl.style.display = '';

  // 로켓 아래에 이펙트 아트 요소 생성/갱신
  let effectEl = document.getElementById('launch-effect-art');
  if (!effectEl) {
    const sceneEl = document.getElementById('launch-scene');
    if (sceneEl) {
      effectEl = document.createElement('pre');
      effectEl.id = 'launch-effect-art';
      effectEl.className = 'rocket-art-core';
      effectEl.style.cssText = 'font-size:13px;line-height:1.4;white-space:pre;text-align:center;margin-top:-2px;';
      sceneEl.appendChild(effectEl);
    }
  }
  if (effectEl) {
    effectEl.textContent = frame.art.join('\n');
    effectEl.style.color = frameColor;
    effectEl.style.textShadow = `0 0 8px ${glowColor}`;
  }

  // 로켓 효과 (D5 5.4 참조)
  const shakeWrapEl = document.getElementById('launch-shake-wrap');

  if (shakeWrapEl) {
    shakeWrapEl.classList.remove('shake-sm', 'shake-md', 'shake-lg', 'shake-xl', 'shaking');
  }
  if (rocketEl) {
    rocketEl.classList.remove('warning-glow', 'success-glow', 'fail-glow', 'launching');
  }

  if (frame.effect) {
    if (frame.effect.startsWith('shake')) {
      if (shakeWrapEl) {
        const shakeClass = frame.effect === 'shake' ? 'shaking' : frame.effect;
        shakeWrapEl.classList.add(shakeClass);
      }
    } else if (frame.effect === 'shake-heavy') {
      if (shakeWrapEl) shakeWrapEl.classList.add('shake-md');
    } else if (frame.effect === 'flash') {
      const animZoneEl = document.getElementById('lc-anim-zone');
      if (animZoneEl) {
        animZoneEl.classList.remove('flash-red');
        void animZoneEl.offsetWidth;
        animZoneEl.classList.add('flash-red');
      }
      if (rocketEl) rocketEl.classList.add('fail-glow');
      if (shakeWrapEl) shakeWrapEl.classList.add('shake-xl');
    } else if (frame.effect === 'success-glow') {
      if (rocketEl) rocketEl.classList.add('success-glow');
    } else if (frame.effect === 'glow-amber') {
      if (rocketEl) rocketEl.classList.add('warning-glow');
    } else if (frame.effect === 'rise') {
      if (rocketEl) rocketEl.classList.add('launching');
    }
  }
}

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
  const animZone = document.getElementById('lc-anim-zone');
  if (preLaunch) preLaunch.style.display = 'none';
  if (animZone) animZone.classList.add('active');

  const animWrap = document.getElementById('launch-anim-wrap');
  if (!animWrap) return;

  // D5: 클래스별 ROCKET_ASCII 발사 아트 사용
  const classId = gs.assembly.selectedClass || 'vega';
  let launchArt = '';
  if (typeof ROCKET_ASCII !== 'undefined' && ROCKET_ASCII[classId]) {
    launchArt = ROCKET_ASCII[classId].launching.join('\n');
  } else if (typeof getRocketArtHtml === 'function') {
    launchArt = getRocketArtHtml({ allGreen: true });
  }

  // 레이아웃: 씬(중앙, 로켓+이펙트 통합) + 단계 라벨(상단) + 텔레메트리(하단 보조)
  animWrap.innerHTML = `
<div id="launch-stage-label" style="position:absolute;top:12px;left:50%;transform:translateX(-50%);z-index:3;text-align:center;font-family:'Share Tech Mono',monospace;font-size:22px;letter-spacing:5px;color:var(--green);text-shadow:0 0 15px rgba(0,230,118,0.7);pointer-events:none;text-transform:uppercase;"></div>
<div id="launch-scene" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:2;text-align:center;">
  <div id="launch-shake-wrap" style="display:inline-block;">
    <pre class="rocket-art-core launch-rocket-ascii" id="launch-rocket-pre" style="color:#00e676;text-shadow:0 0 8px rgba(0,230,118,0.6);font-size:13px;line-height:1.35;white-space:pre;">${launchArt}</pre>
  </div>
</div>
<div id="launch-telem-overlay" style="position:absolute;bottom:12px;left:50%;transform:translateX(-50%);z-index:3;width:100%;text-align:center;pointer-events:none;">
  <pre id="launch-telem-info" style="font-family:'Courier New',Consolas,monospace;font-size:11px;line-height:1.4;white-space:pre;color:var(--green-mid);text-shadow:0 0 6px rgba(0,230,118,0.3);margin:0 auto;"></pre>
</div>`;

  const rocketEl = document.getElementById('launch-rocket-pre');
  const shakeWrapEl = document.getElementById('launch-shake-wrap');
  const stageInfoEl = document.getElementById('launch-telem-info');
  const stageLabelEl = document.getElementById('launch-stage-label');

  setTimeout(() => {
    if (rocketEl) rocketEl.classList.add('launching');
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
  const maxAlt = Math.floor(sci.altitude);
  // 실패 시: 실패 단계까지의 진행비율로 peak 계산
  const failProgress = firstFailStage >= 0 ? (STAGE_PCT[firstFailStage] || 50) / 100 : 1;
  // 실패 발생 시점 (ms) — 실패 단계 시작 + duration*0.6
  const failTimeMs = firstFailStage >= 0
    ? STAGE_TIMING[firstFailStage].delay + STAGE_TIMING[firstFailStage].duration * 0.6
    : 99999;
  // 클래스별 최대 단계
  const maxStage = _getClassMaxStage(gs.assembly.selectedClass || 'vega');
  // 성공 시 총 애니메이션 시간 (maxStage 기준)
  const totalAnimMs = success ? (STAGE_TIMING[maxStage].delay + STAGE_TIMING[maxStage].duration) : (failTimeMs + 6000);

  // ── 패럴랙스 배경 (지상→우주 스크롤) ──
  const parallax = _buildParallaxBg(animWrap, totalAnimMs);
  // 실패 시 실패 시점에서 배경 정지
  if (firstFailStage >= 0) {
    setTimeout(() => parallax.stop(), failTimeMs);
  }

  let gaugeFailTriggered = false;
  const gaugeInterval = setInterval(() => {
    const elapsed = Date.now() - launchTime;
    const speedEl = document.getElementById('lc-speed-val');
    const altEl = document.getElementById('lc-alt-val');
    const speedBar = document.getElementById('lc-speed-bar');
    const altBar = document.getElementById('lc-alt-bar');

    let curSpdNum = 0, curAltNum = 0;

    if (success) {
      const t = Math.min(1, elapsed / totalAnimMs);
      const easedSpeed = t * t;
      const easedAlt = t < 0.7 ? (t / 0.7) * (t / 0.7) : 1;
      curSpdNum = Math.round(easedSpeed * maxSpeed);
      curAltNum = Math.round(easedAlt * maxAlt);
    } else {
      if (elapsed < failTimeMs) {
        const t2 = elapsed / failTimeMs;
        curSpdNum = Math.round(t2 * t2 * maxSpeed * failProgress);
        curAltNum = Math.round(t2 * maxAlt * failProgress);
      } else {
        if (!gaugeFailTriggered) {
          gaugeFailTriggered = true;
          if (speedEl) speedEl.classList.add('gauge-fail');
          if (altEl) altEl.classList.add('gauge-fail');
        }
        const t3 = Math.min(1, (elapsed - failTimeMs) / 2000);
        const peakSpd = Math.round(maxSpeed * failProgress);
        const peakAlt = Math.round(maxAlt * failProgress);
        curSpdNum = Math.round(peakSpd * (1 - t3));
        curAltNum = Math.round(peakAlt * (1 - t3));
      }
    }

    // UI 업데이트
    if (speedEl) speedEl.textContent = Math.max(0, curSpdNum).toLocaleString();
    if (altEl) altEl.textContent = Math.max(0, curAltNum).toLocaleString();

    const sPct = Math.min(100, (curSpdNum / (maxSpeed || 1)) * 100);
    const aPct = Math.min(100, (curAltNum / (maxAlt || 1)) * 100);
    if (speedBar) speedBar.style.width = Math.max(0, sPct).toFixed(1) + '%';
    if (altBar) altBar.style.width = Math.max(0, aPct).toFixed(1) + '%';

    if (gaugeFailTriggered) {
      if (speedBar) speedBar.style.background = 'var(--red)';
      if (altBar) altBar.style.background = 'var(--red)';
    }

    // 통합 텔레메트리 보조 텍스트 (하단)
    if (stageInfoEl && elapsed < totalAnimMs) {
      const unitSpd = (gs.settings.unit === 'us') ? 'mph' : 'km/h';
      const unitAlt = (gs.settings.unit === 'us') ? 'mi' : 'km';
      stageInfoEl.textContent = `VELOCITY: ${Math.max(0, curSpdNum).toLocaleString()} ${unitSpd}  |  ALTITUDE: ${Math.max(0, curAltNum).toLocaleString()} ${unitAlt}`;
    }
  }, 50);

  setTimeout(() => clearInterval(gaugeInterval), totalAnimMs + 2000);

  // ── 텔레메트리 로그 ──
  const telemWrap = document.getElementById('telem-wrap');
  if (telemWrap) telemWrap.innerHTML =
    '<div style="color:var(--green-dim);font-size:9px;letter-spacing:.15em;padding:3px 0;border-bottom:1px solid var(--green-dim);margin-bottom:3px;">// TELEMETRY LOG</div>';

  const telemDiv = document.createElement('div');
  telemDiv.className = 'telemetry-wrap';
  if (telemWrap) telemWrap.appendChild(telemDiv);

  // ── 단계별 순차 처리 (프레임 기반, maxStage까지만) ──
  const stageIds = [];
  for (let si = 4; si <= maxStage; si++) stageIds.push(si);

  stageIds.forEach((stageIdx, i) => {
    const timing = STAGE_TIMING[stageIdx];
    const isFailStage = (stageIdx === firstFailStage);
    const isAfterFail = (firstFailStage >= 0 && stageIdx > firstFailStage);

    // 실패 이후 단계는 스킵
    if (isAfterFail) return;

    // 1. 단계 시작: active 표시 + 텔레메트리 + 단계 라벨
    setTimeout(() => {
      _setLcStage(stageIdx);
      const stgName = STAGE_NAMES[stageIdx] || '';
      if (statusTextEl) statusTextEl.textContent = `// ${stgName}`;
      if (stageLabelEl) {
        stageLabelEl.textContent = `[ ${stgName} ]`;
        stageLabelEl.style.color = 'var(--green)';
        stageLabelEl.style.textShadow = '0 0 16px rgba(0,230,118,0.7)';
      }

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
      if (telemDiv.parentElement) telemDiv.parentElement.scrollTop = telemDiv.parentElement.scrollHeight;
    }, timing.delay);

    // 2. 성공 시: 프레임 순차 애니메이션 (단계 시작 300ms 후부터)
    if (!isFailStage) {
      const successFrames = (typeof LAUNCH_SUCCESS_FRAMES !== 'undefined' && LAUNCH_SUCCESS_FRAMES[stageIdx]) || [];
      let frameOffset = 300; // 단계 시작 후 약간 지연
      successFrames.forEach((frame, fi) => {
        setTimeout(() => {
          _applyStageFrame(frame, rocketEl, stageInfoEl);
          // 단계 라벨 색상 동기화
          if (stageLabelEl && frame.color) {
            stageLabelEl.style.color = frame.color.startsWith('--') ? `var(${frame.color})` : frame.color;
            const glowColor = _getGlowColor(frame.color);
            stageLabelEl.style.textShadow = `0 0 16px ${glowColor}`;
          }
        }, timing.delay + frameOffset);
        frameOffset += frame.durationMs;
      });

      // 마지막 프레임 후 단계 완료 텔레메트리
      setTimeout(() => {
        const doneLine = document.createElement('div');
        doneLine.className = 'telem-line';
        doneLine.innerHTML =
          `<span class="telem-time">${STAGE_TELEM[stageIdx]}</span>` +
          `<span class="telem-event" style="color:var(--green)">OK — ${STAGE_NAMES[stageIdx]} COMPLETE</span>` +
          `<span class="telem-pct" style="color:var(--green)">\u2713</span>`;
        telemDiv.appendChild(doneLine);
        const hudBody = document.getElementById('lc-hud-body');
        if (hudBody) hudBody.scrollTop = hudBody.scrollHeight;
        if (telemDiv.parentElement) telemDiv.parentElement.scrollTop = telemDiv.parentElement.scrollHeight;
      }, timing.delay + timing.duration - 200);
    }

    // 3. 실패 단계: 정상 프레임 일부 → 이상 감지 → 실패 프레임
    if (isFailStage) {
      const zone = _getFailZone(stageIdx);
      const classIdFail = gs.assembly.selectedClass || 'vega';
      const failScale = (typeof FAIL_SCALE !== 'undefined' && FAIL_SCALE[classIdFail]) || { frameDuration: 700, shakeClass: 'shake-sm' };

      // 성공 프레임 첫 1~2개만 짧게 보여주고 (정상 진행 연출)
      const successFrames = (typeof LAUNCH_SUCCESS_FRAMES !== 'undefined' && LAUNCH_SUCCESS_FRAMES[stageIdx]) || [];
      const normalFrameCount = Math.min(2, successFrames.length);
      let frameOffset = 300;
      for (let fi = 0; fi < normalFrameCount; fi++) {
        const frame = successFrames[fi];
        setTimeout(() => {
          _applyStageFrame(frame, rocketEl, stageInfoEl);
        }, timing.delay + frameOffset);
        frameOffset += Math.min(frame.durationMs, 1200); // 실패 전 정상 프레임은 단축
      }

      // anomaly 감지 시점 (duration * 0.4 이후)
      const anomalyDelay = timing.delay + Math.round(timing.duration * 0.4);

      // 텔레메트리: ANOMALY DETECTED
      setTimeout(() => {
        const failInfo = STAGE_FAILURES[stageIdx];
        const anomalyLine = document.createElement('div');
        anomalyLine.className = 'telem-line telem-fail';
        anomalyLine.innerHTML =
          `<span class="telem-time">${STAGE_TELEM[stageIdx]}</span>` +
          `<span class="telem-event">!! ANOMALY DETECTED !!</span>` +
          `<span class="telem-pct">---</span>`;
        telemDiv.appendChild(anomalyLine);

        if (statusTextEl) statusTextEl.textContent = '// ANOMALY';
        if (stageLabelEl) {
          stageLabelEl.textContent = `!! ${STAGE_NAMES[stageIdx]} ANOMALY !!`;
          stageLabelEl.style.color = 'var(--amber)';
          stageLabelEl.style.textShadow = '0 0 16px rgba(255,171,0,1.0)';
        }
        playSfx('sawtooth', 180, 0.14, 0.05, 80);

        // 로켓 경고 진동
        if (rocketEl) {
          rocketEl.classList.remove('launching', 'success-glow');
          rocketEl.classList.add(failScale.shakeClass, 'warning-glow');
        }

        const hudBody = document.getElementById('lc-hud-body');
        if (hudBody) hudBody.scrollTop = hudBody.scrollHeight;
        if (telemDiv.parentElement) telemDiv.parentElement.scrollTop = telemDiv.parentElement.scrollHeight;
      }, anomalyDelay);

      // 실패 확정 (anomaly + 1.2s)
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
        _setLcStageFail(stageIdx);
        if (statusTextEl) statusTextEl.textContent = `// ${failInfo.desc}`;
        if (stageLabelEl) {
          stageLabelEl.textContent = `// ${failInfo.desc}`;
          stageLabelEl.style.color = 'var(--red)';
          stageLabelEl.style.textShadow = '0 0 16px rgba(255,23,68,1.0)';
        }

        const hudBody = document.getElementById('lc-hud-body');
        if (hudBody) hudBody.scrollTop = hudBody.scrollHeight;
        if (telemDiv.parentElement) telemDiv.parentElement.scrollTop = telemDiv.parentElement.scrollHeight;
      }, anomalyDelay + 1200);

      // D5: 실패 프레임 순차 표시 (존별 4프레임)
      const stageFailFrames = (typeof STAGE_FAIL_FRAMES !== 'undefined' && STAGE_FAIL_FRAMES[zone]) || [];
      const failFrameStart = anomalyDelay + 1500;
      stageFailFrames.forEach((frame, fi) => {
        setTimeout(() => {
          if (fi >= 1 && frame && frame.art) {
            // D5: 폭발 프레임 — #launch-scene 전체를 폭발 아트로 교체 (크게, 중앙)
            const sceneEl = document.getElementById('launch-scene');
            if (sceneEl) {
              const failColor = frame.color.startsWith('--') ? `var(${frame.color})` : frame.color;
              const failGlow = _getGlowColor(frame.color);
              sceneEl.innerHTML = `<pre class="rocket-art-core launch-rocket-ascii exploding rocket-${classIdFail} fail-glow"
                style="font-size:13px;line-height:1.4;white-space:pre;color:${failColor};
                       text-shadow:0 0 16px ${failGlow};text-align:center;">${frame.art.join('\n')}</pre>`;
            }
            // 텔레메트리 보조 텍스트 업데이트
            if (stageInfoEl) {
              stageInfoEl.textContent = '';
            }
          } else {
            // fi === 0: 첫 프레임 (경고 — 로켓 유지 + 경고 이펙트)
            _applyStageFrame(frame, rocketEl, stageInfoEl);
            if (rocketEl) {
              rocketEl.classList.remove('launching', 'warning-glow', failScale.shakeClass);
              rocketEl.classList.add(failScale.shakeClass, 'warning-glow');
            }
          }
          // 대형 로켓 첫 폭발 프레임에서 화면 레드 플래시
          if (fi === 1) {
            const animZoneEl = document.getElementById('lc-anim-zone');
            if (animZoneEl && ['hermes', 'atlas', 'selene', 'artemis'].includes(classIdFail)) {
              animZoneEl.classList.remove('flash-red');
              void animZoneEl.offsetWidth;
              animZoneEl.classList.add('flash-red');
            }
          }
        }, failFrameStart + fi * failScale.frameDuration);
      });

      // MISSION LOST 메시지
      const missionLostDelay = failFrameStart + stageFailFrames.length * failScale.frameDuration + 500;
      setTimeout(() => {
        const missionLostLine = document.createElement('div');
        missionLostLine.className = 'telem-line telem-fail';
        missionLostLine.innerHTML =
          `<span class="telem-time">---</span>` +
          `<span class="telem-event">// MISSION LOST \u2014 RUD</span>` +
          `<span class="telem-pct">0%</span>`;
        telemDiv.appendChild(missionLostLine);
        playSfx('sawtooth', 100, 0.22, 0.05, 50);

        if (stageLabelEl) {
          stageLabelEl.textContent = '// MISSION LOST';
          stageLabelEl.style.color = 'var(--red)';
          stageLabelEl.style.textShadow = '0 0 16px rgba(255,23,68,1.0)';
        }

        const hudBody = document.getElementById('lc-hud-body');
        if (hudBody) hudBody.scrollTop = hudBody.scrollHeight;
        if (telemDiv.parentElement) telemDiv.parentElement.scrollTop = telemDiv.parentElement.scrollHeight;
      }, missionLostDelay);
    }
  });

  // ── 결과 패널 표시 ──
  // 성공: 마지막 단계 완료 + 여유
  // 실패: 실패 단계의 전체 애니메이션 종료 후
  const failClassId = gs.assembly.selectedClass || 'vega';
  const failFd = (typeof FAIL_SCALE !== 'undefined' && FAIL_SCALE[failClassId])
    ? FAIL_SCALE[failClassId].frameDuration : 700;
  const failZoneFrames = firstFailStage >= 0
    ? ((typeof STAGE_FAIL_FRAMES !== 'undefined' && STAGE_FAIL_FRAMES[_getFailZone(firstFailStage)]) || []) : [];
  const failAnimEndMs = firstFailStage >= 0
    ? STAGE_TIMING[firstFailStage].delay + Math.round(STAGE_TIMING[firstFailStage].duration * 0.4) + 1500 + failZoneFrames.length * failFd + 1500
    : 0;
  const resultPanelDelay = success
    ? (STAGE_TIMING[maxStage].delay + STAGE_TIMING[maxStage].duration + 500)
    : failAnimEndMs;

  // 결과 오버레이 표시
  setTimeout(() => {
    if (statusTextEl) statusTextEl.textContent = success ? '// MISSION COMPLETE' : '// MISSION LOST';
    if (success) _setLcStage(maxStage + 1); // 모든 단계 done (maxStage 포함)
    clearInterval(timerInterval);
    launchInProgress = false;
    if (success) {
      playLaunchSfx();
    } else {
      if (typeof playSfx_launchFail === 'function') playSfx_launchFail();
    }
    if (typeof BGM !== 'undefined' && gs.settings.sound) BGM.stopEvent();
    _showLaunchOverlay(q, sci, earned, success, firstFailStage);
  }, resultPanelDelay);
}

function _showLaunchOverlay(q, sci, earned, success, firstFailStage) {
  const failStageName = firstFailStage >= 0 ? STAGE_NAMES[firstFailStage] : '';
  const failDesc = firstFailStage >= 0 ? STAGE_FAILURES[firstFailStage].desc : '';
  const overlayClassId = gs.assembly ? (gs.assembly.selectedClass || 'vega') : 'vega';
  const ach = CLASS_ACHIEVEMENTS[overlayClassId] || CLASS_ACHIEVEMENTS.artemis;

  // ── 타이틀 ──
  const loTitle = document.getElementById('lo-title');
  if (loTitle) {
    loTitle.textContent = success ? ach.title : `// 발사 실패 — ${failStageName}`;
  }

  // ── 로켓 아트 (성공: 정지 아트 / 실패: 폭발 마지막 프레임) ──
  const loRocket = document.getElementById('lo-rocket-art');
  if (loRocket) {
    if (success) {
      loRocket.style.color = 'var(--green)';
      loRocket.style.textShadow = '0 0 8px rgba(0,230,118,0.6)';
      if (typeof ROCKET_ASCII !== 'undefined' && ROCKET_ASCII[overlayClassId]) {
        loRocket.textContent = ROCKET_ASCII[overlayClassId].static.join('\n');
      } else if (typeof getRocketArtHtml === 'function') {
        loRocket.innerHTML = getRocketArtHtml({ allGreen: true });
      }
    } else {
      const zone = _getFailZone(firstFailStage);
      const failFrames = (typeof STAGE_FAIL_FRAMES !== 'undefined' && STAGE_FAIL_FRAMES[zone]) || [];
      const lastFrame = failFrames[failFrames.length - 1];
      loRocket.style.color = 'var(--red)';
      loRocket.style.textShadow = '0 0 10px rgba(255,23,68,0.6)';
      loRocket.textContent = lastFrame ? lastFrame.art.join('\n') : 'MISSION LOST';
    }
  }

  // ── 미션 스탯 ──
  const loStats = document.getElementById('lo-stats');
  if (loStats) {
    let statsHtml = `기체: ${q.name}  |  \u0394v: ${sci.deltaV.toFixed(2)} km/s  |  고도: ${success ? Math.floor(sci.altitude) : '---'} km<br>TWR: ${sci.twr.toFixed(2)}  |  성공률: ${sci.overallRate.toFixed(1)}%`;
    if (!success) statsHtml += `<br><span style="color:var(--red)">실패: ${failStageName} — ${failDesc}</span>`;
    loStats.innerHTML = statsHtml;
  }

  // ── 성취 메시지 ──
  const loMs = document.getElementById('lo-ms');
  if (loMs) {
    if (success) {
      loMs.innerHTML =
        `<div style="font-size:18px;color:var(--green);line-height:1.8;text-shadow:0 0 12px rgba(0,230,118,0.7);">${ach.flavor.replace(/\n/g, '<br>')}</div>` +
        `<div style="font-size:12px;color:var(--green-dim);margin-top:8px;letter-spacing:1px;">${ach.next}</div>` +
        (earned > 0 ? `<div style="font-size:16px;color:var(--amber);margin-top:10px;letter-spacing:3px;">&#10003; EP +${earned}</div>` : '');
      loMs.style.color = '';
      playSfx('sine', 1200, 0.10, 0.03, 1600);
    } else {
      loMs.textContent = '\u2717 ' + failStageName + '에서 실패 \u2014 ' + failDesc;
      loMs.style.color = 'var(--red)';
      loMs.style.fontSize = '';
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
//  D5 10.4: 스펙 바 그래프 패널
// ============================================================
const SPEC_LABELS = {
  structural: '구조강도',
  propulsion: '추진안정',
  avionics: '항전신뢰',
  thermal: '열방호도',
};

const STAGE_ABBR = {
  4: 'LFT', 5: 'MXQ', 6: 'MECO', 7: 'SEP',
  8: 'ORB', 9: 'TLI', 10: 'LOI', 11: 'LAND',
};

/**
 * 스펙 바 그래프 + 단계별 성공률 패널 렌더링
 * @param {object} sci - getRocketScience() 반환값
 */
function _renderSpecPanel(sci) {
  const el = document.getElementById('lc-spec-panel');
  if (!el) return;
  if (!sci || !sci.specs) { el.style.display = 'none'; return; }

  el.style.display = '';
  const specs = sci.specs;
  const rv = sci.rollVariance || { structural: 0, propulsion: 0, avionics: 0, thermal: 0 };

  let html = '<div class="lc-spec-hd">// ROCKET SPECS</div>';

  // 4대 스펙 바 그래프
  ['structural', 'propulsion', 'avionics', 'thermal'].forEach(key => {
    const val = Math.round(specs[key]);
    const variance = rv[key] || 0;
    // 바 색상: 70 이상 green, 50~70 amber, 50 미만 red
    const barColor = val >= 70 ? 'green' : val >= 50 ? 'amber' : 'red';
    // 편차 표시
    let varHtml;
    if (variance > 0) {
      varHtml = `<span class="lc-spec-var pos">(+${variance}\u25B2)</span>`;
    } else if (variance < 0) {
      varHtml = `<span class="lc-spec-var neg">(${variance}\u25BC)</span>`;
    } else {
      varHtml = `<span class="lc-spec-var zero">(0)</span>`;
    }

    html += `<div class="lc-spec-row">` +
      `<span class="lc-spec-label">${SPEC_LABELS[key]}</span>` +
      `<div class="lc-spec-bar-wrap"><div class="lc-spec-bar-fill ${barColor}" style="width:${val}%"></div></div>` +
      `<span class="lc-spec-val">${val}</span>` +
      varHtml +
      `</div>`;
  });

  // 구분선
  html += '<hr class="lc-spec-divider">';

  // 전체 성공률
  const overall = sci.overallRate;
  const oc = overall >= 95 ? 'green' : overall >= 90 ? 'amber' : 'red';
  html += `<div class="lc-spec-overall">` +
    `<span class="lc-spec-overall-label">예상 성공률:</span>` +
    `<span class="lc-spec-overall-val ${oc}">${overall.toFixed(1)}%</span>` +
    `</div>`;

  // 단계별 성공률 — maxStage까지만 표시
  html += '<div class="lc-spec-stages-hd">// 단계별</div>';
  html += '<div class="lc-spec-stages">';

  const maxStage = sci.maxStage || 11;
  const visibleStages = [];
  for (let i = 4; i <= maxStage; i++) visibleStages.push(i);

  visibleStages.forEach((sid, si) => {
    const rate = sci.stageRates[sid];
    const sc = rate >= 95 ? 'green' : rate >= 90 ? 'amber' : 'red';
    html += `<span class="lc-spec-stage-item">` +
      `<span class="lc-spec-stage-name">${STAGE_ABBR[sid]}</span> ` +
      `<span class="lc-spec-stage-val ${sc}">${rate.toFixed(1)}</span>` +
      `</span>`;
    if (si < visibleStages.length - 1) html += ' <span class="lc-spec-stage-sep">&gt;</span> ';
    // 3개마다 줄바꿈
    if ((si + 1) % 3 === 0 && si < visibleStages.length - 1) html += '<br>';
  });
  html += '</div>';

  el.innerHTML = html;
}

// ============================================================
//  RENDER: LAUNCH TAB
// ============================================================
function renderLaunchTab() {
  ensureAssemblyState();

  const preLaunch = document.getElementById('lc-pre-launch');
  const animZone = document.getElementById('lc-anim-zone');
  if (!launchInProgress) {
    if (preLaunch) preLaunch.style.display = '';
    if (animZone) animZone.classList.remove('active');

    // 발사/점화 중 숨겼던 UI 복원
    ['lc-commit-box', 'lc-stagebar', 'lc-checklist', 'lc-status-panel', 'lc-readiness'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = '';
    });

    // 게이지 리셋
    const speedEl = document.getElementById('lc-speed-val');
    const altEl = document.getElementById('lc-alt-val');
    const speedBar = document.getElementById('lc-speed-bar');
    const altBar = document.getElementById('lc-alt-bar');
    if (speedEl) { speedEl.textContent = '0'; speedEl.classList.remove('gauge-fail'); }
    if (altEl) { altEl.textContent = '0'; altEl.classList.remove('gauge-fail'); }
    if (speedBar) { speedBar.style.width = '0%'; speedBar.style.background = ''; }
    if (altBar) { altBar.style.width = '0%'; altBar.style.background = ''; }

    const timerEl = document.getElementById('lc-t-timer');
    const statusEl = document.getElementById('lc-status-text');
    if (timerEl) timerEl.textContent = 'T+ 00:00';
    if (statusEl) statusEl.textContent = '// PRE-LAUNCH';
  } else {
    return; // 발사 중 리렌더 방지 (BUG-007)
  }

  // 발사 가능 여부: 부품+연료 100% (조립 프로세스 제거됨)
  const canLaunch = (typeof getRocketCompletion === 'function' && getRocketCompletion() >= 100);
  let q = null, sci = null, earned = 0;
  if (canLaunch) {
    q = getQuality(gs.assembly.selectedQuality || 'proto');
    // D5: 저장된 rollVariance를 사용하여 실제 스펙 표시
    const rvPre = (gs.assembly && gs.assembly.rollVariance) || undefined;
    sci = getRocketScience(q.id, gs.assembly.selectedClass || 'vega', rvPre);
    earned = getExplorationReward(q.id);
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
  if (allGo) _setLcStage(3); // T-MINUS active (0-2 done)
  else if (allPartsDone && fuelFull) _setLcStage(3); // 부품+연료 완료 = 발사 준비 완료
  else if (allPartsDone) _setLcStage(1); // FUEL active — 부품 완료, 연료 진행
  else _setLcStage(0); // PARTS active — 부품 제작 중

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
    const p3 = gs.parts || {};
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

  // D5 10.4: 스펙 바 그래프 패널 (조립 완료 시만 표시)
  if (canLaunch && sci) {
    _renderSpecPanel(sci);
  } else {
    const specEl = document.getElementById('lc-spec-panel');
    if (specEl) specEl.style.display = 'none';
  }

  // 미션 파라미터 (HUD)
  const missionParams = document.getElementById('lc-mission-params');
  if (missionParams) {
    if (canLaunch) {
      const oc = sci.overallRate > 80 ? 'green' : sci.overallRate > 50 ? 'amber' : 'red';
      missionParams.innerHTML =
        `<div class="lc-mp-block"><div class="lc-mp-val green">${sci.deltaV.toFixed(1)}</div><div class="lc-mp-label">Δv (km/s)</div></div>` +
        `<div class="lc-mp-block"><div class="lc-mp-val">${sci.twr.toFixed(2)}</div><div class="lc-mp-label">TWR</div></div>` +
        `<div class="lc-mp-block"><div class="lc-mp-val ${oc}">${sci.overallRate.toFixed(0)}%</div><div class="lc-mp-label">성공률</div></div>` +
        `<div class="lc-mp-block"><div class="lc-mp-val amber">+${earned}</div><div class="lc-mp-label">EP 보상</div></div>` +
        `<div class="lc-mp-block"><div class="lc-mp-val">${Math.floor(sci.altitude)}</div><div class="lc-mp-label">목표고도 km</div></div>` +
        `<div class="lc-mp-block"><div class="lc-mp-val" style="color:var(--cyan)">EP ${gs.explorationPoints || 0}</div><div class="lc-mp-label">탐험 포인트</div></div>`;
    } else {
      missionParams.innerHTML =
        `<div class="lc-mp-block"><div class="lc-mp-val" style="color:#334433">--</div><div class="lc-mp-label">Δv (km/s)</div></div>` +
        `<div class="lc-mp-block"><div class="lc-mp-val" style="color:#334433">--</div><div class="lc-mp-label">TWR</div></div>` +
        `<div class="lc-mp-block"><div class="lc-mp-val" style="color:#334433">--</div><div class="lc-mp-label">성공률</div></div>` +
        `<div class="lc-mp-block"><div class="lc-mp-val" style="color:#334433">--</div><div class="lc-mp-label">EP 보상</div></div>` +
        `<div class="lc-mp-block"><div class="lc-mp-val" style="color:#334433">--</div><div class="lc-mp-label">목표고도</div></div>` +
        `<div class="lc-mp-block"><div class="lc-mp-val" style="color:var(--cyan)">EP ${gs.explorationPoints || 0}</div><div class="lc-mp-label">탐험 포인트</div></div>`;
    }
  }

  // 커밋 박스
  const commitStats = document.getElementById('lc-commit-stats');
  if (commitStats) {
    if (canLaunch) {
      const oc2 = sci.overallRate > 80 ? 'green' : sci.overallRate > 50 ? 'amber' : 'red';
      commitStats.innerHTML =
        `<div class="lc-cs"><span class="lc-cs-val ${oc2}">${sci.overallRate.toFixed(0)}%</span><span class="lc-cs-label">${t('lc_success_pct')}</span></div>` +
        `<div class="lc-cs"><span class="lc-cs-val green">${Math.floor(sci.altitude)}<span style="font-size:11px">km</span></span><span class="lc-cs-label">${t('lc_target_alt')}</span></div>` +
        `<div class="lc-cs"><span class="lc-cs-val amber">+${earned}</span><span class="lc-cs-label">${t('lc_space_score')}</span></div>`;
    } else {
      commitStats.innerHTML =
        `<div class="lc-cs"><span class="lc-cs-val" style="color:var(--green-dim)">--</span><span class="lc-cs-label">${t('lc_success_pct')}</span></div>` +
        `<div class="lc-cs"><span class="lc-cs-val" style="color:var(--green-dim)">--</span><span class="lc-cs-label">${t('lc_target_alt')}</span></div>` +
        `<div class="lc-cs"><span class="lc-cs-val" style="color:var(--green-dim)">--</span><span class="lc-cs-label">${t('lc_space_score')}</span></div>`;
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

  // 안내 — 완성도 100% 미만일 때 조립동/생산허브 이동 안내
  const lcGuideEl = document.getElementById('lc-assembly-guide');
  if (lcGuideEl) {
    if (!canLaunch && readinessPct < 100) {
      lcGuideEl.style.display = '';
      // 조립 가능 부품이 하나라도 있으면 조립동으로, 없으면 생산허브로
      const reqPartsForGuide = _getRequiredParts();
      const hasAnyParts = reqPartsForGuide.some(pt =>
        (gs.parts && (gs.parts[pt.id] || 0) > 0) ||
        (gs.mfgActive && gs.mfgActive[pt.id])
      );
      if (hasAnyParts) {
        lcGuideEl.innerHTML =
          `<div style="font-size:11px;color:var(--cyan);margin-bottom:6px;">` +
          `&#9654; 조립동에서 부품 제작과 연료 주입을 완료하세요.</div>` +
          `<button class="btn btn-sm" onclick="switchMainTab('assembly')" style="font-size:11px;padding:4px 12px;">` +
          `&#9881; 조립동으로 이동</button>`;
      } else {
        lcGuideEl.innerHTML =
          `<div style="font-size:11px;color:var(--cyan);margin-bottom:6px;">` +
          `&#9654; 먼저 생산 시설을 구축하고 자원을 확보하세요.</div>` +
          `<button class="btn btn-sm" onclick="switchMainTab('production')" style="font-size:11px;padding:4px 12px;">` +
          `&#9658; 생산허브로 이동</button>`;
      }
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
    { icon: '[OPS]', key: 'q_sub_ops', done: (gs.assignments && (gs.assignments.ops_center || 0) >= 1) },
    { icon: '[FND]', key: 'q_sub_money', done: (gs.res.money || 0) >= 1000 },
    { icon: '[MIN]', key: 'q_sub_mine', done: (bld.mine || 0) >= 1 },
    { icon: '[RSH]', key: 'q_sub_lab', done: (bld.research_lab || 0) >= 1 },
    { icon: '[TEC]', key: 'q_sub_research', done: Object.keys(upgs).length >= 1 },
    { icon: '[PAD]', key: 'q_sub_pad', done: (bld.launch_pad || 0) >= 1 },
    { icon: '[ASM]', key: 'q_sub_assemble', done: rktReady || hasLaunched },
  ];
  const doneCount = subs.filter(s => s.done).length;

  let html = '';
  if (mainDone) {
    html += `<div class="lc-quest-main-done"><div class="lc-quest-main-title">&#9632; MISSION COMPLETE</div><div class="lc-quest-main-desc">${t('q_done_desc')}</div></div>`;
  } else {
    html += `<div class="lc-quest-main"><div class="qs-section-hd">// MAIN MISSION</div><div class="lc-quest-main-row"><span class="qs-icon-bracket">[GO!]</span><span class="qs-main-text">${t('q_main_desc')}</span><span class="qs-chk todo">&#9675;</span></div></div>`;
    const pct = (doneCount / subs.length * 100).toFixed(0);
    html += `<div class="qs-section-hd qs-sub-hd">// SUB MISSIONS <span class="qs-cnt">${doneCount}/${subs.length}</span></div>`;
    html += `<div class="qs-progress-bar"><div class="qs-progress-fill" style="width:${pct}%"></div></div>`;
    html += `<div class="lc-quest-subs">`;
    subs.forEach(s => {
      html += `<div class="lc-quest-sub${s.done ? ' sub-done' : ''}"><span class="qs-icon-bracket${s.done ? ' done' : ''}">${s.icon}</span><span class="qs-text${s.done ? ' done' : ''}">${t(s.key)}</span><span class="qs-chk ${s.done ? 'done' : 'todo'}">${s.done ? '&#10003;' : '&#9675;'}</span></div>`;
    });
    html += `</div>`;
    if (doneCount === subs.length) html += `<div class="qs-all-ready">&gt;&gt; ${t('q_ready')}</div>`;
  }
  el.innerHTML = html;
}
