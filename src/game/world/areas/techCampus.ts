import type { AreaDef, CollectibleDef, PortfolioAnchor, PropInstance } from "../../types";
import { areaPalette } from "../../config/palette";
import { mulberry32, roadCross, scatter } from "../scatter";

// Chapter 2 — School Days (JNV Jind, 2016–2020). The schoolyard where it
// clicked, plus Admit Easy — the project that closed the loop on admissions.

const C = { x: 4800, y: 1400 };
const keepOut = roadCross(C.x, C.y, 150);

export const techCampusArea: AreaDef = {
  id: "tech-campus",
  name: "The School Grounds",
  subtitle: "Chapter 2 — school days",
  order: 1,
  center: C,
  footprint: { w: 2700, h: 2300 },
  palette: areaPalette("tech-campus"),
  careerTheme: "School (JNV Jind, 2016–2020)",
  audio: {
    pad: [164.81, 246.94, 329.63],
    ambience: ["birds", "shimmer"],
    motif: [659.25, 783.99],
    volume: 0.44,
  },
};

const rng = mulberry32(505);
const anchorAvoid = [
  { x: C.x - 650, y: C.y - 550, r: 220 },
  { x: C.x + 650, y: C.y + 550, r: 220 },
];

export const techCampusProps: PropInstance[] = [
  ...scatter("tree", 22, { x: C.x, y: C.y, w: 2500, h: 2100 }, rng, { keepOut, avoid: anchorAvoid, scale: [0.8, 1.15] }),
  ...scatter("lamp", 12, { x: C.x, y: C.y, w: 2300, h: 1900 }, rng, { keepOut, avoid: anchorAvoid }),
  ...scatter("bush", 18, { x: C.x, y: C.y, w: 2300, h: 1900 }, rng, { physics: "decor", keepOut }),
  ...scatter("cone", 8, { x: C.x, y: C.y, w: 1800, h: 1400 }, rng, { physics: "pushable", keepOut }),
  { id: "tech-sign", kind: "sign", x: C.x - 750, y: C.y - 700, physics: "pushable" },
  { id: "tech-billboard", kind: "billboard", x: C.x - 1200, y: C.y - 300, physics: "static" },
];

export const techCampusAnchors: PortfolioAnchor[] = [
  {
    id: "anchor-edu-school",
    areaId: "tech-campus",
    x: C.x - 650,
    y: C.y - 550,
    radius: 170,
    label: "The School (JNV Jind)",
    content: { contentKind: "education", ref: "3" },
    building: { kind: "school", scale: 1.0, reaction: "lights-up" },
  },
  {
    id: "anchor-proj-admiteasy",
    areaId: "tech-campus",
    x: C.x + 650,
    y: C.y + 550,
    radius: 165,
    label: "Admit Easy platform",
    content: { contentKind: "project", ref: "2" },
    building: { kind: "building", scale: 0.9, reaction: "screens-on" },
  },
];

export const techCampusCollectibles: CollectibleDef[] = [
  { id: "c-tech-1", kind: "coin", x: C.x - 150, y: C.y, value: 5 },
  { id: "c-tech-2", kind: "coin", x: C.x + 150, y: C.y, value: 5 },
  { id: "c-tech-chip", kind: "chip", x: C.x + 1100, y: C.y - 500, value: 20, secret: true },
  { id: "c-tech-duck", kind: "duck", x: C.x - 700, y: C.y + 850, value: 15, secret: true },
];
