import type { AreaDef, CollectibleDef, PortfolioAnchor, PropInstance } from "../../types";
import { areaPalette } from "../../config/palette";
import { mulberry32, roadCross, scatter } from "../scatter";

// The Boardwalk — side quests & clones written for fun. Palm trees, umbrellas, a
// splashable lagoon, dev jokes, and a client's testimonial.

const C = { x: 4800, y: 3700 };
const keepOut = roadCross(C.x, C.y, 150);

export const beachArea: AreaDef = {
  id: "beach",
  name: "The Boardwalk",
  subtitle: "Built just for fun",
  order: 4,
  center: C,
  footprint: { w: 2600, h: 2200 },
  palette: areaPalette("beach"),
  careerTheme: "Clones & code for fun",
  audio: {
    pad: [174.61, 220.0, 293.66],
    ambience: ["waves", "birds"],
    motif: [587.33, 698.46, 880.0],
    volume: 0.46,
  },
};

const rng = mulberry32(606);
const anchorAvoid = [
  { x: 4150, y: 3200, r: 220 },
  { x: 5450, y: 3200, r: 220 },
  { x: 4150, y: 4250, r: 220 },
  { x: 5450, y: 4250, r: 200 },
];

export const beachProps: PropInstance[] = [
  ...scatter("palm", 20, { x: C.x, y: C.y, w: 2500, h: 2000 }, rng, { keepOut, avoid: anchorAvoid, scale: [0.85, 1.25] }),
  ...scatter("umbrella", 10, { x: C.x, y: C.y, w: 2200, h: 1700 }, rng, { keepOut, avoid: anchorAvoid }),
  ...scatter("bush", 10, { x: C.x, y: C.y, w: 2200, h: 1800 }, rng, { physics: "decor", keepOut }),
  ...scatter("cone", 8, { x: C.x, y: C.y, w: 1800, h: 1400 }, rng, { physics: "pushable", keepOut }),
  // splashable lagoon
  { id: "beach-lagoon-1", kind: "puddle", x: 5950, y: 4250, scale: 3.4, physics: "decor" },
  { id: "beach-lagoon-2", kind: "puddle", x: 3700, y: 3200, scale: 2.6, physics: "decor" },
  { id: "beach-sign", kind: "sign", x: 4000, y: 4250, physics: "pushable" },
];

export const beachAnchors: PortfolioAnchor[] = [
  {
    id: "anchor-proj-vercel",
    areaId: "beach",
    x: 4150,
    y: 3200,
    radius: 165,
    label: "Vercel Clone stand",
    content: { contentKind: "project", ref: "4" },
    building: { kind: "building", scale: 0.85, reaction: "screens-on" },
  },
  {
    id: "anchor-proj-spotify",
    areaId: "beach",
    x: 5450,
    y: 3200,
    radius: 165,
    label: "Spotify Clone stand",
    content: { contentKind: "project", ref: "5" },
    building: { kind: "building", scale: 0.85, reaction: "screens-on" },
  },
  {
    id: "anchor-proj-taskexpense",
    areaId: "beach",
    x: 4150,
    y: 4250,
    radius: 160,
    label: "Task & Expense hut",
    content: { contentKind: "project", ref: "9" },
    building: { kind: "building", scale: 0.8, reaction: "screens-on" },
  },
  {
    id: "anchor-testimonial-sarah",
    areaId: "beach",
    x: 5450,
    y: 4250,
    radius: 155,
    label: "A word from a client",
    content: { contentKind: "testimonial", ref: "2" },
    building: { kind: "umbrella", scale: 1.5, reaction: "lights-up" },
  },
];

export const beachCollectibles: CollectibleDef[] = [
  { id: "c-beach-1", kind: "coin", x: 4650, y: 3700, value: 5 },
  { id: "c-beach-2", kind: "coin", x: 4950, y: 3700, value: 5 },
  { id: "c-beach-duck", kind: "duck", x: 5950, y: 4250, value: 15, secret: true },
  { id: "c-beach-keyboard", kind: "keyboard", x: 3700, y: 3200, value: 25, secret: true },
];
