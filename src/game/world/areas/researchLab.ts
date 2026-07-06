import type { AreaDef, CollectibleDef, PortfolioAnchor, PropInstance } from "../../types";
import { areaPalette } from "../../config/palette";
import { mulberry32, roadCross, scatter } from "../scatter";

// Chapter 8 — The AI Research Lab. RAG & real-time voice: holographic labs
// boot up as you approach (VoxAI, Kiki) plus the two AI achievements.

const C = { x: 1500, y: 6000 };
const keepOut = roadCross(C.x, C.y, 150);

export const researchLabArea: AreaDef = {
  id: "research-lab",
  name: "The AI Research Lab",
  subtitle: "Chapter 8 — language, thinking aloud",
  order: 6,
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
  { x: C.x - 600, y: C.y - 550, r: 220 },
  { x: C.x + 650, y: C.y - 550, r: 220 },
  { x: C.x - 550, y: C.y + 550, r: 200 },
  { x: C.x + 600, y: C.y + 550, r: 200 },
  { x: C.x, y: C.y - 750, r: 220 }, // V.I.S.H. chat desk
];

export const researchLabProps: PropInstance[] = [
  ...scatter("server", 10, { x: C.x, y: C.y, w: 2000, h: 1700 }, rng, { keepOut, avoid: anchorAvoid, scale: [0.7, 1] }),
  ...scatter("lamp", 8, { x: C.x, y: C.y, w: 2000, h: 1600 }, rng, { keepOut, avoid: anchorAvoid }),
  ...scatter("cone", 10, { x: C.x, y: C.y, w: 1700, h: 1300 }, rng, { physics: "pushable", keepOut }),
  ...scatter("crate", 6, { x: C.x - 600, y: C.y + 500, w: 700, h: 400 }, rng, { physics: "destructible", keepOut }),
  { id: "lab-sign", kind: "sign", x: C.x - 650, y: C.y, physics: "pushable" },
];

export const researchLabAnchors: PortfolioAnchor[] = [
  {
    id: "anchor-proj-voxai",
    areaId: "research-lab",
    x: C.x - 600,
    y: C.y - 550,
    radius: 175,
    label: "Boot the VoxAI Lab",
    content: { contentKind: "project", ref: "12" },
    // the animated lab vignette lives here — keep the facade modest
    building: { kind: "building", scale: 1.05, reaction: "hologram" },
  },
  {
    id: "anchor-proj-kiki",
    areaId: "research-lab",
    x: C.x + 650,
    y: C.y - 550,
    radius: 165,
    label: "Boot the Kiki Lab",
    content: { contentKind: "project", ref: "3" },
    // the flagship neon mega-lab — visible from a district away
    building: { kind: "aiLab", scale: 1.0, reaction: "hologram" },
  },
  {
    id: "anchor-chat-vish",
    areaId: "research-lab",
    x: C.x,
    y: C.y - 750,
    radius: 175,
    label: "Talk to V.I.S.H. — Lab Assistant",
    content: { contentKind: "chat" },
    building: { kind: "server", scale: 1.25, reaction: "hologram" },
  },
  {
    id: "anchor-ach-rag",
    areaId: "research-lab",
    x: C.x - 550,
    y: C.y + 550,
    radius: 160,
    label: "RAG systems monument",
    content: { contentKind: "achievement", ref: "ach-rag" },
    building: { kind: "server", scale: 1.1, reaction: "hologram" },
  },
  {
    id: "anchor-ach-voice",
    areaId: "research-lab",
    x: C.x + 600,
    y: C.y + 550,
    radius: 160,
    label: "Voice AI monument",
    content: { contentKind: "achievement", ref: "ach-voice" },
    building: { kind: "server", scale: 1.1, reaction: "hologram" },
  },
];

export const researchLabCollectibles: CollectibleDef[] = [
  { id: "c-lab-1", kind: "coin", x: C.x - 150, y: C.y, value: 5 },
  { id: "c-lab-2", kind: "coin", x: C.x + 150, y: C.y, value: 5 },
  { id: "c-lab-core", kind: "ai-core", x: C.x, y: C.y + 600, value: 30 },
  { id: "c-lab-keyboard", kind: "keyboard", x: C.x + 750, y: C.y, value: 25, secret: true },
];
