"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { setFocus, setStops, useFocus } from "@/lib/focus";
import { PLANETS } from "@/lib/planets";
import { play } from "@/lib/sfx";
import { useNarrow, useTouch } from "@/lib/touch";


export type MenuItem = {
  label: string;
  hint: string;
  href: string;
  planet: number;
  preview: string[];
};

export default function MainMenu({ items }: { items: MenuItem[] }) {
  const touch = useTouch();
  const flat = useNarrow();
  const nav = useRef<HTMLElement>(null);
  const router = useRouter();

  const focus = useFocus();
  const sel = Math.max(0, items.findIndex((it) => it.planet === focus));

  useEffect(() => {
    setFocus(items[0].planet);
    setStops(items.map((it) => ({ planet: it.planet, label: it.label, go: () => router.push(it.href) })));
    return () => {
      setFocus(-1);
      setStops([]);
    };
  }, [items, router]);


  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target;
      if (el instanceof Element && el.closest("input, textarea, select, [contenteditable]")) {
        return;
      }
      const step = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
      if (!step) return;
      e.preventDefault();
      const next = (sel + step + items.length) % items.length;
      setFocus(items[next].planet);
      play("move");
      nav.current?.querySelectorAll("a")[next]?.focus();
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  });

  return (
    <nav ref={nav} aria-label="Menu utama" className="max-w-[29rem]">
      {items.map((item, i) => {
        const on = i === sel && !flat;
        const row = (
          <>

            {!flat && (
              <span
                aria-hidden="true"
                className={`w-3 font-mono leading-none text-champagne transition-all duration-300 ease-spring ${
                  on ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"
                }`}
              >
                ▸
              </span>
            )}
            <span
              className={`font-mono text-xs tabular-nums transition-colors duration-400 ease-settle ${
                on || flat ? "text-champagne" : "text-ashdim"
              }`}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span
              className={`font-serif text-[clamp(1.5rem,1.15rem+0.9vw,2.05rem)] leading-none transition-colors duration-400 ease-settle ${
                on
                  ? "text-starlight [text-shadow:0_0_1.8rem_rgb(237_190_112/0.35)]"
                  : flat
                    ? "text-starlight"
                    : "text-ash"
              }`}
            >
              {item.label}
            </span>
            <span className="flex-1 text-[13px] text-ashdim">{item.hint}</span>
          </>
        );


        const cls = `group flex items-baseline gap-4 border-l-2 py-4 pr-4 transition-all duration-400 ease-spring ${
          on
            ? "border-champagne bg-[linear-gradient(90deg,rgb(237_190_112/0.10),transparent_62%)] pl-7"
            : "border-rule pl-4"
        }`;
        const props = {
          className: cls,
          onPointerEnter: () => {
            if (i !== sel) {
              play("move");
              setFocus(item.planet);
            }
          },
          onFocus: () => setFocus(item.planet),
          onClick: () => play("select"),
        };
        const planet = PLANETS[item.planet];

        return (
          <div key={item.href}>
            <Link href={item.href} {...props}>
              {row}
            </Link>
            <div
              className={`grid overflow-hidden transition-all duration-500 ease-spring ${
                flat ? "hidden" : on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="min-h-0">
                <div className="flex flex-wrap items-center gap-2 py-3 pl-7 pr-4">
                  <span
                    className="chip tabular-nums"
                    style={{ ["--tint" as string]: planet.color }}
                  >
                    <span
                      aria-hidden="true"
                      className="mr-2 inline-block size-1.5 rounded-full align-middle"
                      style={{ background: planet.color, boxShadow: `0 0 8px ${planet.color}` }}
                    />
                    {planet.name}
                  </span>
                  {item.preview.map((bit) => (
                    <span key={bit} className="chip">
                      {bit}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <p className="mt-4 pl-4 text-[13px] text-ashdim">
        {touch ? "Ketuk salah satu untuk masuk." : "Pakai tombol ↑ ↓ lalu Enter, atau klik saja."}
      </p>
    </nav>
  );
}
