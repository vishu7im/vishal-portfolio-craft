# Credits & Asset Licenses

This portfolio is an interactive **2D top-down driving game** built with
[Phaser 3](https://phaser.io) (Matter.js physics) and a React 18 + TypeScript
shell. You drive a car around a stylized world whose districts map to career
chapters, collect items, run missions, and reveal project/skill panels, with an
in-game AI chat NPC. A `/classic` route offers a plain résumé fallback.

All **art** is generated procedurally in code (no PNGs, sprites, or 3D models),
and all **sound effects** are synthesized at runtime via the Web Audio API. The
only external asset files are three **CC0** (public-domain) background-music
tracks; see **Audio** below.

## Art

- **All environments and props** — procedurally generated at runtime in
  `src/game/art/*` (canvas-drawn textures for ground, buildings, vehicles, props
  and collectibles). No PNGs, sprites, or 3D models.

## Audio

Audio is organised as a small **group mixer** (`src/game/systems/AudioSystem.ts`):
`master → toneFilter → compressor → destination`, with three group buses hanging
off master — `musicBus`, `sfxBus`, and `ambientBus`.

- **Sound effects & ambience** — fully synthesized at runtime by
  `AudioSystem.ts` (Web Audio oscillators/noise), routed through the sfx/ambient
  buses. Impact SFX are stereo-panned by on-screen position and share an
  anti-spam throttle. No external SFX files are used.
- **Background music** — three **CC0 1.0 (public-domain)** tracks by
  **Bruno Simon**, reused from his [folio-2025](https://github.com/brunosimon/folio-2025)
  project (`static/sounds/musics/`, released CC0 — see
  `public/audio/music/LICENSE-CC0.md`). Streamed by a two-deck crossfading
  jukebox (`src/game/systems/MusicPlayer.ts`) on the music bus. Files:
  `public/audio/music/{Boy,Baguira,Sudo}.mp3`.

> The reference project also ships many SFX/ambience clips, but those are from
> commercial stock libraries and are **not** cleared for redistribution, so none
> are reused — our synthesized path covers every SFX instead.

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
(MIT © 2025 Bruno Simon). No code, art, or branding from that project is copied
here — only ideas and pure-utility patterns adapted to our own 2D Phaser stack
and identity, plus the three **CC0** (public-domain) music tracks noted under
**Audio** above.

## Content

Portfolio content (projects, skills, experience, education, testimonials) lives
in `src/data/db.json` and feeds both the in-game panels and the `/classic`
résumé view. The AI NPC's system prompt is generated from that same data by
`functions/buildPrompt.js` (→ `functions/game-prompt.txt`).
