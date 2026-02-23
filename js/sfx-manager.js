// ============================================================
//  SFX Manager — 프리로드 + 캐시 + 이름 기반 재생
//  SFX_ElevenLabs_Proposal.md §4.2 기반
//  playSfx() 인라인 호출을 SFX.play('이름') 으로 교체
// ============================================================
const SFX = (() => {
  const _cache = {};      // name -> HTMLAudioElement
  let _vol = 0.5;         // 마스터 SFX 볼륨 (0~1)
  let _ready = false;     // preload 완료 여부

  // SFX 매핑 테이블 — ID : 파일 경로
  const _map = {
    // ── UI ──
    'tab-switch':       'audio/sfx/ui/tab-switch.mp3',
    'tab-open':         'audio/sfx/ui/tab-open.mp3',
    'tab-close':        'audio/sfx/ui/tab-close.mp3',
    'detail-panel':     'audio/sfx/ui/detail-panel-open.mp3',
    'info-panel':       'audio/sfx/ui/info-panel-open.mp3',
    'building-select':  'audio/sfx/ui/building-select.mp3',
    'tutorial-type':    'audio/sfx/ui/tutorial-type.mp3',
    'cap-warning':      'audio/sfx/ui/cap-warning.mp3',
    'upgrade-fail':     'audio/sfx/ui/upgrade-fail.mp3',
    'mission-tab':      'audio/sfx/ui/mission-tab-click.mp3',
    // ── Construction ──
    'build-complete':   'audio/sfx/construction/build-complete.mp3',
    'build-confirm':    'audio/sfx/construction/build-confirm.mp3',
    'addon-build':      'audio/sfx/construction/addon-build.mp3',
    'upgrade-complete': 'audio/sfx/construction/upgrade-complete.mp3',
    // ── Workforce ──
    'hire':             'audio/sfx/workforce/hire.mp3',
    'assign':           'audio/sfx/workforce/assign.mp3',
    'ops-role':         'audio/sfx/workforce/ops-role-assign.mp3',
    'unassign':         'audio/sfx/workforce/unassign.mp3',
    'coin-click':       'audio/sfx/workforce/coin-click.mp3',
    // ── Production ──
    'manual-mine':      'audio/sfx/production/manual-mine.mp3',
    'production-up':    'audio/sfx/production/production-up.mp3',
    'craft-complete':   'audio/sfx/production/craft-complete.mp3',
    'fuel-ok':          'audio/sfx/production/fuel-inject-ok.mp3',
    'fuel-fail':        'audio/sfx/production/fuel-inject-fail.mp3',
    // ── Research ──
    'research-start':   'audio/sfx/research/research-start.mp3',
    'research-done':    'audio/sfx/research/research-complete.mp3',
    'queue-add':        'audio/sfx/research/queue-add.mp3',
    'queue-cancel':     'audio/sfx/research/queue-cancel.mp3',
    // ── Assembly ──
    'asm-start':        'audio/sfx/assembly/assembly-start.mp3',
    'asm-slot':         'audio/sfx/assembly/slot-click.mp3',
    'asm-stage':        'audio/sfx/assembly/stage-complete.mp3',
    'asm-all':          'audio/sfx/assembly/all-complete.mp3',
    // ── Launch ──
    'fuel-loading':     'audio/sfx/launch/fuel-loading.mp3',
    'cd-tick':          'audio/sfx/launch/countdown-tick.mp3',
    'stage1':           'audio/sfx/launch/stage1-ignition.mp3',
    'stage2':           'audio/sfx/launch/stage2-accel.mp3',
    'stage3':           'audio/sfx/launch/stage3-atmo.mp3',
    'launch-ok':        'audio/sfx/launch/launch-success.mp3',
    'launch-fail':      'audio/sfx/launch/launch-fail.mp3',
    'cd-alert':         'audio/sfx/launch/countdown-alert.mp3',
    'fuel-depleted':    'audio/sfx/launch/fuel-depleted.mp3',
    'result-reveal':    'audio/sfx/launch/result-reveal.mp3',
    // ── Mission ──
    'explore-start':    'audio/sfx/mission/explore-start.mp3',
    'explore-done':     'audio/sfx/mission/explore-complete.mp3',
    'reward-claim':     'audio/sfx/mission/reward-claim.mp3',
    'obj-done':         'audio/sfx/mission/objective-done.mp3',
    'mission-select':   'audio/sfx/mission/mission-select.mp3',
    'prestige-exec':    'audio/sfx/mission/prestige-exec.mp3',
    // ── System ──
    'achievement':      'audio/sfx/system/achievement.mp3',
    'prestige-reset':   'audio/sfx/system/prestige-reset.mp3',
    'phase-clear':      'audio/sfx/system/phase-clear.mp3',
    'offline-return':   'audio/sfx/system/offline-return.mp3',
    'milestone':        'audio/sfx/system/milestone.mp3',
    'milestone-reward': 'audio/sfx/system/milestone-reward.mp3',
    'feature-unlock':   'audio/sfx/system/feature-unlock.mp3',
    'tab-unlock':       'audio/sfx/system/tab-unlock.mp3',
    'building-unlock':  'audio/sfx/system/building-unlock.mp3',
    // ── Automation ──
    'auto-upgrade':     'audio/sfx/automation/auto-upgrade.mp3',
  };

  /** 프리로드 — 게임 시작 시 1회 호출. 파일 누락은 무시 (아직 미생성 가능) */
  function preload() {
    for (const [name, src] of Object.entries(_map)) {
      try {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.volume = _vol;
        audio.src = src;
        // 로드 에러 무시 (파일 미생성 상태 대비)
        audio.addEventListener('error', () => {}, { once: true });
        _cache[name] = audio;
      } catch (e) { /* 무시 */ }
    }
    _ready = true;
  }

  /** 재생 — 이름 기반. 파일 없으면 조용히 스킵 */
  function play(name) {
    if (typeof gs !== 'undefined' && gs.settings && !gs.settings.sound) return;
    const audio = _cache[name];
    if (!audio || !audio.src) return;
    // readyState 0 = HAVE_NOTHING → 파일 미로드
    if (audio.readyState === 0) return;
    // 이미 재생 중이면 클론으로 중첩 재생 (빠른 반복 클릭 대응)
    if (!audio.paused) {
      try {
        const clone = audio.cloneNode();
        clone.volume = _vol;
        clone.play().catch(() => {});
      } catch (e) { /* 무시 */ }
      return;
    }
    audio.currentTime = 0;
    audio.volume = _vol;
    audio.play().catch(() => {});
  }

  /** 볼륨 설정 (0~1) */
  function setVolume(v) {
    _vol = Math.max(0, Math.min(1, v));
    for (const a of Object.values(_cache)) {
      try { a.volume = _vol; } catch (e) { /* 무시 */ }
    }
  }

  /** 볼륨 조회 */
  function getVolume() { return _vol; }

  /** 등록된 SFX 이름 목록 */
  function list() { return Object.keys(_map); }

  /** 준비 상태 */
  function isReady() { return _ready; }

  return { preload, play, setVolume, getVolume, list, isReady, _map };
})();
