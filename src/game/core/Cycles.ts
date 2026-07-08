// A reusable keyframe-interpolation engine, ported from Bruno Simon's folio-2025
// (`sources/Game/Cycles/Cycles.js`, MIT © 2025 Bruno Simon). The reference uses
// this one class for both its day/night mood and its seasonal `YearCycles`: you
// declare keyframes of `{ properties, stop }` over a normalized 0..1 progress and
// it smoothstep-interpolates numbers and colors between them, firing punctual and
// interval events as the playhead crosses thresholds. That continuous recolor is
// what makes the reference world feel alive rather than statically lit.
//
// This is a pure-JS pattern with no three/WebGPU dependency, so it ports cleanly:
// we drop the GSAP override + Tweakpane debug wiring, swap `THREE.Color` for a
// plain `{ r, g, b }`, and drive it from our own elapsed-time clock instead of the
// reference's `Date.now()`-based absolute progress. See docs/REDESIGN_ROADMAP.md
// (Phase 8); DayNightSystem is the first consumer.

import { Events } from "./Events";
import { lerp, smoothstep } from "./maths";

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export type CycleValue = number | RGB;

/** One keyframe: property values held at a normalized `stop` (0..1) on the loop. */
export interface CycleStep {
  stop: number;
  properties: Record<string, CycleValue>;
}

/** Fires `name` with `[true]` on entering the window and `[false]` on leaving. */
export interface IntervalDescription {
  name: string;
  start: number;
  end: number;
}

/** Fires `name` once each loop as the playhead crosses `progress` (ascending). */
export interface PunctualDescription {
  name: string;
  progress: number;
}

export interface CyclesOptions {
  /** Real-time length of one full loop, in milliseconds. */
  durationMs: number;
  keyframes: CycleStep[];
  intervals?: IntervalDescription[];
  punctual?: PunctualDescription[];
  /** Where on the loop to begin (0..1); defaults to 0. */
  startProgress?: number;
}

function isRGB(value: CycleValue): value is RGB {
  return typeof value === "object";
}

export class Cycles {
  /** Ordered pub/sub for this cycle's punctual + interval events. */
  readonly events = new Events();
  /** Current normalized playhead, 0..1. */
  progress: number;

  private readonly durationMs: number;
  private elapsedMs: number;
  private readonly steps: CycleStep[];
  private readonly keys: string[];
  private readonly values: Record<string, CycleValue> = {};
  private readonly intervals: Array<IntervalDescription & { inInterval: boolean }>;
  private readonly punctual: PunctualDescription[];

  constructor(options: CyclesOptions) {
    this.durationMs = options.durationMs;
    const start = ((options.startProgress ?? 0) % 1 + 1) % 1;
    this.elapsedMs = start * this.durationMs;
    this.progress = start;
    this.steps = this.buildSteps(options.keyframes);
    this.keys = Object.keys(options.keyframes[0].properties);
    this.intervals = (options.intervals ?? []).map((iv) => ({ ...iv, inInterval: false }));
    this.punctual = options.punctual ?? [];
    this.evaluate(this.progress); // seed values so getters are valid before first tick
  }

  /** Advance the playhead by `deltaMs` of wall-clock time, re-interpolating. */
  advance(deltaMs: number) {
    const prev = this.progress;
    this.elapsedMs = (this.elapsedMs + deltaMs) % this.durationMs;
    if (this.elapsedMs < 0) this.elapsedMs += this.durationMs;
    const next = this.elapsedMs / this.durationMs;
    this.fireEvents(prev, next);
    this.progress = next;
    this.evaluate(next);
  }

  /** Interpolated numeric property at the current playhead. */
  num(key: string): number {
    return this.values[key] as number;
  }

  /** Interpolated color property at the current playhead. */
  color(key: string): RGB {
    return this.values[key] as RGB;
  }

  // --- internals ----------------------------------------------------------

  // Mirror the reference's "fake step" trick: pad the loop with wrap-around
  // copies so any progress in [0,1] always has a previous and next step, letting
  // the last keyframe smoothly interpolate back into the first.
  private buildSteps(input: CycleStep[]): CycleStep[] {
    const steps = input.map((s) => ({ stop: s.stop, properties: s.properties }));
    const first = steps[0];
    const last = steps[steps.length - 1];
    if (last.stop < 1) steps.push({ ...first, stop: 1 + first.stop });
    if (first.stop > 0) steps.unshift({ ...last, stop: -(1 - last.stop) });
    return steps;
  }

  private fireEvents(prev: number, next: number) {
    for (const p of this.punctual) {
      if (next >= p.progress && prev < p.progress) this.events.trigger(p.name);
    }
    for (const iv of this.intervals) {
      const inside = next > iv.start && next < iv.end;
      if (inside !== iv.inInterval) {
        iv.inInterval = inside;
        this.events.trigger(iv.name, [inside]);
      }
    }
  }

  private evaluate(progress: number) {
    let prevIndex = 0;
    for (let i = 0; i < this.steps.length; i++) {
      if (this.steps[i].stop <= progress) prevIndex = i;
    }
    const nextIndex = (prevIndex + 1) % this.steps.length;
    const a = this.steps[prevIndex];
    const b = this.steps[nextIndex];
    const mix = smoothstep(progress, a.stop, b.stop);

    for (const key of this.keys) {
      const av = a.properties[key];
      const bv = b.properties[key];
      if (isRGB(av) && isRGB(bv)) {
        this.values[key] = {
          r: lerp(av.r, bv.r, mix),
          g: lerp(av.g, bv.g, mix),
          b: lerp(av.b, bv.b, mix),
        };
      } else {
        this.values[key] = lerp(av as number, bv as number, mix);
      }
    }
  }
}
