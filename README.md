# Vishal Munday — Portfolio

An interactive portfolio built as a **2D top-down driving game**. Drive a car
around a stylized world whose districts map to career chapters, collect items,
run missions, and reveal project/skill panels — with an in-game AI chat NPC. A
`/classic` route provides a plain, accessible résumé fallback.

**Live:** https://vishu.dev

## Tech stack

- **Game:** [Phaser 3](https://phaser.io) with Matter.js physics
  (`src/game/`) — scenes, ~17 systems, procedural art, and a hand-rolled
  dual-channel store (`src/game/state/gameStore.ts`).
- **Shell/UI:** React 18 + TypeScript, React Router (HashRouter), Tailwind CSS.
  In-game HUD overlays live in `src/components/game/`.
- **Build:** Vite 5 (`npm run dev` serves on port **8080**).
- **Backend (optional):** a Firebase Cloud Function `portfolioChat`
  (`functions/`) powers the AI NPC. When `VITE_CHAT_ENDPOINT` is unset or the
  endpoint fails, the NPC falls back to a scripted offline flow, so the game is
  fully playable with no backend.

## Project layout

```
src/
  game/            Phaser game
    scenes/        BootScene, WorldScene (orchestrator)
    systems/       car, camera, audio, missions, achievements, ambient, …
    world/         world layout, districts (areas/), roads, scatter
    art/            procedural texture factories (no asset files)
    state/         gameStore (dual-channel), input
    content/       portfolio bindings, narrative, scripted chat
    config/        palette, tuning constants
  components/game/  React HUD overlays (Hud, Minimap, ChatPanel, panels, …)
  pages/            Game (/), Classic (/classic), NotFound (*)
  data/db.json      portfolio content (projects, skills, experience, …)
functions/          Firebase Cloud Functions (portfolioChat NPC)
```

## Development

```sh
npm install
npm run dev      # http://localhost:8080
npm run build    # production build to dist/
npm run lint
```

There is a DEV-only automation hook: `window.__drive` (see
`src/game/usePhaserGame.ts`) exposes the running game for Playwright smoke tests.

## Content

Edit `src/data/db.json` to update projects, skills, experience, education, and
testimonials. That single source feeds the in-game panels, the `/classic` view,
and the AI NPC's generated system prompt (`functions/buildPrompt.js`).

## Credits

See [CREDITS.md](./CREDITS.md) for asset, font, library, and inspiration
attributions.
