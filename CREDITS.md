# Credits & Asset Licenses

**"The Forgotten Forest"** — the interactive, atmospheric portfolio world — is
built with [three.js](https://threejs.org) + [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
and React. It deliberately ships **no external art or audio asset files**: every
environment, texture, particle, and sound is generated procedurally in code.

## Art

- **All environments** — procedurally generated at runtime: painterly canvas
  textures (layered gradients + value/fractal noise), soft billboard "impostor"
  foliage, gradient skydomes, volumetric fog, and a bloom / light-shaft
  post-processing stack (three.js `EffectComposer`, `UnrealBloomPass`,
  `VignetteShader`). No PNGs, sprites, or 3D models.

## Audio

- **Music & ambience** — fully synthesized at runtime via the Web Audio API
  (layered oscillator pads, filtered-noise ambience, sparse motifs), adaptive
  per biome. No external audio files.

## Fonts

- **Geist / Geist Mono** by Vercel. License: **SIL Open Font License 1.1**.

## Engine & libraries

- [three.js](https://threejs.org), [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber),
  [@react-three/drei](https://github.com/pmndrs/drei) — MIT.
- React, Vite, Tailwind CSS, shadcn/ui, lucide-react.

The world's content (projects, skills, education, etc.) is sourced from
`src/data/db.json`; authored narrative copy (biome intros, achievements, future
goals) lives in `src/world/content/narrative.ts`.
