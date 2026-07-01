import toast from "react-hot-toast";
import { gameStore } from "../state/gameStore";
import { UNLOCKS, VEHICLES } from "../config/tuning";
import type { CarController } from "./CarController";

// Watches progress (coins, missions) to unlock vehicles, toasts new unlocks, and
// hot-swaps the car when the player picks a different ride in the Garage menu.

export class ProgressionSystem {
  private car: CarController;

  constructor(car: CarController) {
    this.car = car;
    // ensure the car starts as the saved selection
    const sel = gameStore.getState().selectedVehicle;
    if (VEHICLES[sel] && sel !== car.tuning.key) car.setVehicle(VEHICLES[sel]);
  }

  update() {
    const s = gameStore.getState();

    // evaluate unlock rules
    for (const rule of UNLOCKS) {
      if (s.vehiclesUnlocked.includes(rule.vehicle)) continue;
      const coinsOk = rule.coins != null && s.coins >= rule.coins;
      const missionOk = rule.mission != null && s.missionsDone.includes(rule.mission);
      if (coinsOk || missionOk) {
        if (gameStore.unlockVehicle(rule.vehicle)) {
          toast.success(`🚗 New ride unlocked: ${VEHICLES[rule.vehicle].name}! Open the Garage to drive it.`);
        }
      }
    }

    // apply a Garage-menu vehicle change
    if (s.selectedVehicle !== this.car.tuning.key && VEHICLES[s.selectedVehicle]) {
      this.car.setVehicle(VEHICLES[s.selectedVehicle]);
    }
  }
}
