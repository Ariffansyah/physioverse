"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { setFocus, setStops, useFocus } from "@/lib/focus";
import type { ChamberKey } from "@/lib/levels";
import { planetOf } from "@/lib/planets";
import { play } from "@/lib/sfx";
import { useNarrow, useTouch } from "@/lib/touch";

export type Room = {
  key: ChamberKey;
  name: string;
  tint: string;
  title: string;
  intro: string;
  missions: number;
};

export default function RoomPicker({ rooms }: { rooms: Room[] }) {
  const router = useRouter();
  const focus = useFocus();
  const list = useRef<HTMLOListElement>(null);
  const touch = useTouch();
  const narrow = useNarrow();

  const sel = Math.max(
    0,
    rooms.findIndex((r) => planetOf(r.key) === focus),
  );

  useEffect(() => {
    setStops(
      rooms.map((r) => ({
        planet: planetOf(r.key),
        label: r.name,
        card: {
          kicker: r.name,
          title: r.title,
          body: r.intro,
          meta: `${r.missions} MISI SETELAHNYA`,
          cta: "MASUK ▸",
          tint: r.tint,
        },
        go: () => router.push(`/belajar/${r.key}`),
      })),
    );
    setFocus(planetOf(rooms[0].key));
    return () => {
      setFocus(-1);
      setStops([]);
    };
  }, [rooms, router]);

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
      if (!step) return;

      e.preventDefault();
      const next = (sel + step + rooms.length) % rooms.length;
      play("move");
      setFocus(planetOf(rooms[next].key));
      list.current?.querySelectorAll("a")[next]?.focus({ preventScroll: true });
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [rooms, sel]);

  return (
    // deliberately narrow: the planet is the main event, this is the index
    <ol
      ref={list}
      className="hud mt-8 w-full max-w-[21rem] bg-graphite/70 p-1.5 backdrop-blur-sm"
    >
      {rooms.map((room, i) => {
        const on = i === sel && !narrow;
        return (
          <li key={room.key}>
            <Link
              href={`/belajar/${room.key}`}
              // on touch pointerenter and click arrive together: let the tap decide
              onPointerEnter={
                touch
                  ? undefined
                  : () => {
                      if (!on) {
                        play("move");
                        setFocus(planetOf(room.key));
                      }
                    }
              }
              onFocus={(e) => {
                if (e.currentTarget.matches(":focus-visible")) setFocus(planetOf(room.key));
              }}
              onClick={(e) => {
                // on a phone there is no planet to pick first: the row opens
                if (touch && !narrow && !on) {
                  e.preventDefault();
                  play("move");
                  setFocus(planetOf(room.key));
                  return;
                }
                play("select");
              }}
              aria-current={on ? "true" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors sm:py-2.5 duration-300 ease-settle ${
                on ? "bg-[color-mix(in_oklab,var(--tint)_14%,transparent)]" : "hover:bg-graphite-hi/60"
              }`}
              style={{ ["--tint" as string]: room.tint }}
            >
              <span
                aria-hidden="true"
                className="size-2 shrink-0 rounded-full transition-shadow duration-500"
                style={{
                  background: room.tint,
                  boxShadow: on ? `0 0 10px ${room.tint}` : undefined,
                }}
              />
              <span
                className={`truncate text-[14px] transition-colors sm:text-[15px] duration-300 ease-settle ${
                  on ? "text-starlight" : "text-ash"
                }`}
              >
                {room.title}
              </span>
              <span
                className={`ml-auto shrink-0 font-mono text-[10px] tracking-[0.16em] transition-opacity duration-300 ${
                  on ? "opacity-100" : "opacity-0"
                }`}
                style={{ color: room.tint }}
              >
                ▸
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
