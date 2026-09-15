"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { play } from "@/lib/sfx";

/**
 * Menu utama. Satu baris selalu tersorot — itu yang membedakan menu permainan
 * dari daftar tautan: kursor menunggu di suatu tempat, bukan tidak di mana-mana.
 * ↑ ↓ memindahkan sorotan sekaligus fokus, jadi Enter jalan tanpa kode tambahan.
 * Angkanya dititipkan halaman — katalog level tidak perlu ikut ke bundel klien.
 */
export type MenuItem = { label: string; hint: string; href: string };

export default function MainMenu({ items }: { items: MenuItem[] }) {
  const nav = useRef<HTMLElement>(null);
  const [sel, setSel] = useState(0);

  /**
   * ↑ ↓ dipasang di window, bukan di nav: menu utama harus langsung menjawab
   * begitu layarnya terbuka, tanpa harus men-Tab masuk ke daftarnya dulu.
   * Sorotan sekaligus memindahkan fokus, jadi Enter jalan tanpa kode tambahan.
   */
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
            {/* Penunjuk yang menyala hanya di baris terpilih. */}
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
              className={`flex-1 font-serif text-[clamp(1.35rem,1.1rem+0.7vw,1.8rem)] leading-none transition-colors duration-400 ease-settle ${
                on ? "text-starlight [text-shadow:0_0_1.8rem_rgb(237_190_112/0.35)]" : "text-ash"
              }`}
            >
              {item.label}
            </span>
            <span className="font-mono text-[11px] tabular-nums text-ashdim">{item.hint}</span>
          </>
        );
        // Rel kiri yang menyala, bukan kotak yang terisi: sorotannya membaca
        // sebagai lampu instrumen, bukan tombol formulir.
        const cls = `group flex items-baseline gap-4 border-l-2 py-3.5 pr-4 transition-all duration-400 ease-spring ${
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
      <p className="mt-4 pl-4 font-mono text-[11px] tracking-[0.18em] text-ashdim">
        ↑ ↓ PILIH · ENTER MASUK
      </p>
    </nav>
  );
}
