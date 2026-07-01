import type { AreaDef, CollectibleDef, PortfolioAnchor, PropInstance } from "../../types";
import { areaPalette } from "../../config/palette";
import { mulberry32, roadCross, scatter } from "../scatter";

// The Garage — the hub & spawn. Skill toolboxes, destructible barrels/crates to
// smash, ramps to jump, and the release-package pickup for the first mission.

const C = { x: 1500, y: 3700 };
const keepOut = roadCross(C.x, C.y, 150);

export const garageArea: AreaDef = {
  id: "garage",
  name: "The Garage",
  subtitle: "Tools & tuning",
  order: 3,
  center: C,
  footprint: { w: 2200, h: 1900 },
  palette: areaPalette("garage"),
  careerTheme: "Skills & the vehicle collection",
  audio: {
    pad: [110.0, 164.81, 220.0],
    ambience: ["machinery", "drone"],
    volume: 0.4,
  },
};

const rng = mulberry32(303);
const anchorAvoid = [
  { x: 850, y: 3200, r: 220 },
  { x: 2200, y: 4200, r: 220 },
];

export const garageProps: PropInstance[] = [
  ...scatter("barrel", 16, { x: C.x, y: C.y, w: 1900, h: 1600 }, rng, { physics: "destructible", keepOut, avoid: anchorAvoid }),
  ...scatter("crate", 14, { x: C.x, y: C.y, w: 1900, h: 1600 }, rng, { physics: "destructible", keepOut, avoid: anchorAvoid }),
  ...scatter("cone", 12, { x: C.x, y: C.y, w: 1600, h: 1200 }, rng, { physics: "pushable", keepOut }),
  { id: "garage-ramp-1", kind: "ramp", x: 1000, y: 4250, rotation: 0, physics: "decor" },
  { id: "garage-ramp-2", kind: "ramp", x: 2100, y: 3150, rotation: Math.PI, physics: "decor" },
  { id: "garage-sign", kind: "sign", x: 900, y: 4200, physics: "pushable" },
];

export const garageAnchors: PortfolioAnchor[] = [
  {
    id: "anchor-skills-backend",
    areaId: "garage",
    x: 850,
    y: 3200,
    radius: 170,
    label: "Backend Toolbox",
    content: {
      contentKind: "skillCluster",
      payload: {
        title: "Backend Foundations",
        body: "The server-side kit used to design and ship real APIs and systems.",
        skills: ["Node.js", "TypeScript", "Express", "API Design", "MongoDB", "SQL", "Docker", "Redis"],
      },
    },
    building: { kind: "building", scale: 0.85, reaction: "lights-up" },
  },
  {
    id: "anchor-skills-ai",
    areaId: "garage",
    x: 2200,
    y: 4200,
    radius: 170,
    label: "AI Toolbox",
    content: {
      contentKind: "skillCluster",
      payload: {
        title: "Language Models & RAG",
        body: "Tools for building retrieval-augmented, agentic AI systems.",
        skills: ["LangChain", "LangGraph", "Vector Embeddings", "Prompt Engineering", "Query Translation", "Query Routing", "Model Context Protocol", "OpenAI"],
      },
    },
    building: { kind: "server", scale: 0.9, reaction: "hologram" },
  },
];

export const garageCollectibles: CollectibleDef[] = [
  { id: "c-garage-1", kind: "coin", x: 1350, y: 3550, value: 5 },
  { id: "c-garage-2", kind: "coin", x: 1650, y: 3550, value: 5 },
  { id: "c-garage-duck", kind: "duck", x: 2200, y: 4250, value: 15, secret: true },
  { id: "c-garage-keyboard", kind: "keyboard", x: 800, y: 4200, value: 25, secret: true },
];
