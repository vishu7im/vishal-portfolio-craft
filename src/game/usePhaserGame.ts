import { useEffect, useRef } from "react";
import type Phaser from "phaser";
import { createGame } from "./PhaserGame";

// Mounts a Phaser game into a div and tears it down on unmount. React renders
// the HUD/panel/minimap overlay on top of the returned parent element.

export function usePhaserGame() {
  const parentRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!parentRef.current || gameRef.current) return;
    const game = createGame(parentRef.current);
    gameRef.current = game;
    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return parentRef;
}
