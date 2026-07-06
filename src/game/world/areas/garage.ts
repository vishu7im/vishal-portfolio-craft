import type { AreaDef, CollectibleDef, PortfolioAnchor, PropInstance } from "../../types";
import { areaPalette } from "../../config/palette";
import { mulberry32, roadCross, scatter } from "../scatter";

// Chapters 3–4 — Polytechnic & First Code (GBN Nilokheri, 2021–2024). The
// workshop where the first laptop lived: diploma hall, the Alma portal, skill
// toolboxes, and every ride in the collection. Still the vehicle hub.

const C = { x: 8100, y: 1500 };
const keepOut = roadCross(C.x, C.y, 150);

export const garageArea: AreaDef = {
  id: "garage",
  name: "The First Workshop",
  subtitle: "Chapters 3–4 — polytechnic & first code",
  order: 2,
  center: C,
  footprint: { w: 2200, h: 1900 },
  palette: areaPalette("garage"),
  careerTheme: "Polytechnic, first laptop & first code",
  audio: {
    pad: [110.0, 164.81, 220.0],
    ambience: ["machinery", "drone"],
    volume: 0.4,
  },
};

const rng = mulberry32(303);
const anchorAvoid = [
  { x: C.x - 650, y: C.y - 500, r: 220 },
  { x: C.x + 700, y: C.y + 500, r: 220 },
  { x: C.x + 650, y: C.y - 500, r: 200 },
  { x: C.x - 650, y: C.y + 450, r: 200 },
  { x: C.x + 150, y: C.y + 650, r: 180 },
];

export const garageProps: PropInstance[] = [
  ...scatter("barrel", 16, { x: C.x, y: C.y, w: 1900, h: 1600 }, rng, { physics: "destructible", keepOut, avoid: anchorAvoid }),
  ...scatter("crate", 14, { x: C.x, y: C.y, w: 1900, h: 1600 }, rng, { physics: "destructible", keepOut, avoid: anchorAvoid }),
  ...scatter("cone", 12, { x: C.x, y: C.y, w: 1600, h: 1200 }, rng, { physics: "pushable", keepOut }),
  { id: "garage-ramp-1", kind: "ramp", x: C.x - 500, y: C.y + 550, rotation: 0, physics: "decor" },
  { id: "garage-ramp-2", kind: "ramp", x: C.x + 600, y: C.y - 550, rotation: Math.PI, physics: "decor" },
  { id: "garage-boost-east", kind: "boost", x: C.x + 550, y: C.y, rotation: 0, physics: "decor" },
  { id: "garage-boost-north", kind: "boost", x: C.x, y: C.y - 700, rotation: Math.PI / 2, physics: "decor" },
  { id: "garage-sign", kind: "sign", x: C.x - 600, y: C.y + 700, physics: "pushable" },
];

export const garageAnchors: PortfolioAnchor[] = [
  {
    id: "anchor-edu-diploma",
    areaId: "garage",
    x: C.x + 650,
    y: C.y - 500,
    radius: 165,
    label: "Polytechnic Hall (GBN Nilokheri)",
    content: { contentKind: "education", ref: "2" },
    building: { kind: "school", scale: 0.85, reaction: "lights-up" },
  },
  {
    id: "anchor-proj-alma",
    areaId: "garage",
    x: C.x - 650,
    y: C.y + 450,
    radius: 165,
    label: "Alma Nilokheri portal — first real build",
    content: { contentKind: "project", ref: "1" },
    building: { kind: "building", scale: 0.9, reaction: "screens-on" },
  },
  {
    id: "anchor-testimonial-tejpal",
    areaId: "garage",
    x: C.x + 150,
    y: C.y + 650,
    radius: 155,
    label: "A word from an alum",
    content: { contentKind: "testimonial", ref: "1" },
    building: { kind: "lamp", scale: 1.4, reaction: "lights-up" },
  },
  {
    id: "anchor-skills-backend",
    areaId: "garage",
    x: C.x - 650,
    y: C.y - 500,
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
    x: C.x + 700,
    y: C.y + 500,
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
  { id: "c-garage-1", kind: "coin", x: C.x - 150, y: C.y - 150, value: 5 },
  { id: "c-garage-2", kind: "coin", x: C.x + 150, y: C.y - 150, value: 5 },
  { id: "c-garage-duck", kind: "duck", x: C.x + 700, y: C.y + 550, value: 15, secret: true },
  { id: "c-garage-keyboard", kind: "keyboard", x: C.x - 700, y: C.y + 700, value: 25, secret: true },
];
