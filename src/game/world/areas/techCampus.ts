import type { AreaDef, CollectibleDef, PortfolioAnchor, PropInstance } from "../../types";
import { areaPalette } from "../../config/palette";
import { mulberry32, roadCross, scatter } from "../scatter";

// Tech Campus — the early role & first web builds. Lecture hall (B.Tech), the
// iComply office, alumni/admission projects, and a mentor's testimonial.

const C = { x: 4800, y: 1400 };
const keepOut = roadCross(C.x, C.y, 150);

export const techCampusArea: AreaDef = {
  id: "tech-campus",
  name: "Tech Campus",
  subtitle: "First commits",
  order: 1,
  center: C,
  footprint: { w: 2700, h: 2300 },
  palette: areaPalette("tech-campus"),
  careerTheme: "Studies & earlier web work",
  audio: {
    pad: [164.81, 246.94, 329.63],
    ambience: ["birds", "shimmer"],
    motif: [659.25, 783.99],
    volume: 0.44,
  },
};

const rng = mulberry32(505);
const anchorAvoid = [
  { x: 4150, y: 850, r: 220 },
  { x: 5450, y: 850, r: 220 },
  { x: 4150, y: 1950, r: 220 },
  { x: 5450, y: 1950, r: 220 },
  { x: 5950, y: 2050, r: 200 },
];

export const techCampusProps: PropInstance[] = [
  ...scatter("tree", 22, { x: C.x, y: C.y, w: 2500, h: 2100 }, rng, { keepOut, avoid: anchorAvoid, scale: [0.8, 1.15] }),
  ...scatter("lamp", 12, { x: C.x, y: C.y, w: 2300, h: 1900 }, rng, { keepOut, avoid: anchorAvoid }),
  ...scatter("bush", 18, { x: C.x, y: C.y, w: 2300, h: 1900 }, rng, { physics: "decor", keepOut }),
  ...scatter("cone", 8, { x: C.x, y: C.y, w: 1800, h: 1400 }, rng, { physics: "pushable", keepOut }),
  { id: "tech-sign", kind: "sign", x: 4050, y: 700, physics: "pushable" },
];

export const techCampusAnchors: PortfolioAnchor[] = [
  {
    id: "anchor-edu-bits",
    areaId: "tech-campus",
    x: 4150,
    y: 850,
    radius: 170,
    label: "The Lecture Hall (B.Tech)",
    content: { contentKind: "education", ref: "1" },
    building: { kind: "building", scale: 1.0, reaction: "lights-up" },
  },
  {
    id: "anchor-exp-icomply",
    areaId: "tech-campus",
    x: 5450,
    y: 850,
    radius: 170,
    label: "iComply Office",
    content: { contentKind: "experience", ref: "2" },
    building: { kind: "building", scale: 0.95, reaction: "lights-up" },
  },
  {
    id: "anchor-proj-alma",
    areaId: "tech-campus",
    x: 4150,
    y: 1950,
    radius: 165,
    label: "Alma Nilokheri portal",
    content: { contentKind: "project", ref: "1" },
    building: { kind: "building", scale: 0.9, reaction: "screens-on" },
  },
  {
    id: "anchor-proj-admiteasy",
    areaId: "tech-campus",
    x: 5450,
    y: 1950,
    radius: 165,
    label: "Admit Easy platform",
    content: { contentKind: "project", ref: "2" },
    building: { kind: "building", scale: 0.9, reaction: "screens-on" },
  },
  {
    id: "anchor-testimonial-tejpal",
    areaId: "tech-campus",
    x: 5950,
    y: 2050,
    radius: 155,
    label: "A word from an alum",
    content: { contentKind: "testimonial", ref: "1" },
    building: { kind: "lamp", scale: 1.4, reaction: "lights-up" },
  },
];

export const techCampusCollectibles: CollectibleDef[] = [
  { id: "c-tech-1", kind: "coin", x: 4650, y: 1400, value: 5 },
  { id: "c-tech-2", kind: "coin", x: 4950, y: 1400, value: 5 },
  { id: "c-tech-chip", kind: "chip", x: 5900, y: 900, value: 20, secret: true },
  { id: "c-tech-duck", kind: "duck", x: 4100, y: 2250, value: 15, secret: true },
];
