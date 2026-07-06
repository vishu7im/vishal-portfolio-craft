import type { AchievementDef } from "../types";

// The game's achievement ledger + XP level curve. Coins double as XP: the
// curve is tuned so fully exploring the world (~1500–2000 XP) lands near the
// top titles, and the boss fight's +500 makes a visible dent.

export const XP_LEVELS = [0, 80, 200, 380, 620, 920, 1300, 1800, 2500] as const;

export const LEVEL_TITLES = [
  "Curious Kid",
  "Student Coder",
  "Polytechnic Hacker",
  "Freelancer",
  "Junior Dev",
  "Backend Engineer",
  "AI Engineer",
  "Tech Lead",
  "Architect of Futures",
] as const;

export interface LevelInfo {
  level: number; // 1-based
  title: string;
  /** xp threshold of the current level */
  floor: number;
  /** xp threshold of the next level, or null at the cap */
  next: number | null;
  /** 0..1 progress toward the next level (1 at the cap) */
  progress: number;
}

export function levelForXp(xp: number): LevelInfo {
  let i = 0;
  while (i + 1 < XP_LEVELS.length && xp >= XP_LEVELS[i + 1]) i++;
  const floor = XP_LEVELS[i];
  const next = i + 1 < XP_LEVELS.length ? XP_LEVELS[i + 1] : null;
  return {
    level: i + 1,
    title: LEVEL_TITLES[i],
    floor,
    next,
    progress: next === null ? 1 : (xp - floor) / (next - floor),
  };
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    id: "ach-ignition",
    title: "Ignition",
    detail: "Left home and crossed into a second life chapter.",
    icon: "🔑",
    trigger: { kind: "chapters", count: 2 },
  },
  {
    id: "ach-first-api",
    title: "Built First API",
    detail: "Reached the First Office — where production code began.",
    icon: "🧩",
    trigger: { kind: "chapter", areaId: "city" },
  },
  {
    id: "ach-backend-resident",
    title: "Backend City Resident",
    detail: "Toured the Edgenroots HQ and both production plants.",
    icon: "🏭",
    trigger: {
      kind: "discoverSet",
      ids: ["anchor-exp-edgenroots", "anchor-proj-easysupply", "anchor-proj-aaxel"],
    },
  },
  {
    id: "ach-ai-architect",
    title: "AI Architect",
    detail: "Booted every lab in the AI Research district.",
    icon: "🧠",
    trigger: {
      kind: "discoverSet",
      ids: ["anchor-proj-voxai", "anchor-proj-kiki", "anchor-ach-rag", "anchor-ach-voice"],
    },
  },
  {
    id: "ach-tech-lead",
    title: "Tech Lead",
    detail: "Made it to Summit HQ — the current chapter.",
    icon: "🗻",
    trigger: { kind: "chapter", areaId: "mountain" },
  },
  {
    id: "ach-full-timeline",
    title: "The Whole Story",
    detail: "Drove through every chapter of the career road.",
    icon: "🛣️",
    trigger: { kind: "chapters", count: 9 },
  },
  {
    id: "ach-shipped-it",
    title: "Shipped It",
    detail: "Delivered the release build to the VoxAI Lab.",
    icon: "🚀",
    trigger: { kind: "mission", missionId: "deploy-release" },
  },
  {
    id: "ach-pipeline-green",
    title: "Pipeline Green",
    detail: "Beat the CI/CD race before the build timed out.",
    icon: "✅",
    trigger: { kind: "mission", missionId: "race-cicd" },
  },
  {
    id: "ach-gc-whisperer",
    title: "GC Whisperer",
    detail: "Outran the memory leak until the garbage collector arrived.",
    icon: "🧹",
    trigger: { kind: "mission", missionId: "escape-memory-leak" },
  },
  {
    id: "ach-first-bug",
    title: "First Production Bug",
    detail: "Squashed a bug in the Bug Swamp. There will be more.",
    icon: "🐛",
    trigger: { kind: "custom" },
  },
  {
    id: "ach-incident-commander",
    title: "Incident Commander",
    detail: "Resolved the production incident before CPU hit 100%.",
    icon: "🔥",
    trigger: { kind: "custom" },
  },
  {
    id: "ach-docker-master",
    title: "Docker Master",
    detail: "Scaled out the containers under live traffic.",
    icon: "🐳",
    trigger: { kind: "custom" },
  },
  {
    id: "ach-collector",
    title: "Compound Interest",
    detail: "Banked 500 XP driving the world.",
    icon: "🪙",
    trigger: { kind: "xp", amount: 500 },
  },
  {
    id: "ach-secret-historian",
    title: "Secret Historian",
    detail: "Found the AI bunker, the GitHub cave, and the 8-bit prototype.",
    icon: "🗝️",
    hidden: true,
    trigger: {
      kind: "collectSet",
      ids: [
        "world-vignette-secret-ai-bunker",
        "world-vignette-secret-github-cave",
        "world-vignette-secret-prototype-arcade",
      ],
    },
  },
  {
    id: "ach-architect-of-futures",
    title: "Architect of Futures",
    detail: "Hit the top of the XP curve. The road continues.",
    icon: "🌆",
    hidden: true,
    trigger: { kind: "xp", amount: 2500 },
  },
];
