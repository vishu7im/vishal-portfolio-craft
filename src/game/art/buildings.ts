import type { PropKind } from "../types";
import type { PropSpec } from "./props";

// Significance-tiered building art. Size tells the story: a childhood house is
// small, the AI Lab dominates its whole district. Same ink/paper language as
// props.ts — fixed colours, soft shadow, 1.5px ink strokes.

const shadow = (cx: number, cy: number, rx: number, ry: number) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="rgba(22,26,34,0.16)"/>`;

type BuildingKind =
  | "house"
  | "school"
  | "office"
  | "loft"
  | "factory"
  | "hq"
  | "aiLab"
  | "futureGate"
  | "cafe"
  | "billboard";

export const BUILDING_SPECS: Record<BuildingKind, PropSpec> = {
  // --- tier 1: small & personal -------------------------------------------
  house: {
    kind: "house",
    w: 140,
    h: 130,
    body: { shape: "rect", w: 0.8, h: 0.56 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="130" viewBox="0 0 140 130">
      ${shadow(70, 121, 60, 8)}
      <rect x="98" y="22" width="14" height="26" rx="3" fill="#8f6a55" stroke="#20242c" stroke-width="1.4"/>
      <rect x="18" y="52" width="104" height="64" rx="8" fill="#f2e6cf" stroke="#20242c" stroke-width="1.6"/>
      <polygon points="70,10 132,56 8,56" fill="#c26b3b" stroke="#20242c" stroke-width="1.6"/>
      <polygon points="70,20 118,54 22,54" fill="#d87d48"/>
      <rect x="60" y="80" width="22" height="36" rx="4" fill="#7a5638" stroke="#20242c" stroke-width="1.4"/>
      <circle cx="77" cy="99" r="2" fill="#f2b843"/>
      <rect x="30" y="72" width="20" height="18" rx="3" fill="#ffe9a8" stroke="#20242c" stroke-width="1.3"/>
      <rect x="92" y="72" width="20" height="18" rx="3" fill="#ffe9a8" stroke="#20242c" stroke-width="1.3"/>
      <path d="M 40 72 v 18 M 30 81 h 20 M 102 72 v 18 M 92 81 h 20" stroke="#20242c" stroke-width="1"/>
    </svg>`,
  },
  cafe: {
    kind: "cafe",
    w: 140,
    h: 122,
    body: { shape: "rect", w: 0.8, h: 0.55 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="122" viewBox="0 0 140 122">
      ${shadow(70, 113, 58, 7)}
      <rect x="16" y="34" width="108" height="74" rx="8" fill="#e9dcc3" stroke="#20242c" stroke-width="1.6"/>
      <rect x="10" y="30" width="120" height="18" rx="8" fill="#e0663a" stroke="#20242c" stroke-width="1.5"/>
      <g fill="#f2e6cf">
        <rect x="20" y="32" width="12" height="14" rx="4"/>
        <rect x="46" y="32" width="12" height="14" rx="4"/>
        <rect x="72" y="32" width="12" height="14" rx="4"/>
        <rect x="98" y="32" width="12" height="14" rx="4"/>
      </g>
      <rect x="56" y="70" width="26" height="38" rx="4" fill="#39414f" stroke="#20242c" stroke-width="1.4"/>
      <rect x="24" y="62" width="24" height="22" rx="3" fill="#fff6df" stroke="#20242c" stroke-width="1.2"/>
      <rect x="92" y="62" width="24" height="22" rx="3" fill="#fff6df" stroke="#20242c" stroke-width="1.2"/>
      <circle cx="70" cy="16" r="12" fill="#f2e6cf" stroke="#20242c" stroke-width="1.5"/>
      <path d="M 65 13 h 8 v 6 a 4 4 0 0 1 -8 0 Z" fill="#8f6a55"/>
      <path d="M 73 14 a 3 3 0 0 1 0 5" fill="none" stroke="#8f6a55" stroke-width="1.4"/>
    </svg>`,
  },
  billboard: {
    kind: "billboard",
    w: 150,
    h: 160,
    body: { shape: "rect", w: 0.55, h: 0.16 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="160" viewBox="0 0 150 160">
      ${shadow(75, 152, 44, 6)}
      <rect x="36" y="92" width="8" height="60" rx="3" fill="#5a6170"/>
      <rect x="106" y="92" width="8" height="60" rx="3" fill="#5a6170"/>
      <rect x="10" y="14" width="130" height="84" rx="8" fill="#202631" stroke="#20242c" stroke-width="1.8"/>
      <rect x="16" y="20" width="118" height="72" rx="5" fill="#2a303b"/>
      <polyline points="26,78 48,58 66,66 92,38 124,30" fill="none" stroke="#4ce0a0" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="124" cy="30" r="5" fill="#4ce0a0"/>
      <rect x="26" y="30" width="34" height="7" rx="3" fill="#39a0f0" opacity="0.85"/>
      <rect x="26" y="42" width="22" height="6" rx="3" fill="#7b5cff" opacity="0.7"/>
      <circle cx="30" cy="10" r="4" fill="#ffe9a8" stroke="#20242c" stroke-width="1.2"/>
      <circle cx="120" cy="10" r="4" fill="#ffe9a8" stroke="#20242c" stroke-width="1.2"/>
    </svg>`,
  },

  // --- tier 2: institutions -------------------------------------------------
  school: {
    kind: "school",
    w: 210,
    h: 175,
    body: { shape: "rect", w: 0.88, h: 0.58 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="210" height="175" viewBox="0 0 210 175">
      ${shadow(105, 165, 92, 9)}
      <rect x="12" y="66" width="186" height="92" rx="8" fill="#d8a06a" stroke="#20242c" stroke-width="1.7"/>
      <rect x="12" y="66" width="186" height="16" fill="#c08a55"/>
      <polygon points="105,18 152,70 58,70" fill="#b04a34" stroke="#20242c" stroke-width="1.6"/>
      <circle cx="105" cy="52" r="12" fill="#fff6df" stroke="#20242c" stroke-width="1.5"/>
      <path d="M 105 45 v 7 l 5 3" fill="none" stroke="#20242c" stroke-width="1.6" stroke-linecap="round"/>
      <rect x="103" y="6" width="3" height="14" fill="#5a6170"/>
      <path d="M 106 7 L 124 11 L 106 16 Z" fill="#f2b843" stroke="#20242c" stroke-width="1"/>
      <g fill="#fff6df" stroke="#20242c" stroke-width="1.2">
        <rect x="26" y="92" width="24" height="22" rx="3"/>
        <rect x="62" y="92" width="24" height="22" rx="3"/>
        <rect x="124" y="92" width="24" height="22" rx="3"/>
        <rect x="160" y="92" width="24" height="22" rx="3"/>
        <rect x="26" y="126" width="24" height="22" rx="3"/>
        <rect x="160" y="126" width="24" height="22" rx="3"/>
      </g>
      <rect x="88" y="112" width="34" height="46" rx="5" fill="#6f4e33" stroke="#20242c" stroke-width="1.5"/>
      <line x1="105" y1="112" x2="105" y2="158" stroke="#20242c" stroke-width="1.4"/>
      <rect x="70" y="150" width="70" height="8" rx="3" fill="#a1663f"/>
    </svg>`,
  },
  office: {
    kind: "office",
    w: 200,
    h: 195,
    body: { shape: "rect", w: 0.8, h: 0.6 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="195" viewBox="0 0 200 195">
      ${shadow(100, 185, 86, 9)}
      <rect x="24" y="14" width="152" height="164" rx="9" fill="#b9c4d4" stroke="#20242c" stroke-width="1.7"/>
      <rect x="24" y="14" width="152" height="20" rx="9" fill="#96a3b8"/>
      <g fill="#5a7d9e">
        <rect x="38" y="46" width="28" height="20" rx="3"/><rect x="76" y="46" width="28" height="20" rx="3"/><rect x="114" y="46" width="28" height="20" rx="3"/><rect x="152" y="46" width="12" height="20" rx="3"/>
        <rect x="38" y="76" width="28" height="20" rx="3"/><rect x="76" y="76" width="28" height="20" rx="3"/><rect x="114" y="76" width="28" height="20" rx="3"/><rect x="152" y="76" width="12" height="20" rx="3"/>
        <rect x="38" y="106" width="28" height="20" rx="3"/><rect x="114" y="106" width="28" height="20" rx="3"/><rect x="152" y="106" width="12" height="20" rx="3"/>
      </g>
      <g fill="#ffe9a8" opacity="0.9">
        <rect x="76" y="106" width="28" height="20" rx="3"/>
        <rect x="38" y="136" width="28" height="20" rx="3"/>
      </g>
      <rect x="82" y="140" width="36" height="38" rx="5" fill="#39414f" stroke="#20242c" stroke-width="1.5"/>
      <rect x="70" y="132" width="60" height="10" rx="4" fill="#e0663a" stroke="#20242c" stroke-width="1.3"/>
    </svg>`,
  },
  loft: {
    kind: "loft",
    w: 200,
    h: 170,
    body: { shape: "rect", w: 0.85, h: 0.58 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="170" viewBox="0 0 200 170">
      ${shadow(100, 160, 88, 9)}
      <rect x="14" y="30" width="172" height="124" rx="8" fill="#b06a4a" stroke="#20242c" stroke-width="1.7"/>
      <rect x="14" y="30" width="172" height="14" fill="#9a5a3e"/>
      <g stroke="#8f4a30" stroke-width="1.2" opacity="0.7">
        <line x1="14" y1="58" x2="186" y2="58"/><line x1="14" y1="86" x2="186" y2="86"/><line x1="14" y1="114" x2="186" y2="114"/>
      </g>
      <g fill="#ffe9a8" stroke="#20242c" stroke-width="1.3">
        <path d="M 30 96 h 30 v -22 a 15 15 0 0 1 0 0 a 15 11 0 0 1 30 0" fill="none"/>
        <path d="M 30 96 v -20 a 15 14 0 0 1 30 0 v 20 Z"/>
        <path d="M 85 96 v -20 a 15 14 0 0 1 30 0 v 20 Z"/>
        <path d="M 140 96 v -20 a 15 14 0 0 1 30 0 v 20 Z"/>
      </g>
      <rect x="84" y="118" width="32" height="36" rx="4" fill="#39414f" stroke="#20242c" stroke-width="1.5"/>
      <rect x="26" y="118" width="44" height="26" rx="3" fill="#fff6df" stroke="#20242c" stroke-width="1.2"/>
      <rect x="130" y="118" width="44" height="26" rx="3" fill="#fff6df" stroke="#20242c" stroke-width="1.2"/>
      <rect x="58" y="12" width="84" height="24" rx="6" fill="#202631" stroke="#20242c" stroke-width="1.5"/>
      <circle cx="72" cy="24" r="5" fill="#4ce0a0"/>
      <rect x="84" y="20" width="46" height="8" rx="4" fill="#39a0f0"/>
    </svg>`,
  },

  // --- tier 3: heavyweights --------------------------------------------------
  factory: {
    kind: "factory",
    w: 260,
    h: 205,
    body: { shape: "rect", w: 0.9, h: 0.6 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="260" height="205" viewBox="0 0 260 205">
      ${shadow(130, 194, 116, 10)}
      <rect x="196" y="20" width="18" height="58" rx="4" fill="#8a94a4" stroke="#20242c" stroke-width="1.5"/>
      <ellipse cx="205" cy="14" rx="12" ry="6" fill="#c9cfda" opacity="0.6"/>
      <ellipse cx="215" cy="6" rx="8" ry="4" fill="#c9cfda" opacity="0.4"/>
      <rect x="14" y="70" width="232" height="118" rx="8" fill="#7d8794" stroke="#20242c" stroke-width="1.8"/>
      <polygon points="14,70 62,34 62,70" fill="#96a1b0" stroke="#20242c" stroke-width="1.5"/>
      <polygon points="62,70 110,34 110,70" fill="#96a1b0" stroke="#20242c" stroke-width="1.5"/>
      <polygon points="110,70 158,34 158,70" fill="#96a1b0" stroke="#20242c" stroke-width="1.5"/>
      <g fill="#5aa0d8" opacity="0.9">
        <polygon points="20,66 58,38 58,66"/>
        <polygon points="68,66 106,38 106,66"/>
        <polygon points="116,66 154,38 154,66"/>
      </g>
      <g fill="#5a6273">
        <rect x="30" y="94" width="30" height="24" rx="3"/><rect x="74" y="94" width="30" height="24" rx="3"/><rect x="118" y="94" width="30" height="24" rx="3"/>
      </g>
      <rect x="164" y="94" width="30" height="24" rx="3" fill="#4ce0a0" opacity="0.85"/>
      <rect x="96" y="140" width="40" height="48" rx="5" fill="#39414f" stroke="#20242c" stroke-width="1.6"/>
      <path d="M 14 132 h 232" stroke="#5f6875" stroke-width="3"/>
      <rect x="222" y="96" width="16" height="72" rx="6" fill="#a7b1bf" stroke="#20242c" stroke-width="1.4"/>
      <path d="M 20 160 h 60 M 20 170 h 60" stroke="#f2b843" stroke-width="4" stroke-linecap="round"/>
    </svg>`,
  },
  hq: {
    kind: "hq",
    w: 250,
    h: 255,
    body: { shape: "rect", w: 0.62, h: 0.5 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="250" height="255" viewBox="0 0 250 255">
      ${shadow(125, 244, 92, 10)}
      <rect x="123" y="6" width="4" height="26" fill="#5a6170"/>
      <circle cx="125" cy="6" r="4" fill="#e04f3f"/>
      <rect x="58" y="120" width="134" height="118" rx="8" fill="#8b93a6" stroke="#20242c" stroke-width="1.7"/>
      <rect x="74" y="66" width="102" height="70" rx="7" fill="#9aa3b6" stroke="#20242c" stroke-width="1.6"/>
      <rect x="88" y="28" width="74" height="52" rx="6" fill="#aeb6c8" stroke="#20242c" stroke-width="1.6"/>
      <g fill="#ffe9a8" opacity="0.95">
        <rect x="96" y="38" width="14" height="10" rx="2"/><rect x="118" y="38" width="14" height="10" rx="2"/><rect x="140" y="38" width="14" height="10" rx="2"/>
        <rect x="96" y="56" width="14" height="10" rx="2"/><rect x="140" y="56" width="14" height="10" rx="2"/>
      </g>
      <g fill="#5a7d9e">
        <rect x="84" y="80" width="18" height="12" rx="2"/><rect x="110" y="80" width="18" height="12" rx="2"/><rect x="136" y="80" width="18" height="12" rx="2"/>
        <rect x="84" y="100" width="18" height="12" rx="2"/><rect x="136" y="100" width="18" height="12" rx="2"/>
        <rect x="70" y="136" width="22" height="14" rx="2"/><rect x="102" y="136" width="22" height="14" rx="2"/><rect x="134" y="136" width="22" height="14" rx="2"/><rect x="166" y="136" width="12" height="14" rx="2"/>
        <rect x="70" y="160" width="22" height="14" rx="2"/><rect x="134" y="160" width="22" height="14" rx="2"/><rect x="166" y="160" width="12" height="14" rx="2"/>
        <rect x="70" y="184" width="22" height="14" rx="2"/><rect x="102" y="184" width="22" height="14" rx="2"/><rect x="166" y="184" width="12" height="14" rx="2"/>
      </g>
      <g fill="#ffe9a8" opacity="0.9">
        <rect x="110" y="100" width="18" height="12" rx="2"/>
        <rect x="102" y="160" width="22" height="14" rx="2"/>
        <rect x="134" y="184" width="22" height="14" rx="2"/>
      </g>
      <rect x="106" y="206" width="38" height="32" rx="5" fill="#39414f" stroke="#20242c" stroke-width="1.5"/>
      <rect x="92" y="198" width="66" height="10" rx="4" fill="#7b5cff" stroke="#20242c" stroke-width="1.3"/>
    </svg>`,
  },

  // --- tier 4: the flagship ---------------------------------------------------
  aiLab: {
    kind: "aiLab",
    w: 340,
    h: 290,
    body: { shape: "rect", w: 0.88, h: 0.55 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="340" height="290" viewBox="0 0 340 290">
      ${shadow(170, 276, 150, 12)}
      <rect x="18" y="150" width="90" height="122" rx="9" fill="#4a4370" stroke="#20242c" stroke-width="1.8"/>
      <rect x="232" y="150" width="90" height="122" rx="9" fill="#443e66" stroke="#20242c" stroke-width="1.8"/>
      <g fill="#8c7cff" opacity="0.85">
        <rect x="30" y="166" width="20" height="14" rx="3"/><rect x="60" y="166" width="20" height="14" rx="3"/>
        <rect x="30" y="192" width="20" height="14" rx="3"/><rect x="60" y="192" width="20" height="14" rx="3"/>
        <rect x="244" y="166" width="20" height="14" rx="3"/><rect x="274" y="166" width="20" height="14" rx="3"/>
        <rect x="244" y="192" width="20" height="14" rx="3"/><rect x="274" y="192" width="20" height="14" rx="3"/>
      </g>
      <rect x="76" y="118" width="188" height="154" rx="12" fill="#251f48" stroke="#20242c" stroke-width="2"/>
      <path d="M 76 150 a 94 62 0 0 1 188 0 Z" fill="#332a5e" stroke="#20242c" stroke-width="1.8"/>
      <path d="M 96 138 a 74 46 0 0 1 148 0" fill="none" stroke="#8c7cff" stroke-width="3" opacity="0.8"/>
      <circle cx="170" cy="96" r="20" fill="#7b5cff" stroke="#ded6ff" stroke-width="2"/>
      <circle cx="170" cy="96" r="9" fill="#ded6ff"/>
      <g stroke="#8c7cff" stroke-width="2.5" opacity="0.9">
        <line x1="92" y1="160" x2="248" y2="160"/>
        <line x1="92" y1="252" x2="248" y2="252"/>
      </g>
      <g fill="#39e6c4" opacity="0.9">
        <rect x="96" y="176" width="34" height="22" rx="4"/>
        <rect x="210" y="176" width="34" height="22" rx="4"/>
      </g>
      <g fill="#8c7cff">
        <rect x="96" y="210" width="34" height="22" rx="4" opacity="0.7"/>
        <rect x="210" y="210" width="34" height="22" rx="4" opacity="0.7"/>
      </g>
      <rect x="146" y="196" width="48" height="76" rx="7" fill="#171233" stroke="#8c7cff" stroke-width="2"/>
      <path d="M 158 234 h 24 M 170 222 v 24" stroke="#39e6c4" stroke-width="2.5" stroke-linecap="round"/>
      <rect x="286" y="70" width="6" height="70" fill="#5a6170"/>
      <path d="M 289 70 a 18 18 0 0 1 18 -16 l -4 18 Z" fill="#c9cfda" stroke="#20242c" stroke-width="1.4"/>
      <g fill="#ded6ff">
        <circle cx="120" cy="132" r="3"/><circle cx="220" cy="132" r="3"/><circle cx="170" cy="124" r="3"/>
      </g>
    </svg>`,
  },

  // --- the locked door to what's next ----------------------------------------
  futureGate: {
    kind: "futureGate",
    w: 380,
    h: 210,
    body: { shape: "rect", w: 0.9, h: 0.4 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="380" height="210" viewBox="0 0 380 210">
      ${shadow(190, 198, 170, 11)}
      <rect x="24" y="60" width="52" height="132" rx="8" fill="#39414f" stroke="#20242c" stroke-width="1.8"/>
      <rect x="304" y="60" width="52" height="132" rx="8" fill="#39414f" stroke="#20242c" stroke-width="1.8"/>
      <g fill="#f2b843">
        <polygon points="24,178 44,158 56,158 36,178"/>
        <polygon points="52,178 72,158 76,158 76,170 68,178"/>
        <polygon points="304,178 324,158 336,158 316,178"/>
        <polygon points="332,178 352,158 356,158 356,170 348,178"/>
      </g>
      <rect x="30" y="24" width="320" height="44" rx="10" fill="#202631" stroke="#20242c" stroke-width="2"/>
      <g fill="#7b5cff" opacity="0.9">
        <circle cx="58" cy="46" r="5"/><circle cx="88" cy="46" r="5"/><circle cx="118" cy="46" r="5"/>
        <circle cx="262" cy="46" r="5"/><circle cx="292" cy="46" r="5"/><circle cx="322" cy="46" r="5"/>
      </g>
      <rect x="140" y="34" width="100" height="24" rx="6" fill="#171233" stroke="#8c7cff" stroke-width="1.6"/>
      <g fill="#39e6c4">
        <rect x="150" y="42" width="18" height="8" rx="2"/>
        <rect x="172" y="42" width="12" height="8" rx="2" opacity="0.7"/>
        <rect x="188" y="42" width="24" height="8" rx="2" opacity="0.5"/>
        <rect x="216" y="42" width="14" height="8" rx="2" opacity="0.3"/>
      </g>
      <rect x="76" y="120" width="228" height="16" rx="8" fill="#e0663a" stroke="#20242c" stroke-width="1.6"/>
      <g fill="#fff6df">
        <polygon points="90,134 106,122 118,122 102,134"/>
        <polygon points="130,134 146,122 158,122 142,134"/>
        <polygon points="170,134 186,122 198,122 182,134"/>
        <polygon points="210,134 226,122 238,122 222,134"/>
        <polygon points="250,134 266,122 278,122 262,134"/>
      </g>
      <rect x="160" y="140" width="60" height="34" rx="6" fill="#f2e6cf" stroke="#20242c" stroke-width="1.6"/>
      <circle cx="190" cy="152" r="6" fill="none" stroke="#20242c" stroke-width="2"/>
      <rect x="186" y="154" width="8" height="12" rx="2" fill="#20242c"/>
    </svg>`,
  },
};

export type { BuildingKind };
