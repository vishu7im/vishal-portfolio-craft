// Shared, mutable input state for the car. Written by keyboard + touch, read
// every frame by CarController. Module-level so DOM controls and the Phaser
// loop see the same object.

export interface CarInput {
  throttle: number; // 0..1 (W / Up)
  reverse: number; // 0..1 (S / Down)
  steer: number; // -1..1 (A/D, Left/Right)
  handbrake: boolean; // Space
  nitro: boolean; // Shift
  interact: boolean; // E / Enter — edge-triggered, consumed by proximity system
  dismiss: boolean; // Escape — consumed by the panel
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
  keys: new Set(),
};

// touch overlay writes here; merged into the keyboard-derived values
export const touch = { throttle: 0, reverse: 0, steer: 0, handbrake: false, nitro: false };

function recompute() {
  const k = carInput.keys;
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
      if (!e.repeat) carInput.interact = true;
    }
    if (e.code === "Escape") carInput.dismiss = true;
    if (DRIVE_CODES.has(e.code)) {
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
