import type { AudioLayerConfig } from "../types";

// Fully-synthesized game audio (no asset files): a procedural engine that
// tracks RPM, tyre-screech that tracks drift load, a per-area ambient pad that
// crossfades between biomes, and a few SFX. Gated behind the first user gesture.

export class AudioSystem {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private muted = false;
  private started = false;
  private noiseBuf: AudioBuffer | null = null;

  // rain
  private rainGain: GainNode | null = null;
  private rainSrc: AudioBufferSourceNode | null = null;
  // engine
  private engOsc: OscillatorNode | null = null;
  private engSub: OscillatorNode | null = null;
  private engFilter: BiquadFilterNode | null = null;
  private engGain: GainNode | null = null;
  // drift
  private driftGain: GainNode | null = null;
  // idle "lump" — slow wobble on engine gain at low rpm
  private engLfoGain: GainNode | null = null;
  // speed wind
  private windGain: GainNode | null = null;
  // pad
  private padGain: GainNode | null = null;
  private padOscs: OscillatorNode[] = [];
  private padFilter: BiquadFilterNode | null = null;
  private ambGain: GainNode | null = null;
  private ambFilter: BiquadFilterNode | null = null;

  start(muted: boolean, area: AudioLayerConfig) {
    if (this.started) return;
    this.started = true;
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    this.ctx = ctx;
    this.muted = muted;

    const master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.9;
    master.connect(ctx.destination);
    this.master = master;

    this.noiseBuf = this.makeNoise(ctx);

    this.buildEngine(ctx, master);
    this.buildDrift(ctx, master);
    this.buildWind(ctx, master);
    this.buildPad(ctx, master, area);

    if (ctx.state === "suspended") ctx.resume();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.master && this.ctx) {
      const t = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(t);
      this.master.gain.linearRampToValueAtTime(muted ? 0 : 0.9, t + 0.3);
    }
  }

  dispose() {
    this.padOscs.forEach((o) => {
      try {
        o.stop();
      } catch {
        /* noop */
      }
    });
    try {
      this.engOsc?.stop();
      this.engSub?.stop();
      this.rainSrc?.stop();
    } catch {
      /* noop */
    }
    this.ctx?.close();
    this.ctx = null;
    this.started = false;
  }

  // --- realtime driving ---------------------------------------------------

  update(rpm: number, throttle: number, driftLoad: number, burnout = false) {
    if (!this.ctx || !this.engOsc) return;
    const t = this.ctx.currentTime;
    const base = 46 + rpm * 150;
    this.engOsc!.frequency.setTargetAtTime(base, t, 0.05);
    this.engSub!.frequency.setTargetAtTime(base * 0.5, t, 0.05);
    this.engFilter!.frequency.setTargetAtTime(340 + throttle * 2000 + rpm * 900, t, 0.05);
    this.engGain!.gain.setTargetAtTime(0.03 + rpm * 0.07, t, 0.08);
    // stationary burnout borrows the tyre-noise bed at near-full level
    const tyre = burnout ? 0.15 : Math.min(0.16, driftLoad * 0.2);
    this.driftGain!.gain.setTargetAtTime(tyre, t, 0.05);
    this.windGain!.gain.setTargetAtTime(Math.max(0, rpm - 0.35) * 0.08, t, 0.12);
    // idle lump: the wobble fades out as revs climb
    this.engLfoGain?.gain.setTargetAtTime(0.012 * Math.max(0, (0.3 - rpm) / 0.3), t, 0.15);
  }

  setArea(area: AudioLayerConfig) {
    if (!this.ctx || !this.padGain) return;
    const t = this.ctx.currentTime;
    // crossfade: dip the pad, retune, swell back
    this.padGain.gain.cancelScheduledValues(t);
    this.padGain.gain.setTargetAtTime(0.0, t, 0.25);
    window.setTimeout(() => {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      this.padOscs.forEach((osc, i) => {
        const f = area.pad[i % area.pad.length];
        osc.frequency.setTargetAtTime(f, now, 0.2);
      });
      if (this.ambFilter) {
        const amb = area.ambience;
        const bright = amb.includes("shimmer")
          ? 3200
          : amb.includes("birds")
          ? 1600
          : amb.includes("waves")
          ? 900
          : amb.includes("wind")
          ? 480
          : amb.includes("machinery")
          ? 220
          : 600;
        this.ambFilter.frequency.setTargetAtTime(bright, now, 0.4);
      }
      this.padGain!.gain.setTargetAtTime(0.16 * area.volume * 2, now, 0.5);
    }, 320);
  }

  // --- SFX ----------------------------------------------------------------

  ding(pitchMul = 1) {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(880 * pitchMul, t);
    o.frequency.exponentialRampToValueAtTime(1320 * pitchMul, t + 0.08);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + 0.34);
  }

  crash(intensity = 0.6) {
    if (!this.ctx || !this.master || !this.noiseBuf) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = this.ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.setValueAtTime(1400, t);
    f.frequency.exponentialRampToValueAtTime(180, t + 0.25);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(Math.min(0.5, 0.25 + intensity * 0.3), t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    src.connect(f).connect(g).connect(this.master);
    src.start(t);
    src.stop(t + 0.32);
  }

  /** tiny bird/duck chirp */
  chirp() {
    this.tone(1560 + Math.random() * 320, 0.09);
  }

  /** friendly two-tone car horn */
  horn() {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    for (const f of [420, 528]) {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = "square";
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.045, t + 0.02);
      g.gain.setValueAtTime(0.045, t + 0.18);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
      o.connect(g).connect(this.master);
      o.start(t);
      o.stop(t + 0.3);
    }
  }

  /** one-shot tyre screech for hard braking */
  screech(intensity = 0.7) {
    if (!this.ctx || !this.master || !this.noiseBuf) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = this.ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.setValueAtTime(2400, t);
    f.frequency.exponentialRampToValueAtTime(1500, t + 0.4);
    f.Q.value = 4;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.14 * intensity, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    src.connect(f).connect(g).connect(this.master);
    src.start(t);
    src.stop(t + 0.5);
  }

  chord() {
    [523.25, 659.25, 783.99].forEach((f, i) => {
      window.setTimeout(() => this.tone(f, 0.5), i * 70);
    });
  }

  /** phone ringtone: two quick tone pairs, like an old handset */
  ring() {
    [0, 90, 420, 510].forEach((delay, i) => {
      window.setTimeout(() => this.tone(i % 2 ? 1174.66 : 987.77, 0.16), delay);
    });
  }

  /** pager-style incident alarm: descending urgent beeps */
  alarm() {
    [880, 698.46, 880, 698.46, 587.33].forEach((f, i) => {
      window.setTimeout(() => this.tone(f, 0.22), i * 160);
    });
  }

  /** looping filtered-noise rain bed; level 0 stops it */
  setRain(level: number) {
    if (!this.ctx || !this.master || !this.noiseBuf) return;
    const t = this.ctx.currentTime;
    if (level <= 0) {
      if (this.rainGain) this.rainGain.gain.setTargetAtTime(0.0001, t, 0.8);
      return;
    }
    if (!this.rainSrc) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuf;
      src.loop = true;
      const f = this.ctx.createBiquadFilter();
      f.type = "highpass";
      f.frequency.value = 900;
      const g = this.ctx.createGain();
      g.gain.value = 0.0001;
      src.connect(f).connect(g).connect(this.master);
      src.start();
      this.rainSrc = src;
      this.rainGain = g;
    }
    this.rainGain!.gain.setTargetAtTime(0.05 * level, t, 1.2);
  }

  private tone(freq: number, dur: number) {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.1, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  // --- builders -----------------------------------------------------------

  private makeNoise(ctx: AudioContext): AudioBuffer {
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      d[i] = last * 3.2;
    }
    return buf;
  }

  private buildEngine(ctx: AudioContext, out: GainNode) {
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = 60;
    const sub = ctx.createOscillator();
    sub.type = "sine";
    sub.frequency.value = 30;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 400;
    const gain = ctx.createGain();
    gain.gain.value = 0.03;
    osc.connect(filter);
    sub.connect(filter);
    filter.connect(gain).connect(out);
    osc.start();
    sub.start();
    this.engOsc = osc;
    this.engSub = sub;
    this.engFilter = filter;
    this.engGain = gain;

    // slow LFO on the engine gain gives the idle a lumpy character
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 4.5;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0;
    lfo.connect(lfoGain).connect(gain.gain);
    lfo.start();
    this.engLfoGain = lfoGain;
  }

  private buildDrift(ctx: AudioContext, out: GainNode) {
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 2600;
    filter.Q.value = 3;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    src.connect(filter).connect(gain).connect(out);
    src.start();
    this.driftGain = gain;
  }

  private buildWind(ctx: AudioContext, out: GainNode) {
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 1500;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    src.connect(filter).connect(gain).connect(out);
    src.start();
    this.windGain = gain;
  }

  private buildPad(ctx: AudioContext, out: GainNode, area: AudioLayerConfig) {
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    const padGain = ctx.createGain();
    padGain.gain.value = 0.16 * area.volume * 2;
    filter.connect(padGain).connect(out);
    this.padFilter = filter;
    this.padGain = padGain;

    area.pad.forEach((f) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = f;
      osc.detune.value = (Math.random() - 0.5) * 8;
      osc.connect(filter);
      osc.start();
      this.padOscs.push(osc);
    });

    // ambience bed
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    src.loop = true;
    const af = ctx.createBiquadFilter();
    af.type = "lowpass";
    af.frequency.value = 600;
    const ag = ctx.createGain();
    ag.gain.value = 0.06;
    src.connect(af).connect(ag).connect(out);
    src.start();
    this.ambFilter = af;
    this.ambGain = ag;
  }
}
