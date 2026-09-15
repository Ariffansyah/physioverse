"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { play } from "@/lib/sfx";
import { useTouch } from "@/lib/touch";


export type MenuItem = { label: string; hint: string; href: string };

export default function MainMenu({ items }: { items: MenuItem[] }) {
  const touch = useTouch();
  const nav = useRef<HTMLElement>(null);
  const [sel, setSel] = useState(0);


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
      setSel(next);
      play("move");
      nav.current?.querySelectorAll("a")[next]?.focus();
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  });

  return (
    <nav ref={nav} aria-label="Menu utama" className="max-w-[29rem]">
      {items.map((item, i) => {
        const on = i === sel;
        const row = (
          <>

            <span
              aria-hidden="true"
              className={`w-3 font-mono leading-none text-champagne transition-all duration-300 ease-spring ${
                on ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"
              }`}
            >
              ▸
            </span>
            <span
              className={`font-mono text-xs tabular-nums transition-colors duration-400 ease-settle ${
                on ? "text-champagne" : "text-ashdim"
              }`}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span
              className={`font-serif text-[clamp(1.5rem,1.15rem+0.9vw,2.05rem)] leading-none transition-colors duration-400 ease-settle ${
                on ? "text-starlight [text-shadow:0_0_1.8rem_rgb(237_190_112/0.35)]" : "text-ash"
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
              setSel(i);
            }
          },
          onFocus: () => setSel(i),
          onClick: () => play("select"),
        };
        return (
          <Link key={item.href} href={item.href} {...props}>
            {row}
          </Link>
        );
      })}
      <p className="mt-4 pl-4 text-[13px] text-ashdim">
        {touch ? "Ketuk salah satu untuk masuk." : "Pakai tombol ↑ ↓ lalu Enter, atau klik saja."}
      </p>
    </nav>
  );
}
