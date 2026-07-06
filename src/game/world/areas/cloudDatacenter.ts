import type { AreaDef, CollectibleDef, PortfolioAnchor, PropInstance } from "../../types";
import { areaPalette } from "../../config/palette";
import { mulberry32, roadCross, scatter } from "../scatter";

// Chapters 9–10 — Startup District. The shipped SaaS towers (FabricatorOS,
// MetaOS) among humming racks, plus the systems/data skill clusters. The
// production-incident boss arena lives on the district's south-east edge.

const C = { x: 4800, y: 6000 };
const keepOut = roadCross(C.x, C.y, 150);

export const cloudDatacenterArea: AreaDef = {
  id: "cloud-datacenter",
  name: "Startup District",
  subtitle: "Chapters 9–10 — shipping at scale",
  order: 7,
  center: C,
  footprint: { w: 2400, h: 2000 },
  palette: areaPalette("cloud-datacenter"),
  careerTheme: "SaaS platforms, cloud & reliability",
  audio: {
    pad: [146.83, 196.0, 293.66],
    ambience: ["drone", "shimmer"],
    volume: 0.4,
  },
};

const rng = mulberry32(909);
const anchorAvoid = [
  { x: C.x - 600, y: C.y - 500, r: 240 },
  { x: C.x + 600, y: C.y - 500, r: 240 },
  { x: C.x - 550, y: C.y + 550, r: 220 },
  { x: C.x + 700, y: C.y + 150, r: 220 },
  { x: C.x - 650, y: C.y + 50, r: 220 },
];

export const cloudDatacenterProps: PropInstance[] = [
  ...scatter("server", 16, { x: C.x, y: C.y, w: 2200, h: 1800 }, rng, { keepOut, avoid: anchorAvoid, scale: [0.75, 1.05] }),
  ...scatter("lamp", 8, { x: C.x, y: C.y, w: 2000, h: 1600 }, rng, { keepOut, avoid: anchorAvoid }),
  ...scatter("cone", 10, { x: C.x, y: C.y, w: 1800, h: 1400 }, rng, { physics: "pushable", keepOut }),
  ...scatter("crate", 6, { x: C.x - 600, y: C.y + 500, w: 700, h: 400 }, rng, { physics: "destructible", keepOut }),
  { id: "cloud-sign", kind: "sign", x: C.x - 250, y: C.y + 700, physics: "pushable" },
  { id: "cloud-cafe", kind: "cafe", x: C.x + 400, y: C.y + 700, physics: "static" },
  { id: "cloud-billboard", kind: "billboard", x: C.x - 900, y: C.y - 300, physics: "static" },
];

export const cloudDatacenterAnchors: PortfolioAnchor[] = [
  {
    id: "anchor-proj-fabricator",
    areaId: "cloud-datacenter",
    x: C.x + 700,
    y: C.y + 150,
    radius: 175,
    label: "Enter FabricatorOS Tower",
    content: { contentKind: "project", ref: "10" },
    building: { kind: "hq", scale: 0.95, reaction: "screens-on" },
  },
  {
    id: "anchor-proj-metaos",
    areaId: "cloud-datacenter",
    x: C.x - 650,
    y: C.y + 50,
    radius: 175,
    label: "Enter MetaOS Tower",
    content: { contentKind: "project", ref: "11" },
    building: { kind: "loft", scale: 1.1, reaction: "screens-on" },
  },
  {
    id: "anchor-ach-saas",
    areaId: "cloud-datacenter",
    x: C.x - 600,
    y: C.y - 500,
    radius: 170,
    label: "Multi-tenant SaaS monument",
    content: { contentKind: "achievement", ref: "ach-saas" },
    building: { kind: "server", scale: 1.2, reaction: "hologram" },
  },
  {
    id: "anchor-skills-systems",
    areaId: "cloud-datacenter",
    x: C.x + 600,
    y: C.y - 500,
    radius: 165,
    label: "Systems & Scale rack",
    content: {
      contentKind: "skillCluster",
      payload: {
        title: "Systems & Scale",
        body: "Running services reliably at ever-larger scale.",
        skills: ["Docker", "Redis", "Microservices", "Express", "API Design", "Model Context Protocol"],
      },
    },
    building: { kind: "server", scale: 1.1, reaction: "hologram" },
  },
  {
    id: "anchor-skills-data",
    areaId: "cloud-datacenter",
    x: C.x - 550,
    y: C.y + 550,
    radius: 165,
    label: "Data & Persistence rack",
    content: {
      contentKind: "skillCluster",
      payload: {
        title: "Data & Persistence",
        body: "Where the state lives — relational, document, graph and vector.",
        skills: ["MongoDB", "SQL", "PostgreSQL", "Prisma", "Graph Databases", "Vector Embeddings"],
      },
    },
    building: { kind: "server", scale: 1.1, reaction: "hologram" },
  },
];

export const cloudDatacenterCollectibles: CollectibleDef[] = [
  { id: "c-cloud-1", kind: "coin", x: C.x - 150, y: C.y, value: 5 },
  { id: "c-cloud-2", kind: "coin", x: C.x + 150, y: C.y, value: 5 },
  { id: "c-cloud-core", kind: "ai-core", x: C.x, y: C.y + 600, value: 30 },
  { id: "c-cloud-keyboard", kind: "keyboard", x: C.x + 600, y: C.y + 550, value: 25, secret: true },
];
