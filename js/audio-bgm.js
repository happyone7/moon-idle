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
  volume: 0.6,
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
      'audio/bgm/bgm_09_moon_approach.mp3',
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

    const src = tracks[Math.floor(Math.random() * tracks.length)];

    // 현재 페이즈 트랙 페이드아웃
    if (this._current && !this._current.paused) {
      this._fadeOut(this._current, 1.2);
    }

    this._eventPlaying = true;
    const evAudio = new Audio(src);
    evAudio.volume = this.volume;
    this._eventAudio = evAudio;

    evAudio.addEventListener('canplaythrough', () => {
      evAudio.play().catch(() => {});
    }, { once: true });

    evAudio.addEventListener('ended', () => {
      this._eventPlaying = false;
      this._eventAudio = null;
      if (this.playing) {
        setTimeout(() => this._startTrack(), 300);
      }
    });

    evAudio.addEventListener('error', () => {
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

  // ─── 내부: 트랙 로드 + 크로스페이드 재생 ─────────────────
  _startTrack() {
    if (!this.playing) return;

    // 페이즈가 아직 null이면 초기화
    if (!this._phase) this._phase = this._getPhase();

    const playlist = this.PLAYLISTS[this._phase] || this.PLAYLISTS.early;
    const src = playlist[this._playlistIdx % playlist.length];

    const prev = this._current;
    const audio = new Audio(src);
    audio.volume = 0;

    audio.addEventListener('canplaythrough', () => {
      if (!this.playing) return;
      this._current = audio;
      audio.play().catch(() => {});
      // 새 트랙 페이드인
      this._fadeTo(audio, this._vol(), 2.0);
      // 이전 트랙 페이드아웃
      if (prev && !prev.paused && !prev.ended) {
        this._fadeOut(prev, 2.0);
      }
      this._updateUI();
    }, { once: true });

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

    audio.addEventListener('error', () => {
      console.warn('[BGM] 로드 실패:', src);
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
      early:     '[BGM: APPROACH]',
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
