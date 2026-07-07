import Phaser from "phaser";
import { gameStore } from "../../state/gameStore";
import { AmbientKit } from "./AmbientKit";

type WeatherKind = "clear" | "rain" | "storm";

/** Rolling weather: clear / rain / storm. Owns the rain emitter (pinned to the
 *  view each frame), swaps ambient rain audio, and triggers lightning + puddle
 *  ripples during storms. */
export class Weather {
  private readonly kit: AmbientKit;
  private readonly rain: Phaser.GameObjects.Particles.ParticleEmitter;
  private weather: WeatherKind = "clear";
  private nextWeatherAt = 45000;

  constructor(kit: AmbientKit) {
    this.kit = kit;
    this.rain = kit.scene.add
      .particles(0, 0, "soft", {
        tint: 0x9fc4e2,
        // generous fixed span — the emitter is repositioned to the view each
        // frame; extra margin keeps corners covered under the drift camera tilt
        x: { min: -600, max: 3400 },
        y: -30,
        lifespan: 900,
        speedY: { min: 640, max: 820 },
        speedX: { min: -60, max: -20 },
        scaleX: 0.06,
        scaleY: { start: 0.5, end: 0.3 },
        alpha: { start: 0.55, end: 0.1 },
        quantity: 3,
        emitting: false,
      })
      .setScrollFactor(0)
      .setDepth(95000);
  }

  update(time: number) {
    if (time > this.nextWeatherAt) {
      const roll = Math.random();
      const next: WeatherKind = roll < 0.68 ? "clear" : roll < 0.9 ? "rain" : "storm";
      this.setWeather(next);
      this.nextWeatherAt = time + Phaser.Math.Between(60000, 120000);
    }
    if (this.weather === "clear") return;

    // keep the emitter pinned to the top-left of the visible view despite zoom
    const cam = this.kit.scene.cameras.main;
    const z = cam.zoom;
    const left = (0 - cam.width / 2) / z + cam.width / 2;
    this.rain.setPosition(left, (0 - cam.height / 2) / z + cam.height / 2 - 40);

    // storms borrow the existing lightning event
    if (this.weather === "storm" && Math.random() < 0.004) this.kit.spawnLightning();
    // wet roads: occasional puddle ripple near the car
    const car = this.kit.car;
    if (Math.random() < 0.05) this.kit.spawnRipple(car.x + Phaser.Math.Between(-220, 220), car.y + Phaser.Math.Between(-160, 160), 0.8);
  }

  private setWeather(next: WeatherKind) {
    if (next === this.weather) return;
    this.weather = next;
    const reduced = gameStore.getState().reducedMotion;
    if (next === "clear") {
      this.rain.stop();
    } else {
      this.rain.start();
      this.rain.quantity = reduced ? 1 : next === "storm" ? 5 : 3;
    }
    this.kit.audio?.setRain(next === "clear" ? 0 : next === "storm" ? 0.9 : 0.55);
  }

  destroy() {
    this.rain.destroy();
  }
}
