"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { finishRun } from "@/app/play/actions";
import Loading from "@/components/Loading";
import { LESSONS } from "@/lib/lesson";
import { CHAMBERS, LEVELS, getLevel, isSolved } from "@/lib/levels";
import { practiceLevel } from "@/lib/practice";
import { useTouch } from "@/lib/touch";
import { Briefing, ClueCard, Crosshair, ExitButton, ObjectiveCard, ResultCard, TweakPanel } from "./Hud";
import type { Lockable } from "./hall";

const World = dynamic(() => import("./World"), { ssr: false });

export default function Game({
  levelId,
  practice = false,
  rooms,
}: {
  levelId: string;
  practice?: boolean;
  rooms?: string[];
}) {
  const [roomId] = useState(() =>
    rooms && rooms.length > 0 ? rooms[Math.floor(Math.random() * rooms.length)]! : levelId,
  );
  const base = getLevel(roomId)!;
  const [seed, setSeed] = useState(() => Date.now());
  const level = useMemo(
    () => (practice ? (practiceLevel(base, seed) ?? base) : base),
    [practice, base, seed],
  );


  const touch = useTouch();
  const orbit = touch ? { ...LESSONS[level.chamber] } : undefined;
  const nextId = LEVELS[LEVELS.indexOf(level) + 1]?.id;
  const tint = CHAMBERS[level.chamber].tint;

  const [params, setParams] = useState<Record<string, number>>(() => ({ ...level.defaults }));
  const [ready, setReady] = useState(false);
  const [locked, setLocked] = useState(false);
  const [dockOpen, setDockOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [runToken, setRunToken] = useState(0);
  const [result, setResult] = useState<{ value: number; solved: boolean; elapsed: string } | null>(null);
  const [attempts, setAttempts] = useState<number[]>([]);
  const [saveError, setSaveError] = useState<string>();
  const [startedAt, setStartedAt] = useState(0);
  const [, record] = useTransition();
  const controls = useRef<Lockable | null>(null);

  const busy = running || !!result;

  const openDock = useCallback(() => {
    setDockOpen(true);
    controls.current?.unlock();
  }, []);
  const closeDock = useCallback(() => {
    setDockOpen(false);
    controls.current?.lock();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "KeyE" || e.code === "Tab") {
        if (!busy && !result && startedAt > 0) {
          e.preventDefault();
          if (dockOpen) {
            setDockOpen(false);
            controls.current?.lock();
          } else {
            setDockOpen(true);
            controls.current?.unlock();
          }
        }
      }
      if (e.code === "Escape" && dockOpen) {
        setDockOpen(false);
        controls.current?.lock();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, result, startedAt, dockOpen]);

  const enter = () => {
    setStartedAt(performance.now());
    setDockOpen(touch);
    if (!touch) setTimeout(() => controls.current?.lock(), 60);
  };

  const run = () => {
    setDockOpen(false);
    setRunning(true);
    setRunToken((t) => t + 1);
    controls.current?.lock();
  };

  const finish = useCallback(
    (value: number) => {
      const ms = performance.now() - startedAt;
      setRunning(false);
      setAttempts((a) => [...a, value]);
      setResult({ value, solved: isSolved(level, value), elapsed: `${(ms / 1000).toFixed(1)}s` });
      controls.current?.unlock();
      if (practice) return;
      record(async () => {
        try {
          await finishRun(level.id, params, ms);
        } catch (e) {
          setSaveError(e instanceof Error ? e.message : "koneksi gagal");
        }
      });
    },
    [level, params, startedAt, practice],
  );

  const retry = () => {
    setResult(null);
    setSaveError(undefined);
    setDockOpen(false);
    setTimeout(() => controls.current?.lock(), 60);
  };

  const shuffle = () => {
    setSeed(Date.now());
    setParams({ ...base.defaults });
    setAttempts([]);
    retry();
  };

  const panelProps = {
    level,
    params,
    attempts,
    onChange: (key: string, v: number) => setParams((p) => ({ ...p, [key]: v })),
    onRun: run,
    onClose: closeDock,
  } as const;

  return (
    <main className="relative z-2 h-[100dvh] w-full overflow-hidden">
      <div id="play-surface" className="absolute inset-0">
        <World
          levelId={level.id}
          params={params}
          runToken={runToken}
          active={locked && !dockOpen && !result}
          onFinish={finish}
          onNear={() => {}}
          onLock={() => setLocked(true)}
          onUnlock={() => setLocked(false)}
          controlsRef={controls}
          onInteract={openDock}
          onReady={() => setReady(true)}
          orbit={orbit}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-[70]">
        <Loading label="Mengkalibrasi ruang uji" done={ready} />
      </div>

      {startedAt > 0 && !result && (
        <>
          {locked && !dockOpen && <Crosshair hot={!running} />}
          {!dockOpen && <ObjectiveCard level={level} startedAt={startedAt} />}
          {!dockOpen && <ClueCard level={level} />}
          <ExitButton />
          {!dockOpen && !locked && !touch && (
            <div className="pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3">
              <span className="hud px-4 py-2 text-xs text-ash">Klik arena untuk jalan, klik objek untuk atur</span>
            </div>
          )}


          {!dockOpen && (
            <button
              type="button"
              onClick={openDock}
              style={{ background: tint, borderColor: tint, color: "var(--color-obsidian)" }}
              className={`btn absolute z-20 py-3 font-medium ${touch ? "bottom-5 right-3" : "bottom-24 right-6 sm:bottom-24 sm:right-6"}`}
            >
              Atur alat{!touch && <span className="opacity-70"> atau klik E</span>}
            </button>
          )}

          {dockOpen && (
            <div className="absolute inset-x-2 bottom-2 z-20 flex justify-center">
              <TweakPanel {...panelProps} />
            </div>
          )}
        </>
      )}

      {startedAt === 0 && <Briefing level={level} onEnter={enter} />}

      {result && (
        <ResultCard
          level={level}
          params={params}
          attempts={attempts}
          value={result.value}
          solved={result.solved}
          elapsed={result.elapsed}
          nextId={nextId}
          saveError={saveError}
          onRetry={retry}
          onShuffle={practice ? shuffle : undefined}
        />
      )}

    </main>
  );
}
