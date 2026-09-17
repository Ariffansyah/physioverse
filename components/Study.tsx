"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Loading from "@/components/Loading";
import MenuLink from "@/components/MenuLink";
import { CHAMBERS, LEVELS, getLevel, type ChamberKey } from "@/lib/levels";
import { LESSONS } from "@/lib/lesson";
import { play } from "@/lib/sfx";

const World = dynamic(() => import("./game/World"), { ssr: false });


export default function Study({ chamber }: { chamber: ChamberKey }) {
  const lesson = LESSONS[chamber];
  const level = getLevel(lesson.levelId)!;
  const room = CHAMBERS[chamber];
  const firstMission = LEVELS.find((l) => l.chamber === chamber)!;

  const [params, setParams] = useState<Record<string, number>>(() => ({
    ...level.defaults,
    ...lesson.defaults,
  }));
  const [ready, setReady] = useState(false);
  const [live, setLive] = useState(false);
  const goLive = useCallback(() => setLive(true), []);
  const [runToken, setRunToken] = useState(0);
  const [knobs, setKnobs] = useState(true);
  const [reading, setReading] = useState<number | null>(null);


  useEffect(() => {
    if (!live) return;
    const id = setTimeout(() => {
      setReading(null);
      setRunToken((t) => t + 1);
    }, 420);
    return () => clearTimeout(id);
  }, [params, live]);

  const steps = lesson.steps(params, level);

  return (
    <div className="relative z-2 flex min-h-svh flex-col lg:h-svh lg:grid lg:grid-cols-[minmax(0,1fr)_27rem] lg:overflow-hidden">
      <section
        aria-label="Simulasi"
        className="relative h-[64vh] min-h-0 overflow-hidden sm:overflow-visible lg:h-auto"
      >
        <World
          levelId={level.id}
          params={params}
          runToken={runToken}
          onFinish={setReading}
          onReady={() => setReady(true)}
          orbit={{ camera: lesson.camera, target: lesson.target, spin: true }}
        />

        <div className="pointer-events-none absolute inset-0 z-[70]">
          <Loading label="Menyiapkan simulasi" done={ready} onGone={goLive} />
        </div>

        <div className="absolute left-4 top-4 flex items-center gap-4">
          <span className="hud px-3 py-2">
            <MenuLink label="Menu" />
          </span>
          <Link
            href="/belajar"
            onClick={() => play("back")}
            className="hud px-3 py-2 font-mono text-[11px] tracking-[0.18em] uppercase text-ash transition-colors duration-500 ease-settle hover:text-champagne"
          >
            Ruang lain
          </Link>
        </div>


        <div className="hud absolute inset-x-4 bottom-4 z-30 grid gap-3 bg-graphite/90 p-4 backdrop-blur-sm sm:inset-x-auto sm:left-4 sm:w-[20rem]">
          <p className="tag hidden sm:block">Atur sendiri</p>
          <button
            type="button"
            onClick={() => {
              play("move");
              setKnobs((open) => !open);
            }}
            aria-expanded={knobs}
            className="flex items-center justify-between gap-3 sm:hidden"
          >
            <span className="tag">Atur sendiri</span>
            <span className="font-mono text-[11px] tracking-[0.16em] text-champagne">
              {knobs ? "TUTUP ▾" : "BUKA ▴"}
            </span>
          </button>

          <div className={knobs ? "grid gap-3" : "hidden sm:grid sm:gap-3"}>
          {lesson.controls.map((c) => (
            <label key={c.key} className="grid gap-1.5">
              <span className="flex items-baseline justify-between gap-3 text-[13px] text-ash">
                {c.label}
                <span className="font-mono tabular-nums" style={{ color: room.tint }}>
                  {params[c.key].toFixed(c.step < 0.1 ? 3 : c.step < 1 ? 2 : 0)} {c.unit}
                </span>
              </span>
              <input
                type="range"
                min={c.min}
                max={c.max}
                step={c.step}
                value={params[c.key]}
                onChange={(e) =>
                  setParams((p) => ({ ...p, [c.key]: Number(e.target.value) }))
                }
                className="w-full"
                style={{ accentColor: room.tint }}
              />
            </label>
          ))}
          <button
            type="button"
            onClick={() => {
              play("run");
              setReading(null);
              setRunToken((t) => t + 1);
            }}
            className="btn mt-1 w-full"
            style={{ ["--tint" as string]: room.tint }}
          >
            Putar ulang
          </button>
          </div>
        </div>
      </section>

      <main className="flex min-h-0 flex-col border-rule bg-obsidian/85 backdrop-blur-sm lg:border-l lg:overflow-y-auto">
        <div className="grid gap-4 border-b border-rule p-6">
          <p className="tag" style={{ color: room.tint }}>
            {room.name}
          </p>
          <h1 className="text-[clamp(1.6rem,1.2rem+1.4vw,2.2rem)] leading-tight">{lesson.title}</h1>
          <p className="text-[15px] leading-relaxed text-ash">{lesson.intro}</p>
        </div>

        <div className="grid gap-3 border-b border-rule p-6">
          <p className="tag">Apa yang terjadi</p>
          {lesson.body.map((par) => (
            <p key={par} className="text-[14px] leading-relaxed text-ash">
              {par}
            </p>
          ))}
        </div>

        <div className="grid gap-4 p-6">
          <div className="flex items-baseline justify-between gap-4">
            <p className="tag">Hitungannya</p>
            <p className="text-[12px] text-ashdim">ikut berubah saat kenop digeser</p>
          </div>
          <ol className="grid gap-3.5">
            {steps.map((s, i) => (
              <li key={s.label} className="flex gap-3">
                <span
                  className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border font-mono text-[11px]"
                  style={{ borderColor: `${room.tint}55`, color: room.tint }}
                >
                  {i + 1}
                </span>
                <span className="grid gap-1">
                  <span className="text-[14px] leading-snug text-starlight">{s.label}</span>
                  <span className="font-mono text-[12px] leading-relaxed text-ashdim">{s.math}</span>
                  <span className="font-mono text-[13px] tabular-nums text-champagne">
                    {s.value}
                  </span>
                </span>
              </li>
            ))}
          </ol>

          {reading !== null && (
            <p className="border-t border-rule pt-4 text-[13px] leading-relaxed text-ash">
              Yang terbaca alat barusan: {level.goal.label}{" "}
              <span className="font-mono tabular-nums text-quantum">
                {Number.isFinite(reading) ? reading.toFixed(2) : "tak hingga"} {level.goal.unit}
              </span>
              . Hitungan di atas dan simulasinya memang memakai rumus yang sama.
            </p>
          )}

          <Link
            href={`/play/${firstMission.id}`}
            onClick={() => play("select")}
            className="btn btn-hot mt-2 w-full"
          >
            Coba misinya
          </Link>
        </div>
      </main>
    </div>
  );
}
