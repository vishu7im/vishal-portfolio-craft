# Credits & Asset Licenses

This portfolio is an interactive **2D top-down driving game** built with
[Phaser 3](https://phaser.io) (Matter.js physics) and a React 18 + TypeScript
shell. You drive a car around a stylized world whose districts map to career
chapters, collect items, run missions, and reveal project/skill panels, with an
in-game AI chat NPC. A `/classic` route offers a plain résumé fallback.

It deliberately ships **no external art or audio asset files today**: every
environment, texture, and particle is generated procedurally in code, and all
sound is synthesized at runtime via the Web Audio API.

## Art

- **All environments and props** — procedurally generated at runtime in
  `src/game/art/*` (canvas-drawn textures for ground, buildings, vehicles, props
  and collectibles). No PNGs, sprites, or 3D models.

## Audio

- **Music, ambience & SFX** — fully synthesized at runtime by
  `src/game/systems/AudioSystem.ts` (Web Audio oscillators/noise). No external
  audio files.

## Fonts

- **Geist / Geist Mono** by Vercel — SIL Open Font License 1.1.
- **Press Start 2P** by CodeMan38 — SIL Open Font License 1.1.

  Loaded from Google Fonts (see `index.html`).

## Engine & libraries

- [Phaser 3](https://phaser.io) — MIT.
- React, React Router, Vite, Tailwind CSS, lucide-react, react-hot-toast,
  react-markdown — MIT.
- Backend AI NPC: a Firebase Cloud Function (`functions/portfolioChat.js`) using
  Google's Generative AI SDK, with a scripted offline fallback
  (`src/game/content/scriptedChat.ts`).

## Inspiration

Design patterns, game-feel tuning ideas, and the "drive to explore a portfolio"
concept are inspired by [Bruno Simon's 2025 folio](https://github.com/brunosimon/folio-2025)
(MIT © 2025 Bruno Simon). No code, art, audio, or branding from that project is
copied here — only ideas and pure-utility patterns adapted to our own 2D Phaser
stack and identity.

## Content

Portfolio content (projects, skills, experience, education, testimonials) lives
in `src/data/db.json` and feeds both the in-game panels and the `/classic`
résumé view. The AI NPC's system prompt is generated from that same data by
`functions/buildPrompt.js` (→ `functions/game-prompt.txt`).
