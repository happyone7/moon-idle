// ============================================================
//  BGM — js/audio-bgm.js
//  MP3 기반 페이즈/플레이리스트 시스템
//
//  페이즈 흐름:
//    early (초반)  → mid (중반)  → late (후반)  → post_moon (달 이후)
//
//  이벤트 BGM:
//    launch       : 발사 카운트다운 (bgm_03 variants)
//    prestige     : 프레스티지/리셋 직후 (bgm_08)
//
//  기존 API 하위호환:
//    BGM.start(trackIdx)  — trackIdx 무시, 페이즈 자동 감지
//    BGM.stop()
//    BGM.next()
//    BGM.setVolume(v)
// ============================================================

const BGM = {
  volume: 0.2,
  playing: false,

  _phase: null,          // 'early' | 'mid' | 'late' | 'post_moon'
  _playlistIdx: 0,       // 현재 플레이리스트 내 인덱스
  _current: null,        // 재생 중 HTMLAudioElement
  _prevAudio: null,      // 크로스페이드 중인 이전 HTMLAudioElement
  _duckVolume: false,    // 발사 탭 덕킹 플래그
  _eventPlaying: false,  // 이벤트 BGM 재생 중
  _eventAudio: null,     // 이벤트 HTMLAudioElement

  // ─── 페이즈별 플레이리스트 ────────────────────────────────
  PLAYLISTS: {
    early:     [
      'audio/bgm/Circuit Breaker Protocol.mp3',
    ],
    mid:       [
      'audio/bgm/bgm_04_assembly_focus.mp3',
      'audio/bgm/bgm_02_research_grid_v2.mp3',
      'audio/bgm/bgm_02_research_grid.mp3',
    ],
    late:      [
      'audio/bgm/bgm_01_early_drive.mp3',
      'audio/bgm/bgm_06_automation_hum.mp3',
    ],
    post_moon: [
      'audio/bgm/bgm_07_mission_epic.mp3',
      'audio/bgm/bgm_05_mid_ambient.mp3',
      'audio/bgm/bgm_09_moon_approach_v2.mp3',
    ],
  },

  // ─── 이벤트 BGM 목록 ──────────────────────────────────────
  EVENTS: {
    launch:   [
      'audio/bgm/bgm_03_launch_tension.mp3',
      'audio/bgm/bgm_03_launch_tension_v2.mp3',
    ],
    prestige: [
      'audio/bgm/bgm_08_prestige_void.mp3',
    ],
  },

  // ─── 페이즈 감지 ─────────────────────────────────────────
  _getPhase() {
    if (typeof gs === 'undefined' || !gs || !gs.unlocks) return 'early';
    if ((gs.moonstone || 0) > 0)          return 'post_moon';
    if (gs.unlocks.tab_automation)        return 'late';
    // mid: 첫 로켓 부품 제작 시
    const hasPart = gs.parts && Object.values(gs.parts).some(v => v > 0);
    if (hasPart)                          return 'mid';
    return 'early';
  },

  // ─── 실효 볼륨 (덕킹 반영) ───────────────────────────────
  _vol() {
    return this._duckVolume ? this.volume * 0.55 : this.volume;
  },

  // ─── 공개 API ────────────────────────────────────────────

  /** 볼륨 조정 */
  setVolume(v) {
    this.volume = v;
    if (this._current)    this._current.volume    = this._vol();
    if (this._eventAudio) this._eventAudio.volume = this.volume;
  },

  /** BGM 시작. trackIdx는 하위호환용 — 실제로는 페이즈 자동 감지. */
  start(trackIdx) {
    console.log('[BGM] start() 호출, 현재 phase=%s, playing=%s', this._phase, this.playing);
    this.playing = true;
    this._refreshIfNeeded();
    this._updateUI();
  },

  /** BGM 정지 (페이드아웃) */
  stop() {
    this.playing = false;
    this._duckVolume = false;
    if (this._current) {
      this._fadeOut(this._current, 0.8);
      this._current = null;
    }
    if (this._eventAudio) {
      this._eventAudio.pause();
      this._eventAudio = null;
    }
    this._eventPlaying = false;
  },

  /** 다음 곡 (UI 버튼용) */
  next() {
    const playlist = this.PLAYLISTS[this._phase] || this.PLAYLISTS.early;
    this._playlistIdx = (this._playlistIdx + 1) % playlist.length;
    if (this.playing && !this._eventPlaying) this._startTrack();
    this._updateUI();
  },

  /** 발사 탭 덕킹 토글 */
  duck(on) {
    this._duckVolume = on;
    if (this._current && !this._current.paused) {
      this._fadeTo(this._current, this._vol(), 0.4);
    }
  },

  /**
   * 페이즈 갱신 체크 (탭 전환, renderAll, 틱에서 주기적으로 호출)
   * 페이즈가 바뀌었을 때만 곡 전환 — 매 호출마다 오디오 중단 없음
   */
  refreshPhase() {
    if (!this.playing) return;
    const newPhase = this._getPhase();
    if (newPhase !== this._phase) {
      this._phase = newPhase;
      this._playlistIdx = 0;
      if (!this._eventPlaying) this._startTrack();
      this._updateUI();
    }
  },

  /** 이벤트 BGM 재생 (현재 페이즈 트랙을 페이드아웃하고 이벤트 트랙 재생) */
  playEvent(eventId) {
    if (!this.playing) return;
    if (typeof gs !== 'undefined' && gs.settings && !gs.settings.sound) return;
    const tracks = this.EVENTS[eventId];
    if (!tracks || !tracks.length) return;

    // 이미 같은 이벤트 재생 중이면 스킵
    if (this._eventPlaying) return;

    const rawSrc = tracks[Math.floor(Math.random() * tracks.length)];
    const src = this._encodeSrc(rawSrc);
    console.log('[BGM] playEvent id=%s src=%s', eventId, src);

    // 현재 페이즈 트랙 페이드아웃
    if (this._current && !this._current.paused) {
      this._fadeOut(this._current, 1.2);
    }

    this._eventPlaying = true;
    const evAudio = new Audio(src);
    evAudio.volume = this.volume;
    this._eventAudio = evAudio;

    let evStarted = false;

    const doEventPlay = () => {
      if (evStarted) return;
      evStarted = true;
      evAudio.play().catch(err => {
        console.warn('[BGM] 이벤트 play() 실패:', err.message, src);
        this._eventPlaying = false;
        this._eventAudio = null;
        if (this.playing) this._startTrack();
      });
    };

    evAudio.addEventListener('canplaythrough', doEventPlay, { once: true });

    // canplaythrough 타임아웃
    setTimeout(() => {
      if (!evStarted) {
        console.warn('[BGM] 이벤트 canplaythrough 타임아웃, 강제 재생 시도:', src);
        doEventPlay();
      }
    }, 5000);

    evAudio.addEventListener('ended', () => {
      this._eventPlaying = false;
      this._eventAudio = null;
      if (this.playing) {
        setTimeout(() => this._startTrack(), 300);
      }
    });

    evAudio.addEventListener('error', (e) => {
      console.warn('[BGM] 이벤트 로드 실패:', src, e);
      evStarted = true;
      this._eventPlaying = false;
      this._eventAudio = null;
      if (this.playing) this._startTrack();
    });

    evAudio.load();
  },

  /** 이벤트 BGM 중단 후 페이즈 트랙으로 복귀 */
  stopEvent() {
    if (!this._eventPlaying || !this._eventAudio) return;
    const evAudio = this._eventAudio;
    this._eventPlaying = false;
    this._eventAudio = null;
    this._fadeOut(evAudio, 1.0, () => {
      if (this.playing) this._startTrack();
    });
  },

  // ─── 내부: 페이즈 체크 후 트랙 시작 ─────────────────────
  _refreshIfNeeded() {
    if (this._eventPlaying) return;
    const newPhase = this._getPhase();
    const phaseChanged = (newPhase !== this._phase);
    if (phaseChanged) {
      this._phase = newPhase;
      this._playlistIdx = 0;
      this._startTrack();
    } else if (!this._current || this._current.paused || this._current.ended) {
      this._startTrack();
    }
  },

  // ─── 내부: 경로 인코딩 (공백 등 특수문자 처리) ─────────
  _encodeSrc(src) {
    // 경로의 각 세그먼트를 개별 인코딩 (슬래시는 유지)
    return src.split('/').map(seg => encodeURIComponent(seg)).join('/');
  },

  // ─── 내부: 트랙 로드 + 크로스페이드 재생 ─────────────────
  _startTrack() {
    if (!this.playing) return;

    // 페이즈가 아직 null이면 초기화
    if (!this._phase) this._phase = this._getPhase();

    const playlist = this.PLAYLISTS[this._phase] || this.PLAYLISTS.early;
    const rawSrc = playlist[this._playlistIdx % playlist.length];
    const src = this._encodeSrc(rawSrc);
    console.log('[BGM] _startTrack phase=%s idx=%d src=%s', this._phase, this._playlistIdx, src);

    const prev = this._current;
    const audio = new Audio(src);
    audio.volume = 0;

    let started = false;

    const doPlay = () => {
      if (started || !this.playing) return;
      started = true;
      this._current = audio;
      audio.play().then(() => {
        console.log('[BGM] 재생 시작:', src);
      }).catch(err => {
        console.warn('[BGM] play() 실패:', err.message, src);
        // play 실패 시 다음 트랙 시도
        if (!this.playing) return;
        const pl = this.PLAYLISTS[this._phase] || this.PLAYLISTS.early;
        this._playlistIdx = (this._playlistIdx + 1) % pl.length;
        setTimeout(() => this._startTrack(), 500);
        return;
      });
      // 새 트랙 페이드인
      this._fadeTo(audio, this._vol(), 2.0);
      // 이전 트랙 페이드아웃
      if (prev && !prev.paused && !prev.ended) {
        this._fadeOut(prev, 2.0);
      }
      this._updateUI();
    };

    audio.addEventListener('canplaythrough', doPlay, { once: true });

    // canplaythrough 타임아웃 — 5초 내 이벤트 미수신 시 강제 재생 시도
    setTimeout(() => {
      if (!started && this.playing) {
        console.warn('[BGM] canplaythrough 타임아웃, 강제 재생 시도:', src);
        doPlay();
      }
    }, 5000);

    audio.addEventListener('ended', () => {
      if (!this.playing || this._eventPlaying) return;
      const pl = this.PLAYLISTS[this._phase] || this.PLAYLISTS.early;
      this._playlistIdx = (this._playlistIdx + 1) % pl.length;
      // 페이즈 변경 체크 후 다음 곡
      const newPhase = this._getPhase();
      if (newPhase !== this._phase) {
        this._phase = newPhase;
        this._playlistIdx = 0;
        this._updateUI();
      }
      this._startTrack();
    });

    audio.addEventListener('error', (e) => {
      console.warn('[BGM] 로드 실패:', src, e);
      started = true; // 에러 시 doPlay 중복 방지
      if (!this.playing) return;
      const pl = this.PLAYLISTS[this._phase] || this.PLAYLISTS.early;
      this._playlistIdx = (this._playlistIdx + 1) % pl.length;
      setTimeout(() => this._startTrack(), 500);
    });

    audio.load();
  },

  // ─── 내부: 볼륨 페이드 유틸 ──────────────────────────────
  _fadeTo(audio, targetVol, duration, onDone) {
    if (!audio) { if (onDone) onDone(); return; }
    const startVol = audio.volume;
    const diff = targetVol - startVol;
    const fps = 30;
    const steps = Math.max(8, Math.round(duration * fps));
    const stepTime = (duration * 1000) / steps;
    let step = 0;
    const tick = setInterval(() => {
      step++;
      audio.volume = Math.max(0, Math.min(1, startVol + diff * (step / steps)));
      if (step >= steps) {
        clearInterval(tick);
        audio.volume = Math.max(0, Math.min(1, targetVol));
        if (onDone) onDone();
      }
    }, stepTime);
  },

  _fadeOut(audio, duration, onDone) {
    this._fadeTo(audio, 0, duration, () => {
      audio.pause();
      if (onDone) onDone();
    });
  },

  // ─── UI 라벨 ─────────────────────────────────────────────
  _updateUI() {
    const labels = {
      early:     '[BGM: CIRCUIT]',
      mid:       '[BGM: GRID]',
      late:      '[BGM: DRIVE]',
      post_moon: '[BGM: EPIC]',
    };
    const el = document.getElementById('bgm-track-label');
    if (el) el.textContent = this.playing
      ? (labels[this._phase] || '[BGM: --]')
      : '[BGM: OFF]';
  },

  // ─── 하위호환 shim (기존 Web Audio 참조 보호) ─────────────
  ctx: null,
  nodes: [],
  masterGain: null,
  init() { return true; },
};


// ============================================================
//  SFX 이벤트 — Web Audio API OscillatorNode 프로그래매틱 생성
//  기존 playSfx() (js/game-state.js) 를 활용한 고수준 효과음
//
//  ※ BGM 시스템(위 BGM 객체)과 완전히 독립된 레이어.
//     BGM은 HTMLAudioElement(mp3), SFX는 Web Audio OscillatorNode.
// ============================================================

/**
 * 조립 스테이지 1개 완료 SFX
 * 짧은 성공 효과음 — 상승하는 2음 시퀀스 (ding-ding)
 *
 * 연결점: js/tabs/assembly.js updateAssemblyJobs() 에서
 *         job.ready = true 직후 호출.
 *         현재는 인라인 playSfx 호출이 있으며,
 *         이 함수로 대체하여 통합 관리 가능.
 */
function sfxAssemblyStageComplete() {
  if (typeof playSfx !== 'function') return;
  // 첫 번째 음: 밝은 삼각파 상승음
  playSfx('triangle', 660, 0.10, 0.06, 880);
  // 두 번째 음: 약간의 딜레이 후 더 높은 사인파
  setTimeout(() => playSfx('sine', 880, 0.08, 0.04, 1100), 100);
}

/**
 * 전체 조립 완료 (모든 슬롯 조립 완료) SFX
 * 화려한 완성 팡파르 — 3단 상승 시퀀스 + 하모닉 쉬머
 *
 * 연결점: js/tabs/assembly.js 또는 js/game-state.js 에서
 *         모든 assembly.jobs 가 ready 상태가 되었을 때 호출.
 *         launchReady() 직전 또는 전체 슬롯 완료 감지 시점에서 사용.
 */
function sfxAssemblyAllComplete() {
  if (typeof playSfx !== 'function') return;
  // 1단: 낮은 사각파 — 기반 톤
  playSfx('square', 440, 0.12, 0.06, 660);
  // 2단: 중간 삼각파 — 상승
  setTimeout(() => playSfx('triangle', 660, 0.10, 0.05, 880), 120);
  // 3단: 높은 사인파 — 정점
  setTimeout(() => playSfx('sine', 880, 0.14, 0.06, 1320), 250);
  // 4단: 하모닉 쉬머 (고음 잔향)
  setTimeout(() => playSfx('sine', 1320, 0.20, 0.03, 1760), 400);
}

/**
 * 탭 전환 SFX
 * 미세한 클릭 사운드 — 짧은 삼각파 틱 (UI 피드백용)
 *
 * 연결점: js/main.js switchMainTab() 에서 호출.
 *         현재 switchMainTab() 라인 6에 인라인 playSfx('triangle', 220, ...)가 있으며,
 *         이 함수로 대체하여 사운드 파라미터를 audio-bgm.js에서 통합 관리 가능.
 *         nav-tab click handler (main.js init() 라인 371~373):
 *           document.querySelectorAll('.nav-tab').forEach(t => {
 *             t.addEventListener('click', () => switchMainTab(t.dataset.tab));
 *           });
 */
function sfxTabSwitch() {
  if (typeof playSfx !== 'function') return;
  // 매우 짧고 미세한 삼각파 클릭 — UI 피드백
  playSfx('triangle', 220, 0.04, 0.02, 330);
}

/**
 * 업적 달성 SFX  (S4-1)
 * 축하하는 느낌의 상승 메이저 코드 아르페지오 (C5-E5-G5-C6)
 * 총 ~600ms, OscillatorNode + GainNode attack-sustain-release 엔벨로프
 *
 * 연결점: 업적 언락 시점에서 호출
 *         (예: js/tabs/achievements.js 또는 게임 상태 업적 체크 로직)
 */
function playSfx_achievementUnlock() {
  if (typeof ensureAudio !== 'function') return;
  const ctx = ensureAudio();
  if (!ctx) return;
  if (typeof gs !== 'undefined' && gs.settings && !gs.settings.sound) return;

  const now = ctx.currentTime;
  // C5=523.25, E5=659.25, G5=783.99, C6=1046.50
  const notes = [523.25, 659.25, 783.99, 1046.50];
  const noteSpacing = 0.12;   // 각 음 간격 120ms
  const attack  = 0.015;
  const sustain = 0.10;
  const release = 0.12;
  const peakVol = 0.06;

  notes.forEach((freq, i) => {
    const startTime = now + i * noteSpacing;
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = (i < 3) ? 'triangle' : 'sine';  // 마지막 음은 사인파로 부드럽게
    osc.frequency.setValueAtTime(freq, startTime);

    // attack → sustain → release 엔벨로프
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(peakVol, startTime + attack);
    gain.gain.setValueAtTime(peakVol, startTime + attack + sustain);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + attack + sustain + release);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + attack + sustain + release + 0.01);
  });

  // 마지막에 쉬머 하모닉 (C6 옥타브 위 잔향)
  const shimmerStart = now + notes.length * noteSpacing;
  const shimOsc  = ctx.createOscillator();
  const shimGain = ctx.createGain();
  shimOsc.type = 'sine';
  shimOsc.frequency.setValueAtTime(1046.50, shimmerStart);
  shimOsc.frequency.linearRampToValueAtTime(1318.51, shimmerStart + 0.15); // E6까지 글라이드
  shimGain.gain.setValueAtTime(0, shimmerStart);
  shimGain.gain.linearRampToValueAtTime(peakVol * 0.5, shimmerStart + 0.02);
  shimGain.gain.exponentialRampToValueAtTime(0.0001, shimmerStart + 0.18);
  shimOsc.connect(shimGain);
  shimGain.connect(ctx.destination);
  shimOsc.start(shimmerStart);
  shimOsc.stop(shimmerStart + 0.20);
}
window.playSfx_achievementUnlock = playSfx_achievementUnlock;

/**
 * 프레스티지 리셋 SFX  (S4-2)
 * "우주적" 임팩트 — 깊은 하강음 + 상승 쉬머
 * 총 ~1200ms, 다중 오실레이터: 베이스 스위프 다운 + 고주파 스위프 업
 *
 * 연결점: 프레스티지/리셋 실행 시점에서 호출
 *         (예: js/tabs/prestige.js doPrestige() 또는 리셋 확인 후)
 */
function playSfx_prestigeReset() {
  if (typeof ensureAudio !== 'function') return;
  const ctx = ensureAudio();
  if (!ctx) return;
  if (typeof gs !== 'undefined' && gs.settings && !gs.settings.sound) return;

  const now = ctx.currentTime;

  // ── 레이어 1: 베이스 스위프 다운 (깊고 묵직한 하강) ──
  const bassOsc  = ctx.createOscillator();
  const bassGain = ctx.createGain();
  bassOsc.type = 'sawtooth';
  bassOsc.frequency.setValueAtTime(220, now);                         // A3에서 시작
  bassOsc.frequency.exponentialRampToValueAtTime(55, now + 0.6);      // A1까지 하강
  bassGain.gain.setValueAtTime(0, now);
  bassGain.gain.linearRampToValueAtTime(0.05, now + 0.03);            // 빠른 어택
  bassGain.gain.setValueAtTime(0.05, now + 0.25);
  bassGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);     // 페이드아웃
  bassOsc.connect(bassGain);
  bassGain.connect(ctx.destination);
  bassOsc.start(now);
  bassOsc.stop(now + 0.70);

  // ── 레이어 2: 서브 베이스 럼블 (추가 깊이감) ──
  const subOsc  = ctx.createOscillator();
  const subGain = ctx.createGain();
  subOsc.type = 'sine';
  subOsc.frequency.setValueAtTime(110, now);
  subOsc.frequency.exponentialRampToValueAtTime(30, now + 0.5);
  subGain.gain.setValueAtTime(0, now);
  subGain.gain.linearRampToValueAtTime(0.04, now + 0.02);
  subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
  subOsc.connect(subGain);
  subGain.connect(ctx.destination);
  subOsc.start(now);
  subOsc.stop(now + 0.60);

  // ── 레이어 3: 상승 쉬머 (우주적 느낌, 딜레이 후 시작) ──
  const shimmerDelay = 0.35;
  const shimOsc1  = ctx.createOscillator();
  const shimGain1 = ctx.createGain();
  shimOsc1.type = 'sine';
  shimOsc1.frequency.setValueAtTime(880, now + shimmerDelay);            // A5에서 시작
  shimOsc1.frequency.exponentialRampToValueAtTime(3520, now + shimmerDelay + 0.7); // A7까지 상승
  shimGain1.gain.setValueAtTime(0, now + shimmerDelay);
  shimGain1.gain.linearRampToValueAtTime(0.03, now + shimmerDelay + 0.08);
  shimGain1.gain.setValueAtTime(0.03, now + shimmerDelay + 0.45);
  shimGain1.gain.exponentialRampToValueAtTime(0.0001, now + shimmerDelay + 0.80);
  shimOsc1.connect(shimGain1);
  shimGain1.connect(ctx.destination);
  shimOsc1.start(now + shimmerDelay);
  shimOsc1.stop(now + shimmerDelay + 0.85);

  // ── 레이어 4: 두 번째 쉬머 (5도 위, 하모닉 보강) ──
  const shimOsc2  = ctx.createOscillator();
  const shimGain2 = ctx.createGain();
  shimOsc2.type = 'sine';
  shimOsc2.frequency.setValueAtTime(1320, now + shimmerDelay + 0.05);   // E6
  shimOsc2.frequency.exponentialRampToValueAtTime(4400, now + shimmerDelay + 0.75); // 상승
  shimGain2.gain.setValueAtTime(0, now + shimmerDelay + 0.05);
  shimGain2.gain.linearRampToValueAtTime(0.02, now + shimmerDelay + 0.12);
  shimGain2.gain.setValueAtTime(0.02, now + shimmerDelay + 0.50);
  shimGain2.gain.exponentialRampToValueAtTime(0.0001, now + shimmerDelay + 0.85);
  shimOsc2.connect(shimGain2);
  shimGain2.connect(ctx.destination);
  shimOsc2.start(now + shimmerDelay + 0.05);
  shimOsc2.stop(now + shimmerDelay + 0.90);
}
window.playSfx_prestigeReset = playSfx_prestigeReset;

/**
 * 페이즈 클리어 팡파레 SFX  (S4-3)
 * 승리의 팡파레 — 빠른 상승 노트 시퀀스 → 서스테인 코드
 * 총 ~1000ms, 클래식 게임 "레벨 클리어" 스타일
 *
 * 연결점: 게임 페이즈(early→mid→late→post_moon) 전환 완료 시 호출
 *         (예: BGM.refreshPhase() 내 페이즈 변경 감지 시,
 *          또는 진행도 마일스톤 달성 시)
 */
function playSfx_phaseClear() {
  if (typeof ensureAudio !== 'function') return;
  const ctx = ensureAudio();
  if (!ctx) return;
  if (typeof gs !== 'undefined' && gs.settings && !gs.settings.sound) return;

  const now = ctx.currentTime;

  // ── 파트 1: 빠른 상승 노트 시퀀스 (G4-B4-D5-G5) ──
  const fanfareNotes = [
    { freq: 392.00, time: 0,    dur: 0.08, type: 'square',   vol: 0.04 },  // G4
    { freq: 493.88, time: 0.08, dur: 0.08, type: 'square',   vol: 0.045 }, // B4
    { freq: 587.33, time: 0.16, dur: 0.08, type: 'square',   vol: 0.05 },  // D5
    { freq: 783.99, time: 0.24, dur: 0.10, type: 'triangle', vol: 0.055 }, // G5 (약간 길게)
  ];

  fanfareNotes.forEach(note => {
    const startTime = now + note.time;
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = note.type;
    osc.frequency.setValueAtTime(note.freq, startTime);

    // 빠른 어택 + 짧은 릴리즈
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(note.vol, startTime + 0.01);
    gain.gain.setValueAtTime(note.vol, startTime + note.dur * 0.6);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + note.dur);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + note.dur + 0.01);
  });

  // ── 파트 2: 서스테인 메이저 코드 (G5+B5+D6, 화음 동시 발음) ──
  const chordStart = now + 0.38;
  const chordNotes = [
    { freq: 783.99, type: 'triangle', vol: 0.04 },  // G5
    { freq: 987.77, type: 'sine',     vol: 0.03 },  // B5
    { freq: 1174.66, type: 'sine',    vol: 0.025 },  // D6
  ];
  const chordAttack  = 0.02;
  const chordSustain = 0.30;
  const chordRelease = 0.28;

  chordNotes.forEach(note => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = note.type;
    osc.frequency.setValueAtTime(note.freq, chordStart);

    gain.gain.setValueAtTime(0, chordStart);
    gain.gain.linearRampToValueAtTime(note.vol, chordStart + chordAttack);
    gain.gain.setValueAtTime(note.vol, chordStart + chordAttack + chordSustain);
    gain.gain.exponentialRampToValueAtTime(0.0001, chordStart + chordAttack + chordSustain + chordRelease);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(chordStart);
    osc.stop(chordStart + chordAttack + chordSustain + chordRelease + 0.01);
  });

  // ── 파트 3: 마무리 옥타브 강조 (G6 — 짧은 스파클) ──
  const sparkleStart = now + 0.42;
  const sparkleOsc  = ctx.createOscillator();
  const sparkleGain = ctx.createGain();
  sparkleOsc.type = 'sine';
  sparkleOsc.frequency.setValueAtTime(1567.98, sparkleStart); // G6
  sparkleGain.gain.setValueAtTime(0, sparkleStart);
  sparkleGain.gain.linearRampToValueAtTime(0.02, sparkleStart + 0.01);
  sparkleGain.gain.exponentialRampToValueAtTime(0.0001, sparkleStart + 0.20);
  sparkleOsc.connect(sparkleGain);
  sparkleGain.connect(ctx.destination);
  sparkleOsc.start(sparkleStart);
  sparkleOsc.stop(sparkleStart + 0.22);
}
window.playSfx_phaseClear = playSfx_phaseClear;

/**
 * 발사 실패 폭발 SFX  (S5-1)
 * 저주파 폭발음 + 고주파 파편음 + 잔향 페이드아웃
 * 총 ~1000ms, 다중 오실레이터: 베이스 폭발(sawtooth) + 파편 노이즈(square burst) + 잔향
 *
 * 사운드 디자인:
 *   레이어 1: 저주파 폭발음 (60-120Hz sawtooth, 0.3초)
 *   레이어 2: 고주파 파편음 (800-2000Hz square burst, 0.2초)
 *   레이어 3: 잔향 페이드아웃 (서브 베이스 럼블, 0.5초)
 *
 * 연결점: 발사 실패 처리 시점에서 호출
 *         (예: js/tabs/launch.js 발사 실패 판정 후)
 */
function playSfx_launchFail() {
  if (typeof ensureAudio !== 'function') return;
  const ctx = ensureAudio();
  if (!ctx) return;
  if (typeof gs !== 'undefined' && gs.settings && !gs.settings.sound) return;

  const now = ctx.currentTime;

  // ── 레이어 1: 저주파 폭발음 (60-120Hz sawtooth, 0.3초) ──
  // 묵직한 폭발 임팩트 — 120Hz에서 시작, 60Hz로 급강하
  const boomOsc  = ctx.createOscillator();
  const boomGain = ctx.createGain();
  boomOsc.type = 'sawtooth';
  boomOsc.frequency.setValueAtTime(120, now);
  boomOsc.frequency.exponentialRampToValueAtTime(60, now + 0.30);
  boomGain.gain.setValueAtTime(0, now);
  boomGain.gain.linearRampToValueAtTime(0.07, now + 0.01);       // 극히 빠른 어택
  boomGain.gain.setValueAtTime(0.07, now + 0.08);
  boomGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.30); // 0.3초 디케이
  boomOsc.connect(boomGain);
  boomGain.connect(ctx.destination);
  boomOsc.start(now);
  boomOsc.stop(now + 0.32);

  // ── 레이어 1b: 서브 베이스 보강 (40-80Hz sine, 깊이감) ──
  const subOsc  = ctx.createOscillator();
  const subGain = ctx.createGain();
  subOsc.type = 'sine';
  subOsc.frequency.setValueAtTime(80, now);
  subOsc.frequency.exponentialRampToValueAtTime(40, now + 0.25);
  subGain.gain.setValueAtTime(0, now);
  subGain.gain.linearRampToValueAtTime(0.05, now + 0.01);
  subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
  subOsc.connect(subGain);
  subGain.connect(ctx.destination);
  subOsc.start(now);
  subOsc.stop(now + 0.30);

  // ── 레이어 2: 고주파 파편음 (800-2000Hz square burst, 0.2초) ──
  // 금속 파편이 흩어지는 느낌 — 약간의 딜레이 후 시작
  const debrisDelay = 0.04;
  const debrisOsc  = ctx.createOscillator();
  const debrisGain = ctx.createGain();
  debrisOsc.type = 'square';
  debrisOsc.frequency.setValueAtTime(2000, now + debrisDelay);
  debrisOsc.frequency.exponentialRampToValueAtTime(800, now + debrisDelay + 0.20);
  debrisGain.gain.setValueAtTime(0, now + debrisDelay);
  debrisGain.gain.linearRampToValueAtTime(0.03, now + debrisDelay + 0.008);
  debrisGain.gain.setValueAtTime(0.03, now + debrisDelay + 0.04);
  debrisGain.gain.exponentialRampToValueAtTime(0.0001, now + debrisDelay + 0.20);
  debrisOsc.connect(debrisGain);
  debrisGain.connect(ctx.destination);
  debrisOsc.start(now + debrisDelay);
  debrisOsc.stop(now + debrisDelay + 0.22);

  // ── 레이어 2b: 두 번째 파편 (1200-500Hz, 랜덤 느낌 보강) ──
  const debris2Delay = 0.08;
  const debris2Osc  = ctx.createOscillator();
  const debris2Gain = ctx.createGain();
  debris2Osc.type = 'sawtooth';
  debris2Osc.frequency.setValueAtTime(1200, now + debris2Delay);
  debris2Osc.frequency.exponentialRampToValueAtTime(500, now + debris2Delay + 0.15);
  debris2Gain.gain.setValueAtTime(0, now + debris2Delay);
  debris2Gain.gain.linearRampToValueAtTime(0.02, now + debris2Delay + 0.005);
  debris2Gain.gain.exponentialRampToValueAtTime(0.0001, now + debris2Delay + 0.18);
  debris2Osc.connect(debris2Gain);
  debris2Gain.connect(ctx.destination);
  debris2Osc.start(now + debris2Delay);
  debris2Osc.stop(now + debris2Delay + 0.20);

  // ── 레이어 3: 잔향 페이드아웃 (저주파 럼블 tail, 0.5초) ──
  // 폭발 잔향이 서서히 사라지는 느낌
  const tailDelay = 0.15;
  const tailOsc  = ctx.createOscillator();
  const tailGain = ctx.createGain();
  tailOsc.type = 'sine';
  tailOsc.frequency.setValueAtTime(55, now + tailDelay);            // A1
  tailOsc.frequency.exponentialRampToValueAtTime(30, now + tailDelay + 0.50);
  tailGain.gain.setValueAtTime(0, now + tailDelay);
  tailGain.gain.linearRampToValueAtTime(0.04, now + tailDelay + 0.05);
  tailGain.gain.setValueAtTime(0.04, now + tailDelay + 0.15);
  tailGain.gain.exponentialRampToValueAtTime(0.0001, now + tailDelay + 0.50);
  tailOsc.connect(tailGain);
  tailGain.connect(ctx.destination);
  tailOsc.start(now + tailDelay);
  tailOsc.stop(now + tailDelay + 0.52);

  // ── 레이어 3b: 고주파 잔향 쉬머 (사라지는 금속 울림) ──
  const shimDelay = 0.20;
  const shimOsc  = ctx.createOscillator();
  const shimGain = ctx.createGain();
  shimOsc.type = 'triangle';
  shimOsc.frequency.setValueAtTime(600, now + shimDelay);
  shimOsc.frequency.exponentialRampToValueAtTime(200, now + shimDelay + 0.40);
  shimGain.gain.setValueAtTime(0, now + shimDelay);
  shimGain.gain.linearRampToValueAtTime(0.015, now + shimDelay + 0.03);
  shimGain.gain.exponentialRampToValueAtTime(0.0001, now + shimDelay + 0.45);
  shimOsc.connect(shimGain);
  shimGain.connect(ctx.destination);
  shimOsc.start(now + shimDelay);
  shimOsc.stop(now + shimDelay + 0.47);
}
window.playSfx_launchFail = playSfx_launchFail;

/**
 * 오프라인 복귀 알림 SFX  (S5-2)
 * 긍정적인 알림음 — 상승 아르페지오 3음 (C5->E5->G5) + 글로우 tail
 * 총 ~540ms, 밝고 환영하는 느낌의 사인파 시퀀스
 *
 * 사운드 디자인:
 *   파트 1: 상승 아르페지오 3음 (C5=523.25, E5=659.25, G5=783.99)
 *           각 0.08초, sine wave, 빠른 어택 + 짧은 릴리즈
 *   파트 2: 글로우 tail (G5 서스테인 + 옥타브 하모닉, 0.3초 페이드)
 *
 * 연결점: 오프라인 복귀 보고서 모달 열릴 때 1회 재생
 *         (예: js/main.js 또는 js/game-state.js 오프라인 수익 계산 후
 *          모달 표시 시점에서 호출)
 */
function playSfx_offlineReturn() {
  if (typeof ensureAudio !== 'function') return;
  const ctx = ensureAudio();
  if (!ctx) return;
  if (typeof gs !== 'undefined' && gs.settings && !gs.settings.sound) return;

  const now = ctx.currentTime;

  // ── 파트 1: 상승 아르페지오 3음 (C5->E5->G5) ──
  // 밝고 긍정적인 "돌아왔어요" 알림
  const notes = [
    { freq: 523.25, time: 0 },      // C5
    { freq: 659.25, time: 0.08 },   // E5
    { freq: 783.99, time: 0.16 },   // G5
  ];
  const noteDur = 0.08;
  const noteAttack  = 0.008;
  const noteSustain = 0.04;
  const noteRelease = 0.028;  // noteDur = attack + sustain + release
  const noteVol = 0.05;

  notes.forEach(note => {
    const startTime = now + note.time;
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(note.freq, startTime);

    // attack -> sustain -> release 엔벨로프
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(noteVol, startTime + noteAttack);
    gain.gain.setValueAtTime(noteVol, startTime + noteAttack + noteSustain);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + noteAttack + noteSustain + noteRelease);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + noteDur + 0.01);
  });

  // ── 파트 2: 글로우 tail (G5 서스테인 + 옥타브 하모닉 C6, 0.3초 페이드) ──
  // 마지막 음이 부드럽게 퍼지는 잔향 — 따뜻하고 환영하는 느낌
  const glowStart = now + 0.22;

  // G5 서스테인 글로우
  const glowOsc1  = ctx.createOscillator();
  const glowGain1 = ctx.createGain();
  glowOsc1.type = 'sine';
  glowOsc1.frequency.setValueAtTime(783.99, glowStart);  // G5
  glowGain1.gain.setValueAtTime(0, glowStart);
  glowGain1.gain.linearRampToValueAtTime(0.035, glowStart + 0.02);
  glowGain1.gain.setValueAtTime(0.035, glowStart + 0.10);
  glowGain1.gain.exponentialRampToValueAtTime(0.0001, glowStart + 0.30);
  glowOsc1.connect(glowGain1);
  glowGain1.connect(ctx.destination);
  glowOsc1.start(glowStart);
  glowOsc1.stop(glowStart + 0.32);

  // C6 옥타브 하모닉 (5도 위 보강 — 메이저 코드 느낌 유지)
  const glowOsc2  = ctx.createOscillator();
  const glowGain2 = ctx.createGain();
  glowOsc2.type = 'sine';
  glowOsc2.frequency.setValueAtTime(1046.50, glowStart + 0.03);  // C6
  glowGain2.gain.setValueAtTime(0, glowStart + 0.03);
  glowGain2.gain.linearRampToValueAtTime(0.02, glowStart + 0.06);
  glowGain2.gain.setValueAtTime(0.02, glowStart + 0.12);
  glowGain2.gain.exponentialRampToValueAtTime(0.0001, glowStart + 0.30);
  glowOsc2.connect(glowGain2);
  glowGain2.connect(ctx.destination);
  glowOsc2.start(glowStart + 0.03);
  glowOsc2.stop(glowStart + 0.32);
}
window.playSfx_offlineReturn = playSfx_offlineReturn;
