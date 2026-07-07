// Device-agnostic input with context filters.
//
// Physical keys / touch map to named **actions**; each action belongs to a
// **category** (`drive` | `interact` | `dismiss`). A single active **context**
// (`driving` | `panel` | `menu` | `intro`) decides which categories are live via
// a filter set — so one call (`setInputContext`) swaps the whole control scheme,
// e.g. suspending driving while a project panel is open. This mirrors the
// reference `Inputs` action/filter design (see docs/REDESIGN_ROADMAP.md, Phase
// 3), adapted to our stack. Bindings are unchanged from before; the default
// `driving` context is live-for-everything, so normal play behaves identically.
//
// `carInput` remains the mutable driving output read every frame by
// CarController — populated only while the `drive` category is live.

export interface CarInput {
  throttle: number; // 0..1 (W / Up)
  reverse: number; // 0..1 (S / Down)
  steer: number; // -1..1 (A/D, Left/Right)
  handbrake: boolean; // Space
  nitro: boolean; // Shift
  interact: boolean; // E / Enter — edge-triggered, consumed by proximity system
  dismiss: boolean; // Escape — consumed by the panel
  horn: boolean; // H — edge-triggered, consumed by the scene
  keys: Set<string>;
}

export const carInput: CarInput = {
  throttle: 0,
  reverse: 0,
  steer: 0,
  handbrake: false,
  nitro: false,
  interact: false,
  dismiss: false,
  horn: false,
  keys: new Set(),
};

// touch overlay writes here; merged into the keyboard-derived values
export const touch = { throttle: 0, reverse: 0, steer: 0, handbrake: false, nitro: false };

// --- action categories & contexts -----------------------------------------

export type ActionCategory = "drive" | "interact" | "dismiss";
export type InputContext = "driving" | "panel" | "menu" | "intro";

// Which action categories are live in each context. `driving` enables
// everything (identical to the old always-on behaviour); overlays keep only
// `dismiss` so Escape/back still closes them while the car is suspended.
const CONTEXT_FILTERS: Record<InputContext, ReadonlySet<ActionCategory>> = {
  driving: new Set(["drive", "interact", "dismiss"]),
  panel: new Set(["dismiss"]),
  menu: new Set(["dismiss"]),
  intro: new Set(["dismiss"]),
};

let context: InputContext = "driving";

function isLive(category: ActionCategory): boolean {
  return CONTEXT_FILTERS[context].has(category);
}

export function getInputContext(): InputContext {
  return context;
}

/** Swap the active control scheme. Recomputes so held driving keys take effect
 *  (or release) immediately on the switch — no stuck throttle when a panel
 *  opens mid-drive. */
export function setInputContext(next: InputContext) {
  if (next === context) return;
  context = next;
  recompute();
}

function recompute() {
  const k = carInput.keys;
  if (isLive("drive")) {
    const throttle = k.has("KeyW") || k.has("ArrowUp") ? 1 : 0;
    const reverse = k.has("KeyS") || k.has("ArrowDown") ? 1 : 0;
    let steer = 0;
    if (k.has("KeyA") || k.has("ArrowLeft")) steer -= 1;
    if (k.has("KeyD") || k.has("ArrowRight")) steer += 1;

    carInput.throttle = Math.min(1, throttle + touch.throttle);
    carInput.reverse = Math.min(1, reverse + touch.reverse);
    carInput.steer = Math.max(-1, Math.min(1, steer + touch.steer));
    carInput.handbrake = k.has("Space") || touch.handbrake;
    carInput.nitro = k.has("ShiftLeft") || k.has("ShiftRight") || touch.nitro;
  } else {
    // driving suspended (panel/menu/intro): coast to a stop, ignore held keys
    carInput.throttle = 0;
    carInput.reverse = 0;
    carInput.steer = 0;
    carInput.handbrake = false;
    carInput.nitro = false;
  }
}

const DRIVE_CODES = new Set([
  "KeyW", "KeyA", "KeyS", "KeyD",
  "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
  "Space", "ShiftLeft", "ShiftRight",
]);

let installed = false;

export function installInputListeners(): () => void {
  if (installed || typeof window === "undefined") return () => {};
  installed = true;

  const onDown = (e: KeyboardEvent) => {
    if (e.code === "KeyE" || e.code === "Enter") {
      if (!e.repeat && isLive("interact")) carInput.interact = true;
    }
    if (e.code === "Escape" && isLive("dismiss")) carInput.dismiss = true;
    if (e.code === "KeyH" && !e.repeat && isLive("interact")) carInput.horn = true;
    if (DRIVE_CODES.has(e.code)) {
      // always prevent page scroll and track the physical key; recompute gates
      // whether it actually drives, so a key held across a context switch works.
      if (e.code === "Space" || e.code.startsWith("Arrow")) e.preventDefault();
      if (!e.repeat) {
        carInput.keys.add(e.code);
        recompute();
      }
    }
  };
  const onUp = (e: KeyboardEvent) => {
    if (carInput.keys.delete(e.code)) recompute();
  };
  const onBlur = () => {
    carInput.keys.clear();
    recompute();
  };

  window.addEventListener("keydown", onDown);
  window.addEventListener("keyup", onUp);
  window.addEventListener("blur", onBlur);

  return () => {
    window.removeEventListener("keydown", onDown);
    window.removeEventListener("keyup", onUp);
    window.removeEventListener("blur", onBlur);
    installed = false;
  };
}

export function setTouch(patch: Partial<typeof touch>) {
  Object.assign(touch, patch);
  recompute();
}
