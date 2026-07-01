import Phaser from "phaser";

// Bakes code-authored vector art (SVG strings) into Phaser textures once, at
// boot. SVG gives us gradients, soft shadows and rounded joins — the premium
// hand-designed look — rasterized crisply at a supersampled size.

/** Supersample factor: every SVG texture is baked at this multiple of its
 *  logical size, so placed images are scaled by 1/TEX_SS. */
export const TEX_SS = 2;

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export async function bakeSvg(
  scene: Phaser.Scene,
  key: string,
  svg: string,
  w: number,
  h: number
): Promise<void> {
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  try {
    const img = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(w * TEX_SS);
    canvas.height = Math.round(h * TEX_SS);
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    if (scene.textures.exists(key)) scene.textures.remove(key);
    scene.textures.addCanvas(key, canvas);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Synchronous canvas texture for procedural utility art (dots, blobs, dust). */
export function makeCanvasTexture(
  scene: Phaser.Scene,
  key: string,
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
): void {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const tex = scene.textures.createCanvas(key, w, h);
  if (!tex) return;
  const ctx = tex.getContext();
  draw(ctx, w, h);
  tex.refresh();
}
