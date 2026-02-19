// ============================================================
//  BGM — js/audio-bgm.js
//  3 tracks — Matrix-style driving minor-key electronic
// ============================================================

const BGM = {
  ctx: null,
  nodes: [],
  track: 0,   // 0=main 1=research 2=launch
  playing: false,
  masterGain: null,
  volume: 0.12,
  _loopTimer: null,

  init() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return false;
    if (!this.ctx) {
      this.ctx = new Ctx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return true;
  },

  start(trackIdx) {
    if (!this.init()) return;
    this.stop();
    this.track = (trackIdx !== undefined) ? trackIdx : this.track;
    this.playing = true;
    this._playTrack(this.track);
    this._updateUI();
  },

  stop() {
    this.playing = false;
    clearTimeout(this._loopTimer);
    this.nodes.forEach(n => { try { n.stop(); } catch(e) {} });
    this.nodes = [];
  },

  next() {
    this.track = (this.track + 1) % 3;
    if (this.playing) this.start(this.track);
    else this._updateUI();
  },

  setVolume(v) {
    this.volume = v;
    if (this.masterGain) this.masterGain.gain.value = v;
  },

  _updateUI() {
    const labels = ['[BGM: DRIVE]', '[BGM: GRID]', '[BGM: LAUNCH]'];
    const el = document.getElementById('bgm-track-label');
    if (el) el.textContent = labels[this.track];
  },

  // ── helper: schedule one note ─────────────────────────────
  _note(type, freq, t, dur, vol, mg) {
    if (!freq) return;
    const osc = this.ctx.createOscillator();
    const g   = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + Math.min(0.02, dur * 0.1));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.92);
    osc.connect(g); g.connect(mg);
    osc.start(t); osc.stop(t + dur);
    this.nodes.push(osc);
  },

  // ── TRACK 0: Main Gameplay — D-minor pulse, 134 BPM ─────
  // Driving bass + pentatonic arpeggio + high shimmer
  _track0(ctx, mg) {
    const dur = 8;
    const bpm = 134;
    const b   = 60 / bpm;

    // D-minor root: D2=73.4, F2=87.3, A2=110, C3=130.8, D3=146.8
    // Bass: root hits on beat 1 and 3, passing notes
    const bassSeq = [73.4, 0, 73.4, 87.3, 73.4, 0, 73.4, 110];
    bassSeq.forEach((freq, i) => {
      this._note('sawtooth', freq, ctx.currentTime + i * b, b * 0.88, 0.10, mg);
    });

    // Inner melody arpeggio: D-minor pentatonic (D, F, G, A, C)
    const mel = [293.7, 349.2, 392, 440, 523.3, 440, 392, 349.2,
                 293.7, 329.6, 392, 440, 523.3, 587.3, 523.3, 440];
    mel.forEach((freq, i) => {
      this._note('square', freq, ctx.currentTime + i * (b / 2), b * 0.45, 0.028, mg);
    });

    // High shimmer pad (D4 chord tones, slow swell)
    const pad = [293.7, 440, 587.3];
    pad.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq * 2;
      const t = ctx.currentTime + i * 0.08;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.018, t + 1.5);
      g.gain.linearRampToValueAtTime(0.006, t + dur - 0.5);
      g.gain.linearRampToValueAtTime(0, t + dur);
      osc.connect(g); g.connect(mg);
      osc.start(t); osc.stop(t + dur);
      this.nodes.push(osc);
    });

    return dur;
  },

  // ── TRACK 1: Research / Grid — 110 BPM, glitchy arpeggio ─
  _track1(ctx, mg) {
    const dur = 8;
    const bpm = 110;
    const b   = 60 / bpm;

    // Slow AM-minor bass pulse
    const bassSeq = [55, 55, 65.4, 55, 65.4, 55, 73.4, 55];
    bassSeq.forEach((freq, i) => {
      this._note('sawtooth', freq, ctx.currentTime + i * b, b * 0.7, 0.085, mg);
    });

    // Bright square arpeggio — A-minor: A, C, E, G, A×2
    const arp = [220, 261.6, 329.6, 392, 440, 392, 329.6, 261.6,
                 220, 246.9, 329.6, 392, 440, 523.3, 440, 392];
    arp.forEach((freq, i) => {
      this._note('square', freq, ctx.currentTime + i * (b * 0.5), b * 0.42, 0.032, mg);
    });

    // Glitch burst every 2 beats
    [0, 2, 4, 6].forEach(beat => {
      [660, 880, 1100].forEach((f, j) => {
        this._note('triangle', f, ctx.currentTime + beat * b + j * 0.04, 0.06, 0.016, mg);
      });
    });

    return dur;
  },

  // ── TRACK 2: Launch Countdown — 145 BPM, tense + rise ───
  _track2(ctx, mg) {
    const dur = 8;
    const bpm = 145;
    const b   = 60 / bpm;

    // Pounding bass: E2 + B1
    const bassSeq = [82.4, 82.4, 123.5, 82.4, 82.4, 110, 123.5, 82.4];
    bassSeq.forEach((freq, i) => {
      this._note('sawtooth', freq, ctx.currentTime + i * b, b * 0.82, 0.11, mg);
    });

    // Driving 16th-note sawtooth stab (E-minor chord)
    const stab = [164.8, 0, 196, 0, 164.8, 246.9, 196, 0,
                  164.8, 0, 220, 246.9, 293.7, 0, 246.9, 220];
    stab.forEach((freq, i) => {
      this._note('sawtooth', freq, ctx.currentTime + i * (b / 2), b * 0.4, 0.038, mg);
    });

    // Rising tension pad — swell through octave
    [82.4, 164.8, 246.9].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(freq * 1.08, ctx.currentTime + dur);
      const t = ctx.currentTime + i * 0.12;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.022, t + 2);
      g.gain.linearRampToValueAtTime(0.04, t + dur - 0.4);
      g.gain.linearRampToValueAtTime(0, t + dur);
      osc.connect(g); g.connect(mg);
      osc.start(t); osc.stop(t + dur);
      this.nodes.push(osc);
    });

    return dur;
  },

  _playTrack(trackIdx) {
    if (!this.ctx || !this.playing) return;
    const dur = this['_track' + trackIdx](this.ctx, this.masterGain);
    this._loopTimer = setTimeout(() => {
      if (this.playing) this._playTrack(trackIdx);
    }, (dur - 0.05) * 1000);
  },
};
