import Phaser from "phaser";
import type { CollectibleKind } from "../types";
import { bakeSvg } from "./textureFactory";

// Collectibles scattered across the world — coins, computer chips, AI cores,
// golden keyboards and rubber ducks. Authored as SVG, baked once.

interface CollectibleArt {
  kind: CollectibleKind;
  w: number;
  h: number;
  svg: string;
}

const A: Record<CollectibleKind, CollectibleArt> = {
  coin: {
    kind: "coin",
    w: 34,
    h: 34,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34">
      <circle cx="17" cy="17" r="14" fill="#f2b843" stroke="#c98a1e" stroke-width="2"/>
      <circle cx="17" cy="17" r="9" fill="none" stroke="#fdd97a" stroke-width="2"/>
      <path d="M 17 9 L 17 25 M 13 13 L 21 13 M 13 21 L 21 21" stroke="#c98a1e" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="12" cy="12" rx="3.5" ry="2" fill="rgba(255,255,255,0.8)"/>
    </svg>`,
  },
  chip: {
    kind: "chip",
    w: 34,
    h: 34,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34">
      <g stroke="#2f6df0" stroke-width="2">
        <line x1="9" y1="4" x2="9" y2="9"/><line x1="17" y1="4" x2="17" y2="9"/><line x1="25" y1="4" x2="25" y2="9"/>
        <line x1="9" y1="30" x2="9" y2="25"/><line x1="17" y1="30" x2="17" y2="25"/><line x1="25" y1="30" x2="25" y2="25"/>
        <line x1="4" y1="9" x2="9" y2="9"/><line x1="4" y1="17" x2="9" y2="17"/><line x1="4" y1="25" x2="9" y2="25"/>
        <line x1="30" y1="9" x2="25" y2="9"/><line x1="30" y1="17" x2="25" y2="17"/><line x1="30" y1="25" x2="25" y2="25"/>
      </g>
      <rect x="8" y="8" width="18" height="18" rx="3" fill="#2f6df0" stroke="#1c49b0" stroke-width="1.5"/>
      <rect x="13" y="13" width="8" height="8" rx="1.5" fill="#9fc0ff"/>
    </svg>`,
  },
  "ai-core": {
    kind: "ai-core",
    w: 36,
    h: 36,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
      <defs><radialGradient id="core" cx="0.5" cy="0.4" r="0.6">
        <stop offset="0" stop-color="#e6ddff"/><stop offset="0.6" stop-color="#7b5cff"/><stop offset="1" stop-color="#4c33c0"/>
      </radialGradient></defs>
      <circle cx="18" cy="18" r="13" fill="url(#core)" stroke="#4c33c0" stroke-width="1.5"/>
      <g fill="none" stroke="#d9ccff" stroke-width="1.4" opacity="0.9">
        <circle cx="18" cy="18" r="7"/>
        <path d="M 18 11 L 18 25 M 11 18 L 25 18"/>
      </g>
      <circle cx="18" cy="18" r="2.4" fill="#fff"/>
    </svg>`,
  },
  keyboard: {
    kind: "keyboard",
    w: 44,
    h: 30,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="30" viewBox="0 0 44 30">
      <rect x="3" y="7" width="38" height="18" rx="3" fill="#f2b843" stroke="#c98a1e" stroke-width="1.5"/>
      <g fill="#fff4d2">
        <rect x="6" y="10" width="4" height="4" rx="1"/><rect x="12" y="10" width="4" height="4" rx="1"/><rect x="18" y="10" width="4" height="4" rx="1"/><rect x="24" y="10" width="4" height="4" rx="1"/><rect x="30" y="10" width="4" height="4" rx="1"/>
        <rect x="9" y="16" width="4" height="4" rx="1"/><rect x="15" y="16" width="14" height="4" rx="1"/><rect x="31" y="16" width="4" height="4" rx="1"/>
      </g>
    </svg>`,
  },
  duck: {
    kind: "duck",
    w: 34,
    h: 34,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34">
      <ellipse cx="16" cy="24" rx="13" ry="8" fill="#ffd84d"/>
      <circle cx="23" cy="14" r="8" fill="#ffe06b"/>
      <circle cx="25" cy="12" r="1.6" fill="#20242c"/>
      <path d="M 30 14 q 5 0 4 3 q -3 1 -5 -1 Z" fill="#f0813a"/>
      <ellipse cx="12" cy="9" rx="4" ry="2.4" fill="rgba(255,255,255,0.7)"/>
    </svg>`,
  },
};

export async function buildCollectibleTextures(scene: Phaser.Scene): Promise<void> {
  await Promise.all(
    Object.values(A).map((a) => bakeSvg(scene, `col-${a.kind}`, a.svg, a.w, a.h))
  );
}
