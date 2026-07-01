import type { AreaDef, CollectibleDef, PortfolioAnchor, PropInstance } from "../../types";
import { areaPalette } from "../../config/palette";
import { mulberry32, roadCross, scatter } from "../scatter";

// Summit Trail — future goals. Rocky switchbacks, pines and tents, with three
// summit flags marking what's still to come.

const C = { x: 1500, y: 6000 };
const keepOut = roadCross(C.x, C.y, 150);

export const mountainArea: AreaDef = {
  id: "mountain",
  name: "Summit Trail",
  subtitle: "What's still to come",
  order: 6,
  center: C,
  footprint: { w: 2400, h: 2100 },
  palette: areaPalette("mountain"),
  careerTheme: "Goals & ambitions",
  audio: {
    pad: [196.0, 261.63, 392.0],
    ambience: ["wind", "shimmer"],
    motif: [784.0, 1046.5],
    volume: 0.42,
  },
};

const rng = mulberry32(707);
const anchorAvoid = [
  { x: 850, y: 5500, r: 220 },
  { x: 2150, y: 5550, r: 220 },
  { x: 1000, y: 6550, r: 220 },
];

export const mountainProps: PropInstance[] = [
  ...scatter("rock", 26, { x: C.x, y: C.y, w: 2300, h: 2000 }, rng, { keepOut, avoid: anchorAvoid, scale: [0.8, 1.7] }),
  ...scatter("pine", 20, { x: C.x, y: C.y, w: 2300, h: 2000 }, rng, { keepOut, avoid: anchorAvoid, scale: [0.8, 1.2] }),
  ...scatter("tent", 6, { x: C.x, y: C.y, w: 1900, h: 1500 }, rng, { keepOut, avoid: anchorAvoid }),
  { id: "mtn-ramp", kind: "ramp", x: 2050, y: 6500, physics: "decor" },
  { id: "mtn-sign", kind: "sign", x: 900, y: 6550, physics: "pushable" },
];

export const mountainAnchors: PortfolioAnchor[] = [
  {
    id: "anchor-goal-btech",
    areaId: "mountain",
    x: 850,
    y: 5500,
    radius: 165,
    label: "Summit: B.Tech in AI & ML",
    content: { contentKind: "goal", ref: "goal-btech" },
    building: { kind: "flag", scale: 1.6, reaction: "lights-up" },
  },
  {
    id: "anchor-goal-agents",
    areaId: "mountain",
    x: 2150,
    y: 5550,
    radius: 165,
    label: "Summit: Agent systems",
    content: { contentKind: "goal", ref: "goal-agents" },
    building: { kind: "flag", scale: 1.6, reaction: "lights-up" },
  },
  {
    id: "anchor-goal-oss",
    areaId: "mountain",
    x: 1000,
    y: 6550,
    radius: 165,
    label: "Summit: Open-source & scale",
    content: { contentKind: "goal", ref: "goal-oss" },
    building: { kind: "flag", scale: 1.6, reaction: "lights-up" },
  },
];

export const mountainCollectibles: CollectibleDef[] = [
  { id: "c-mtn-1", kind: "coin", x: 1500, y: 5650, value: 5 },
  { id: "c-mtn-2", kind: "coin", x: 1500, y: 5450, value: 5 },
  { id: "c-mtn-duck", kind: "duck", x: 700, y: 5450, value: 15, secret: true },
  // stunt-jump reward arc off the ramp (hit the ramp, sail through the coins)
  { id: "c-mtn-jump-1", kind: "coin", x: 1900, y: 6500, value: 5 },
  { id: "c-mtn-jump-2", kind: "coin", x: 1760, y: 6500, value: 5 },
  { id: "c-mtn-jump-3", kind: "coin", x: 1620, y: 6500, value: 5 },
  { id: "c-mtn-jump-4", kind: "coin", x: 1480, y: 6500, value: 5 },
  { id: "c-mtn-jump-core", kind: "ai-core", x: 1340, y: 6500, value: 30 },
];
