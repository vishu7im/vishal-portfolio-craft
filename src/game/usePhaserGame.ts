import { useEffect, useRef } from "react";
import type Phaser from "phaser";
import { createGame } from "./PhaserGame";
import { gameStore, frame } from "./state/gameStore";

// Mounts a Phaser game into a div and tears it down on unmount. React renders
// the HUD/panel/minimap overlay on top of the returned parent element.

export function usePhaserGame() {
  const parentRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!parentRef.current || gameRef.current) return;
    const game = createGame(parentRef.current);
    gameRef.current = game;
    if (import.meta.env.DEV) {
      // test/debug handle for driving the game from the console or Playwright
      (window as unknown as Record<string, unknown>).__drive = { gameStore, frame };
    }
    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return parentRef;
}
