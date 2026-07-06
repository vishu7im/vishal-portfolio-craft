import type {
  AreaDef,
  ChapterDef,
  CollectibleDef,
  FastTravelNode,
  MissionDef,
  PortfolioAnchor,
  PropInstance,
  RoadSegment,
  WorldDef,
} from "../types";
import { roads } from "./roads";
import { forestArea, forestAnchors, forestCollectibles, forestProps } from "./areas/forest";
import { techCampusArea, techCampusAnchors, techCampusCollectibles, techCampusProps } from "./areas/techCampus";
import { cityArea, cityAnchors, cityCollectibles, cityProps } from "./areas/city";
import { garageArea, garageAnchors, garageCollectibles, garageProps } from "./areas/garage";
import { beachArea, beachAnchors, beachCollectibles, beachProps } from "./areas/beach";
import {
  researchLabArea,
  researchLabAnchors,
  researchLabCollectibles,
  researchLabProps,
} from "./areas/researchLab";
import { mountainArea, mountainAnchors, mountainCollectibles, mountainProps } from "./areas/mountain";
import {
  industrialArea,
  industrialAnchors,
  industrialCollectibles,
  industrialProps,
} from "./areas/industrial";
import {
  cloudDatacenterArea,
  cloudDatacenterAnchors,
  cloudDatacenterCollectibles,
  cloudDatacenterProps,
} from "./areas/cloudDatacenter";

// Lays a trail of coins along a road polyline for pacing.
function coinTrail(id: string, road: RoadSegment, spacing = 320): CollectibleDef[] {
  const out: CollectibleDef[] = [];
  let acc = 0;
  let n = 0;
  for (let i = 0; i < road.points.length - 1; i++) {
    const a = road.points[i];
    const b = road.points[i + 1];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    let t = spacing - acc;
    while (t < len) {
      const k = t / len;
      out.push({
        id: `trail-${id}-${n++}`,
        kind: "coin",
        x: a.x + (b.x - a.x) * k,
        y: a.y + (b.y - a.y) * k,
        value: 5,
      });
      t += spacing;
    }
    acc = (acc + len) % spacing;
  }
  return out;
}

const areas: AreaDef[] = [
  forestArea,
  techCampusArea,
  cityArea,
  garageArea,
  beachArea,
  researchLabArea,
  mountainArea,
  industrialArea,
  cloudDatacenterArea,
];

// The chronological spine: one chapter per area, in Career Road order.
export const CHAPTERS: ChapterDef[] = [
  {
    id: "ch-home",
    order: 1,
    areaId: "forest",
    title: "Home",
    years: "the early years",
    line: "A house in the woods, a kid full of questions.",
  },
  {
    id: "ch-school",
    order: 2,
    areaId: "tech-campus",
    title: "School Days",
    years: "2016–2020",
    line: "JNV Jind — where curiosity got a curriculum.",
  },
  {
    id: "ch-polytechnic",
    order: 3,
    areaId: "garage",
    title: "Polytechnic & First Code",
    years: "2021–2024",
    line: "GBN Nilokheri, a first laptop, and hello world.",
  },
  {
    id: "ch-freelance",
    order: 4,
    areaId: "beach",
    title: "Freelance Bay",
    years: "the side-quest era",
    line: "First clients, clones, and code that finally paid.",
  },
  {
    id: "ch-first-job",
    order: 5,
    areaId: "city",
    title: "The First Office",
    years: "2022–2024",
    line: "iComply — a badge, a desk, and production code.",
  },
  {
    id: "ch-backend",
    order: 6,
    areaId: "industrial",
    title: "Backend City",
    years: "2024–now",
    line: "Edgenroots — backends that carry real weight.",
  },
  {
    id: "ch-ai-lab",
    order: 7,
    areaId: "research-lab",
    title: "The AI Research Lab",
    years: "2024–now",
    line: "RAG pipelines and voices that answer back.",
  },
  {
    id: "ch-startup",
    order: 8,
    areaId: "cloud-datacenter",
    title: "Startup District",
    years: "2024–now",
    line: "FabricatorOS, MetaOS — shipping SaaS at scale.",
  },
  {
    id: "ch-future",
    order: 9,
    areaId: "mountain",
    title: "Summit & The Future",
    years: "today → tomorrow",
    line: "Tech lead today. Future City is under construction.",
  },
];

export function chapterFor(areaId: string): ChapterDef | undefined {
  return CHAPTERS.find((c) => c.areaId === areaId);
}

const props: PropInstance[] = [
  ...forestProps,
  ...techCampusProps,
  ...cityProps,
  ...garageProps,
  ...beachProps,
  ...researchLabProps,
  ...mountainProps,
  ...industrialProps,
  ...cloudDatacenterProps,
];

const anchors: PortfolioAnchor[] = [
  ...forestAnchors,
  ...techCampusAnchors,
  ...cityAnchors,
  ...garageAnchors,
  ...beachAnchors,
  ...researchLabAnchors,
  ...mountainAnchors,
  ...industrialAnchors,
  ...cloudDatacenterAnchors,
];

const collectibles: CollectibleDef[] = [
  ...forestCollectibles,
  ...techCampusCollectibles,
  ...cityCollectibles,
  ...garageCollectibles,
  ...beachCollectibles,
  ...researchLabCollectibles,
  ...mountainCollectibles,
  ...industrialCollectibles,
  ...cloudDatacenterCollectibles,
  // coin trails along every paved road
  ...roads.filter((r) => r.kind === "asphalt").flatMap((r) => coinTrail(r.id, r)),
];

const missions: MissionDef[] = [
  {
    id: "deploy-release",
    title: "Deploy the Release",
    brief: "carry the build across the map to the VoxAI Lab.",
    areaId: "research-lab",
    type: "delivery",
    projectRef: "12",
    giver: { x: 8400, y: 1360, radius: 150, label: "Grab the release package" },
    deliver: { x: 1000, y: 5550, radius: 210, label: "Deploy it at the VoxAI Lab" },
    rewardCoins: 50,
    rewardVehicle: "vintage",
    rewardText: "Release deployed 🚀 — that was VoxAI going live.",
  },
  {
    id: "transport-db-backup",
    title: "Transport the DB Backup",
    brief: "haul the nightly backup from EasySupply to the startup racks.",
    areaId: "cloud-datacenter",
    type: "delivery",
    projectRef: "7",
    giver: { x: 2150, y: 3350, radius: 150, label: "Load the backup at EasySupply" },
    deliver: { x: 4250, y: 6550, radius: 200, label: "Store the backup in the racks" },
    rewardCoins: 55,
    rewardText: "Backup safe in the cloud ☁️ — that's EasySupply's pipeline.",
  },
  {
    id: "race-cicd",
    title: "Race the CI/CD Pipeline",
    brief: "beat the clock through every stage before the build times out.",
    areaId: "cloud-datacenter",
    type: "race",
    giver: { x: 4800, y: 5650, radius: 170, label: "Start the CI/CD race" },
    checkpoints: [
      { x: 4800, y: 4500, radius: 150 },
      { x: 4800, y: 2600, radius: 150 },
      { x: 4800, y: 1600, radius: 150 },
      { x: 4800, y: 4200, radius: 150 },
    ],
    timeLimitMs: 21000,
    rewardCoins: 70,
    rewardVehicle: "f1",
    rewardText: "CI/CD pipeline: all green ✅",
  },
  {
    id: "escape-memory-leak",
    title: "Escape the Memory Leak",
    brief: "a leak is eating the heap — outrun it until the GC kicks in!",
    areaId: "industrial",
    type: "escape",
    giver: { x: 850, y: 4200, radius: 160, label: "Trigger the leak" },
    surviveMs: 20000,
    chaserSpeed: 5.4,
    rewardCoins: 60,
    rewardVehicle: "cyber",
    rewardText: "Memory leak contained 🧹 — GC to the rescue.",
  },
  {
    id: "boss-production-incident",
    title: "⚠ PRODUCTION INCIDENT",
    brief: "traffic is spiking and CPU is at 95% — apply every fix before it maxes out!",
    areaId: "cloud-datacenter",
    type: "boss",
    giver: { x: 5600, y: 6400, radius: 180, label: "⚠ Respond to the incident" },
    stations: [
      { x: 5150, y: 6050, radius: 130, label: "Redis cache" },
      { x: 6050, y: 6100, radius: 130, label: "NGINX load balancer" },
      { x: 6000, y: 6750, radius: 130, label: "BullMQ queue" },
      { x: 5150, y: 6700, radius: 130, label: "Docker scale-out" },
    ],
    cpuRampMs: 26000,
    rewardCoins: 500,
    rewardText: "INCIDENT RESOLVED — Used: Docker · Redis · NGINX · BullMQ · AWS. +500 XP",
    rewardAchievements: ["ach-incident-commander", "ach-docker-master"],
  },
];

const fastTravel: FastTravelNode[] = areas.map((a) => ({
  id: `ft-${a.id}`,
  areaId: a.id,
  x: a.center.x,
  y: a.center.y,
  label: a.name,
}));

export const WORLD: WorldDef = {
  bounds: { w: 9600, h: 7000 },
  // Chapter 1 driveway: just west of home, facing east down the Career Road.
  spawn: { x: 1100, y: 1400, angle: 0 },
  areas,
  chapters: CHAPTERS,
  roads,
  props,
  anchors,
  collectibles,
  missions,
  fastTravel,
};

export function areaAt(x: number, y: number): AreaDef {
  let best = areas[0];
  let bestD = Infinity;
  for (const a of areas) {
    const d = Math.hypot(x - a.center.x, y - a.center.y);
    if (d < bestD) {
      bestD = d;
      best = a;
    }
  }
  return best;
}
