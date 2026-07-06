import type { AreaDef, CollectibleDef, PortfolioAnchor, PropInstance } from "../../types";
import { areaPalette } from "../../config/palette";
import { mulberry32, roadCross, scatter } from "../scatter";

// Chapter 5 — Freelance Bay. First clients, clones and side gigs: Vercel &
// Spotify clones, bnbMEhome, and a client's word by the lagoon.

const C = { x: 8100, y: 3700 };
const keepOut = roadCross(C.x, C.y, 150);

export const beachArea: AreaDef = {
  id: "beach",
  name: "Freelance Bay",
  subtitle: "Chapter 5 — first clients",
  order: 3,
  center: C,
  footprint: { w: 2600, h: 2200 },
  palette: areaPalette("beach"),
  careerTheme: "Freelance work, clones & first clients",
  audio: {
    pad: [174.61, 220.0, 293.66],
    ambience: ["waves", "birds"],
    motif: [587.33, 698.46, 880.0],
    volume: 0.46,
  },
};

const rng = mulberry32(606);
const anchorAvoid = [
  { x: C.x - 650, y: C.y - 500, r: 220 },
  { x: C.x + 650, y: C.y - 500, r: 220 },
  { x: C.x - 650, y: C.y + 550, r: 220 },
  { x: C.x + 650, y: C.y + 550, r: 200 },
  { x: C.x, y: C.y - 800, r: 200 },
];

export const beachProps: PropInstance[] = [
  ...scatter("palm", 20, { x: C.x, y: C.y, w: 2500, h: 2000 }, rng, { keepOut, avoid: anchorAvoid, scale: [0.85, 1.25] }),
  ...scatter("umbrella", 10, { x: C.x, y: C.y, w: 2200, h: 1700 }, rng, { keepOut, avoid: anchorAvoid }),
  ...scatter("bush", 10, { x: C.x, y: C.y, w: 2200, h: 1800 }, rng, { physics: "decor", keepOut }),
  ...scatter("cone", 8, { x: C.x, y: C.y, w: 1800, h: 1400 }, rng, { physics: "pushable", keepOut }),
  // splashable lagoon
  { id: "beach-lagoon-1", kind: "puddle", x: C.x + 1150, y: C.y + 550, scale: 3.4, physics: "decor" },
  { id: "beach-lagoon-2", kind: "puddle", x: C.x - 1100, y: C.y - 500, scale: 2.6, physics: "decor" },
  { id: "beach-sign", kind: "sign", x: C.x - 800, y: C.y + 550, physics: "pushable" },
];

export const beachAnchors: PortfolioAnchor[] = [
  {
    id: "anchor-proj-vercel",
    areaId: "beach",
    x: C.x - 650,
    y: C.y - 500,
    radius: 165,
    label: "Vercel Clone stand",
    content: { contentKind: "project", ref: "4" },
    building: { kind: "building", scale: 0.85, reaction: "screens-on" },
  },
  {
    id: "anchor-proj-spotify",
    areaId: "beach",
    x: C.x + 650,
    y: C.y - 500,
    radius: 165,
    label: "Spotify Clone stand",
    content: { contentKind: "project", ref: "5" },
    building: { kind: "building", scale: 0.85, reaction: "screens-on" },
  },
  {
    id: "anchor-proj-bnb",
    areaId: "beach",
    x: C.x,
    y: C.y - 800,
    radius: 170,
    label: "bnbMEhome — the client booking gig",
    content: { contentKind: "project", ref: "6" },
    building: { kind: "house", scale: 1.15, reaction: "screens-on" },
  },
  {
    id: "anchor-testimonial-sarah",
    areaId: "beach",
    x: C.x + 650,
    y: C.y + 550,
    radius: 155,
    label: "A word from a client",
    content: { contentKind: "testimonial", ref: "2" },
    building: { kind: "umbrella", scale: 1.5, reaction: "lights-up" },
  },
];

export const beachCollectibles: CollectibleDef[] = [
  { id: "c-beach-1", kind: "coin", x: C.x - 150, y: C.y, value: 5 },
  { id: "c-beach-2", kind: "coin", x: C.x + 150, y: C.y, value: 5 },
  { id: "c-beach-duck", kind: "duck", x: C.x + 1150, y: C.y + 550, value: 15, secret: true },
  { id: "c-beach-keyboard", kind: "keyboard", x: C.x - 1100, y: C.y - 500, value: 25, secret: true },
];
