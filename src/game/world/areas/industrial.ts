import type { AreaDef, CollectibleDef, PortfolioAnchor, PropInstance } from "../../types";
import { areaPalette } from "../../config/palette";
import { mulberry32, roadCross, scatter } from "../scatter";

// The Works — heavy backend platforms. Silos, barrels and crates around three
// production plants: bnbMEhome, EasySupply, Aaxel.

const C = { x: 4800, y: 6000 };
const keepOut = roadCross(C.x, C.y, 150);

export const industrialArea: AreaDef = {
  id: "industrial",
  name: "The Works",
  subtitle: "Backends that carry weight",
  order: 7,
  center: C,
  footprint: { w: 2600, h: 2100 },
  palette: areaPalette("industrial"),
  careerTheme: "Infra-heavy backend platforms",
  audio: {
    pad: [130.81, 174.61, 220.0],
    ambience: ["machinery", "drone"],
    volume: 0.42,
  },
};

const rng = mulberry32(808);
const anchorAvoid = [
  { x: 4150, y: 5500, r: 240 },
  { x: 5450, y: 5500, r: 240 },
  { x: 5450, y: 6550, r: 220 },
];

export const industrialProps: PropInstance[] = [
  ...scatter("silo", 8, { x: C.x, y: C.y, w: 2300, h: 1900 }, rng, { keepOut, avoid: anchorAvoid, scale: [0.8, 1.2] }),
  ...scatter("barrel", 16, { x: C.x, y: C.y, w: 2300, h: 1900 }, rng, { physics: "destructible", keepOut, avoid: anchorAvoid }),
  ...scatter("crate", 14, { x: C.x, y: C.y, w: 2300, h: 1900 }, rng, { physics: "destructible", keepOut, avoid: anchorAvoid }),
  ...scatter("cone", 10, { x: C.x, y: C.y, w: 1900, h: 1500 }, rng, { physics: "pushable", keepOut }),
  { id: "ind-sign", kind: "sign", x: 4050, y: 6550, physics: "pushable" },
];

export const industrialAnchors: PortfolioAnchor[] = [
  {
    id: "anchor-proj-bnb",
    areaId: "industrial",
    x: 4150,
    y: 5500,
    radius: 170,
    label: "bnbMEhome plant",
    content: { contentKind: "project", ref: "6" },
    building: { kind: "building", scale: 1.05, reaction: "screens-on" },
  },
  {
    id: "anchor-proj-easysupply",
    areaId: "industrial",
    x: 5450,
    y: 5500,
    radius: 170,
    label: "EasySupply plant",
    content: { contentKind: "project", ref: "7" },
    building: { kind: "building", scale: 1.0, reaction: "screens-on" },
  },
  {
    id: "anchor-proj-aaxel",
    areaId: "industrial",
    x: 5450,
    y: 6550,
    radius: 165,
    label: "Aaxel Insurance plant",
    content: { contentKind: "project", ref: "8" },
    building: { kind: "building", scale: 0.95, reaction: "screens-on" },
  },
];

export const industrialCollectibles: CollectibleDef[] = [
  { id: "c-ind-1", kind: "coin", x: 4650, y: 6000, value: 5 },
  { id: "c-ind-2", kind: "coin", x: 4950, y: 6000, value: 5 },
  { id: "c-ind-chip", kind: "chip", x: 4100, y: 5500, value: 20, secret: true },
  { id: "c-ind-core", kind: "ai-core", x: 5450, y: 6550, value: 30, secret: true },
];
