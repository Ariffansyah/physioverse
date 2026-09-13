"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { finishRun } from "@/app/play/actions";
import { LEVELS, getLevel, isSolved } from "@/lib/levels";
import { Briefing, ClueCard, Crosshair, ExitButton, ObjectiveCard, ResultCard, TweakPanel } from "./Hud";
import type { Lockable } from "./hall";
import { VrPanel } from "./VrPanel";

const World = dynamic(() => import("./World"), {
  ssr: false,
  loading: () => (
    <div className="flex size-full items-center justify-center bg-well">
      <div className="grid w-64 gap-3">
        <span className="h-px w-full bg-rule" />
        <span className="h-px w-2/3 bg-rule" />
        <span className="h-px w-5/6 bg-rule" />
        <p className="tag mt-2">Mengkalibrasi arena</p>
      </div>
    </div>
  ),
});

export default function Game({ levelId }: { levelId: string }) {
  const level = getLevel(levelId)!;
  const nextId = LEVELS[LEVELS.indexOf(level) + 1]?.id;

  const [params, setParams] = useState<Record<string, number>>(() => ({ ...level.defaults }));
  const [locked, setLocked] = useState(false);
  const [dockOpen, setDockOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [runToken, setRunToken] = useState(0);
  const [result, setResult] = useState<{ value: number; solved: boolean; elapsed: string } | null>(null);
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
    setDockOpen(false);
    setTimeout(() => controls.current?.lock(), 60);
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
      setResult({ value, solved: isSolved(level, value), elapsed: `${(ms / 1000).toFixed(1)}s` });
      controls.current?.unlock();
      record(async () => {
        try {
          await finishRun(level.id, params, ms);
        } catch (e) {
          setSaveError(e instanceof Error ? e.message : "koneksi gagal");
        }
      });
    },
    [level, params, startedAt],
  );

  const retry = () => {
    setResult(null);
    setSaveError(undefined);
    setDockOpen(false);
    setTimeout(() => controls.current?.lock(), 60);
  };

  const hud =
    startedAt > 0 && !result && dockOpen ? (
      <VrPanel id="dock" offset={[0, 0, -1.05]} lag={7} interactive>
        <TweakPanel
          level={level}
          params={params}
          onChange={(key, v) => setParams((p) => ({ ...p, [key]: v }))}
          onRun={run}
          onClose={closeDock}
        />
      </VrPanel>
    ) : null;

  return (
    <div className="relative z-2 h-[100dvh] w-full overflow-hidden">
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
          hud={hud}
        />
      </div>

      {startedAt > 0 && !result && (
        <>
          {locked && !dockOpen && <Crosshair hot={!running} />}
          {!dockOpen && <ObjectiveCard level={level} startedAt={startedAt} />}
          {!dockOpen && <ClueCard level={level} />}
          <ExitButton />
          {!dockOpen && !locked && (
            <div className="pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3">
              <span className="hud px-4 py-2 text-xs text-ash">Klik arena untuk jalan, klik objek untuk atur</span>
            </div>
          )}
        </>
      )}

      {startedAt === 0 && <Briefing level={level} onEnter={enter} />}

      {result && (
        <ResultCard
          level={level}
          value={result.value}
          solved={result.solved}
          elapsed={result.elapsed}
          nextId={nextId}
          saveError={saveError}
          onRetry={retry}
        />
      )}

    </div>
  );
}
