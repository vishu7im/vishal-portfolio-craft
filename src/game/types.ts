// The data contract for the ONE connected world. Areas, roads, props, anchors,
// collectibles and missions are all data; the WorldScene reads these shapes.

import type { AreaId, AreaPalette } from "./config/palette";

export type { AreaId, AreaPalette };

// --- portfolio content contract (ported unchanged from the old 3D engine so
//     content/portfolioBindings.ts keeps working) --------------------------

export type ContentKind =
  | "profile"
  | "project"
  | "experience"
  | "education"
  | "skillCluster"
  | "achievement"
  | "goal"
  | "testimonial"
  | "chat"; // live NPC conversation (ChatPanel, not PortfolioPanel)

export interface InteractableContent {
  contentKind: ContentKind;
  /** id/key resolved against dataService, or inline narrative payload */
  ref?: string;
  payload?: Record<string, unknown>;
}

export interface AudioLayerConfig {
  /** detuned pad oscillator frequencies (Hz) */
  pad: number[];
  ambience: Array<
    "wind" | "birds" | "insects" | "water" | "machinery" | "shimmer" | "drone" | "waves"
  >;
  motif?: number[];
  volume: number; // 0..1 base bus level
}

// --- world geometry -------------------------------------------------------

export type PropKind =
  | "tree"
  | "pine"
  | "bush"
  | "barrel"
  | "crate"
  | "cone"
  | "sign"
  | "rock"
  | "lamp"
  | "building"
  | "ramp"
  | "boost"
  | "puddle"
  | "palm"
  | "umbrella"
  | "server"
  | "silo"
  | "tent"
  | "flag"
  // significance-tiered buildings (art/buildings.ts)
  | "house"
  | "school"
  | "office"
  | "loft"
  | "factory"
  | "hq"
  | "aiLab"
  | "futureGate"
  | "cafe"
  | "billboard";

export type PropPhysics = "static" | "destructible" | "pushable" | "decor";

export interface PropInstance {
  id: string;
  kind: PropKind;
  x: number;
  y: number;
  rotation?: number; // radians
  scale?: number;
  physics: PropPhysics;
  tint?: number; // override area default
}

export type CollectibleKind =
  | "coin"
  | "chip"
  | "ai-core"
  | "keyboard"
  | "duck";

export interface CollectibleDef {
  id: string;
  kind: CollectibleKind;
  x: number;
  y: number;
  value: number;
  secret?: boolean;
}

export type RoadKind = "asphalt" | "dirt" | "boardwalk" | "bridge" | "neon";

export interface RoadSegment {
  id: string;
  points: Array<{ x: number; y: number }>; // polyline
  width: number;
  kind: RoadKind;
  shortcut?: boolean;
  /** part of the chronological Career Road — drawn emphasized on map + minimap */
  spine?: boolean;
}

export type ReactionKind =
  | "none"
  | "screens-on"
  | "doors-open"
  | "lights-up"
  | "hologram";

export interface PortfolioAnchor {
  id: string;
  areaId: AreaId;
  x: number;
  y: number;
  radius: number; // proximity that shows the "Press E" hint
  label: string;
  content: InteractableContent;
  /** which building/prop lights up as you approach (drawn by ReactivitySystem) */
  building?: { kind: PropKind; scale?: number; reaction: ReactionKind };
}

export interface AreaDef {
  id: AreaId;
  name: string;
  subtitle: string;
  order: number;
  center: { x: number; y: number };
  footprint: { w: number; h: number };
  palette: AreaPalette;
  audio: AudioLayerConfig;
  careerTheme: string;
}

export type MissionType = "delivery" | "race" | "escape" | "boss";

export interface MissionDef {
  id: string;
  title: string;
  brief: string;
  areaId: AreaId;
  type: MissionType;
  projectRef?: string; // the project this mission narratively explains
  /** drive near this to start the mission */
  giver: { x: number; y: number; radius: number; label: string };
  rewardCoins: number;
  rewardText: string;
  rewardVehicle?: string;
  // delivery
  deliver?: { x: number; y: number; radius: number; label: string };
  // race
  checkpoints?: Array<{ x: number; y: number; radius: number }>;
  timeLimitMs?: number;
  // escape
  surviveMs?: number;
  chaserSpeed?: number;
  // boss: sequential fix stations + a CPU meter that ramps to 100%
  stations?: Array<{ x: number; y: number; radius: number; label: string }>;
  cpuRampMs?: number;
  rewardAchievements?: string[];
}

/** A "client calling" random event: a timed delivery offered while driving. */
export interface RandomEventDef {
  id: string;
  caller: string;
  pitch: string;
  timeLimitMs: number;
  rewardXp: number;
  destination: { x: number; y: number; label: string };
}

export interface FastTravelNode {
  id: string;
  areaId: AreaId;
  x: number;
  y: number;
  label: string;
}

// --- game achievements (the ledger, distinct from portfolio "achievement" content) ---

export type AchievementTrigger =
  | { kind: "chapter"; areaId: AreaId } // drive into a specific life chapter
  | { kind: "chapters"; count: number } // visit N chapters
  | { kind: "mission"; missionId: string }
  | { kind: "xp"; amount: number }
  | { kind: "collectSet"; ids: string[] } // all of these collectible ids picked up
  | { kind: "discoverSet"; ids: string[] } // all of these anchors opened
  | { kind: "custom" }; // awarded imperatively (boss fight, vignettes, chat)

export interface AchievementDef {
  id: string;
  title: string;
  detail: string;
  icon: string;
  /** hidden entries render as "???" until unlocked */
  hidden?: boolean;
  trigger: AchievementTrigger;
}

/** One life chapter of the chronological career map; each area hosts one. */
export interface ChapterDef {
  id: string;
  /** 1-based position along the Career Road */
  order: number;
  areaId: AreaId;
  title: string;
  years: string;
  line: string;
}

export interface WorldDef {
  bounds: { w: number; h: number };
  spawn: { x: number; y: number; angle: number };
  areas: AreaDef[];
  chapters: ChapterDef[];
  roads: RoadSegment[];
  props: PropInstance[];
  anchors: PortfolioAnchor[];
  collectibles: CollectibleDef[];
  missions: MissionDef[];
  fastTravel: FastTravelNode[];
}
