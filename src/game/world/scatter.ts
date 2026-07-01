import type { PropInstance, PropKind, PropPhysics } from "../types";

// Deterministic scatter helpers so hand-authored areas can be dressed with
// natural-looking clutter without listing every coordinate.

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface ScatterOpts {
  physics?: PropPhysics;
  scale?: [number, number];
  /** avoid circular clearings (spawn, anchors) */
  avoid?: { x: number; y: number; r: number }[];
  /** reject any position for which this returns true (e.g. road corridors) */
  keepOut?: (x: number, y: number) => boolean;
}

/** Builds a keep-out predicate for the axis-aligned road cross through a centre. */
export function roadCross(colX: number, rowY: number, half = 140) {
  return (x: number, y: number) => Math.abs(x - colX) < half || Math.abs(y - rowY) < half;
}

let uid = 0;

export function scatter(
  kind: PropKind,
  count: number,
  region: { x: number; y: number; w: number; h: number },
  rng: () => number,
  opts: ScatterOpts = {}
): PropInstance[] {
  const out: PropInstance[] = [];
  const physics = opts.physics ?? "static";
  const [smin, smax] = opts.scale ?? [0.9, 1.15];
  let attempts = 0;
  while (out.length < count && attempts < count * 12) {
    attempts++;
    const x = region.x + (rng() - 0.5) * region.w;
    const y = region.y + (rng() - 0.5) * region.h;
    if (opts.avoid?.some((a) => Math.hypot(x - a.x, y - a.y) < a.r)) continue;
    if (opts.keepOut?.(x, y)) continue;
    out.push({
      id: `${kind}-${uid++}`,
      kind,
      x,
      y,
      rotation: (rng() - 0.5) * 0.4,
      scale: smin + rng() * (smax - smin),
      physics,
    });
  }
  return out;
}
