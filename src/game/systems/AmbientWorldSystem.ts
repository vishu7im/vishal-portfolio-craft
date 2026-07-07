import Phaser from "phaser";
import type { CarController } from "./CarController";
import type { DayNightSystem } from "./DayNightSystem";
import type { AudioSystem } from "./AudioSystem";
import { AmbientKit } from "./ambient/AmbientKit";
import { ReactiveProps } from "./ambient/ReactiveProps";
import { AmbientLife } from "./ambient/AmbientLife";
import { Npcs } from "./ambient/Npcs";
import { Weather } from "./ambient/Weather";
import { WorldEvents } from "./ambient/WorldEvents";

// Coordinator for the living-world layer. The behaviour lives in cohesive
// ambient/* modules that share an AmbientKit (scene/car/dayNight/audio refs, the
// ambient particle emitters, ripple + lightning effects):
//   ReactiveProps — props reacting to the car + night glows/headlights
//   AmbientLife   — decorative clouds / drones / butterflies
//   Npcs          — walkers, road walkers, ducks, traffic + horn/hit reactions
//   Weather       — rolling clear/rain/storm
//   WorldEvents   — ambient particles + the birds/meteor/heli/balloon/train roulette
// (Was a single 1100-line class before the Phase 2 split.) Public API and the
// per-frame update order are unchanged.
export class AmbientWorldSystem {
  private readonly kit: AmbientKit;
  private readonly reactiveProps: ReactiveProps;
  private readonly life: AmbientLife;
  private readonly npcs: Npcs;
  private readonly weather: Weather;
  private readonly events: WorldEvents;

  constructor(scene: Phaser.Scene, car: CarController, dayNight?: DayNightSystem, audio?: AudioSystem) {
    this.kit = new AmbientKit(scene, car, dayNight, audio);
    this.reactiveProps = new ReactiveProps(this.kit);
    this.life = new AmbientLife(this.kit);
    this.npcs = new Npcs(this.kit);
    this.weather = new Weather(this.kit);
    this.events = new WorldEvents(this.kit);
  }

  update(time: number, delta: number) {
    this.reactiveProps.update(time, delta);
    this.life.update(time, delta);
    this.npcs.update(time, delta);
    this.weather.update(time);
    this.events.update(time);
  }

  /** the horn startles nearby walkers and ducks */
  onHorn(x: number, y: number) {
    this.npcs.onHorn(x, y);
  }

  /** a hard hit makes a lamp lean, spark and flicker */
  onLampHit(img: Phaser.GameObjects.Image) {
    this.reactiveProps.onLampHit(img);
  }

  destroy() {
    this.reactiveProps.destroy();
    this.life.destroy();
    this.npcs.destroy();
    this.weather.destroy();
    this.kit.destroyEmitters();
  }
}
