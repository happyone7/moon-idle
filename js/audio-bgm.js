// ============================================================
//  BGM — js/audio-bgm.js
//  3 procedural tracks using Web Audio API
// ============================================================

const BGM = {
  ctx: null,
  nodes: [],      // active oscillators/gains
  track: 0,       // 0=ambient 1=research 2=launch
  playing: false,
  masterGain: null,
  volume: 0.12,
  _stopTimer: null,
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
    this.nodes.forEach(n => {
      try { n.stop(); } catch(e) {}
    });
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
    const labels = ['[BGM: 앰비언트]', '[BGM: 연구]', '[BGM: 발사]'];
    const el = document.getElementById('bgm-track-label');
    if (el) el.textContent = labels[this.track];
  },

  // ── TRACK 0: Ambient Industrial (slow pads, 55 BPM) ──────────
  _track0(ctx, mg) {
    const dur = 16;
    const notes = [55, 82.5, 110, 138.6, 165];  // A1 chord + octave
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.18;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.18 / notes.length, t + 1.2);
      g.gain.linearRampToValueAtTime(0.08 / notes.length, t + dur - 2);
      g.gain.linearRampToValueAtTime(0, t + dur);
      osc.connect(g); g.connect(mg);
      osc.start(t); osc.stop(t + dur);
      this.nodes.push(osc);
    });
    // Low pulse
    const pulse = ctx.createOscillator();
    const pg = ctx.createGain();
    pulse.type = 'triangle';
    pulse.frequency.value = 27.5;
    pg.gain.setValueAtTime(0.06, ctx.currentTime);
    pg.gain.linearRampToValueAtTime(0, ctx.currentTime + dur);
    pulse.connect(pg); pg.connect(mg);
    pulse.start(ctx.currentTime); pulse.stop(ctx.currentTime + dur);
    this.nodes.push(pulse);
    return dur;
  },

  // ── TRACK 1: Research Mode (arpeggiated, 90 BPM) ─────────────
  _track1(ctx, mg) {
    const dur = 8;
    const beatLen = 60 / 90;
    const seq = [220, 261.6, 329.6, 392, 329.6, 261.6, 220, 174.6];
    seq.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * beatLen;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.05, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + beatLen * 0.85);
      osc.connect(g); g.connect(mg);
      osc.start(t); osc.stop(t + beatLen);
      this.nodes.push(osc);
    });
    // Bass note every 2 beats
    [0, 2, 4, 6].forEach(i => {
      const b = ctx.createOscillator();
      const bg = ctx.createGain();
      b.type = 'sawtooth';
      b.frequency.value = 55 + (i % 2 === 0 ? 0 : 11);
      const t = ctx.currentTime + i * beatLen;
      bg.gain.setValueAtTime(0, t);
      bg.gain.linearRampToValueAtTime(0.07, t + 0.05);
      bg.gain.exponentialRampToValueAtTime(0.001, t + beatLen * 1.8);
      b.connect(bg); bg.connect(mg);
      b.start(t); b.stop(t + beatLen * 2);
      this.nodes.push(b);
    });
    return dur;
  },

  // ── TRACK 2: Launch Ready (tense rhythm, 120 BPM) ────────────
  _track2(ctx, mg) {
    const dur = 8;
    const beatLen = 60 / 120;
    // Driving bass line
    const bassSeq = [55, 55, 73.4, 55, 65.4, 55, 73.4, 82.4];
    bassSeq.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * beatLen;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.09, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + beatLen * 0.9);
      osc.connect(g); g.connect(mg);
      osc.start(t); osc.stop(t + beatLen);
      this.nodes.push(osc);
    });
    // High tension melody
    const melSeq = [440, 0, 466.2, 0, 523.2, 493.9, 440, 0];
    melSeq.forEach((freq, i) => {
      if (!freq) return;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * beatLen;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.06, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + beatLen * 0.75);
      osc.connect(g); g.connect(mg);
      osc.start(t); osc.stop(t + beatLen);
      this.nodes.push(osc);
    });
    return dur;
  },

  _playTrack(trackIdx) {
    if (!this.ctx || !this.playing) return;
    const dur = this['_track' + trackIdx](this.ctx, this.masterGain);
    this._loopTimer = setTimeout(() => {
      if (this.playing) this._playTrack(trackIdx);
    }, (dur - 0.1) * 1000);
  },
};
