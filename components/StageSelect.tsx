"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { play } from "@/lib/sfx";
import { useTouch } from "@/lib/touch";


export type Stage = {
  id: string;
  idx: number;
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


export default function StageSelect({ stages }: { stages: Stage[] }) {
  const touch = useTouch();
  const [sel, setSel] = useState(0);
  const track = useRef<HTMLUListElement>(null);
  const cards = useRef<(HTMLAnchorElement | null)[]>([]);
  const pending = useRef(0);


  const center = (i: number, behavior: ScrollBehavior = "smooth") => {
    const el = cards.current[i];
    const rail = track.current;
    if (!el || !rail) return;
    rail.scrollTo({
      left: el.offsetLeft + el.offsetWidth / 2 - rail.clientWidth / 2,
      behavior,
    });
  };


  useEffect(() => center(sel, "auto"), []);

  const jump = (i: number, quiet = false, behavior: ScrollBehavior = "smooth") => {
    if (!quiet) play("move");
    setSel(i);
    center(i, behavior);
    cards.current[i]?.focus({ preventScroll: true });
  };


  const move = (step: number) => {
    const raw = sel + step;
    const wrapped = raw < 0 || raw >= stages.length;
    const next = (raw + stages.length) % stages.length;
    if (next !== sel) jump(next, false, wrapped ? "instant" : "smooth");
  };


  const onScroll = () => {
    const rail = track.current;
    if (!rail || pending.current) return;
    pending.current = requestAnimationFrame(() => {
      pending.current = 0;
      const mid = rail.scrollLeft + rail.clientWidth / 2;
      let near = 0;
      let gap = Infinity;
      cards.current.forEach((el, i) => {
        if (!el) return;
        const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid);
        if (d < gap) {
          gap = d;
          near = i;
        }
      });
      setSel(near);
    });
  };


  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {


      const el = e.target;
      if (el instanceof Element && el.closest("input, textarea, select, [contenteditable]")) {
        return;
      }

      const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (step) {
        e.preventDefault();
        move(step);
        return;
      }
      if (e.key === "Home" || e.key === "End") {
        e.preventDefault();
        const to = e.key === "Home" ? 0 : stages.length - 1;
        if (to !== sel) jump(to);
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  });

  const active = stages[sel];

  return (
    <div className="grid min-h-0 grid-cols-[minmax(0,1fr)] content-center gap-6">


      <ol className="flex flex-wrap items-center gap-x-2 gap-y-2 px-6 sm:px-10 lg:px-16">
        {stages.map((s, i) => {
          const first = i === 0 || stages[i - 1].chamber !== s.chamber;
          if (!first) return null;
          const on = s.chamber === active.chamber;
          return (
            <li key={s.chamber}>
              <button
                type="button"
                onClick={() => jump(i)}
                className="flex items-center gap-2 px-2 py-1 font-mono text-[11px] tracking-[0.16em] uppercase transition-colors duration-500 ease-settle"
                style={{ color: on ? s.tint : undefined }}
              >
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full transition-opacity duration-500"
                  style={{ background: s.tint, opacity: on ? 1 : 0.3 }}
                />
                <span className={on ? "" : "text-ashdim"}>{s.chamber}</span>
              </button>
            </li>
          );
        })}
      </ol>


      <div className="relative min-h-0">
        <ul
          ref={track}
          onScroll={onScroll}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-[calc(50%-8.5rem)] pb-8 pt-6 sm:px-[calc(50%-9.5rem)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {stages.map((s, i) => {
            const on = i === sel;


            const step = Math.abs(i - sel);
            const size =
              step === 0
                ? "scale-100 opacity-100"
                : step === 1
                  ? "scale-[0.86] opacity-70"
                  : "scale-[0.78] opacity-40";
            return (
              <li key={s.id} className="snap-center">
                <Link
                  ref={(el) => {
                    cards.current[i] = el;
                  }}
                  href={`/play/${s.id}`}


                  onFocus={(e) => {
                    if (i !== sel && e.currentTarget.matches(":focus-visible")) jump(i, true);
                  }}
                  onClick={(e) => {
                    if (i !== sel) {
                      e.preventDefault();
                      jump(i);
                      return;
                    }
                    play("select");
                  }}
                  aria-current={on ? "true" : undefined}
                  className={`hud bracket flex h-full w-[17rem] flex-col gap-3 p-5 transition-all duration-500 ease-spring sm:w-[19rem] ${size} ${
                    on ? "border-[color:var(--tint)] shadow-[0_0_50px_-16px_var(--tint)]" : ""
                  }`}
                  style={{ ["--tint" as string]: s.tint }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className="font-mono text-[2rem] leading-none tabular-nums transition-colors duration-500 ease-settle"
                      style={{ color: on ? s.tint : undefined }}
                    >
                      <span className={on ? "" : "text-ashdim/40"}>
                        {String(s.idx).padStart(2, "0")}
                      </span>
                    </span>
                    <span
                      className="chip"
                      style={
                        s.solved ? { ["--tint" as string]: "var(--color-champagne)" } : undefined
                      }
                    >
                      {s.solved ? "Selesai" : "Belum"}
                    </span>
                  </div>

                  <h3 className="text-xl leading-snug text-starlight">{s.name}</h3>
                  <p className="text-[14px] leading-relaxed text-ash">{s.objective}</p>
                  <p
                    className="font-serif text-base italic transition-colors duration-500 ease-settle"
                    style={{ color: on ? s.tint : "var(--color-quantum)" }}
                  >
                    {s.relation}
                  </p>


                  <dl className="mt-1 grid gap-1.5 border-t border-rule pt-3 font-mono text-[11px] tabular-nums text-ashdim">
                    <div className="flex justify-between gap-4">
                      <dt>Boleh meleset</dt>
                      <dd>
                        ± {s.tolerance} {s.unit}
                      </dd>
                    </div>
                    {s.yourMs !== undefined && (
                      <div className="flex justify-between gap-4">
                        <dt>Waktumu</dt>
                        <dd className="text-champagne">{secs(s.yourMs)}</dd>
                      </div>
                    )}
                    {s.recordMs !== undefined && (
                      <div className="flex justify-between gap-4">
                        <dt>Rekor</dt>
                        <dd className="text-ash">
                          {secs(s.recordMs)} · {s.recordBy}
                        </dd>
                      </div>
                    )}
                  </dl>

                  <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="font-mono text-[11px] tabular-nums text-quantum">
                      {s.xp} XP
                    </span>
                    <span
                      className="font-mono text-[11px] tracking-[0.18em] transition-colors duration-500 ease-settle"
                      style={{ color: on ? s.tint : undefined }}
                    >
                      <span className={on ? "" : "text-ashdim"}>
                        {on ? "MAIN ▸" : "LIHAT"}
                      </span>
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>


        {([-1, 1] as const).map((step) => (
          <button
            key={step}
            type="button"
            onClick={() => move(step)}
            aria-label={step < 0 ? "Tahap sebelumnya" : "Tahap berikutnya"}
            className={`hud absolute top-1/2 hidden size-10 -translate-y-1/2 place-items-center font-mono text-sm text-ash transition-all duration-500 ease-settle hover:border-champagne hover:text-champagne sm:grid ${
              step < 0 ? "left-2" : "right-2"
            }`}
          >
            {step < 0 ? "◂" : "▸"}
          </button>
        ))}
      </div>

      <p className="px-6 text-[13px] text-ashdim sm:px-10 lg:px-16">
        {touch ? "Geser kartunya, lalu ketuk untuk masuk" : "Pakai ← → lalu Enter, atau klik kartunya"} ·{" "}
        {sel + 1} / {stages.length}
      </p>
    </div>
  );
}
