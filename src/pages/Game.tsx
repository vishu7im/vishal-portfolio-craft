import { useEffect } from "react";
import { usePhaserGame } from "@/game/usePhaserGame";
import { Hud } from "@/components/game/Hud";
import { PortfolioPanel } from "@/components/game/PortfolioPanel";
import { InteractHint } from "@/components/game/InteractHint";
import { Minimap } from "@/components/game/Minimap";
import { ObjectiveTracker } from "@/components/game/ObjectiveTracker";
import { GarageMenu } from "@/components/game/GarageMenu";
import { TouchControls } from "@/components/game/TouchControls";
import { AreaIntro, ControlsCard, LoadingVeil, Speedometer } from "@/components/game/HudExtras";
import { Seo } from "@/components/Seo";

// Hosts the Phaser canvas with the React HUD/panel/minimap overlaid on top.
// The overlay is pointer-events-none by default; interactive bits opt back in.
export default function Game() {
  const parentRef = usePhaserGame();

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
      <div ref={parentRef} className="absolute inset-0 z-0" />
      <div className="pointer-events-none absolute inset-0 z-10 select-none">
        <Hud />
        <ObjectiveTracker />
        <AreaIntro />
        <InteractHint />
        <Speedometer />
        <Minimap />
        <ControlsCard />
        <PortfolioPanel />
        <GarageMenu />
        <TouchControls />
        <LoadingVeil />
      </div>
    </div>
  );
}
