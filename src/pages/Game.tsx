import { useEffect } from "react";
import { usePhaserGame } from "@/game/usePhaserGame";
import { useGameStore } from "@/game/state/gameStore";
import { Hud } from "@/components/game/Hud";
import { PortfolioPanel } from "@/components/game/PortfolioPanel";
import { InteractHint } from "@/components/game/InteractHint";
import { Minimap } from "@/components/game/Minimap";
import { ObjectiveTracker } from "@/components/game/ObjectiveTracker";
import { GarageMenu } from "@/components/game/GarageMenu";
import { TouchControls } from "@/components/game/TouchControls";
import { AreaIntro, ClockChip, ControlsCard, IntroOverlay, LevelUp, Speedometer } from "@/components/game/HudExtras";
import { AchievementsPanel } from "@/components/game/AchievementsPanel";
import { ChatPanel } from "@/components/game/ChatPanel";
import { Seo } from "@/components/Seo";

// Hosts the Phaser canvas with the React HUD/panel/minimap overlaid on top.
// The overlay is pointer-events-none by default; interactive bits opt back in.
export default function Game() {
  const parentRef = usePhaserGame();
  const started = useGameStore((s) => s.started);
  const reduced = useGameStore((s) => s.reducedMotion);

  // Paint-in: the canvas irises open from the car (screen centre) once the
  // visitor presses start on the intro; before that it's clipped to nothing and
  // the paper page/overlay shows through. Reduced-motion gets an instant reveal.
  const reveal = {
    clipPath: `circle(${started ? "150%" : "0%"} at 50% 52%)`,
    transition: reduced ? "none" : "clip-path 1000ms cubic-bezier(0.4, 0, 0.2, 1)",
  } as const;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#f4ede0]">
      <Seo path="/" canonical="/" />
      <main className="sr-only" aria-label="Vishal Munday interactive portfolio game">
        <h1>Vishal Munday, Vishu, Backend Tech Lead and AI Engineer</h1>
        <p>
          Play an interactive top-down portfolio game that turns Vishal Munday's backend,
          AI, DevOps, database, and production engineering work into explorable districts.
        </p>
        <p>
          The world highlights Node.js, Express, TypeScript, LangChain, LangGraph, OpenAI,
          RAG systems, Redis, Docker, PostgreSQL, MongoDB, API design, AI voice agents,
          CI/CD pipelines, data pipelines, and production incident recovery.
        </p>
        <p>
          Featured work includes FabricatorOS, MetaOS, VoxAI, Alma Nilokheri, Admit Easy,
          Kiki, a Vercel clone, Spotify clone, bnbMEhome, EasySupply, and Aaxel Insurance.
        </p>
      </main>
      <div ref={parentRef} className="absolute inset-0 z-0" style={reveal} />
      <div className="pointer-events-none absolute inset-0 z-10 select-none">
        <Hud />
        <ObjectiveTracker />
        <AreaIntro />
        <InteractHint />
        <Speedometer />
        <ClockChip />
        <Minimap />
        <ControlsCard />
        <LevelUp />
        <PortfolioPanel />
        <ChatPanel />
        <AchievementsPanel />
        <GarageMenu />
        <TouchControls />
        <IntroOverlay />
      </div>
    </div>
  );
}
