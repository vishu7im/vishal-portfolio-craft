// Single source of truth for the game's hand-designed look.
// Warm-paper base + ink outline + one shared shadow, plus a saturated triad per
// area. Every prop/car draws from these so the whole world reads as one hand.

export type AreaId =
  | "forest"
  | "city"
  | "tech-campus"
  | "garage"
  | "mountain"
  | "beach"
  | "industrial"
  | "research-lab"
  | "cloud-datacenter";

export interface AreaPalette {
  ground: string; // soft region tint blended onto the paper
  accent: string; // saturated highlight (lights, glows, signage)
  prop: string; // primary prop fill
  propDark: string; // prop shadow-side / outline-adjacent fill
}

export const PALETTE = {
  paper: "#f4ede0",
  paperDeep: "#ece2d1",
  dot: "rgba(20,24,32,0.055)",
  ink: "#20242c",
  inkSoft: "#3a4048",
  shadow: "rgba(22,26,34,0.16)",
  shadowSoft: "rgba(22,26,34,0.10)",
  white: "#ffffff",
  road: "#3d434f",
  roadDark: "#31363f",
  roadLine: "#f3ecdc",
  water: "#57c4d6",

  area: {
    forest: { ground: "#cfe3bf", accent: "#4c9a6a", prop: "#3a7d54", propDark: "#2c6242" },
    city: { ground: "#e4e2da", accent: "#2f6df0", prop: "#93a0b6", propDark: "#697488" },
    "tech-campus": { ground: "#dfe7ef", accent: "#1fb6c9", prop: "#8fb2c4", propDark: "#5f8698" },
    garage: { ground: "#e9e0cf", accent: "#f0a24b", prop: "#c08a55", propDark: "#8f6438" },
    mountain: { ground: "#e6e8ee", accent: "#8a7bd8", prop: "#aeb6c8", propDark: "#7b8598" },
    beach: { ground: "#f4e6c0", accent: "#f0994b", prop: "#f2d199", propDark: "#d8ab63" },
    industrial: { ground: "#e5ddd0", accent: "#e0663a", prop: "#a79684", propDark: "#7c6c5b" },
    "research-lab": { ground: "#e4defb", accent: "#7b5cff", prop: "#a08cff", propDark: "#6a52d6" },
    "cloud-datacenter": { ground: "#dbeaf6", accent: "#39a0f0", prop: "#9fc4e2", propDark: "#6a98bd" },
  } satisfies Record<AreaId, AreaPalette>,
} as const;

export function areaPalette(id: AreaId): AreaPalette {
  return PALETTE.area[id];
}

// --- Day/night mood presets ------------------------------------------------
// Keyframed by Cycles (DayNightSystem) to continuously recolor the world. These
// are OUR hues, not Bruno's candy/vaporwave set: a warm-paper day that dims to a
// golden dusk, a deep indigo night, and a rosy dawn — so the mood animates while
// the hand-drawn identity holds. `tint` is the color a camera-fixed MULTIPLY
// overlay pushes toward, `overlay` its strength (0 = untouched daylight), and
// `nightness` (0 noon → 1 deep night) is what glows/lamps read to swell after dark.

export interface DayPhasePreset {
  tint: { r: number; g: number; b: number };
  overlay: number;
  nightness: number;
}

export const DAY_CYCLE = {
  day: { tint: { r: 255, g: 250, b: 240 }, overlay: 0.0, nightness: 0.0 },
  dusk: { tint: { r: 255, g: 170, b: 112 }, overlay: 0.3, nightness: 0.32 },
  night: { tint: { r: 42, g: 54, b: 104 }, overlay: 0.54, nightness: 1.0 },
  dawn: { tint: { r: 255, g: 186, b: 170 }, overlay: 0.22, nightness: 0.2 },
} satisfies Record<string, DayPhasePreset>;

/** hex "#rrggbb" -> 0xrrggbb for Phaser tint APIs */
export function hex(color: string): number {
  return parseInt(color.replace("#", ""), 16);
}
