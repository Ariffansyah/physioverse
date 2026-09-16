"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { onFocus, setFocus, setStops } from "@/lib/focus";
import type { ChamberKey } from "@/lib/levels";
import { PLANETS, planetOf } from "@/lib/planets";
import { play } from "@/lib/sfx";
import { useNarrow, useTouch } from "@/lib/touch";

export type Stage = {
  id: string;
  idx: number;
  key: ChamberKey;
  name: string;
  objective: string;
  relation: string;
  tolerance: number;
  unit: string;
  xp: number;
  chamber: string;
  tint: string;
  solved: boolean;
  yourMs?: number;
  recordMs?: number;
  recordBy?: string;
};

const secs = (ms: number) => `${(ms / 1000).toFixed(1)} s`;
const PLANET_KEYS = PLANETS.map((p) => p.chamber);

export default function StageSelect({ stages }: { stages: Stage[] }) {
  const touch = useTouch();
  const narrow = useNarrow();
  const router = useRouter();
  const [sel, setSel] = useState(0);
  const rows = useRef<(HTMLAnchorElement | null)[]>([]);

  // planet clicks arrive outside React's render, so they read the list through refs
  const at = useRef(sel);
  const jumpTo = useRef<(i: number, quiet?: boolean) => void>(() => {});

  const jump = (i: number, quiet = false) => {
    if (!quiet) play("move");
    setSel(i);
    rows.current[i]?.focus({ preventScroll: true });
    rows.current[i]?.scrollIntoView({ block: "nearest" });
  };

  useEffect(() => {
    at.current = sel;
    jumpTo.current = jump;
  });

  // the list aims the camera
  useEffect(() => {
    setFocus(planetOf(stages[sel].key));
  }, [sel, stages]);

  // every planet carries the mission you are on in that room, or its first one
  useEffect(() => {
    setStops(
      stages
        .map((s, i) => ({ s, i }))
        .filter(({ s, i }) => i === 0 || stages[i - 1].key !== s.key)
        .map(({ s, i }) => {
          const show = stages[sel].key === s.key ? stages[sel] : s;
          const lines = [
            show.yourMs !== undefined ? `Waktumu · ${secs(show.yourMs)}` : "",
            show.recordMs !== undefined ? `Rekor · ${secs(show.recordMs)} ${show.recordBy}` : "",
          ].filter(Boolean);

          return {
            planet: planetOf(s.key),
            label: s.chamber,
            card: {
              kicker: `${s.chamber} · ${String(show.idx).padStart(2, "0")}`,
              title: show.name,
              body: show.objective,
              lines,
              meta: `${show.xp} XP · ± ${show.tolerance} ${show.unit}`,
              cta: show.solved ? "ULANGI ▸" : "MAIN ▸",
              tint: s.tint,
            },
            // same rule as the rows: pick the room first, enter on the second go
            go: () => {
              const here = stages[at.current];
              if (here.key === s.key) {
                play("select");
                router.push(`/play/${here.id}`);
              } else {
                jumpTo.current(i);
              }
            },
          };
        }),
    );
  }, [stages, sel, router]);

  // and a planet picked in the sky steers the list
  useEffect(
    () =>
      onFocus((planet) => {
        const key = PLANET_KEYS[planet];
        if (!key || stages[at.current].key === key) return;
        const i = stages.findIndex((s) => s.key === key);
        if (i >= 0) jumpTo.current(i, true);
      }),
    [stages],
  );

  useEffect(
    () => () => {
      setFocus(-1);
      setStops([]);
    },
    [],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target;
      if (el instanceof Element && el.closest("input, textarea, select, [contenteditable]")) return;

      const step =
        e.key === "ArrowDown" || e.key === "ArrowRight"
          ? 1
          : e.key === "ArrowUp" || e.key === "ArrowLeft"
            ? -1
            : 0;
      if (step) {
        e.preventDefault();
        jump((sel + step + stages.length) % stages.length);
        return;
      }
      if (e.key === "Home" || e.key === "End") {
        e.preventDefault();
        jump(e.key === "Home" ? 0 : stages.length - 1);
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  });

  return (
    // narrow on purpose: the planet and its card are the main view, this is the index
    <div className="grid gap-3 px-6 sm:px-10 lg:px-16">
      <ol className="hud max-h-[min(58vh,34rem)] w-full max-w-[24rem] overflow-y-auto bg-graphite/70 p-1.5 backdrop-blur-sm [scrollbar-width:thin]">
        {stages.map((s, i) => {
          const head = i === 0 || stages[i - 1].key !== s.key;
          const on = i === sel && !narrow;
          return (
            <li key={s.id}>
              {head && (
                <p className="tag px-3 pb-1 pt-3 text-[10px]" style={{ color: s.tint }}>
                  {s.chamber}
                </p>
              )}
              <Link
                ref={(el) => {
                  rows.current[i] = el;
                }}
                href={`/play/${s.id}`}
                onFocus={(e) => {
                  if (i !== sel && e.currentTarget.matches(":focus-visible")) setSel(i);
                }}
                // a tap fires pointerenter and click in one gesture, so on touch the
                // selection must come from the click alone or the first tap enters
                onPointerEnter={
                  touch
                    ? undefined
                    : () => {
                        if (i !== sel) {
                          play("move");
                          setSel(i);
                        }
                      }
                }
                onClick={(e) => {
                  // on a phone there is no planet to pick first: the row opens
                  if (i !== sel && !narrow) {
                    e.preventDefault();
                    jump(i);
                    return;
                  }
                  play("select");
                }}
                aria-current={on ? "true" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-300 ease-settle ${
                  on
                    ? "bg-[color-mix(in_oklab,var(--tint)_14%,transparent)]"
                    : "hover:bg-graphite-hi/60"
                }`}
                style={{ ["--tint" as string]: s.tint }}
              >
                <span
                  className="w-6 shrink-0 font-mono text-[13px] tabular-nums"
                  style={{ color: on ? s.tint : undefined }}
                >
                  <span className={on ? "" : "text-ashdim"}>{String(s.idx).padStart(2, "0")}</span>
                </span>
                <span
                  className={`truncate text-[15px] transition-colors duration-300 ease-settle ${
                    on ? "text-starlight" : "text-ash"
                  }`}
                >
                  {s.name}
                </span>
                <span
                  aria-label={s.solved ? "Selesai" : "Belum"}
                  className="ml-auto shrink-0 font-mono text-[10px] tracking-[0.16em]"
                  style={{ color: s.solved ? "var(--color-champagne)" : "var(--color-ashdim)" }}
                >
                  {s.solved ? "✓" : "·"}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      <p className="text-[13px] text-ashdim">
        {narrow
          ? "Ketuk misinya untuk masuk"
          : touch
            ? "Ketuk planetnya atau daftarnya, lalu ketuk kartunya untuk masuk"
            : "Pakai ↑ ↓ lalu Enter, klik planetnya, atau klik kartunya"}{" "}
        · {sel + 1} / {stages.length}
      </p>
    </div>
  );
}
