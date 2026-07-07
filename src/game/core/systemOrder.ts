// Canonical per-frame update order for WorldScene's systems.
//
// The reference (folio-2025) makes its frame deterministic by having every
// system subscribe to the ticker with an integer priority — input → vehicle →
// physics → camera → world visuals → cycles → audio/UI → render. That ordering
// is the single biggest reason the driving "feels good": physics, camera and
// feedback never fight over stale state within a frame.
//
// We mirror that idea with an explicit registry instead of an ad-hoc sequence
// of method calls. Lower number = earlier in the frame. Values are spaced so
// later phases can insert systems (e.g. a dedicated time-scale/bullet-time step)
// without renumbering. This registry currently encodes the EXISTING order 1:1 —
// no behavior change — so later feel work can reorder intentionally and in one
// visible place. See docs/REDESIGN_ROADMAP.md (Phase 1).

export const ORDER = {
  /** Read input and drive the vehicle (forces + integration). */
  VEHICLE: 10,
  /** Smoothed camera follow — reads the vehicle's post-move transform. */
  CAMERA: 20,
  /** Tyre skid marks — reads drift load / transform. */
  TIRE: 25,
  /** Vehicle particle & squash/stretch FX. */
  CAR_FX: 30,
  /** Proximity to portfolio anchors + camera nearness bias. */
  PROXIMITY: 40,
  /** Discrete input actions: interact / dismiss / horn. */
  INTERACT: 45,
  /** Hard-brake tyre-screech one-shot. */
  BRAKE_SFX: 48,
  /** Collectible pickups. */
  COLLECTIBLES: 50,
  /** Mission progression + objective checks. */
  MISSION: 55,
  /** Distance / XP progression. */
  PROGRESSION: 60,
  /** Anchor reactivity glow. */
  REACTIVITY: 65,
  /** World vignette & screen-space visuals. */
  VIGNETTE: 70,
  /** Ambient world (weather, walkers, glows). */
  AMBIENT: 75,
  /** Day/night mood cycle. */
  DAY_NIGHT: 80,
  /** In-world ops/data screen displays. */
  SCREENS: 85,
  /** Area-transition detection + entry cinematics. */
  AREA: 90,
  /** Locked-gate approach cinematic. */
  GATE: 92,
  /** Minimap fast-travel request. */
  FAST_TRAVEL: 94,
  /** Push per-frame telemetry to the React HUD (no re-render). */
  TELEMETRY: 96,
  /** Audio mixer update — last, like the reference's audio/UI priority. */
  AUDIO: 98,
} as const;

/** Per-frame context handed to every pipeline step. */
export interface FrameContext {
  time: number;
  delta: number;
}

/** One entry in the ordered update pipeline. */
export interface SystemStep {
  order: number;
  label: string;
  run: (ctx: FrameContext) => void;
}

/** Sort a set of steps into ascending frame order (stable for equal orders). */
export function orderedPipeline(steps: SystemStep[]): SystemStep[] {
  return steps
    .map((step, index) => ({ step, index }))
    .sort((a, b) => a.step.order - b.step.order || a.index - b.index)
    .map(({ step }) => step);
}
