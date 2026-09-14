"use client";

import Link from "next/link";
import { useRef } from "react";

/**
 * Menu utama. Tab dan klik jalan sendiri; ↑ ↓ ditambah supaya terasa konsol.
 * Angkanya dititipkan halaman — katalog level tidak perlu ikut ke bundel klien.
 */
export default function MainMenu({ missions, chambers }: { missions: number; chambers: number }) {
  const nav = useRef<HTMLElement>(null);
  const items = [
    { label: "Masuk lab", hint: `${missions} misi siap`, href: "/play" },
    { label: "Ruang uji", hint: `${chambers} instrumen`, href: "#ruang" },
    { label: "Cara main", hint: "empat langkah", href: "#metode" },
    { label: "Ketentuan", hint: "aturan & privasi", href: "/ketentuan" },
  ];

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const links = [...(nav.current?.querySelectorAll("a") ?? [])];
    const at = links.indexOf(document.activeElement as HTMLAnchorElement);
    links[at < 0 ? (step > 0 ? 0 : links.length - 1) : (at + step + links.length) % links.length]
      ?.focus();
  };

  return (
    <nav ref={nav} onKeyDown={onKeyDown} aria-label="Menu utama" className="bracket max-w-[34rem] py-3">
      {items.map((item, i) => {
        const row = (
          <>
            <span
              aria-hidden="true"
              className="w-3 font-mono text-champagne opacity-0 transition-opacity duration-300 ease-settle group-hover:opacity-100 group-focus-visible:opacity-100"
            >
              ▸
            </span>
            <span className="font-mono text-xs tabular-nums text-ashdim transition-colors duration-500 ease-settle group-hover:text-champagne group-focus-visible:text-champagne">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="flex-1 font-serif text-[1.35rem] leading-none text-starlight">
              {item.label}
            </span>
            <span className="font-mono text-[11px] tabular-nums text-ashdim">{item.hint}</span>
          </>
        );
        const cls =
          "group flex items-baseline gap-4 border-b border-rule px-4 py-4 transition-all duration-500 ease-spring last:border-b-0 hover:border-champagne hover:bg-graphite/50 hover:pl-6 focus-visible:border-champagne focus-visible:bg-graphite/50 focus-visible:pl-6";
        return item.href.startsWith("#") ? (
          <a key={item.href} href={item.href} className={cls}>
            {row}
          </a>
        ) : (
          <Link key={item.href} href={item.href} className={cls}>
            {row}
          </Link>
        );
      })}
    </nav>
  );
}
