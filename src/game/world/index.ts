import type {
  AreaDef,
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
    giver: { x: 1800, y: 3560, radius: 150, label: "Grab the release package" },
    deliver: { x: 7600, y: 3250, radius: 210, label: "Deploy it at the VoxAI Lab" },
    rewardCoins: 50,
    rewardVehicle: "vintage",
    rewardText: "Release deployed 🚀 — that was VoxAI going live.",
  },
  {
    id: "transport-db-backup",
    title: "Transport the DB Backup",
    brief: "haul the nightly backup from EasySupply up to the cloud.",
    areaId: "cloud-datacenter",
    type: "delivery",
    projectRef: "7",
    giver: { x: 5450, y: 5650, radius: 150, label: "Load the backup at EasySupply" },
    deliver: { x: 7550, y: 6550, radius: 200, label: "Store the backup in the cloud" },
    rewardCoins: 55,
    rewardText: "Backup safe in the cloud ☁️ — that's EasySupply's pipeline.",
  },
  {
    id: "race-cicd",
    title: "Race the CI/CD Pipeline",
    brief: "beat the clock through every stage before the build times out.",
    areaId: "cloud-datacenter",
    type: "race",
    giver: { x: 8100, y: 5650, radius: 170, label: "Start the CI/CD race" },
    checkpoints: [
      { x: 8100, y: 4500, radius: 150 },
      { x: 8100, y: 2600, radius: 150 },
      { x: 8100, y: 1600, radius: 150 },
      { x: 8100, y: 4200, radius: 150 },
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
    giver: { x: 4150, y: 6500, radius: 160, label: "Trigger the leak" },
    surviveMs: 20000,
    chaserSpeed: 5.4,
    rewardCoins: 60,
    rewardVehicle: "cyber",
    rewardText: "Memory leak contained 🧹 — GC to the rescue.",
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
  spawn: { x: 1500, y: 3500, angle: 0 },
  areas,
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
