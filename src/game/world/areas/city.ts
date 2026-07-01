import type { AreaDef, CollectibleDef, PortfolioAnchor, PropInstance } from "../../types";
import { areaPalette } from "../../config/palette";
import { mulberry32, roadCross, scatter } from "../scatter";

// Shipping District — current work & shipped SaaS. Towers whose screens light up
// (FabricatorOS, MetaOS) and the current role HQ (Edgenroots).

const C = { x: 8100, y: 1500 };
const keepOut = roadCross(C.x, C.y, 150);

export const cityArea: AreaDef = {
  id: "city",
  name: "Shipping District",
  subtitle: "Real, shipped work",
  order: 2,
  center: C,
  footprint: { w: 2400, h: 2100 },
  palette: areaPalette("city"),
  careerTheme: "Current role & SaaS platforms",
  audio: {
    pad: [146.83, 220.0, 293.66],
    ambience: ["machinery", "drone"],
    volume: 0.42,
  },
};

const rng = mulberry32(202);
const anchorAvoid = [
  { x: 7500, y: 900, r: 240 },
  { x: 8750, y: 950, r: 240 },
  { x: 8100, y: 2200, r: 220 },
];

export const cityProps: PropInstance[] = [
  ...scatter("lamp", 12, { x: C.x, y: C.y, w: 2200, h: 1900 }, rng, { keepOut, avoid: anchorAvoid }),
  ...scatter("cone", 14, { x: C.x, y: C.y, w: 2000, h: 1600 }, rng, { physics: "pushable", keepOut }),
  ...scatter("crate", 10, { x: 7500, y: 2050, w: 800, h: 500 }, rng, { physics: "destructible", keepOut }),
  ...scatter("barrel", 8, { x: 8700, y: 900, w: 700, h: 500 }, rng, { physics: "destructible", keepOut }),
  { id: "city-sign", kind: "sign", x: 7450, y: 1550, physics: "pushable" },
];

export const cityAnchors: PortfolioAnchor[] = [
  {
    id: "anchor-proj-fabricator",
    areaId: "city",
    x: 7500,
    y: 900,
    radius: 175,
    label: "Enter FabricatorOS Tower",
    content: { contentKind: "project", ref: "10" },
    building: { kind: "building", scale: 1.15, reaction: "screens-on" },
  },
  {
    id: "anchor-proj-metaos",
    areaId: "city",
    x: 8750,
    y: 950,
    radius: 175,
    label: "Enter MetaOS Tower",
    content: { contentKind: "project", ref: "11" },
    building: { kind: "building", scale: 1.1, reaction: "screens-on" },
  },
  {
    id: "anchor-exp-edgenroots",
    areaId: "city",
    x: 8100,
    y: 2200,
    radius: 165,
    label: "Edgenroots HQ",
    content: { contentKind: "experience", ref: "1" },
    building: { kind: "building", scale: 0.95, reaction: "lights-up" },
  },
];

export const cityCollectibles: CollectibleDef[] = [
  { id: "c-city-1", kind: "coin", x: 7950, y: 1500, value: 5 },
  { id: "c-city-2", kind: "coin", x: 8100, y: 1500, value: 5 },
  { id: "c-city-3", kind: "coin", x: 8250, y: 1500, value: 5 },
  { id: "c-city-core", kind: "ai-core", x: 8800, y: 2200, value: 30, secret: true },
];
