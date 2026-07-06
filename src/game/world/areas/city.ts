import type { AreaDef, CollectibleDef, PortfolioAnchor, PropInstance } from "../../types";
import { areaPalette } from "../../config/palette";
import { mulberry32, roadCross, scatter } from "../scatter";

// Chapter 6 — First Office District (iComply, 2022–2024). The first badge,
// the first standups, and the tools built along the way.

const C = { x: 4800, y: 3700 };
const keepOut = roadCross(C.x, C.y, 150);

export const cityArea: AreaDef = {
  id: "city",
  name: "First Office District",
  subtitle: "Chapter 6 — the first job",
  order: 4,
  center: C,
  footprint: { w: 2400, h: 2100 },
  palette: areaPalette("city"),
  careerTheme: "First job — iComply (2022–2024)",
  audio: {
    pad: [146.83, 220.0, 293.66],
    ambience: ["machinery", "drone"],
    volume: 0.42,
  },
};

const rng = mulberry32(202);
const anchorAvoid = [
  { x: C.x - 650, y: C.y - 600, r: 240 },
  { x: C.x + 650, y: C.y - 550, r: 240 },
  { x: C.x, y: C.y + 700, r: 220 },
];

export const cityProps: PropInstance[] = [
  ...scatter("lamp", 12, { x: C.x, y: C.y, w: 2200, h: 1900 }, rng, { keepOut, avoid: anchorAvoid }),
  ...scatter("cone", 14, { x: C.x, y: C.y, w: 2000, h: 1600 }, rng, { physics: "pushable", keepOut }),
  ...scatter("crate", 10, { x: C.x - 600, y: C.y + 550, w: 800, h: 500 }, rng, { physics: "destructible", keepOut }),
  ...scatter("barrel", 8, { x: C.x + 600, y: C.y + 600, w: 700, h: 500 }, rng, { physics: "destructible", keepOut }),
  { id: "city-sign", kind: "sign", x: C.x - 650, y: C.y + 50, physics: "pushable" },
  { id: "city-cafe", kind: "cafe", x: C.x - 200, y: C.y + 650, physics: "static" },
  { id: "city-billboard", kind: "billboard", x: C.x + 1050, y: C.y - 300, physics: "static" },
  // a cone slalom along the western approach — weave through for style
  ...Array.from({ length: 7 }, (_, i) => ({
    id: `city-slalom-${i}`,
    kind: "cone" as const,
    x: C.x - 1050 + i * 150,
    y: C.y + (i % 2 === 0 ? -70 : 70),
    physics: "pushable" as const,
  })),
];

export const cityAnchors: PortfolioAnchor[] = [
  {
    id: "anchor-exp-icomply",
    areaId: "city",
    x: C.x - 650,
    y: C.y - 600,
    radius: 175,
    label: "iComply Office — the first badge",
    content: { contentKind: "experience", ref: "2" },
    building: { kind: "office", scale: 1.0, reaction: "lights-up" },
  },
  {
    id: "anchor-proj-taskexpense",
    areaId: "city",
    x: C.x + 650,
    y: C.y - 550,
    radius: 165,
    label: "Task & Expense tracker",
    content: { contentKind: "project", ref: "9" },
    building: { kind: "building", scale: 0.9, reaction: "screens-on" },
  },
];

export const cityCollectibles: CollectibleDef[] = [
  { id: "c-city-1", kind: "coin", x: C.x - 150, y: C.y, value: 5 },
  { id: "c-city-2", kind: "coin", x: C.x, y: C.y, value: 5 },
  { id: "c-city-3", kind: "coin", x: C.x + 150, y: C.y, value: 5 },
  { id: "c-city-core", kind: "ai-core", x: C.x + 700, y: C.y + 700, value: 30, secret: true },
];
