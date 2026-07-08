import { useSyncExternalStore } from "react";
import type { AreaId } from "../types";
import { levelForXp } from "../content/achievements";

// ---------------------------------------------------------------------------
// Two channels of state (ported from the old worldStore):
//   * `store`  — low-frequency UI state, React subscribes via useSyncExternalStore.
//   * `frame`  — high-frequency car telemetry, written every frame by the Phaser
//                scene and read imperatively (minimap, speedometer). Never
//                triggers a React render.
// ---------------------------------------------------------------------------

const SAVE_KEY = "vishal-drive-save-v3";
const SAVE_KEY_V2 = "vishal-drive-save-v2"; // read-only fallback for migration

export interface GameUIState {
  audioStarted: boolean;
  muted: boolean;
  reducedMotion: boolean;
  ready: boolean; // world scene has committed its first frame (textures baked)
  started: boolean; // visitor pressed "start" on the intro → world paints in
  currentArea: AreaId;
  focusedId: string | null; // anchor revealed in the side panel
  nearId: string | null; // anchor in proximity (shows the E hint)
  nearLabel: string | null;
  discovered: string[]; // anchors ever opened
  collected: string[]; // collectible ids picked up
  chaptersVisited: AreaId[]; // life chapters the player has driven into
  coins: number;
  xp: number; // lifetime XP — accumulates with coins but is never spent
  achievementsUnlocked: string[];
  lastAchievement: string | null; // most recent unlock (AchievementSystem toasts it)
  lastLevelUp: { level: number; at: number } | null;
  achievementsOpen: boolean;
  missionsDone: string[];
  activeMissionId: string | null;
  objective: string | null; // current objective line for the tracker
  vehiclesUnlocked: string[];
  selectedVehicle: string;
  garageOpen: boolean;
}

interface SaveBlob {
  version: number;
  discovered: string[];
  collected: string[];
  coins: number;
  xp: number;
  achievements: string[];
  chaptersVisited: string[];
  missionsDone: string[];
  muted: boolean;
  vehiclesUnlocked: string[];
  selectedVehicle: string;
}

function loadSave(): Partial<SaveBlob> {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return JSON.parse(raw) as SaveBlob;
    // migrate a v2 save: coins seed the new xp track; keep the v2 key for rollback
    const rawV2 = localStorage.getItem(SAVE_KEY_V2);
    if (rawV2) {
      const v2 = JSON.parse(rawV2) as Partial<SaveBlob>;
      return { ...v2, xp: v2.coins ?? 0, achievements: [], chaptersVisited: [] };
    }
  } catch {
    /* ignore */
  }
  return {};
}

const saved = loadSave();

let state: GameUIState = {
  audioStarted: false,
  muted: !!saved.muted,
  reducedMotion:
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
  ready: false,
  started: false,
  currentArea: "forest",
  focusedId: null,
  nearId: null,
  nearLabel: null,
  discovered: saved.discovered ?? [],
  collected: saved.collected ?? [],
  chaptersVisited: (saved.chaptersVisited ?? []) as AreaId[],
  coins: saved.coins ?? 0,
  xp: saved.xp ?? saved.coins ?? 0,
  achievementsUnlocked: saved.achievements ?? [],
  lastAchievement: null,
  lastLevelUp: null,
  achievementsOpen: false,
  missionsDone: saved.missionsDone ?? [],
  activeMissionId: null,
  objective: null,
  vehiclesUnlocked: saved.vehiclesUnlocked?.length ? saved.vehiclesUnlocked : ["sports"],
  selectedVehicle: saved.selectedVehicle ?? "sports",
  garageOpen: false,
};

function persist() {
  try {
    const blob: SaveBlob = {
      version: 3,
      discovered: state.discovered,
      collected: state.collected,
      coins: state.coins,
      xp: state.xp,
      achievements: state.achievementsUnlocked,
      chaptersVisited: state.chaptersVisited,
      missionsDone: state.missionsDone,
      muted: state.muted,
      vehiclesUnlocked: state.vehiclesUnlocked,
      selectedVehicle: state.selectedVehicle,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(blob));
  } catch {
    /* ignore */
  }
}

/** xp bump + level-up detection shared by collect/completeMission/addXp */
function gainXp(patch: Partial<GameUIState>, amount: number): Partial<GameUIState> {
  const before = levelForXp(state.xp).level;
  const xp = state.xp + amount;
  const after = levelForXp(xp).level;
  return {
    ...patch,
    xp,
    ...(after > before ? { lastLevelUp: { level: after, at: Date.now() } } : {}),
  };
}

const listeners = new Set<() => void>();
function emit() {
  for (const l of listeners) l();
}
function set(patch: Partial<GameUIState>) {
  state = { ...state, ...patch };
  emit();
}

export const gameStore = {
  getState: () => state,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  set,
  focus(id: string | null) {
    if (id && !state.discovered.includes(id)) {
      state = { ...state, focusedId: id, discovered: [...state.discovered, id] };
      persist();
      emit();
    } else {
      set({ focusedId: id });
    }
  },
  setNear(id: string | null, label: string | null = null) {
    if (id !== state.nearId) set({ nearId: id, nearLabel: label });
  },
  collect(id: string, value: number) {
    if (state.collected.includes(id)) return;
    state = {
      ...state,
      ...gainXp({}, value),
      collected: [...state.collected, id],
      coins: state.coins + value,
    };
    persist();
    emit();
  },
  /** grant XP without a collectible (missions, boss fight, events) */
  addXp(amount: number) {
    if (amount <= 0) return;
    state = { ...state, ...gainXp({}, amount) };
    persist();
    emit();
  },
  /** unlock an achievement; returns true if newly unlocked */
  award(id: string): boolean {
    if (state.achievementsUnlocked.includes(id)) return false;
    state = {
      ...state,
      achievementsUnlocked: [...state.achievementsUnlocked, id],
      lastAchievement: id,
    };
    persist();
    emit();
    return true;
  },
  toggleAchievements() {
    set({ achievementsOpen: !state.achievementsOpen });
  },
  isCollected(id: string) {
    return state.collected.includes(id);
  },
  toggleMute() {
    set({ muted: !state.muted });
    persist();
  },
  startAudio() {
    if (!state.audioStarted) set({ audioStarted: true });
  },
  setArea(id: AreaId) {
    // still records the very first chapter even though currentArea starts there
    if (id === state.currentArea && state.chaptersVisited.includes(id)) return;
    const newChapter = !state.chaptersVisited.includes(id);
    set({
      currentArea: id,
      chaptersVisited: newChapter ? [...state.chaptersVisited, id] : state.chaptersVisited,
    });
    if (newChapter) persist();
  },
  setReady() {
    if (!state.ready) set({ ready: true });
  },
  /** Visitor pressed start on the intro — unlocks driving + paints the world in. */
  introStart() {
    if (!state.started) set({ started: true });
  },
  startMission(id: string, objective: string) {
    set({ activeMissionId: id, objective });
  },
  setObjective(objective: string | null) {
    set({ objective });
  },
  completeMission(id: string, coins: number) {
    if (state.missionsDone.includes(id)) return;
    state = {
      ...state,
      ...gainXp({}, coins),
      missionsDone: [...state.missionsDone, id],
      activeMissionId: state.activeMissionId === id ? null : state.activeMissionId,
      objective: null,
      coins: state.coins + coins,
    };
    persist();
    emit();
  },
  /** unlock a vehicle; returns true if it was newly unlocked */
  unlockVehicle(key: string): boolean {
    if (state.vehiclesUnlocked.includes(key)) return false;
    state = { ...state, vehiclesUnlocked: [...state.vehiclesUnlocked, key] };
    persist();
    emit();
    return true;
  },
  selectVehicle(key: string) {
    if (!state.vehiclesUnlocked.includes(key) || key === state.selectedVehicle) return;
    set({ selectedVehicle: key });
    persist();
  },
  toggleGarage() {
    set({ garageOpen: !state.garageOpen });
  },
  setGarage(open: boolean) {
    if (open !== state.garageOpen) set({ garageOpen: open });
  },
};

export function useGameStore<T>(selector: (s: GameUIState) => T): T {
  return useSyncExternalStore(
    gameStore.subscribe,
    () => selector(state),
    () => selector(state)
  );
}

// --- high-frequency frame channel (no React re-render) -----------------------

export const frame = {
  playerX: 0,
  playerY: 0,
  heading: 0, // radians
  speed: 0, // 0..1 normalized
  rpm: 0, // 0..1 normalized (for engine audio + speedo)
  driftLoad: 0, // 0..1
  nitro: false,
  drifting: false,
  braking: false,
  reversing: false,
  onDirt: false, // car is on a dirt shortcut (dust tint, rumble)
  /** global time scale (1 = real time, <1 = bullet-time on a hard crash) */
  timeScale: 1,
  /** 0..1 position in the day/night cycle (0 = noon) */
  timeOfDay: 0,
  /** 0 at noon → 1 deep night; drives the CSS vignette darkening */
  nightness: 0,
  /** command flags React -> Phaser */
  requestTravel: null as { x: number; y: number } | null,
};
