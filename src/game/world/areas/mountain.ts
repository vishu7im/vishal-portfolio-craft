import type { AreaDef, CollectibleDef, PortfolioAnchor, PropInstance } from "../../types";
import { areaPalette } from "../../config/palette";
import { mulberry32, roadCross, scatter } from "../scatter";

// Chapters 11–13 — Summit HQ & the Future. The end of the Career Road: the
// Tech Lead HQ, the ongoing B.Tech, goal flags, and the locked Future City
// gate where the road runs out — for now.

const C = { x: 8100, y: 6000 };
const keepOut = roadCross(C.x, C.y, 150);

export const mountainArea: AreaDef = {
  id: "mountain",
  name: "Summit HQ",
  subtitle: "Chapters 11–13 — the road ahead",
  order: 8,
  center: C,
  footprint: { w: 2400, h: 2100 },
  palette: areaPalette("mountain"),
  careerTheme: "Tech lead today, Future City tomorrow",
  audio: {
    pad: [196.0, 261.63, 392.0],
    ambience: ["wind", "shimmer"],
    motif: [784.0, 1046.5],
    volume: 0.42,
  },
};

const rng = mulberry32(707);
const anchorAvoid = [
  { x: C.x - 650, y: C.y - 500, r: 220 },
  { x: C.x + 650, y: C.y - 450, r: 220 },
  { x: C.x - 500, y: C.y + 550, r: 220 },
  { x: C.x - 350, y: C.y - 250, r: 200 },
  { x: C.x + 800, y: C.y + 600, r: 240 },
];

export const mountainProps: PropInstance[] = [
  ...scatter("rock", 26, { x: C.x, y: C.y, w: 2300, h: 2000 }, rng, { keepOut, avoid: anchorAvoid, scale: [0.8, 1.7] }),
  ...scatter("pine", 20, { x: C.x, y: C.y, w: 2300, h: 2000 }, rng, { keepOut, avoid: anchorAvoid, scale: [0.8, 1.2] }),
  ...scatter("tent", 6, { x: C.x, y: C.y, w: 1900, h: 1500 }, rng, { keepOut, avoid: anchorAvoid }),
  { id: "mtn-ramp", kind: "ramp", x: C.x + 550, y: C.y + 500, physics: "decor" },
  { id: "mtn-sign", kind: "sign", x: C.x - 750, y: C.y + 700, physics: "pushable" },
];

export const mountainAnchors: PortfolioAnchor[] = [
  {
    id: "anchor-hq",
    areaId: "mountain",
    x: C.x - 350,
    y: C.y - 250,
    radius: 170,
    label: "Tech Lead HQ",
    content: { contentKind: "profile" },
    building: { kind: "hq", scale: 1.1, reaction: "lights-up" },
  },
  {
    id: "anchor-edu-bits",
    areaId: "mountain",
    x: C.x - 650,
    y: C.y - 500,
    radius: 165,
    label: "Night School — B.Tech in AI & ML",
    content: { contentKind: "education", ref: "1" },
    building: { kind: "school", scale: 0.8, reaction: "lights-up" },
  },
  {
    id: "anchor-goal-agents",
    areaId: "mountain",
    x: C.x + 650,
    y: C.y - 450,
    radius: 165,
    label: "Summit: Agent systems",
    content: { contentKind: "goal", ref: "goal-agents" },
    building: { kind: "flag", scale: 1.6, reaction: "lights-up" },
  },
  {
    id: "anchor-goal-oss",
    areaId: "mountain",
    x: C.x - 500,
    y: C.y + 550,
    radius: 165,
    label: "Summit: Open-source & scale",
    content: { contentKind: "goal", ref: "goal-oss" },
    building: { kind: "flag", scale: 1.6, reaction: "lights-up" },
  },
  {
    id: "anchor-future-gate",
    areaId: "mountain",
    x: C.x + 800,
    y: C.y + 600,
    radius: 190,
    label: "Future City — coming soon",
    content: { contentKind: "goal", ref: "goal-future" },
    building: { kind: "futureGate", scale: 1.0, reaction: "hologram" },
  },
];

export const mountainCollectibles: CollectibleDef[] = [
  { id: "c-mtn-1", kind: "coin", x: C.x, y: C.y - 350, value: 5 },
  { id: "c-mtn-2", kind: "coin", x: C.x, y: C.y - 550, value: 5 },
  { id: "c-mtn-duck", kind: "duck", x: C.x - 800, y: C.y - 550, value: 15, secret: true },
  // stunt-jump reward arc off the ramp (hit the ramp, sail through the coins)
  { id: "c-mtn-jump-1", kind: "coin", x: C.x + 400, y: C.y + 500, value: 5 },
  { id: "c-mtn-jump-2", kind: "coin", x: C.x + 260, y: C.y + 500, value: 5 },
  { id: "c-mtn-jump-3", kind: "coin", x: C.x + 120, y: C.y + 500, value: 5 },
  { id: "c-mtn-jump-4", kind: "coin", x: C.x - 20, y: C.y + 500, value: 5 },
  { id: "c-mtn-jump-core", kind: "ai-core", x: C.x - 160, y: C.y + 500, value: 30 },
];
