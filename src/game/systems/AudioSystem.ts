import type { AudioLayerConfig } from "../types";
import { MusicPlayer } from "./MusicPlayer";

// Game audio, restructured into a small group mixer (docs/REDESIGN_ROADMAP.md,
// Phase 7). The reference (folio-2025) routes everything through named groups
// with playRandomNext / antiSpam / positional fade; we mirror that shape:
//
//   master ── toneFilter ── compressor ── destination
//     ├── musicBus   ← streaming CC0 jukebox (MusicPlayer)
//     ├── sfxBus     ← one-shot event SFX (optionally stereo-panned)
//     └── ambientBus ← continuous engine/drift/wind/pad/rain beds
//
// Every SFX stays fully synthesized here — our guaranteed-safe path — while the
// only reused asset files are the three CC0 music tracks (see CREDITS.md). The
// continuous beds remain gated off by default so the game never buzzes.

const MASTER_LEVEL = 0.58;
const PAD_LEVEL = 0.11;
const AMBIENCE_LEVEL = 0.025;
const TONE_PEAK = 0.045;
const ENABLE_CONTINUOUS_AUDIO = false;

export class AudioSystem {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  // group buses (children of master) — the mixer's three channels
  private musicBus: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private ambientBus: GainNode | null = null;
  private music: MusicPlayer | null = null;
  private muted = false;
  private started = false;
  private noiseBuf: AudioBuffer | null = null;
  /** per-key throttle timestamps (ctx-time seconds) — the antiSpam gate */
  private lastAt = new Map<string, number>();

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
  // night crickets bed (gated on by the day-cycle 'night' interval)
  private crickets: { gain: AudioParam; stop: () => void } | null = null;
  private cricketsOn = false;

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
    master.gain.value = muted ? 0 : MASTER_LEVEL;
    const toneFilter = ctx.createBiquadFilter();
    toneFilter.type = "lowpass";
    toneFilter.frequency.value = 7200;
    toneFilter.Q.value = 0.5;
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.knee.value = 24;
    compressor.ratio.value = 2.5;
    compressor.attack.value = 0.012;
    compressor.release.value = 0.18;
    master.connect(toneFilter).connect(compressor).connect(ctx.destination);
    this.master = master;

    // group buses — everything routes through one of these three into master
    this.musicBus = ctx.createGain();
    this.sfxBus = ctx.createGain();
    this.ambientBus = ctx.createGain();
    this.musicBus.connect(master);
    this.sfxBus.connect(master);
    this.ambientBus.connect(master);

    this.noiseBuf = this.makeNoise(ctx);

    if (ENABLE_CONTINUOUS_AUDIO) {
      this.buildEngine(ctx, this.ambientBus);
      this.buildDrift(ctx, this.ambientBus);
      this.buildWind(ctx, this.ambientBus);
      this.buildPad(ctx, this.ambientBus, area);
    }

    // streaming CC0 jukebox on the music bus (starts on this same gesture)
    this.music = new MusicPlayer(ctx, this.musicBus);
    this.music.start(muted);

    if (ctx.state === "suspended") ctx.resume();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    this.music?.setMuted(muted);
    if (this.master && this.ctx) {
      const t = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(t);
      this.master.gain.linearRampToValueAtTime(muted ? 0 : MASTER_LEVEL, t + 0.3);
    }
  }

  /** Skip to the next jukebox track (for a future HUD control). */
  nextTrack() {
    this.music?.next();
  }

  /**
   * Route a one-shot SFX to the sfx bus, optionally stereo-panned by screen
   * position (-1 left … +1 right). The reference fades sounds by listener
   * distance; for our near-camera events a light pan is the useful 2D analogue.
   */
  private sfxOut(pan = 0): AudioNode {
    const bus = this.sfxBus ?? this.master;
    if (!this.ctx || !bus || !pan) return bus as AudioNode;
    const p = this.ctx.createStereoPanner();
    p.pan.value = Math.max(-1, Math.min(1, pan));
    p.connect(bus);
    return p;
  }

  /** True if `key` fired within `gap` seconds — the shared anti-spam throttle. */
  private antiSpam(key: string, gap: number): boolean {
    if (!this.ctx) return true;
    const t = this.ctx.currentTime;
    const last = this.lastAt.get(key) ?? -Infinity;
    if (t - last < gap) return true;
    this.lastAt.set(key, t);
    return false;
  }

  dispose() {
    this.music?.dispose();
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
    this.crickets?.stop();
    this.ctx?.close();
    this.ctx = null;
    this.started = false;
  }

  // --- realtime driving ---------------------------------------------------

  update(rpm: number, throttle: number, driftLoad: number, burnout = false) {
    if (!this.ctx || !this.engOsc) return;
    const t = this.ctx.currentTime;
    const base = 42 + rpm * 120;
    this.engOsc!.frequency.setTargetAtTime(base, t, 0.05);
    this.engSub!.frequency.setTargetAtTime(base * 0.5, t, 0.05);
    this.engFilter!.frequency.setTargetAtTime(260 + throttle * 950 + rpm * 600, t, 0.07);
    this.engGain!.gain.setTargetAtTime(0.018 + rpm * 0.044, t, 0.1);
    // stationary burnout borrows the tyre-noise bed at near-full level
    const tyre = burnout ? 0.075 : Math.min(0.07, driftLoad * 0.09);
    this.driftGain!.gain.setTargetAtTime(tyre, t, 0.07);
    this.windGain!.gain.setTargetAtTime(Math.max(0, rpm - 0.35) * 0.035, t, 0.18);
    // idle lump: the wobble fades out as revs climb
    this.engLfoGain?.gain.setTargetAtTime(0.006 * Math.max(0, (0.3 - rpm) / 0.3), t, 0.18);
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
          ? 1800
          : amb.includes("birds")
          ? 1200
          : amb.includes("waves")
          ? 650
          : amb.includes("wind")
          ? 380
          : amb.includes("machinery")
          ? 180
          : 520;
        this.ambFilter.frequency.setTargetAtTime(bright, now, 0.4);
      }
      this.padGain!.gain.setTargetAtTime(PAD_LEVEL * area.volume, now, 0.6);
    }, 320);
  }

  // --- SFX ----------------------------------------------------------------

  ding(pitchMul = 1, pan = 0) {
    if (!this.ctx || !this.sfxBus) return;
    if (this.antiSpam("ding", 0.07)) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(620 * pitchMul, t);
    o.frequency.exponentialRampToValueAtTime(880 * pitchMul, t + 0.08);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.052, t + 0.025);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
    o.connect(g).connect(this.sfxOut(pan));
    o.start(t);
    o.stop(t + 0.28);
  }

  crash(intensity = 0.6, pan = 0) {
    if (!this.ctx || !this.sfxBus || !this.noiseBuf) return;
    if (this.antiSpam("crash", 0.08)) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = this.ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.setValueAtTime(900, t);
    f.frequency.exponentialRampToValueAtTime(140, t + 0.22);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(Math.min(0.22, 0.09 + intensity * 0.12), t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
    src.connect(f).connect(g).connect(this.sfxOut(pan));
    src.start(t);
    src.stop(t + 0.3);
  }

  /** low-end body-blow that layers under crash() on the hardest hits */
  boom(intensity = 1, pan = 0) {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(120, t);
    o.frequency.exponentialRampToValueAtTime(38, t + 0.22);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.min(0.16, 0.06 + intensity * 0.12), t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
    o.connect(g).connect(this.sfxOut(pan));
    o.start(t);
    o.stop(t + 0.38);
  }

  /** tiny bird/duck chirp */
  chirp() {
    this.tone(1100 + Math.random() * 220, 0.08, 0.026);
  }

  /** friendly two-tone car horn */
  horn() {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 820;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.032, t + 0.025);
    g.gain.setValueAtTime(0.03, t + 0.14);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    filter.connect(g).connect(this.sfxBus);
    for (const f of [330, 392]) {
      const o = this.ctx.createOscillator();
      o.type = "triangle";
      o.frequency.value = f;
      o.connect(filter);
      o.start(t);
      o.stop(t + 0.24);
    }
  }

  /** one-shot tyre screech for hard braking */
  screech(intensity = 0.7) {
    if (!this.ctx || !this.sfxBus || !this.noiseBuf) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = this.ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.setValueAtTime(1150, t);
    f.frequency.exponentialRampToValueAtTime(760, t + 0.28);
    f.Q.value = 1.25;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05 * intensity, t + 0.035);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
    src.connect(f).connect(g).connect(this.sfxBus);
    src.start(t);
    src.stop(t + 0.36);
  }

  chord() {
    [392.0, 493.88, 659.25].forEach((f, i) => {
      window.setTimeout(() => this.tone(f, 0.36, 0.036), i * 80);
    });
  }

  /** phone ringtone: two quick tone pairs, like an old handset */
  ring() {
    [0, 90, 420, 510].forEach((delay, i) => {
      window.setTimeout(() => this.tone(i % 2 ? 659.25 : 523.25, 0.13, 0.03), delay);
    });
  }

  /** pager-style incident alarm: descending urgent beeps */
  alarm() {
    [587.33, 493.88, 587.33, 493.88].forEach((f, i) => {
      window.setTimeout(() => this.tone(f, 0.15, 0.038, "triangle"), i * 170);
    });
  }

  /** looping filtered-noise rain bed; level 0 stops it */
  setRain(level: number) {
    if (!ENABLE_CONTINUOUS_AUDIO) return;
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
      f.type = "bandpass";
      f.frequency.value = 620;
      f.Q.value = 0.55;
      const g = this.ctx.createGain();
      g.gain.value = 0.0001;
      src.connect(f).connect(g).connect(this.ambientBus ?? this.master!);
      src.start();
      this.rainSrc = src;
      this.rainGain = g;
    }
    this.rainGain!.gain.setTargetAtTime(0.025 * level, t, 1.2);
  }

  /**
   * Night ambience bed, toggled by DayNightSystem's `night` cycle interval — the
   * reference ties ambient loops to day-cycle events the same way. A soft
   * tremolo-pulsed bandpass-noise "crickets" wash, gated ON only after dark so
   * the daytime world stays clean (unlike the always-on beds we keep disabled).
   */
  setNightAmbience(active: boolean) {
    if (!this.ctx || !this.ambientBus || active === this.cricketsOn) return;
    this.cricketsOn = active;
    const t = this.ctx.currentTime;
    if (active) {
      if (!this.crickets) this.crickets = this.buildCrickets(this.ctx, this.ambientBus);
      this.crickets.gain.cancelScheduledValues(t);
      this.crickets.gain.linearRampToValueAtTime(AMBIENCE_LEVEL, t + 2.5);
    } else if (this.crickets) {
      this.crickets.gain.cancelScheduledValues(t);
      this.crickets.gain.linearRampToValueAtTime(0.0001, t + 2.5);
    }
  }

  private buildCrickets(ctx: AudioContext, out: GainNode): { gain: AudioParam; stop: () => void } {
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    src.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 4600;
    bp.Q.value = 14;
    // tremolo: a ~9 Hz pulse gives the chirpy rhythm
    const trem = ctx.createGain();
    trem.gain.value = 0.5;
    const lfo = ctx.createOscillator();
    lfo.type = "triangle";
    lfo.frequency.value = 9;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.5;
    const gain = ctx.createGain();
    gain.gain.value = 0.0001;
    lfo.connect(lfoGain).connect(trem.gain);
    src.connect(bp).connect(trem).connect(gain).connect(out);
    src.start();
    lfo.start();
    return {
      gain: gain.gain,
      stop: () => {
        try {
          src.stop();
          lfo.stop();
        } catch {
          /* noop */
        }
      },
    };
  }

  private tone(freq: number, dur: number, peak = TONE_PEAK, type: OscillatorType = "sine") {
    if (!this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.035);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.sfxBus);
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
      d[i] = last * 1.5;
    }
    return buf;
  }

  private buildEngine(ctx: AudioContext, out: GainNode) {
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = 60;
    const sub = ctx.createOscillator();
    sub.type = "sine";
    sub.frequency.value = 30;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 300;
    const gain = ctx.createGain();
    gain.gain.value = 0.018;
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
    filter.frequency.value = 1050;
    filter.Q.value = 1.1;
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
    filter.type = "bandpass";
    filter.frequency.value = 520;
    filter.Q.value = 0.7;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    src.connect(filter).connect(gain).connect(out);
    src.start();
    this.windGain = gain;
  }

  private buildPad(ctx: AudioContext, out: GainNode, area: AudioLayerConfig) {
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 650;
    const padGain = ctx.createGain();
    padGain.gain.value = PAD_LEVEL * area.volume;
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
    af.frequency.value = 520;
    const ag = ctx.createGain();
    ag.gain.value = AMBIENCE_LEVEL;
    src.connect(af).connect(ag).connect(out);
    src.start();
    this.ambFilter = af;
    this.ambGain = ag;
  }
}
