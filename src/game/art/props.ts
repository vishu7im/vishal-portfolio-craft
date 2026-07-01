import Phaser from "phaser";
import type { PropKind } from "../types";
import { bakeSvg } from "./textureFactory";

// Hand-picked, fixed-colour prop art (regional colour comes from the ground
// blobs, not from tinting these). Each spec carries its logical size and a
// collision descriptor the scene uses to build Matter bodies.

export interface PropBody {
  shape: "circle" | "rect" | "none";
  /** collision size as a fraction of the logical texture size */
  r?: number; // circle radius fraction of width
  w?: number; // rect width fraction
  h?: number; // rect height fraction
  sensor?: boolean;
}

export interface PropSpec {
  kind: PropKind;
  w: number;
  h: number;
  body: PropBody;
  svg: string;
}

const shadow = (cx: number, cy: number, rx: number, ry: number) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="rgba(22,26,34,0.16)"/>`;

const S: Record<PropKind, PropSpec> = {
  tree: {
    kind: "tree",
    w: 88,
    h: 104,
    body: { shape: "circle", r: 0.2 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="88" height="104" viewBox="0 0 88 104">
      ${shadow(44, 96, 26, 8)}
      <rect x="39" y="60" width="10" height="34" rx="4" fill="#7a5638"/>
      <circle cx="30" cy="46" r="24" fill="#3a7d54"/>
      <circle cx="58" cy="44" r="26" fill="#347049"/>
      <circle cx="44" cy="30" r="26" fill="#4e9e6a"/>
      <circle cx="36" cy="24" r="9" fill="#66b481" opacity="0.8"/>
    </svg>`,
  },
  pine: {
    kind: "pine",
    w: 70,
    h: 108,
    body: { shape: "circle", r: 0.18 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="70" height="108" viewBox="0 0 70 108">
      ${shadow(35, 100, 20, 6)}
      <rect x="31" y="80" width="8" height="22" rx="3" fill="#6f4e33"/>
      <polygon points="35,10 58,54 12,54" fill="#2f6e49"/>
      <polygon points="35,30 62,78 8,78" fill="#357c52"/>
      <polygon points="35,50 66,96 4,96" fill="#3e8c5c"/>
    </svg>`,
  },
  bush: {
    kind: "bush",
    w: 60,
    h: 46,
    body: { shape: "none", sensor: true },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="46" viewBox="0 0 60 46">
      ${shadow(30, 40, 22, 5)}
      <circle cx="18" cy="26" r="14" fill="#4a9564"/>
      <circle cx="40" cy="26" r="15" fill="#3f8557"/>
      <circle cx="30" cy="18" r="15" fill="#54a56f"/>
    </svg>`,
  },
  barrel: {
    kind: "barrel",
    w: 42,
    h: 42,
    body: { shape: "circle", r: 0.42 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 42 42">
      ${shadow(21, 34, 17, 5)}
      <circle cx="21" cy="20" r="18" fill="#c26b3b" stroke="#20242c" stroke-width="1.5"/>
      <circle cx="21" cy="20" r="12" fill="none" stroke="#8f4a26" stroke-width="2"/>
      <circle cx="21" cy="20" r="6" fill="#e08a52"/>
      <path d="M 8 14 A 18 18 0 0 1 30 8" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
  crate: {
    kind: "crate",
    w: 42,
    h: 42,
    body: { shape: "rect", w: 0.82, h: 0.82 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 42 42">
      ${shadow(21, 37, 18, 4)}
      <rect x="5" y="4" width="32" height="32" rx="4" fill="#c79a5c" stroke="#20242c" stroke-width="1.5"/>
      <rect x="5" y="4" width="32" height="32" rx="4" fill="none" stroke="#8f6a38" stroke-width="2"/>
      <path d="M 7 6 L 35 34 M 35 6 L 7 34" stroke="#8f6a38" stroke-width="2"/>
    </svg>`,
  },
  cone: {
    kind: "cone",
    w: 28,
    h: 28,
    body: { shape: "circle", r: 0.3, sensor: false },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
      ${shadow(14, 22, 11, 4)}
      <circle cx="14" cy="14" r="11" fill="#f0813a" stroke="#20242c" stroke-width="1.2"/>
      <circle cx="14" cy="14" r="6" fill="#fff" opacity="0.85"/>
      <circle cx="14" cy="14" r="2.4" fill="#f0813a"/>
    </svg>`,
  },
  sign: {
    kind: "sign",
    w: 56,
    h: 62,
    body: { shape: "rect", w: 0.2, h: 0.3 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="62" viewBox="0 0 56 62">
      ${shadow(28, 58, 12, 4)}
      <rect x="25" y="26" width="6" height="30" rx="3" fill="#7a5638"/>
      <rect x="4" y="6" width="48" height="26" rx="5" fill="#f2e6cf" stroke="#20242c" stroke-width="1.5"/>
      <rect x="4" y="6" width="48" height="7" rx="4" fill="#e0663a"/>
    </svg>`,
  },
  rock: {
    kind: "rock",
    w: 52,
    h: 44,
    body: { shape: "circle", r: 0.4 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="52" height="44" viewBox="0 0 52 44">
      ${shadow(26, 38, 20, 5)}
      <path d="M 8 30 Q 6 14 22 12 Q 40 8 46 24 Q 48 34 34 36 Q 16 40 8 30 Z" fill="#9aa1ac" stroke="#20242c" stroke-width="1.4"/>
      <path d="M 16 20 Q 26 16 34 20" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
  lamp: {
    kind: "lamp",
    w: 30,
    h: 68,
    body: { shape: "circle", r: 0.16 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="68" viewBox="0 0 30 68">
      ${shadow(15, 63, 9, 3)}
      <rect x="12" y="20" width="6" height="42" rx="3" fill="#454b57"/>
      <circle cx="15" cy="14" r="10" fill="#ffe9a8"/>
      <circle cx="15" cy="14" r="6" fill="#fff5d0"/>
    </svg>`,
  },
  building: {
    kind: "building",
    w: 170,
    h: 150,
    body: { shape: "rect", w: 0.86, h: 0.72 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="170" height="150" viewBox="0 0 170 150">
      ${shadow(85, 140, 78, 10)}
      <rect x="12" y="20" width="146" height="112" rx="10" fill="#c9cfda" stroke="#20242c" stroke-width="1.6"/>
      <rect x="12" y="20" width="146" height="26" rx="10" fill="#aeb6c4"/>
      <g fill="#5a6273">
        <rect x="28" y="58" width="22" height="18" rx="3"/>
        <rect x="60" y="58" width="22" height="18" rx="3"/>
        <rect x="92" y="58" width="22" height="18" rx="3"/>
        <rect x="124" y="58" width="18" height="18" rx="3"/>
        <rect x="28" y="86" width="22" height="18" rx="3"/>
        <rect x="60" y="86" width="22" height="18" rx="3"/>
        <rect x="92" y="86" width="22" height="18" rx="3"/>
        <rect x="124" y="86" width="18" height="18" rx="3"/>
      </g>
      <rect x="72" y="108" width="26" height="24" rx="3" fill="#3a4150"/>
    </svg>`,
  },
  ramp: {
    kind: "ramp",
    w: 66,
    h: 50,
    body: { shape: "none", sensor: true },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="66" height="50" viewBox="0 0 66 50">
      ${shadow(33, 44, 26, 5)}
      <rect x="6" y="12" width="54" height="28" rx="6" fill="#5a6170" stroke="#20242c" stroke-width="1.4"/>
      <g fill="#ffd36b">
        <polygon points="16,34 26,18 32,18 22,34"/>
        <polygon points="30,34 40,18 46,18 36,34"/>
        <polygon points="44,34 54,18 60,18 50,34"/>
      </g>
    </svg>`,
  },
  puddle: {
    kind: "puddle",
    w: 78,
    h: 50,
    body: { shape: "none", sensor: true },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="78" height="50" viewBox="0 0 78 50">
      <path d="M 10 30 Q 6 16 26 14 Q 50 8 64 20 Q 74 30 56 38 Q 30 46 10 30 Z" fill="#7fc9d8" opacity="0.7"/>
      <path d="M 22 22 Q 34 18 44 22" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
  palm: {
    kind: "palm",
    w: 76,
    h: 104,
    body: { shape: "circle", r: 0.12 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="76" height="104" viewBox="0 0 76 104">
      ${shadow(38, 96, 22, 7)}
      <path d="M 38 92 Q 34 60 42 34" fill="none" stroke="#9a6b3f" stroke-width="8" stroke-linecap="round"/>
      <g fill="#3f9d63">
        <path d="M 40 34 Q 14 22 4 34 Q 24 30 40 40 Z"/>
        <path d="M 40 34 Q 66 20 74 34 Q 52 30 40 40 Z"/>
        <path d="M 40 32 Q 24 8 14 8 Q 32 16 40 38 Z"/>
        <path d="M 40 32 Q 56 8 66 10 Q 48 16 40 38 Z"/>
        <path d="M 40 30 Q 40 6 40 4 Q 44 18 44 36 Z"/>
      </g>
      <circle cx="40" cy="34" r="5" fill="#7a5638"/>
    </svg>`,
  },
  umbrella: {
    kind: "umbrella",
    w: 62,
    h: 60,
    body: { shape: "circle", r: 0.16 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="62" height="60" viewBox="0 0 62 60">
      ${shadow(31, 52, 20, 5)}
      <rect x="29" y="26" width="4" height="28" rx="2" fill="#7a5638"/>
      <circle cx="31" cy="26" r="24" fill="#f2f0ea"/>
      <path d="M 31 2 A 24 24 0 0 1 55 26 L 43 26 A 12 12 0 0 0 31 14 Z" fill="#f0813a"/>
      <path d="M 31 2 A 24 24 0 0 0 7 26 L 19 26 A 12 12 0 0 1 31 14 Z" fill="#f0994b"/>
      <path d="M 7 26 A 24 24 0 0 0 19 26 A 12 12 0 0 1 31 38 A 12 12 0 0 1 43 26 A 24 24 0 0 0 55 26" fill="none" stroke="#e0663a" stroke-width="1.5"/>
      <circle cx="31" cy="26" r="3" fill="#e0663a"/>
    </svg>`,
  },
  server: {
    kind: "server",
    w: 64,
    h: 92,
    body: { shape: "rect", w: 0.7, h: 0.6 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="92" viewBox="0 0 64 92">
      ${shadow(32, 84, 26, 7)}
      <rect x="10" y="8" width="44" height="72" rx="6" fill="#39414f" stroke="#20242c" stroke-width="1.6"/>
      <rect x="10" y="8" width="44" height="14" rx="6" fill="#4a5464"/>
      <g>
        <rect x="16" y="28" width="32" height="8" rx="2" fill="#2a303b"/>
        <rect x="16" y="40" width="32" height="8" rx="2" fill="#2a303b"/>
        <rect x="16" y="52" width="32" height="8" rx="2" fill="#2a303b"/>
        <rect x="16" y="64" width="32" height="8" rx="2" fill="#2a303b"/>
      </g>
      <g>
        <circle cx="20" cy="32" r="1.8" fill="#39a0f0"/><circle cx="26" cy="32" r="1.8" fill="#4ce0a0"/>
        <circle cx="20" cy="44" r="1.8" fill="#4ce0a0"/><circle cx="26" cy="44" r="1.8" fill="#39a0f0"/>
        <circle cx="20" cy="56" r="1.8" fill="#39a0f0"/><circle cx="26" cy="56" r="1.8" fill="#4ce0a0"/>
        <circle cx="20" cy="68" r="1.8" fill="#f2b843"/><circle cx="26" cy="68" r="1.8" fill="#4ce0a0"/>
      </g>
    </svg>`,
  },
  silo: {
    kind: "silo",
    w: 58,
    h: 98,
    body: { shape: "circle", r: 0.32 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="58" height="98" viewBox="0 0 58 98">
      ${shadow(29, 90, 22, 6)}
      <rect x="12" y="24" width="34" height="64" rx="8" fill="#b8a894" stroke="#20242c" stroke-width="1.6"/>
      <ellipse cx="29" cy="24" rx="17" ry="9" fill="#cabca8"/>
      <path d="M 14 24 Q 29 2 44 24 Z" fill="#a79684"/>
      <g stroke="#8a7a66" stroke-width="1.5">
        <line x1="12" y1="42" x2="46" y2="42"/><line x1="12" y1="58" x2="46" y2="58"/><line x1="12" y1="74" x2="46" y2="74"/>
      </g>
    </svg>`,
  },
  tent: {
    kind: "tent",
    w: 84,
    h: 66,
    body: { shape: "rect", w: 0.7, h: 0.5 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="84" height="66" viewBox="0 0 84 66">
      ${shadow(42, 60, 34, 5)}
      <polygon points="42,10 76,56 8,56" fill="#5aa0d8" stroke="#20242c" stroke-width="1.6"/>
      <polygon points="42,10 56,56 28,56" fill="#3f7fb0"/>
      <polygon points="42,26 52,56 32,56" fill="#2a2f3a"/>
      <rect x="40" y="4" width="4" height="10" rx="2" fill="#7a5638"/>
    </svg>`,
  },
  flag: {
    kind: "flag",
    w: 42,
    h: 74,
    body: { shape: "circle", r: 0.12 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="42" height="74" viewBox="0 0 42 74">
      ${shadow(18, 68, 10, 4)}
      <rect x="15" y="10" width="4" height="58" rx="2" fill="#5a6170"/>
      <path d="M 19 12 L 40 18 L 19 26 Z" fill="#e0663a" stroke="#20242c" stroke-width="1.2"/>
    </svg>`,
  },
};

export const PROP_SPECS = S;

export async function buildPropTextures(scene: Phaser.Scene): Promise<void> {
  await Promise.all(
    Object.values(S).map((s) => bakeSvg(scene, `prop-${s.kind}`, s.svg, s.w, s.h))
  );
}
