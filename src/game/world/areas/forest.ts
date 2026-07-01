import type { AreaDef, CollectibleDef, PortfolioAnchor, PropInstance } from "../../types";
import { areaPalette } from "../../config/palette";
import { mulberry32, roadCross, scatter } from "../scatter";

// The Whispering Woods — origins & education. Profile cabin + two milestone
// stones (diploma, secondary school).

const C = { x: 1500, y: 1400 };
const keepOut = roadCross(C.x, C.y, 150);

export const forestArea: AreaDef = {
  id: "forest",
  name: "The Whispering Woods",
  subtitle: "Where it all began",
  order: 0,
  center: C,
  footprint: { w: 2600, h: 2400 },
  palette: areaPalette("forest"),
  careerTheme: "Origins & education",
  audio: {
    pad: [130.81, 196.0, 261.63],
    ambience: ["wind", "birds", "insects"],
    motif: [523.25, 659.25, 783.99],
    volume: 0.5,
  },
};

const rng = mulberry32(101);
const anchorAvoid = [
  { x: 900, y: 850, r: 220 },
  { x: 2150, y: 900, r: 200 },
  { x: 900, y: 2000, r: 200 },
];

export const forestProps: PropInstance[] = [
  ...scatter("tree", 54, { x: C.x, y: C.y, w: 2500, h: 2300 }, rng, {
    scale: [0.85, 1.4],
    keepOut,
    avoid: anchorAvoid,
  }),
  ...scatter("pine", 22, { x: 1000, y: 700, w: 1600, h: 1400 }, rng, { scale: [0.9, 1.3], keepOut, avoid: anchorAvoid }),
  ...scatter("bush", 26, { x: C.x, y: C.y, w: 2200, h: 2000 }, rng, { physics: "decor", keepOut }),
  ...scatter("rock", 9, { x: C.x, y: C.y, w: 2200, h: 2000 }, rng, { keepOut, avoid: anchorAvoid }),
  { id: "forest-sign", kind: "sign", x: 2100, y: 2050, physics: "pushable" },
];

export const forestAnchors: PortfolioAnchor[] = [
  {
    id: "anchor-profile",
    areaId: "forest",
    x: 900,
    y: 850,
    radius: 175,
    label: "Meet the Driver",
    content: { contentKind: "profile" },
    building: { kind: "building", scale: 0.75, reaction: "lights-up" },
  },
  {
    id: "anchor-edu-diploma",
    areaId: "forest",
    x: 2150,
    y: 900,
    radius: 155,
    label: "Diploma milestone",
    content: { contentKind: "education", ref: "2" },
    building: { kind: "rock", scale: 1.7, reaction: "lights-up" },
  },
  {
    id: "anchor-edu-school",
    areaId: "forest",
    x: 900,
    y: 2000,
    radius: 155,
    label: "School days",
    content: { contentKind: "education", ref: "3" },
    building: { kind: "rock", scale: 1.5, reaction: "lights-up" },
  },
];

export const forestCollectibles: CollectibleDef[] = [
  { id: "c-forest-1", kind: "coin", x: 1500, y: 1000, value: 5 },
  { id: "c-forest-2", kind: "coin", x: 1650, y: 950, value: 5 },
  { id: "c-forest-3", kind: "coin", x: 1800, y: 950, value: 5 },
  { id: "c-forest-chip", kind: "chip", x: 550, y: 1650, value: 20, secret: true },
  { id: "c-forest-duck", kind: "duck", x: 2350, y: 1800, value: 15, secret: true },
];
