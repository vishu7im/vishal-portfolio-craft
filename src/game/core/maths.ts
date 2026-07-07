// Shared pure-math helpers for the game runtime.
//
// Ported near-verbatim from Bruno Simon's folio-2025
// (`sources/Game/utilities/maths.js`, MIT © 2025 Bruno Simon) and typed for our
// codebase. These are the one part of the reference that is stack-agnostic — no
// three/WebGPU dependency — so systems import from here instead of re-rolling
// their own clamp/lerp/remap. See docs/REDESIGN_ROADMAP.md (Phase 1).

export interface Point {
  x: number;
  y: number;
}

export function clamp(input: number, min: number, max: number): number {
  return Math.max(min, Math.min(input, max));
}

export function remap(
  input: number,
  inLow: number,
  inHigh: number,
  outLow: number,
  outHigh: number
): number {
  return ((input - inLow) * (outHigh - outLow)) / (inHigh - inLow) + outLow;
}

export function remapClamp(
  input: number,
  inLow: number,
  inHigh: number,
  outLow: number,
  outHigh: number
): number {
  return clamp(
    ((input - inLow) * (outHigh - outLow)) / (inHigh - inLow) + outLow,
    outLow < outHigh ? outLow : outHigh,
    outLow > outHigh ? outLow : outHigh
  );
}

export function lerp(start: number, end: number, ratio: number): number {
  return (1 - ratio) * start + ratio * end;
}

export function smoothstep(value: number, min: number, max: number): number {
  const x = clamp((value - min) / (max - min), 0, 1);
  return x * x * (3 - 2 * x);
}

export function safeMod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export function signedModDelta(a: number, b: number, mod: number): number {
  let delta = (b - a + mod) % mod;
  if (delta > mod / 2) delta -= mod;
  return delta;
}

const TAU = 2 * Math.PI;
const wrapPi = (a: number) => safeMod(a + Math.PI, TAU) - Math.PI; // → [-π, +π]

/** Signed shortest angular delta from `current` to `target` (radians). */
export function smallestAngle(current: number, target: number): number {
  return wrapPi(target - current);
}

export function dist(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function segmentCircleIntersection(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  cx: number,
  cy: number,
  r: number
): Point[] {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const fx = x1 - cx;
  const fy = y1 - cy;

  const a = dx * dx + dy * dy;
  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - r * r;

  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return [];

  const intersections: Point[] = [];
  const sqrtD = Math.sqrt(discriminant);

  const t1 = (-b - sqrtD) / (2 * a);
  const t2 = (-b + sqrtD) / (2 * a);

  if (t1 >= 0 && t1 <= 1) intersections.push({ x: x1 + t1 * dx, y: y1 + t1 * dy });
  if (t2 >= 0 && t2 <= 1 && discriminant !== 0)
    intersections.push({ x: x1 + t2 * dx, y: y1 + t2 * dy });

  return intersections;
}

export function lineIntersectsCircle(
  p1: Point,
  p2: Point,
  center: Point,
  radius: number
): boolean {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const fx = center.x - p1.x;
  const fy = center.y - p1.y;

  const t = (fx * dx + fy * dy) / (dx * dx + dy * dy);

  let closest: Point;
  if (t < 0) closest = p1;
  else if (t > 1) closest = p2;
  else closest = { x: p1.x + t * dx, y: p1.y + t * dy };

  return dist(closest, center) <= radius;
}

export function pointInPolygon(point: Point, poly: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x,
      yi = poly[i].y;
    const xj = poly[j].x,
      yj = poly[j].y;

    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }
  return inside;
}

export function circleIntersectsPolygon(
  center: Point,
  radius: number,
  poly: Point[]
): boolean {
  for (const p of poly) if (dist(p, center) <= radius) return true;
  for (let i = 0; i < poly.length; i++) {
    const p1 = poly[i];
    const p2 = poly[(i + 1) % poly.length];
    if (lineIntersectsCircle(p1, p2, center, radius)) return true;
  }
  if (pointInPolygon(center, poly)) return true;
  return false;
}
