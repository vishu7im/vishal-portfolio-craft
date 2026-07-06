import type { AreaDef, CollectibleDef, PortfolioAnchor, PropInstance } from "../../types";
import { areaPalette } from "../../config/palette";
import { mulberry32, roadCross, scatter } from "../scatter";

// Chapter 7 — Backend City (Edgenroots, 2024–). Heavy plants and pipelines:
// the current-role HQ plus the production backends EasySupply and Aaxel.

const C = { x: 1500, y: 3700 };
const keepOut = roadCross(C.x, C.y, 150);

export const industrialArea: AreaDef = {
  id: "industrial",
  name: "Backend City",
  subtitle: "Chapter 7 — backends that carry weight",
  order: 5,
  center: C,
  footprint: { w: 2600, h: 2100 },
  palette: areaPalette("industrial"),
  careerTheme: "Backend engineering at Edgenroots (2024–)",
  audio: {
    pad: [130.81, 174.61, 220.0],
    ambience: ["machinery", "drone"],
    volume: 0.42,
  },
};

const rng = mulberry32(808);
const anchorAvoid = [
  { x: C.x - 650, y: C.y - 500, r: 240 },
  { x: C.x + 650, y: C.y - 500, r: 240 },
  { x: C.x + 650, y: C.y + 550, r: 220 },
];

export const industrialProps: PropInstance[] = [
  ...scatter("silo", 8, { x: C.x, y: C.y, w: 2300, h: 1900 }, rng, { keepOut, avoid: anchorAvoid, scale: [0.8, 1.2] }),
  ...scatter("barrel", 16, { x: C.x, y: C.y, w: 2300, h: 1900 }, rng, { physics: "destructible", keepOut, avoid: anchorAvoid }),
  ...scatter("crate", 14, { x: C.x, y: C.y, w: 2300, h: 1900 }, rng, { physics: "destructible", keepOut, avoid: anchorAvoid }),
  ...scatter("cone", 10, { x: C.x, y: C.y, w: 1900, h: 1500 }, rng, { physics: "pushable", keepOut }),
  { id: "ind-sign", kind: "sign", x: C.x - 750, y: C.y + 550, physics: "pushable" },
];

export const industrialAnchors: PortfolioAnchor[] = [
  {
    id: "anchor-exp-edgenroots",
    areaId: "industrial",
    x: C.x - 650,
    y: C.y - 500,
    radius: 175,
    label: "Edgenroots HQ — the current chapter",
    content: { contentKind: "experience", ref: "1" },
    building: { kind: "office", scale: 1.05, reaction: "lights-up" },
  },
  {
    id: "anchor-proj-easysupply",
    areaId: "industrial",
    x: C.x + 650,
    y: C.y - 500,
    radius: 170,
    label: "EasySupply plant",
    content: { contentKind: "project", ref: "7" },
    building: { kind: "factory", scale: 1.0, reaction: "screens-on" },
  },
  {
    id: "anchor-proj-aaxel",
    areaId: "industrial",
    x: C.x + 650,
    y: C.y + 550,
    radius: 165,
    label: "Aaxel Insurance plant",
    content: { contentKind: "project", ref: "8" },
    building: { kind: "factory", scale: 0.85, reaction: "screens-on" },
  },
];

export const industrialCollectibles: CollectibleDef[] = [
  { id: "c-ind-1", kind: "coin", x: C.x - 150, y: C.y, value: 5 },
  { id: "c-ind-2", kind: "coin", x: C.x + 150, y: C.y, value: 5 },
  { id: "c-ind-chip", kind: "chip", x: C.x - 700, y: C.y - 500, value: 20, secret: true },
  { id: "c-ind-core", kind: "ai-core", x: C.x + 650, y: C.y + 550, value: 30, secret: true },
];
