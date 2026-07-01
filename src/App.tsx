import { lazy, Suspense } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Classic from "@/pages/Classic";
import NotFound from "@/pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";

// The driving game lives only inside this chunk and stays off /classic.
const Game = lazy(() => import("@/pages/Game"));

function GameSplash() {
  return (
    <div
      className="flex h-[100dvh] w-full items-center justify-center"
      style={{
        background:
          "radial-gradient(120% 90% at 50% 40%, #f6efe2 0%, #ece2d1 60%, #e3d7c2 100%)",
      }}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-[#5b5346]">
        starting the engine…
      </p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={<GameSplash />}>
        <Routes>
          <Route path="/" element={<Game />} />
          <Route path="/classic" element={<Classic />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 2200,
          style: {
            background: "hsl(222 18% 12%)",
            color: "hsl(0 0% 100%)",
            borderRadius: "12px",
            padding: "10px 14px",
            fontSize: "14px",
            boxShadow: "0 12px 32px -12px rgba(17,18,22,0.4)",
          },
        }}
      />
    </Router>
  );
}

export default App;
