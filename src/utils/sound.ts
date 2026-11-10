// Sound synthesizer using standard Web Audio API (offline safe, zero asset downloads)

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  constructor() {
    const saved = localStorage.getItem('vialkahoot_muted');
    if (saved !== null) {
      this.enabled = saved !== 'true';
    }
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.enabled = !this.enabled;
    localStorage.setItem('vialkahoot_muted', (!this.enabled).toString());
    if (this.enabled) {
      this.playChime();
    }
    return this.enabled;
  }

  public playTick(urgent = false) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(urgent ? 880 : 520, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // AudioContext not allowed yet without user gesture
    }
  }

  public playChime() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.06 + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.06);
        osc.stop(this.ctx.currentTime + idx * 0.06 + 0.32);
      });
    } catch {
      // Ignore
    }
  }

  public playCorrect() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const chord = [523.25, 659.25, 783.99, 1046.50]; // C - E - G - C6
      chord.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.05);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.05 + 0.5);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + i * 0.05);
        osc.stop(this.ctx.currentTime + i * 0.05 + 0.55);
      });
    } catch {
      // Ignore
    }
  }

  public playWrong() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(120, this.ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch {
      // Ignore
    }
  }

  public playFanfare() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const melody = [
        { f: 523.25, d: 0.15, t: 0.0 }, // C5
        { f: 523.25, d: 0.15, t: 0.15 },
        { f: 523.25, d: 0.15, t: 0.3 },
        { f: 659.25, d: 0.45, t: 0.45 }, // E5
        { f: 523.25, d: 0.2, t: 0.95 },
        { f: 783.99, d: 0.7, t: 1.15 }, // G5
      ];
      melody.forEach(item => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(item.f, this.ctx.currentTime + item.t);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime + item.t);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + item.t + item.d);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + item.t);
        osc.stop(this.ctx.currentTime + item.t + item.d + 0.05);
      });
    } catch {
      // Ignore
    }
  }
}

export const soundManager = new SoundSynthesizer();
