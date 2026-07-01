import { useEffect, useMemo, useRef, useState } from "react";
import { gameStore, useGameStore } from "@/game/state/gameStore";
import { WORLD } from "@/game/world";
import { resolveContent, type ResolvedPanel } from "@/game/content/portfolioBindings";

/**
 * Glass side panel that slides in from the edge when an anchor is focused.
 * Non-blocking: the car keeps driving, the world never pauses; closing just
 * releases focus.
 */
export function PortfolioPanel() {
  const focusedId = useGameStore((s) => s.focusedId);
  const [shown, setShown] = useState<ResolvedPanel | null>(null);

  const open = !!focusedId;

  const resolved = useMemo(() => {
    if (!focusedId) return null;
    const anchor = WORLD.anchors.find((a) => a.id === focusedId);
    if (!anchor) return null;
    return resolveContent(anchor.content);
  }, [focusedId]);

  const lastId = useRef<string | null>(null);
  useEffect(() => {
    if (resolved) {
      setShown(resolved);
      lastId.current = focusedId;
    }
  }, [resolved, focusedId]);

  const data = open ? resolved ?? shown : shown;

  return (
    <div
      className="panel-slide pointer-events-none fixed right-0 top-0 z-40 flex h-[100dvh] w-[min(440px,92vw)] items-center pr-4 sm:pr-6"
      data-open={open}
      aria-hidden={!open}
    >
      <div className="glass thin-scroll pointer-events-auto max-h-[82dvh] w-full overflow-y-auto rounded-[26px] p-7 text-white">
        {data && (
          <>
            <div className="flex items-start justify-between gap-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/55">
                {data.eyebrow}
              </p>
              <button
                onClick={() => gameStore.focus(null)}
                className="-mr-1 -mt-1 grid h-8 w-8 place-items-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-tight">{data.title}</h2>
            {data.subtitle && <p className="mt-1 text-sm text-white/70">{data.subtitle}</p>}

            {data.meta && data.meta.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {data.meta.map((m, i) => (
                  <span key={i} className="glass-chip">
                    {m}
                  </span>
                ))}
              </div>
            )}

            {data.body && <p className="mt-5 text-[15px] leading-relaxed text-white/80">{data.body}</p>}

            {data.tags && data.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-1.5">
                {data.tags.map((t, i) => (
                  <span key={i} className="glass-chip !text-[10px]">
                    {t}
                  </span>
                ))}
              </div>
            )}

            {data.links && data.links.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {data.links.map((l, i) => (
                  <a
                    key={i}
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-black transition hover:bg-white"
                  >
                    {l.label} ↗
                  </a>
                ))}
              </div>
            )}

            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
              Esc or ✕ to close · keep driving
            </p>
          </>
        )}
      </div>
    </div>
  );
}
