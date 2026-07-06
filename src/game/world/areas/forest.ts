import type { AreaDef, CollectibleDef, PortfolioAnchor, PropInstance } from "../../types";
import { areaPalette } from "../../config/palette";
import { mulberry32, roadCross, scatter } from "../scatter";

// Chapter 1 — Home. Where the story starts: a small house in the woods, the
// profile cabin, and the first stretch of the Career Road heading east.

const C = { x: 1500, y: 1400 };
const keepOut = roadCross(C.x, C.y, 150);

export const forestArea: AreaDef = {
  id: "forest",
  name: "Rootwood Home",
  subtitle: "Chapter 1 — where it all began",
  order: 0,
  center: C,
  footprint: { w: 2600, h: 2400 },
  palette: areaPalette("forest"),
  careerTheme: "Home & childhood",
  audio: {
    pad: [130.81, 196.0, 261.63],
    ambience: ["wind", "birds", "insects"],
    motif: [523.25, 659.25, 783.99],
    volume: 0.5,
  },
};

const rng = mulberry32(101);
const anchorAvoid = [
  { x: C.x - 600, y: C.y - 550, r: 220 },
  { x: C.x + 650, y: C.y + 600, r: 200 },
];

export const forestProps: PropInstance[] = [
  ...scatter("tree", 54, { x: C.x, y: C.y, w: 2500, h: 2300 }, rng, {
    scale: [0.85, 1.4],
    keepOut,
    avoid: anchorAvoid,
  }),
  ...scatter("pine", 22, { x: C.x - 500, y: C.y - 700, w: 1600, h: 1400 }, rng, { scale: [0.9, 1.3], keepOut, avoid: anchorAvoid }),
  ...scatter("bush", 26, { x: C.x, y: C.y, w: 2200, h: 2000 }, rng, { physics: "decor", keepOut }),
  ...scatter("rock", 9, { x: C.x, y: C.y, w: 2200, h: 2000 }, rng, { keepOut, avoid: anchorAvoid }),
  { id: "forest-sign", kind: "sign", x: C.x + 600, y: C.y + 650, physics: "pushable" },
];

export const forestAnchors: PortfolioAnchor[] = [
  {
    id: "anchor-profile",
    areaId: "forest",
    x: C.x - 600,
    y: C.y - 550,
    radius: 175,
    label: "Home — meet the Driver",
    content: { contentKind: "profile" },
    building: { kind: "house", scale: 1.0, reaction: "lights-up" },
  },
];

export const forestCollectibles: CollectibleDef[] = [
  { id: "c-forest-1", kind: "coin", x: C.x, y: C.y - 400, value: 5 },
  { id: "c-forest-2", kind: "coin", x: C.x + 150, y: C.y - 450, value: 5 },
  { id: "c-forest-3", kind: "coin", x: C.x + 300, y: C.y - 450, value: 5 },
  { id: "c-forest-chip", kind: "chip", x: C.x - 950, y: C.y + 250, value: 20, secret: true },
  { id: "c-forest-duck", kind: "duck", x: C.x + 850, y: C.y + 400, value: 15, secret: true },
];
