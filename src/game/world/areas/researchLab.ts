import type { AreaDef, CollectibleDef, PortfolioAnchor, PropInstance } from "../../types";
import { areaPalette } from "../../config/palette";
import { mulberry32, roadCross, scatter } from "../scatter";

// The AI Lab — RAG & real-time voice. Holographic labs boot up as you approach
// (VoxAI, Kiki) plus the two AI achievements. Drop-off for the first mission.

const C = { x: 8100, y: 3700 };
const keepOut = roadCross(C.x, C.y, 150);

export const researchLabArea: AreaDef = {
  id: "research-lab",
  name: "The AI Lab",
  subtitle: "Language, thinking aloud",
  order: 5,
  center: C,
  footprint: { w: 2300, h: 2000 },
  palette: areaPalette("research-lab"),
  careerTheme: "AI / ML, voice agents & RAG",
  audio: {
    pad: [174.61, 261.63, 349.23],
    ambience: ["shimmer", "drone"],
    motif: [880.0, 1046.5, 1318.5],
    volume: 0.44,
  },
};

const rng = mulberry32(404);
const anchorAvoid = [
  { x: 7500, y: 3150, r: 220 },
  { x: 8750, y: 3150, r: 220 },
  { x: 7550, y: 4250, r: 200 },
  { x: 8700, y: 4250, r: 200 },
];

export const researchLabProps: PropInstance[] = [
  ...scatter("server", 10, { x: C.x, y: C.y, w: 2000, h: 1700 }, rng, { keepOut, avoid: anchorAvoid, scale: [0.7, 1] }),
  ...scatter("lamp", 8, { x: C.x, y: C.y, w: 2000, h: 1600 }, rng, { keepOut, avoid: anchorAvoid }),
  ...scatter("cone", 10, { x: C.x, y: C.y, w: 1700, h: 1300 }, rng, { physics: "pushable", keepOut }),
  ...scatter("crate", 6, { x: 7500, y: 4200, w: 700, h: 400 }, rng, { physics: "destructible", keepOut }),
  { id: "lab-sign", kind: "sign", x: 7450, y: 3700, physics: "pushable" },
];

export const researchLabAnchors: PortfolioAnchor[] = [
  {
    id: "anchor-proj-voxai",
    areaId: "research-lab",
    x: 7500,
    y: 3150,
    radius: 175,
    label: "Boot the VoxAI Lab",
    content: { contentKind: "project", ref: "12" },
    building: { kind: "building", scale: 1.05, reaction: "hologram" },
  },
  {
    id: "anchor-proj-kiki",
    areaId: "research-lab",
    x: 8750,
    y: 3150,
    radius: 165,
    label: "Boot the Kiki Lab",
    content: { contentKind: "project", ref: "3" },
    building: { kind: "building", scale: 0.95, reaction: "hologram" },
  },
  {
    id: "anchor-ach-rag",
    areaId: "research-lab",
    x: 7550,
    y: 4250,
    radius: 160,
    label: "RAG systems monument",
    content: { contentKind: "achievement", ref: "ach-rag" },
    building: { kind: "server", scale: 1.1, reaction: "hologram" },
  },
  {
    id: "anchor-ach-voice",
    areaId: "research-lab",
    x: 8700,
    y: 4250,
    radius: 160,
    label: "Voice AI monument",
    content: { contentKind: "achievement", ref: "ach-voice" },
    building: { kind: "server", scale: 1.1, reaction: "hologram" },
  },
];

export const researchLabCollectibles: CollectibleDef[] = [
  { id: "c-lab-1", kind: "coin", x: 7950, y: 3700, value: 5 },
  { id: "c-lab-2", kind: "coin", x: 8250, y: 3700, value: 5 },
  { id: "c-lab-core", kind: "ai-core", x: 8100, y: 4300, value: 30 },
  { id: "c-lab-keyboard", kind: "keyboard", x: 8850, y: 3700, value: 25, secret: true },
];
