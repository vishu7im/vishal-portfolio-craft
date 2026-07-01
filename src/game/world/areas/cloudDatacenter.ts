import type { AreaDef, CollectibleDef, PortfolioAnchor, PropInstance } from "../../types";
import { areaPalette } from "../../config/palette";
import { mulberry32, roadCross, scatter } from "../scatter";

// Cloud Datacenter — cloud/DevOps & scale. Rows of humming server racks holding
// up the multi-tenant SaaS achievement and the systems/data skill clusters.

const C = { x: 8100, y: 6000 };
const keepOut = roadCross(C.x, C.y, 150);

export const cloudDatacenterArea: AreaDef = {
  id: "cloud-datacenter",
  name: "Cloud Datacenter",
  subtitle: "Holding it all up",
  order: 8,
  center: C,
  footprint: { w: 2400, h: 2000 },
  palette: areaPalette("cloud-datacenter"),
  careerTheme: "Cloud, scale & reliability",
  audio: {
    pad: [146.83, 196.0, 293.66],
    ambience: ["drone", "shimmer"],
    volume: 0.4,
  },
};

const rng = mulberry32(909);
const anchorAvoid = [
  { x: 7500, y: 5500, r: 240 },
  { x: 8700, y: 5500, r: 240 },
  { x: 7550, y: 6550, r: 220 },
];

export const cloudDatacenterProps: PropInstance[] = [
  ...scatter("server", 16, { x: C.x, y: C.y, w: 2200, h: 1800 }, rng, { keepOut, avoid: anchorAvoid, scale: [0.75, 1.05] }),
  ...scatter("lamp", 8, { x: C.x, y: C.y, w: 2000, h: 1600 }, rng, { keepOut, avoid: anchorAvoid }),
  ...scatter("cone", 10, { x: C.x, y: C.y, w: 1800, h: 1400 }, rng, { physics: "pushable", keepOut }),
  ...scatter("crate", 6, { x: 7500, y: 6500, w: 700, h: 400 }, rng, { physics: "destructible", keepOut }),
  { id: "cloud-sign", kind: "sign", x: 7450, y: 6550, physics: "pushable" },
];

export const cloudDatacenterAnchors: PortfolioAnchor[] = [
  {
    id: "anchor-ach-saas",
    areaId: "cloud-datacenter",
    x: 7500,
    y: 5500,
    radius: 170,
    label: "Multi-tenant SaaS monument",
    content: { contentKind: "achievement", ref: "ach-saas" },
    building: { kind: "server", scale: 1.2, reaction: "hologram" },
  },
  {
    id: "anchor-skills-systems",
    areaId: "cloud-datacenter",
    x: 8700,
    y: 5500,
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
    x: 7550,
    y: 6550,
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
  { id: "c-cloud-1", kind: "coin", x: 7950, y: 6000, value: 5 },
  { id: "c-cloud-2", kind: "coin", x: 8250, y: 6000, value: 5 },
  { id: "c-cloud-core", kind: "ai-core", x: 8100, y: 6600, value: 30 },
  { id: "c-cloud-keyboard", kind: "keyboard", x: 8700, y: 6550, value: 25, secret: true },
];
