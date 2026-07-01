import { useSyncExternalStore } from "react";
import type { AreaId } from "../types";

// ---------------------------------------------------------------------------
// Two channels of state (ported from the old worldStore):
//   * `store`  — low-frequency UI state, React subscribes via useSyncExternalStore.
//   * `frame`  — high-frequency car telemetry, written every frame by the Phaser
//                scene and read imperatively (minimap, speedometer). Never
//                triggers a React render.
// ---------------------------------------------------------------------------

const SAVE_KEY = "vishal-drive-save-v2";

export interface GameUIState {
  audioStarted: boolean;
  muted: boolean;
  reducedMotion: boolean;
  ready: boolean;
  currentArea: AreaId;
  focusedId: string | null; // anchor revealed in the side panel
  nearId: string | null; // anchor in proximity (shows the E hint)
  nearLabel: string | null;
  discovered: string[]; // anchors ever opened
  collected: string[]; // collectible ids picked up
  coins: number;
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
  missionsDone: string[];
  muted: boolean;
  vehiclesUnlocked: string[];
  selectedVehicle: string;
}

function loadSave(): Partial<SaveBlob> {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return JSON.parse(raw) as SaveBlob;
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
  currentArea: "garage",
  focusedId: null,
  nearId: null,
  nearLabel: null,
  discovered: saved.discovered ?? [],
  collected: saved.collected ?? [],
  coins: saved.coins ?? 0,
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
      version: 2,
      discovered: state.discovered,
      collected: state.collected,
      coins: state.coins,
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
      collected: [...state.collected, id],
      coins: state.coins + value,
    };
    persist();
    emit();
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
    if (id !== state.currentArea) set({ currentArea: id });
  },
  setReady() {
    if (!state.ready) set({ ready: true });
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
  /** command flags React -> Phaser */
  requestTravel: null as { x: number; y: number } | null,
};
