# Portfolio Redesign — Reverse-Engineering Analysis & Phased Roadmap

Reverse-engineering of **`./folio-2025`** (Bruno Simon's award-winning WebGL/WebGPU
driving portfolio, **MIT**) to guide a redesign of **`./portfolio`** (Vishal
Munday's portfolio, already a **2D top-down Phaser driving game**). We keep our
identity and stack; we borrow mechanics, feel, patterns, reusable pure-JS
utilities, and licensing-permitting audio.

---

## Context — why this work

Our portfolio is already an ambitious interactive experience: a Phaser 3 top-down
driving game where you explore districts mapped to career chapters, collect coins,
run missions, and reveal project/skill panels, with an AI NPC and a `/classic`
résumé fallback. It works, but next to the reference it feels comparatively flat:
the driving lacks "juice," the camera is rigid, feedback is thin, the visual mood
is static, content reveal is unremarkable, and the codebase carries real debt
(two 1000+ line god-systems, ~46 unused shadcn components, stale/incorrect docs,
phantom 3D deps). The reference is a masterclass in _game feel_, _art direction_,
and _reusable architecture_. This plan extracts _why it works_ and turns it into
an incremental, low-risk roadmap that raises our experience to that bar **without
rewriting** — refining the Phaser engine we already have.

### Decisions locked with the user

1. **Direction: refine the existing 2D Phaser engine.** No 3D pivot. Adapt
   Bruno's ideas to our stack. Prefer incremental refactor over rewrite.
2. **Focus (all four):** game feel & juice · visual art direction · content &
   storytelling · architecture & tech-debt.
3. **Audio: reuse the reference's audio** (CC0 music is safe; generic SFX with
   the third-party caveat below), keeping our synth engine as fallback.
4. **Landing: game-first, and upgrade `/classic`** into a first-class accessible
   experience.

### Hard constraint that shapes everything

The reference renders with **`three/webgpu` + TSL node shaders** (r183) and
**Rapier3D** physics. **None of its rendering or physics _code_ is portable to our
Phaser 2D stack.** What _is_ reusable: its **pure-JS utilities**, its **design
patterns and tuning constants**, its **feel model**, and its **audio assets**. So
throughout this plan, "reuse" of systems means _adapt the pattern/tuning_, not
copy files; only `utilities/maths.js`-style pure helpers and CC0 audio are copied
near-verbatim.

---

## 1. Reference Engine — how it actually works

**Single `Game` singleton service-locator** (`sources/Game/Game.js`): ~90 modules
each do `this.game = Game.getInstance()` and reach siblings via `this.game.<x>`.
No DI, no bus between top-level modules — the singleton _is_ the dependency graph.
Boot is a manual, order-sensitive async sequence in 3 staged batches (intro assets
→ renderer/reveal → heavy world + Rapier WASM in parallel).

**The backbone is an ordered tick pipeline.** `Ticker.update` (driven by
`renderer.setAnimationLoop`) is a single **variable timestep** (clamped to 1/30)
running at **2× wall-clock** (`Ticker.scale = 2`). Every system subscribes with an
**integer priority** so the frame is deterministic: `input(0) → player pre-physics
intents(1) → vehicle pre-physics forces(2) → Rapier step(3) → transform sync(4) →
vehicle post-physics reads(5) → player post-physics(6) → camera(7) → day/year
cycles + zones(8) → lighting/wind/tracks(9) → world visuals(10) → instancing(13) →
audio/UI(14) → render(998) → stats(999)`. This ordering is the single most
important reason it "feels good" — physics, camera, and feedback never fight.

**State/events:** no central store; state is mutable public fields on each module,
persistence via `localStorage`. The one reused abstraction is **`Events.js`** —
an ordered pub/sub (`on(name, cb, order)`, fired ascending) — _composed_ into
`Ticker`, `Inputs`, every `Cycles`, every `Zone`/`Area`, etc. `ObservableSet/Map`
fire on mutation and drive CSS-class state on `<html>`.

**Camera (`View.js`, ~790 lines):** not a rigid follow. A smoothed `focusPoint`
tracks the car via lerp + a **"magnet"** term (spring-like lag); camera sits at a
spherical offset (25° FOV, iso-ish). **Zoom** auto-widens with speed; **roll** is
a spring that `kick()`s a tilt on impacts; **cinematic** mode GSAP-lerps position +
slerps quaternion to framed shots on area entry; **`optimalArea`** raycasts the 4
frustum corners to the ground to get the on-screen world quad — one computation
that drives shadow bounds, culling, grass extent, and physics sleeping.

**Physics (Rapier):** declarative body factory (`Physics.getPhysical`), colliders
authored in Blender by mesh-name convention, one-directional physics→render sync in
`Objects.update`, contact-**force** events (threshold 15) routed to per-body
`onCollision(force, position)` callbacks (this is what scales impact sounds). Vehicle
is Rapier's raycast controller with a separate mass-0 **bumper** collider that shoves
props without destabilizing the chassis.

**Inputs (`Inputs/*`):** a genuinely reusable **device-agnostic action layer** —
physical keys → named **actions** with **categories** (`intro/wandering/racing/
cinematic/modal`); a `filters` `ObservableSet` gates which actions are live per game
state (swap control schemes by swapping filters). Auto-detects mouse/gamepad/touch;
thorough per-browser gamepad remapping; a bespoke 3D radial **Nipple** joystick for
touch.

**Cycles (`Cycles/Cycles.js`):** a reusable **keyframe interpolation engine** —
define keyframes of `{properties, stop}`, it smoothstep-interpolates numbers and
`THREE.Color`s over a normalized progress, with punctual + interval events.
`DayCycles` (4-min day/dusk/night/dawn) and `YearCycles` (seasons) subclass it and
recolor light/fog/shadow/reveal continuously — the animated mood is _the_ atmosphere.

**Performance:** instancing (`InstancedGroup`), `optimalArea` culling reused across
shadows/grass/physics/areas, GPU-driven visuals (TSL compute), a 2-tier `Quality`
system (bloom mips, shadow size, DOF, substeps), shared cached materials, and a
`PreRenderer` shader warm-up.

**Audio (`Audio.js`, Howler):** items grouped by name with `play()`/
`playRandomNext()` (cycles variants, avoids repeats), manual positional fade in
`Audio.update`, `antiSpam` throttle, global rate scaled by bullet-time, deferred
init on first user gesture, ambient loops tied to day-cycle interval events.

**Reusable primitives worth lifting (pure JS, no WebGPU):** `Events.js`,
`utilities/maths.js` (`clamp/lerp/remap/remapClamp/smoothstep/smallestAngle` +
2D geometry `circleIntersectsPolygon/pointInPolygon/lineIntersectsCircle`),
`ObservableSet/Map`, the `Cycles` engine, the `Inputs` action-mapping design, the
`Audio` group/mixer design, and the `View` follow/roll/optimal-area _math_.

---

## 2. Gameplay Breakdown (with copy / adapt / redesign verdict)

Verdict legend: **Copy** = lift pure-JS/tuning near-verbatim · **Adapt** = port the
_pattern/feel_ to our Phaser/Matter stack · **Redesign** = rethink for our identity.

| Mechanic                      | What it does / why it feels good                                                                                              | Reference files                                       | Our files                                                              | Verdict                                 |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------- |
| **Vehicle movement**          | Engine force ÷ `(1+overflowSpeed)` = _soft_ top-speed cap (natural, not clamped); boost lerps top speed 5→40                  | `Physics/PhysicsVehicle.js`, `Player.js`              | `systems/CarController.ts`, `config/tuning.ts`                         | **Adapt** (tuning model)                |
| **Braking**                   | Auto idle-brake; pressing reverse above speed applies strong `reverseBrake` and zeroes engine — reverse never fights momentum | `PhysicsVehicle.js`                                   | `CarController.ts`                                                     | **Adapt**                               |
| **Camera follow**             | Smoothed focus point + **magnet** spring lag; not rigid                                                                       | `View.js`                                             | `systems/CameraRig.ts`                                                 | **Adapt**                               |
| **Speed zoom**                | Camera widens FOV/zoom with speed → sense of velocity                                                                         | `View.setZoom`                                        | `CameraRig.ts`                                                         | **Adapt**                               |
| **Camera roll kick**          | Spring tilts camera on impact/explosion — pure juice                                                                          | `View.setRoll`                                        | `CameraRig.ts` (new)                                                   | **Adapt**                               |
| **Drift / traction**          | Emergent from wheel friction; ice/water lowers `frictionSlip` 0.9→0.04; skid-sound keyed to sideways-vs-facing ratio          | `PhysicsVehicle.js`                                   | `world/roads.ts` (`isOnDirt`), `CarController.ts`, `TireMarks.ts`      | **Adapt**                               |
| **Collision response**        | Contact-**force** events → `onCollision(force,pos)` → random impact SFX scaled by force + camera roll + bullet-time           | `Physics.js`, `Explosions.js`                         | `CarFxSystem.ts`, `DestructionSystem.ts`                               | **Adapt**                               |
| **Bumping props**             | Mass-0 bumper collider shoves objects without destabilizing car                                                               | `PhysicsVehicle.js`                                   | `WorldScene.ts` collisions                                             | **Adapt**                               |
| **Interactive points**        | Diamond "◇+label+key" markers revealed by proximity (≤2.5u) _and_ hover; elastic GSAP reveal; key icon swaps per input device | `InteractivePoints.js`, `RayCursor.js`                | `systems/ProximitySystem.ts`, `components/game/InteractHint.tsx`       | **Adapt**                               |
| **Content reveal (drive-in)** | Area content only rendered when inside the on-screen quad; intro "paint-in" reveal wipe                                       | `Reveal.js`, `Area.setFrustum`, `MeshDefaultMaterial` | `WorldScene.ts`, `AmbientWorldSystem.ts`                               | **Adapt** (2D version)                  |
| **Dialog / info**             | Drive up → cinematic camera → vehicle deactivated → focused paginated content panel; back to close                            | `World/Areas/ProjectsArea.js`                         | `components/game/PortfolioPanel.tsx`, `ProximitySystem.ts`             | **Adapt**                               |
| **Bullet time**               | Global time scale 2→0.5 on hard hits; drives ticker + GSAP timeline together                                                  | `Time.js`                                             | _(new)_ `systems/TimeScale.ts`, `gameStore.ts`                         | **Adapt**                               |
| **Particle FX**               | GPU-instanced confetti/leaves/snow/rain; boost **speed lines**                                                                | `World/Confetti.js`, `View.setSpeedLines`             | `CarFxSystem.ts`, `WorldVignetteSystem.ts`                             | **Adapt/Redesign**                      |
| **Day/night mood**            | 4-min cycle recolors everything via keyframe interpolation                                                                    | `Cycles/DayCycles.js`                                 | `systems/DayNightSystem.ts`, `AmbientWorldSystem.ts`                   | **Adapt** (port `Cycles`)               |
| **Loading experience**        | Glowing progress ring → input-scheme prompt + mute → click starts world paint-in                                              | `World/Intro.js`, `ResourcesLoader.js`                | `components/game/HudExtras.tsx` (LoadingVeil), `BootScene.ts`          | **Redesign**                            |
| **Keyboard controls**         | WASD drive, Shift boost, B brake, R respawn, H honk, E/F interact                                                             | `Inputs/Keyboard.js`, `Player.js`                     | `state/input.ts`                                                       | **Adapt**                               |
| **Mouse controls**            | Wheel zoom, drag = map pan, click = interact                                                                                  | `Inputs/Pointer.js`, `Wheel.js`                       | `state/input.ts`                                                       | **Adapt**                               |
| **Touch controls**            | 3D radial joystick + contextual on-screen buttons                                                                             | `Inputs/Nipple.js`, `InteractiveButtons.js`           | `components/game/TouchControls.tsx`                                    | **Adapt**                               |
| **Gamepad**                   | Full mapping, per-browser remap, Xbox/PS auto-detect                                                                          | `Inputs/Gamepad.js`                                   | _(none)_                                                               | **Redesign** (optional, low priority)   |
| **Unstuck / respawn**         | Auto-flips upside-down car after 3s; overlay wipe on respawn                                                                  | `Player.setUnstuck`, `Overlay.js`, `Respawns.js`      | `CarController.ts`                                                     | **Adapt**                               |
| **Progression**               | Distance/XP/levels/achievements persisted                                                                                     | `Achievements.js`, `localStorage`                     | `systems/ProgressionSystem.ts`, `AchievementSystem.ts`, `gameStore.ts` | **Keep** (ours is good)                 |
| **Accessibility**             | _None_ in reference (no reduced-motion, canvas-only, not SR-accessible)                                                       | —                                                     | —                                                                      | **Redesign (do better than reference)** |

**What our project already does _as well or better_:** the **dual-channel
`gameStore`** (React-subscribed UI state + imperative high-freq frame telemetry)
is a clean solution the reference lacks (it has no React layer); our **progression/
missions/achievements** and **offline AI NPC** are genuinely ours and worth keeping.

---

## 3. Visual Analysis — why the reference looks good

- **Palette = warm-to-cool candy/vaporwave that _animates_.** Day-cycle presets
  (`Cycles/DayCycles.js`): day `light #ffd2c2 / shadow #6d3fff / fog #00ffff→#9b89ff`;
  dusk peaches→magenta; night indigos `#3240ff/#2f00db`; dawn `#ffa882/#db004f`.
  Terrain gradient sand `#ffa94e`→teal `#5bc2b9`→deep-blue `#13375f`. Reveal ring
  `#e88eff`. The _continuous recolor_ is the atmosphere — far more alive than a
  static scene. **We can do this in 2D** (tint layers, fog overlay, lighting
  vignette driven by a ported `Cycles`).
- **Toon/stylized shading** via one shared `MeshDefaultMaterial`: hard core-shadow
  terminator, colored shadow tint from the day cycle, fake light-bounce from terrain
  color, radial fog mix. In 2D this maps to: consistent flat palette, a colored
  **vignette/lighting overlay**, and soft ambient occlusion baked into procedural
  textures — much of which our `WorldVignetteSystem`/`AmbientWorldSystem` already
  attempt (but monolithically).
- **Post:** bloom (threshold 1, strength 0.25) + a cheap vertical hash-blur DOF +
  radial fog + gradient sky. **Phaser equivalent:** post-FX pipelines / a bloom
  pipeline + a vignette + a subtle gradient sky layer.
- **Typography:** body **Nunito**; titles + all in-world text **Amatic SC**
  (handwritten) — the signature charm. We currently use Geist + Press Start 2P. Our
  identity choice: keep a clean sans for UI, pick _one_ characterful display face
  for in-world/HUD flourish (not necessarily Amatic).
- **Juice:** GSAP elastic/back eases on every reveal/interaction; the world "paints
  in" from the car on load. This is cheap to replicate and disproportionately
  raises perceived quality.

---

## 4. Portfolio Storytelling — engagement analysis

- **Why the reference is engaging:** immediate agency (you _drive_ within seconds),
  a **reveal** that rewards movement, spatialized content (each portfolio section is
  a _place_ you discover, not a scroll position), constant micro-feedback (sound,
  particles, camera), an evolving mood (day/night), and hidden delight (konami code,
  easter eggs, tornado). Attention is _self-paced exploration_, so dwell time is high
  and curiosity-driven rather than duty-driven.
- **Why ours currently under-delivers despite similar bones:** the driving feels
  floaty and the camera rigid (low kinesthetic pleasure), feedback is thin (mostly
  synth blips, little screen-space reaction), the world mood is static, and content
  reveal is functional rather than cinematic — so the _place_ doesn't feel alive and
  exploration isn't rewarded moment-to-moment. The `/classic` page is a competent but
  generic résumé.
- **Emotional journey we want:** _arrival_ (a crafted load/paint-in that sets tone) →
  _play_ (satisfying handling within 3s) → _discovery_ (drive into a district, the
  camera frames it, content blooms in, sound/particles reward you) → _depth_ (missions,
  AI NPC, achievements pull deeper) → _exit_ (clear CTA to contact/résumé). Each
  district should hold attention ~30–60s; the whole loop should invite a 3–8 min stay.
- **What should change (ranked):** (1) handling + camera feel, (2) collision/feedback
  juice + sound, (3) animated mood, (4) cinematic content reveal, (5) a crafted
  intro/loading moment, (6) an upgraded accessible `/classic`.

---

## 5. Technical-Debt Report (current portfolio)

- **~46 unused shadcn `components/ui/*` (~4–5k lines) — fully dead.** Nothing imports
  them; app uses raw Tailwind + lucide + react-hot-toast. Largest single cleanup.
- **Phantom/stale deps:** `three` not installed but `node_modules/@react-three` is an
  empty phantom dir; `@tanstack/react-query` and `next-themes` unused.
- **Stale/incorrect docs:** `CREDITS.md` describes a non-existent R3F "Forgotten
  Forest" and a non-existent path; `README.md` is untouched Lovable boilerplate.
- **God files:** `systems/WorldVignetteSystem.ts` (**1305**) and `AmbientWorldSystem.ts`
  (**1107**) mix weather/walkers/glows/screen-displays/particles. `WorldScene.ts` (527)
  is a heavy orchestrator with an ad-hoc per-frame update of 17 systems.
- **Duplication / missing abstraction:** color constants (`INK`, `PAPER`, …)
  re-declared per-system instead of importing `config/palette.ts`; no shared math util
  (each system rolls its own lerp/clamp); no formal system-update-order registry.
- **Security:** plaintext admin creds in `data/db.json` (bundled to client, consumed by
  nothing — remove); `firestore.rules` `allow read,write: if true` on legacy
  `devices/sessions/messages` collections.
- **Identity/deploy drift:** "Backend Developer" vs "Tech Lead"; two emails;
  "EdgeNroots" vs "Edgenroots"; three deploy targets (vishu.dev / gh-pages / lovable
  `homepage`); `package.json` still `vite_react_shadcn_ts`.
- **Legacy chat path:** `functions/index.js` `chatWithGemini` + `prompt.txt` superseded
  by `portfolioChat.js` — dead.
- **Perf:** no `manualChunks` in `vite.config.ts` (Phaser is huge); content baked into
  bundle; `HashRouter` hurts SEO/shareability despite heavy metadata.

---

## 6. Feature Comparison Matrix

| Feature                                         | Current (portfolio) | Reference (folio-2025)      | Recommended                          | Priority | Difficulty | Est.     | Depends on       |
| ----------------------------------------------- | ------------------- | --------------------------- | ------------------------------------ | -------- | ---------- | -------- | ---------------- |
| Vehicle feel (soft cap, reverse-brake, boost)   | Basic arcade        | Rich soft-cap model         | Adapt tuning model                   | P1       | M          | 1 sess   | maths util       |
| Camera follow + roll + speed-zoom               | Rigid rig           | Magnet spring + roll + zoom | Adapt                                | P1       | M          | 1 sess   | maths util       |
| Collision → force-scaled SFX + bullet-time      | Thin                | Force events + time-scale   | Adapt                                | P1       | M          | 1–2 sess | audio, timescale |
| Audio (music + SFX)                             | Web-Audio synth     | Howler groups + CC0 music   | Reuse CC0 + generic SFX; group mixer | P1       | M          | 1–2 sess | asset copy       |
| Day/night mood cycle                            | Present, monolithic | `Cycles` keyframe engine    | Port `Cycles`, refactor              | P2       | M          | 1–2 sess | Events util      |
| Interactive-point reveal                        | Proximity only      | Proximity + hover + elastic | Adapt                                | P2       | M          | 1 sess   | camera           |
| Cinematic content panel                         | Static panel        | Cinematic + paginated       | Adapt                                | P2       | M–L        | 2 sess   | camera           |
| Loading / intro moment                          | Simple veil         | Ring + paint-in + prompt    | Redesign                             | P3       | M          | 1 sess   | —                |
| Input action-mapping + filters                  | Ad-hoc listeners    | Action/category system      | Adapt                                | P2       | M          | 1 sess   | —                |
| Touch controls                                  | Basic buttons       | 3D nipple + buttons         | Adapt (2D nipple)                    | P3       | M          | 1 sess   | input            |
| Gamepad                                         | None                | Full + remap                | Optional                             | P4       | M          | 1 sess   | input            |
| Particles / speed lines                         | Some                | GPU-instanced rich          | Adapt/redesign                       | P3       | M          | 1 sess   | fx               |
| Post-FX (bloom/vignette)                        | Custom vignette     | Bloom+DOF+fog               | Phaser pipelines                     | P3       | M          | 1 sess   | —                |
| Accessibility (reduced-motion, a11y `/classic`) | None / basic        | None                        | **Exceed reference**                 | P2       | M          | 1–2 sess | classic          |
| Progression / missions / AI NPC                 | **Strong (ours)**   | Achievements only           | Keep, polish                         | P4       | L          | —        | —                |
| Architecture (utils, split god-files)           | Debt                | Clean primitives            | Refactor                             | P1       | M          | 2–3 sess | —                |
| Repo hygiene (dead code, docs, deps)            | Debt                | —                           | Cleanup                              | P0       | S          | 1 sess   | —                |

---

## 7. Asset Reuse & Licensing

Reference is **MIT © 2025 Bruno Simon** (code + Bruno's own works). Inventory: **~92
audio files** (`static/sounds/`, 88 mp3 + 3 wav), **64 GLB models**, KTX/basis
textures, fonts, terrain.

- ✅ **Music — safe (CC0).** `static/sounds/musics/{Boy,Baguira,Sudo}` (`static/
sounds/musics/license.md` = CC0). **Copy freely.** Prime reuse for a jukebox/ambient
  bed.
- ⚠️ **SFX — reuse with per-file caution.** Filenames indicate **commercial stock
  libraries** (`soundjay_…`, `Mountain Audio`, catalog codes `SDFIRE0411`,
  `SIG015201`, `PE281202`). Bruno's MIT license does **not** guarantee redistribution
  rights for these individual clips. **Plan:** prefer clearly-generic clips we can
  re-source or replace, verify origin per file before shipping, attribute in
  `CREDITS.md`, and **keep our synth `AudioSystem` as a guaranteed fallback**. Best
  candidates that map to our events: `vehicle/engine` (idle loop), `vehicle/floor`
  (wheels/brake), `swoosh`, `hits/defaults` (Impact Soft ×4), `explosions`, `ding`,
  `reveal`, and ambience (`wind/crickets/birdTweets/rain/thunder/waves/owl/wolf`).
- ✅ **Pure-JS utilities — copy/adapt.** `utilities/maths.js` (verbatim-portable),
  `Events.js`, `ObservableSet/Map.js`, `Cycles/Cycles.js` (adapt off `THREE.Color` →
  our color type). No WebGPU dependency.
- ✅ **Design patterns / tuning constants** (§2 table) — free to adopt (ideas, not
  copyrightable expression).
- ❌ **Recreate, do not reuse:** all GLB models (we're 2D — keep procedural textures),
  TSL/GLSL shaders (WebGPU-only), Bruno's exact palette/branding, project/career
  imagery (client/brand content), fonts (governed by their own OFL/Fontshare licenses —
  load our own).

---

## 8. Risks & Constraints

- **Stack mismatch is total for rendering/physics.** Copying reference _code_ for
  camera/physics/shaders will not work in Phaser/Matter. Mitigation: this plan only
  ports _pure utilities + patterns + tuning_; everything else is re-implemented.
- **Audio licensing** (§7). Mitigation: CC0 music only for guaranteed-safe; per-file
  verify SFX; synth fallback retained; attribution.
- **God-file refactor risk** (`WorldVignetteSystem` 1305, `AmbientWorldSystem` 1107):
  splitting can regress subtle visuals. Mitigation: refactor behind unchanged public
  API, screenshot-compare before/after, do it in its own phase.
- **Feel tuning is iterative** — numbers from Rapier (mass 2.5, force 300, top 5)
  won't transfer to Matter/arcade directly. Mitigation: expose tuning in `config/
tuning.ts`, add a dev tweak panel, tune by playtest.
- **Scope creep** — the reference has years of polish. Mitigation: many small phases,
  each shippable; P4 items are optional.
- **Not a git repo at this path per env** (`.git` exists but env reports non-repo).
  Mitigation: verify VCS before large deletes; commit per phase.
- **Perf regressions** from added FX. Mitigation: keep/extend a quality tier + mobile
  path; measure.

---

## 9. Prioritized Backlog (themes)

- **P0 Hygiene:** dead code, deps, docs, secrets, identity — unblocks everything.
- **P1 Feel core:** shared utils + system-order registry, vehicle feel, camera feel,
  collision/audio feedback. _This is the biggest perceived-quality win._
- **P2 Systems & story:** input action-system, day/night `Cycles` refactor, interactive
  reveal, cinematic content panel, accessible `/classic`.
- **P3 Atmosphere & entry:** post-FX/art pass, particles/speed-lines, intro/loading
  moment, touch controls.
- **P4 Optional depth:** gamepad, extra easter eggs, further mission/NPC polish.

---

## 10. Phased Implementation Roadmap

> Each phase is one focused coding session, leaves the app working, and touches
> minimal unrelated systems. Global rule: after each phase run `npm run dev`, drive
> the world, exercise the affected flow, and use the DEV `window.__drive` Playwright
> hook (`usePhaserGame.ts`) for automated smoke checks. Commit per phase.

### Phase 0 — Repo hygiene & truthful docs

- **Objective:** Remove dead code/deps/secrets and correct all docs & identity so the
  redesign starts from a clean, honest base.
- **Reason:** ~5k lines of dead shadcn + phantom deps + false `CREDITS.md` actively
  mislead every future change (including AI-assisted ones).
- **Files to modify:** `package.json` (drop `@tanstack/react-query`, `next-themes`,
  fix `name`/`homepage`), `CREDITS.md` (rewrite to describe the actual Phaser game),
  `README.md` (real project docs), `data/db.json` (delete `admin` block), `firestore.
rules` (scope down / remove legacy world-writable collections), `vite.config.ts`
  (add `build.rollupOptions.output.manualChunks` splitting `phaser`).
- **Files to create:** none (optionally `CONTRIBUTING`/`ARCHITECTURE.md` note).
- **Files to delete:** unused `components/ui/*` (verify zero imports first), stale
  `functions/index.js` `chatWithGemini` + `prompt.txt`, phantom `@react-three`.
- **Risks:** deleting a `ui/*` file that _is_ imported. **Mitigation:** grep each for
  `@/components/ui/<name>` before delete.
- **Dependencies:** none.
- **Acceptance:** `npm run build` succeeds; bundle has a separate phaser chunk; no
  `admin` creds in `dist`; docs describe reality; app + `/classic` still render.
- **Testing checklist:** build passes · game route drives · `/classic` renders · grep
  confirms no dangling imports · Firestore rules deploy-valid.
- **Estimate:** 2–3 h.

### Phase 1 — Shared core utilities + system-order registry

- **Objective:** Introduce a small `game/core/` with a ported maths util, an ordered
  `Events` emitter, and an explicit **system update-order registry** used by
  `WorldScene.update`.
- **Reason:** Removes per-system duplication (lerp/clamp/palette) and replaces the
  ad-hoc 17-system update with a deterministic ordered pipeline — the reference's key
  "feel" mechanism and the foundation for later phases.
- **Files to create:** `game/core/maths.ts` (port `folio-2025/sources/Game/utilities/
maths.js`: `clamp/lerp/remap/remapClamp/smoothstep/smallestAngle/circleIntersects
Polygon/…`), `game/core/Events.ts` (ordered pub/sub), `game/core/systemOrder.ts`
  (named priority constants).
- **Files to modify:** `scenes/WorldScene.ts` (call systems in registry order), each
  `systems/*` that redeclares math/palette constants → import from `core/maths` &
  `config/palette`.
- **Risks:** reordering system updates changes timing. **Mitigation:** replicate the
  _current_ order first, then adjust intentionally in later phases; screenshot-compare.
- **Dependencies:** Phase 0.
- **Acceptance:** no behavior change; zero duplicated math/palette constants; systems
  run in a documented order.
- **Testing checklist:** visual parity vs pre-refactor screenshots · drive/collect/
  mission still work · TypeScript builds.
- **Estimate:** 3–4 h.

### Phase 2 — Split the god-systems

- **Objective:** Decompose `WorldVignetteSystem.ts` (1305) and `AmbientWorldSystem.ts`
  (1107) into cohesive modules behind their existing public API.
- **Reason:** Maintainability + unlocks the art/atmosphere phases; two files currently
  own weather, walkers, glows, screen-displays, and particles at once.
- **Files to create:** e.g. `systems/ambient/{Weather,Walkers,Glows,ScreenDisplays}.ts`,
  `systems/vignette/{Vignette,Particles}.ts` (names per actual concerns found).
- **Files to modify:** `AmbientWorldSystem.ts` / `WorldVignetteSystem.ts` become thin
  coordinators; `WorldScene.ts` wiring unchanged.
- **Risks:** subtle visual regressions. **Mitigation:** pure mechanical extraction, no
  logic changes; before/after screenshots per sub-area.
- **Dependencies:** Phase 1.
- **Acceptance:** identical visuals; each new file < ~300 lines; public API unchanged.
- **Testing checklist:** screenshot parity across day/night + weather states · perf
  unchanged · builds.
- **Estimate:** 3–4 h.

### Phase 3 — Input action-mapping + context filters

- **Objective:** Refactor `state/input.ts` into a device-agnostic **action** layer with
  **category filters** (`intro/driving/panel/menu`).
- **Reason:** Clean control-scheme switching (driving vs viewing a panel vs menus) is a
  prerequisite for cinematic panels and touch parity; mirrors the reference `Inputs`.
- **Files to modify:** `state/input.ts` (actions + filters API), consumers in
  `CarController.ts`, `WorldScene.ts`, HUD components reading input.
- **Files to create:** `game/core/actions.ts` (action defs + filter set) if separated.
- **Risks:** input regressions. **Mitigation:** keep current key bindings identical;
  add filters without changing defaults.
- **Dependencies:** Phase 1.
- **Acceptance:** identical controls; a single call swaps schemes (e.g. disables driving
  while a panel is open).
- **Testing checklist:** keyboard drive · mouse pan/zoom · panel open disables drive ·
  mobile buttons still work.
- **Estimate:** 3 h.

### Phase 4 — Camera redesign (feel)

- **Objective:** Rebuild `CameraRig.ts` with a smoothed **magnet** follow, **speed-based
  zoom-out**, and an impact **roll/shake kick**.
- **Reason:** The single biggest kinesthetic upgrade; the reference camera is its most
  tuned system.
- **Files to modify:** `systems/CameraRig.ts`, `config/tuning.ts` (camera constants),
  `WorldScene.ts` (invoke roll kick on collision/boost).
- **Risks:** motion sickness / over-shake. **Mitigation:** conservative defaults, tweak
  panel, respect reduced-motion (Phase 11).
- **Dependencies:** Phases 1, 3.
- **Acceptance:** camera lags/eases naturally, widens with speed, kicks on impact;
  no jitter.
- **Testing checklist:** high-speed drive feels smooth · zoom scales with speed · impact
  produces a brief kick · minimap/HUD unaffected.
- **Estimate:** 3–4 h.

### Phase 5 — Vehicle feel & handling

- **Objective:** Adapt the reference feel model into `CarController.ts`: soft top-speed
  cap, boost that raises top speed, idle-brake + reverse-brake, surface-based traction
  (dirt/road/ice), tuned tire marks & skid.
- **Reason:** Handling is the core verb of the whole site; "floaty" is our biggest feel
  gap.
- **Files to modify:** `systems/CarController.ts`, `config/tuning.ts`, `systems/
TireMarks.ts`, `world/roads.ts` (`isOnDirt` → friction).
- **Risks:** tuning drift from Matter/arcade differences. **Mitigation:** all constants
  in `tuning.ts` + dev tweak panel; playtest loop.
- **Dependencies:** Phases 1, 3, 4.
- **Acceptance:** acceleration has weight, top speed soft-caps, boost feels distinct,
  surfaces change grip, skid marks track drift.
- **Testing checklist:** accel/brake/reverse/boost feel · dirt vs road grip differs ·
  tire marks appear on skid · no runaway speed.
- **Estimate:** 4 h.

### Phase 6 — Collision & feedback juice

- **Objective:** Force-scaled impact feedback: on collision, compute impact force → play
  a force-scaled impact SFX + brief camera kick + optional **bullet-time** on hard hits +
  particle burst.
- **Reason:** Turns collisions from silent bumps into satisfying events (the reference's
  `onCollision(force,pos)` pattern).
- **Files to create:** `systems/TimeScale.ts` (global time-scale + bullet-time ramp,
  read by systems and `gameStore.frame`).
- **Files to modify:** `WorldScene.ts` (Matter collision → force estimate), `CarFxSystem.
ts`, `DestructionSystem.ts`, `AudioSystem.ts` (impact group), `CameraRig.ts` (kick).
- **Risks:** bullet-time desyncs animations/HUD. **Mitigation:** single time-scale source
  consumed everywhere; cap frequency (antiSpam).
- **Dependencies:** Phases 4, 5; Phase 7 (audio) can land first or stub SFX.
- **Acceptance:** impacts scale sound + shake with speed; rare hard hits briefly slow time;
  no audio spam.
- **Testing checklist:** light vs hard impacts differ audibly/visually · bullet-time ramps
  in/out smoothly · HUD/telemetry stay correct.
- **Estimate:** 3–4 h.

### Phase 7 — Audio overhaul (group mixer + reused assets)

- **Objective:** Restructure `AudioSystem.ts` into a **group mixer** (`play/
playRandomNext/antiSpam/positional fade`), add real audio files (CC0 music + vetted
  SFX) with the synth path as fallback.
- **Reason:** Sound is half of "juice"; the reference's grouped, positional, variant-
  cycling mixer is the model. Music/ambience transform mood.
- **Files to create:** `public/audio/**` (copied CC0 music + vetted SFX), `game/core/
AudioGroups.ts` if separated; update `CREDITS.md` attribution.
- **Files to modify:** `systems/AudioSystem.ts` (mixer + file loading via Phaser sound or
  Howler), event hooks (engine/wheels/impact/collect/reveal/ambient).
- **Risks:** licensing (per §7); autoplay policy. **Mitigation:** CC0 music only for
  guaranteed-safe; verify each SFX; defer audio init to first user gesture; keep synth
  fallback behind a flag.
- **Dependencies:** Phase 6 (impact hooks), Phase 3 (gesture/mute action).
- **Acceptance:** engine/wheel/impact/collect/ambient sounds play, positional-ish fade,
  no repeats-back-to-back, mute persists, music jukebox works, synth fallback still
  selectable.
- **Testing checklist:** first-gesture init · mute toggle persists across reload · impact
  SFX scale · ambience changes by area/time · no console autoplay errors.
- **Estimate:** 4–5 h (+ per-file license verification).

### Phase 8 — Day/night mood via ported `Cycles`

- **Objective:** Port the reference `Cycles` keyframe engine and refactor `DayNightSystem`
  to drive palette/vignette/fog/ambient-audio from keyframed presets with interval events.
- **Reason:** A _continuously recoloring_ world is the reference's atmospheric signature and
  cheap in 2D (tint/vignette layers).
- **Files to create:** `game/core/Cycles.ts` (adapted; color interpolation via our color
  type).
- **Files to modify:** `systems/DayNightSystem.ts`, `systems/ambient/*` (from Phase 2),
  `config/palette.ts` (day/dusk/night/dawn presets, our own hues — not Bruno's).
- **Risks:** color math + perf of frequent tinting. **Mitigation:** interpolate a few
  overlay colors, not per-object; throttle.
- **Dependencies:** Phases 1, 2, 7.
- **Acceptance:** mood shifts smoothly over the cycle; ambient sounds swap by phase; our
  palette identity preserved.
- **Testing checklist:** force each phase via a debug flag · smooth transitions · ambient
  audio matches phase · perf stable.
- **Estimate:** 3–4 h.

### Phase 9 — Interactive-point reveal + cinematic content panel

- **Objective:** Upgrade proximity markers to **proximity + hover** with elastic reveal,
  and make entering a portfolio anchor trigger a **cinematic camera** framing + focused
  paginated panel, disabling driving while open.
- **Reason:** Turns content discovery from "a panel pops up" into a cinematic _moment_ —
  the reference `ProjectsArea` pattern, adapted to our `PortfolioPanel`.
- **Files to modify:** `systems/ProximitySystem.ts` (hover + reveal states), `components/
game/{InteractHint,PortfolioPanel}.tsx`, `CameraRig.ts` (cinematic move), `state/input.
ts` (panel filter from Phase 3), `content/portfolioBindings.ts` (pagination shape).
- **Risks:** camera-return glitches; input lock stuck. **Mitigation:** explicit
  open/close state machine; always restore driving filter on close.
- **Dependencies:** Phases 3, 4.
- **Acceptance:** markers reveal on approach/hover with easing; entering an anchor frames
  it and opens a panel; back/Esc closes and restores driving.
- **Testing checklist:** approach reveals marker · interact opens cinematic panel · pagination
  works · close restores camera + controls · mobile equivalent works.
- **Estimate:** 4–5 h (may split into 9a markers / 9b panel).

### Phase 10 — Intro / loading experience

- **Objective:** Craft an arrival moment: a progress indicator (ring/bar) → an input-scheme
  prompt + mute → click/press starts a **paint-in reveal** of the world.
- **Reason:** First impression sets the entire tone; the reference's intro is a signature
  beat and cheap to evoke in 2D.
- **Files to modify:** `components/game/HudExtras.tsx` (LoadingVeil → intro), `scenes/
BootScene.ts` / `WorldScene.ts` (reveal-from-car wipe), `state/input.ts` (introStart
  action + gesture→audio init).
- **Risks:** blocking load / perceived slowness. **Mitigation:** show intro before heavy
  world build (staged like the reference `World.step`); `#skip` flag for dev.
- **Dependencies:** Phases 3, 7, 8.
- **Acceptance:** load shows progress, a start prompt, mute; starting paints the world in
  from the car; audio inits on that gesture.
- **Testing checklist:** cold load shows intro · start triggers reveal + audio · `#skip`
  works · mobile prompt correct.
- **Estimate:** 3–4 h.

### Phase 11 — Visual art-direction & post-FX pass

- **Objective:** A cohesive art pass: refined palette identity, Phaser post-FX (bloom +
  vignette + subtle gradient sky), consistent typography, GSAP-style eases on HUD reveals.
- **Reason:** Ties the feel upgrades together into a signature look distinct from Bruno's.
- **Files to modify:** `config/palette.ts`, `art/*` (texture tints), `systems/vignette/*`
  (post pipeline), `index.css` / `tailwind.config.ts` (fonts, HUD tokens), HUD components
  (easing).
- **Risks:** over-bloom/perf. **Mitigation:** quality-tiered FX; measure; reduced-motion.
- **Dependencies:** Phases 2, 8.
- **Acceptance:** a distinct, consistent look across areas + day phases; readable HUD; no
  perf regression on mid hardware.
- **Testing checklist:** each area reads well in each day phase · HUD legible · FX scale
  down on low quality · fps stable.
- **Estimate:** 4 h.

### Phase 12 — Accessible `/classic` upgrade + reduced-motion

- **Objective:** Make `/classic` a first-class, accessible experience and wire a global
  reduced-motion / low-power path, plus a clear game↔classic bridge.
- **Reason:** User asked to upgrade the fallback; also the _only_ screen-reader-accessible
  surface (canvas game isn't) — we should **exceed the reference** here.
- **Files to modify:** `pages/Classic.tsx`, `content/sections.tsx`, `pages/Game.tsx` (offer
  classic on reduced-motion/low-power), `services/dataService.ts` (drop fragile localStorage
  override or make it robust), `components/Seo.tsx`.
- **Files to create:** `hooks/useReducedMotion.ts` if not present.
- **Risks:** content drift between game bindings and classic. **Mitigation:** both read the
  same `db.json` via `dataService`.
- **Dependencies:** none hard (can run early); benefits from Phase 0 identity fixes.
- **Acceptance:** `/classic` is semantic, keyboard-navigable, responsive; reduced-motion
  users get a calm path; game and classic cross-link clearly.
- **Testing checklist:** axe/lighthouse a11y pass on `/classic` · keyboard-only nav · reduced-
  motion disables heavy motion · content matches game.
- **Estimate:** 3–4 h.

### Phase 13 — Touch controls & mobile quality

- **Objective:** Adapt a 2D on-screen radial joystick + contextual buttons; confirm mobile
  quality tier scales FX and camera.
- **Reason:** Large share of visitors are mobile; the reference invests heavily here.
- **Files to modify:** `components/game/TouchControls.tsx`, `state/input.ts` (touch actions),
  quality gating in FX/camera systems, `hooks/use-mobile.tsx`.
- **Risks:** touch + camera-pan conflicts. **Mitigation:** clear gesture zones; test on real
  devices/emulation.
- **Dependencies:** Phases 3, 4, 11.
- **Acceptance:** playable one-handed on phone; FX scale down; no gesture conflicts.
- **Testing checklist:** drive via joystick · interact buttons work · pinch/pan (if enabled)
  · fps acceptable on mid phone.
- **Estimate:** 3–4 h.

### Phase 14 — Polish, QA & deploy consolidation

- **Objective:** Cross-device tuning pass, consolidate deploy target/identity, finalize SEO,
  and a full regression sweep.
- **Reason:** Ship a coherent product; resolve the three-deploy-target confusion.
- **Files to modify:** `vite.config.ts`, `index.html`/`Seo.tsx`, `firebase.json`/gh-pages
  config, `package.json`, `CREDITS.md` (final attribution), `config/tuning.ts` (final values).
- **Risks:** routing/SEO regressions (HashRouter). **Mitigation:** decide BrowserRouter+SPA
  fallback vs keep Hash; test share links.
- **Dependencies:** all prior.
- **Acceptance:** one canonical domain, consistent identity, valid SEO/OG, green regression on
  desktop + mobile.
- **Testing checklist:** full playthrough desktop + mobile · share-link preview · achievements/
  save/load intact · Lighthouse perf/SEO/a11y acceptable.
- **Estimate:** 3–4 h.

### Optional (P4)

- **Phase 15 — Gamepad support** (adapt reference remap tables). ~3 h.
- **Phase 16 — Easter eggs / delight** (konami, hidden area, seasonal `YearCycles`). ~2–3 h.
- **Phase 17 — AI NPC & mission polish** (already ours; deepen dialog, tie to progression). ~3 h.

---

## Verification (global)

- **Run:** `npm run dev` (port 8080); primary route `/` drives the game, `/classic` is the
  fallback. `npm run build` must stay green each phase.
- **Automated smoke:** the DEV-only `window.__drive` hook (`src/game/usePhaserGame.ts`) exposes
  the game for Playwright — use it to script drive/collect/open-panel checks per phase (see
  `webapp-testing` skill for Playwright driving).
- **Regression guard:** keep before/after screenshots for visual phases (1, 2, 8, 11);
  verify save/load (`vishal-drive-save-v3`), achievements, and missions after any state-touching
  phase.
- **Per-phase:** exercise the specific flow that phase changed, not just the build — drive it.

## Sequencing summary

P0 → **P1 feel (Phases 1–2 arch, 3 input, 4 camera, 5 vehicle, 6 collision, 7 audio)** →
**P2 systems/story (8 cycles, 9 reveal/panel, 12 accessible classic)** →
**P3 atmosphere/entry (10 intro, 11 art, 13 touch)** → **P4 optional (14 polish, 15–17)**.
Phases 0, 12 can run early/independently. Phases 4–7 deliver the largest perceived-quality jump.

---

## ✅ Progress Checklist

> Living tracker — I tick these off as each phase is completed and verified. A phase
> is only checked when its **acceptance criteria pass** and the build is green.
> Legend: `[ ]` not started · `[~]` in progress · `[x]` done & verified.

- [x] **Phase 0 — Repo hygiene & truthful docs** ✅ _(branch `redesign/phase-0-hygiene`)_
  - [x] Dropped **47 unused deps** (all of shadcn's radix/cmdk/vaul/recharts/react-hook-form/zod/react-query/next-themes/axios/uuid/date-fns…), fixed `package.json` name (`vishal-portfolio`) + homepage (`https://vishu.dev`); `npm install` pruned **194 packages**. Kept `tailwindcss-animate` (used by `tailwind.config.ts`).
  - [x] Rewrote `CREDITS.md` (actual Phaser game, not the phantom R3F "Forgotten Forest") + real `README.md`
  - [x] Removed `admin` creds block from `db.json`; locked `firestore.rules` to default-deny; emptied dead `messages` indexes
  - [x] Deleted dead `components/ui/*` (all 46 — zero app imports), legacy `chatWithGemini` + `prompt.txt` (+ unused `cors` dep), phantom `@react-three`
  - [x] Added `manualChunks` → phaser split into its own 1.48 MB chunk; `npm run build` ✓, `tsc --noEmit` ✓ (0 errors), no creds in `dist`, CNAME preserved
- [ ] **Phase 1 — Shared core utilities + system-order registry**
- [ ] `game/core/maths.ts`, `Events.ts`, `systemOrder.ts` created
- [ ] Systems import shared maths/palette (zero duplicated constants)
- [ ] `WorldScene.update` runs in documented order; visual parity
- [ ] **Phase 2 — Split the god-systems** (`WorldVignetteSystem`, `AmbientWorldSystem` → <300-line modules, identical visuals)
- [ ] **Phase 3 — Input action-mapping + context filters** (actions + `intro/driving/panel/menu` filters; controls unchanged)
- [ ] **Phase 4 — Camera redesign** (magnet follow + speed-zoom + impact roll kick; no jitter)
- [ ] **Phase 5 — Vehicle feel & handling** (soft top-speed cap, reverse-brake, boost, surface traction, skid marks)
- [ ] **Phase 6 — Collision & feedback juice** (force-scaled SFX + camera kick + bullet-time; `TimeScale.ts`)
- [ ] **Phase 7 — Audio overhaul** (group mixer, CC0 music + vetted SFX, synth fallback, mute persists)
- [ ] **Phase 8 — Day/night mood via ported `Cycles`** (smooth recolor + ambient audio by phase)
- [ ] **Phase 9 — Interactive-point reveal + cinematic content panel** (proximity+hover reveal; cinematic open/close)
- [ ] **Phase 10 — Intro / loading experience** (progress + start prompt + mute → paint-in reveal; audio inits on gesture)
- [ ] **Phase 11 — Visual art-direction & post-FX pass** (palette identity, bloom/vignette/sky, typography, eased HUD)
- [ ] **Phase 12 — Accessible `/classic` upgrade + reduced-motion** (semantic, keyboard-nav, a11y pass, calm path)
- [ ] **Phase 13 — Touch controls & mobile quality** (2D radial joystick + buttons; FX scale down; no gesture conflicts)
- [ ] **Phase 14 — Polish, QA & deploy consolidation** (one domain/identity, valid SEO, green regression desktop+mobile)
- [ ] **Phase 15 — (optional) Gamepad support**
- [ ] **Phase 16 — (optional) Easter eggs / delight**
- [ ] **Phase 17 — (optional) AI NPC & mission polish**
