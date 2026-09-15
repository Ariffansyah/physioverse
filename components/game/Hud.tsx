"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Level } from "@/lib/levels";
import { play } from "@/lib/sfx";

export const fmt = (v: number, digits = 2) => (Number.isFinite(v) ? v.toFixed(digits) : "∞");

export function Crosshair({ hot }: { hot: boolean }) {
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <div
        className={`rounded-full border ${hot ? "size-1.5 border-champagne bg-champagne" : "size-3 border-starlight/45 bg-transparent"}`}
      />
    </div>
  );
}

export function ObjectiveCard({ level, startedAt }: { level: Level; startedAt: number }) {
  const [elapsed, setElapsed] = useState("0.0");
  useEffect(() => {
    const tick = () => setElapsed(((performance.now() - startedAt) / 1000).toFixed(1));
    tick();
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, [startedAt]);
  return (
    <div className="hud pointer-events-none absolute left-6 top-6 max-w-xs p-5">
      <p className="tag">Mission Briefing</p>
      <p className="mt-2.5 font-serif text-xl leading-snug text-starlight">{level.name}</p>
      <p className="mt-2.5 text-sm leading-relaxed text-ash">{level.objective}</p>
      <dl className="mt-4 grid gap-1.5 border-t border-rule pt-4 font-mono text-xs tabular-nums">
        <div className="flex justify-between gap-4">
          <dt className="text-ashdim">Target</dt>
          <dd className="text-ash">
            {level.goal.label} {level.goal.target} {level.goal.unit}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ashdim">Toleransi</dt>
          <dd className="text-champagne">± {level.goal.tolerance} {level.goal.unit}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ashdim">Waktu</dt>
          <dd className="text-ash">{elapsed} s</dd>
        </div>
      </dl>
    </div>
  );
}

export function ExitButton() {
  return (
    <div className="absolute bottom-6 right-6 grid justify-items-end gap-1.5">
      <div className="flex gap-2">
        <Link
          href="/play"
          onClick={() => play("back")}
          className="hud px-4 py-2 font-mono text-xs tracking-[0.08em] text-ash transition-colors duration-500 ease-settle hover:border-champagne hover:text-champagne"
        >
          ◂ PILIH TAHAP
        </Link>
        <Link
          href="/"
          onClick={() => play("back")}
          className="hud px-4 py-2 font-mono text-xs tracking-[0.08em] text-ash transition-colors duration-500 ease-settle hover:border-champagne hover:text-champagne"
        >
          MENU UTAMA
        </Link>
      </div>
      <span className="font-mono text-[10px] text-ashdim">ESC lepas kursor, lalu klik</span>
    </div>
  );
}

export function ClueCard({ level }: { level: Level }) {
  return (
    <div className="hud pointer-events-none absolute right-6 top-6 hidden max-w-[20rem] p-5 lg:block">
      <p className="tag">Cosmic Clue</p>
      <p className="mt-3 font-serif text-base leading-snug text-champagne">{level.clue.relation}</p>
      <ul className="mt-3.5 grid gap-1">
        {level.clue.given.map((g) => (
          <li key={g} className="font-mono text-xs tabular-nums text-ash">
            {g}
          </li>
        ))}
      </ul>
      <p className="mt-4 border-t border-rule pt-4 text-xs leading-relaxed text-ashdim">{level.clue.hint}</p>
    </div>
  );
}

export function Prompt({ show, text = "Tekan E untuk atur" }: { show: boolean; text?: string }) {
  if (!show) return null;
  return (
    <div className="pointer-events-none absolute bottom-28 left-1/2 -translate-x-1/2">
      <div className="hud flex items-center gap-3 px-5 py-3">
        <kbd className="border border-champagne/45 px-2 py-0.5 font-mono text-[11px] text-champagne">E</kbd>
        <span className="text-sm text-ash">{text}</span>
      </div>
    </div>
  );
}

const KEYS: [string, string][] = [
  ["W A S D", "jalan"],
  ["SHIFT", "lari"],
  ["MOUSE", "lihat"],
  ["E / TAB", "isi angka"],
  ["ESC", "lepas kursor"],
];

export function Briefing({ level, onEnter }: { level: Level; onEnter: () => void }) {
  return (
    <Overlay>
      <div className="panel w-full max-w-xl p-9">
        <p className="tag">Pengarahan</p>
        <h1 className="mt-3 text-[clamp(1.9rem,1.4rem+1.6vw,2.6rem)] leading-tight">{level.name}</h1>
        <p className="mt-5 max-w-[58ch] text-[15px] leading-relaxed text-ash">{level.brief}</p>
        <div className="mt-7 grid gap-2 border-t border-rule pt-5">
          <p className="tag">Sasaran</p>
          <p className="text-[15px] text-starlight">{level.objective}</p>
          <p className="font-mono text-sm tabular-nums text-champagne">
            {level.goal.label} {level.goal.target} {level.goal.unit} toleransi {level.goal.tolerance}
          </p>
          <p className="text-xs leading-relaxed text-ashdim">
            Ketik angkanya di konsol objek. Tidak ada bocoran hasil — hitung sendiri dari rumus, lalu kirim.
          </p>
        </div>
        <div className="mt-6 grid gap-2 border-t border-rule pt-5">
          <p className="tag">Rumus</p>
          <p className="font-serif text-lg italic text-champagne">{level.clue.relation}</p>
          {level.clue.given.map((g) => (
            <p key={g} className="font-mono text-xs tabular-nums text-ash">
              {g}
            </p>
          ))}
          <p className="mt-1.5 text-xs leading-relaxed text-ashdim">{level.clue.hint}</p>
        </div>
        <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2">
          {KEYS.map(([k, v]) => (
            <span key={k} className="flex items-center gap-2 text-xs text-ashdim">
              <kbd className="border border-rule px-1.5 py-0.5 font-mono text-[11px] text-ash">{k}</kbd>
              {v}
            </span>
          ))}
        </div>
        <div className="mt-9 flex items-center gap-6">
          <button
            type="button"
            onClick={() => {
              play("select");
              onEnter();
            }}
            className="btn btn-hot flex-1"
          >
            Masuk arena
          </button>
          <Link
            href="/play"
            onClick={() => play("back")}
            className="font-mono text-[11px] tracking-[0.18em] uppercase text-ashdim transition-colors duration-500 ease-settle hover:text-champagne"
          >
            Batal
          </Link>
        </div>
      </div>
    </Overlay>
  );
}

export function Resume({ onResume }: { onResume: () => void }) {
  return (
    <Overlay onClick={onResume}>
      <div className="text-center">
        <p className="font-serif text-3xl text-starlight">Klik untuk lanjut</p>
        <p className="mt-3 text-sm text-ashdim">Kursor dilepas. Klik lagi untuk mengunci.</p>
        <Link
          href="/play"
          onClick={(e) => e.stopPropagation()}
          className="mt-8 inline-block border-b border-transparent pb-1 text-sm text-ashdim"
        >
          Keluar ke daftar misi
        </Link>
      </div>
    </Overlay>
  );
}

export function ResultCard({
  level,
  value,
  solved,
  elapsed,
  nextId,
  saveError,
  onRetry,
}: {
  level: Level;
  value: number;
  solved: boolean;
  elapsed: string;
  nextId?: string;
  saveError?: string;
  onRetry: () => void;
}) {
  const off = Math.abs(value - level.goal.target);
  const tone = solved ? "text-champagne" : "text-oxide";

  // Dipicu sekali per hasil: `solved` ikut di deps supaya percobaan berikutnya
  // berbunyi lagi, tapi render ulang biasa tidak.
  useEffect(() => {
    play(solved ? "win" : "fail");
  }, [solved, elapsed]);
  return (
    <Overlay>
      <div className="panel w-full max-w-md p-9">
        <p className="tag">{solved ? "Masuk" : "Meleset"}</p>
        <h2 className={`mt-3 font-serif text-3xl leading-tight ${tone}`}>
          {solved ? "Tepat sasaran" : "Coba lagi"}
        </h2>
        <dl className="mt-7 grid gap-0 border-t border-rule font-mono text-sm tabular-nums">
          {[
            ["Hasilmu", `${fmt(value)} ${level.goal.unit}`],
            ["Target", `${level.goal.target} ${level.goal.unit}`],
            ["Selisih", `${Number.isFinite(off) ? off.toFixed(2) : "∞"} ${level.goal.unit}`],
            ["Waktu", elapsed],
          ].map(([label, v], i) => (
            <div key={label} className="flex justify-between gap-6 border-b border-rule py-3">
              <dt className="tag">{label}</dt>
              <dd className={i === 0 ? tone : "text-ash"}>{v}</dd>
            </div>
          ))}
        </dl>
        {solved ? (
          <p className="mt-5 text-sm text-ash">
            Bagus. <span className="text-champagne">+{level.xp} XP</span>
          </p>
        ) : (
          <p className="mt-5 max-w-[46ch] text-sm leading-relaxed text-ash">
            Hitung ulang dari rumus, ubah angkanya, lalu kirim lagi.
          </p>
        )}
        {saveError && <p className="mt-4 border-l border-oxide pl-4 text-xs text-oxide">Gagal simpan: {saveError}</p>}
        <div className="mt-8 flex gap-4">
          <button
            type="button"
            onClick={() => {
              play("select");
              onRetry();
            }}
            className="btn flex-1"
          >
            Coba lagi
          </button>
          <Link
            href={solved && nextId ? `/play/${nextId}` : "/play"}
            className="btn btn-hot flex-1"
          >
            {solved && nextId ? "Misi berikutnya" : "Daftar misi"}
          </Link>
        </div>
      </div>
    </Overlay>
  );
}

function NumberField({
  control,
  value,
  onChange,
}: {
  control: Level["controls"][number];
  value: number;
  onChange: (v: number) => void;
}) {
  const decimals = Math.max(0, -Math.floor(Math.log10(control.step)));
  const [text, setText] = useState(value.toFixed(decimals));

  // rapikan + kunci ke rentang saat selesai mengetik; server juga clamp lagi
  const commit = () => {
    const n = Number(text);
    const safe = Number.isFinite(n) ? Math.min(control.max, Math.max(control.min, n)) : value;
    setText(safe.toFixed(decimals));
    onChange(safe);
  };

  return (
    <label className="grid gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="tag">{control.label}</span>
        <span className="font-mono text-[10px] tabular-nums text-ashdim">
          {control.min}–{control.max} {control.unit}
        </span>
      </div>
      <div className="flex items-center gap-2 border border-rule bg-obsidian px-3 py-2 focus-within:border-champagne/60">
        <input
          type="number"
          inputMode="decimal"
          min={control.min}
          max={control.max}
          step={control.step}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            const n = Number(e.target.value);
            if (e.target.value !== "" && Number.isFinite(n)) onChange(n);
          }}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
          }}
          aria-label={`${control.label} (${control.unit})`}
          className="w-full bg-transparent font-mono text-sm tabular-nums text-champagne outline-none"
        />
        <span className="shrink-0 font-mono text-xs text-ashdim">{control.unit}</span>
      </div>
    </label>
  );
}

export function TweakPanel({
  level,
  params,
  onChange,
  onRun,
  onClose,
}: {
  level: Level;
  params: Record<string, number>;
  onChange: (key: string, v: number) => void;
  onRun: () => void;
  onClose: () => void;
}) {
  return (
    <aside className="hud max-h-[64dvh] w-[21rem] overflow-y-auto p-5">
      <div className="flex items-start justify-between gap-3 border-b border-rule pb-4">
        <div>
          <p className="tag">Konsol objek</p>
          <h2 className="mt-1.5 font-serif text-lg leading-none text-starlight">{level.name}</h2>
          <p className="mt-2 flex items-center gap-1.5 font-mono text-[10px] text-ashdim">
            <span aria-hidden className="tracking-[-0.15em]">⁙⁙</span>
            seret area kosong untuk geser panel
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup konsol"
          className="border border-rule px-2 py-1 font-mono text-[11px] text-ashdim"
        >
          ESC
        </button>
      </div>

      <div className="mt-5 grid gap-5">
        {level.controls.map((c) => (
          <NumberField key={c.key} control={c} value={params[c.key]} onChange={(v) => onChange(c.key, v)} />
        ))}
      </div>

      <dl className="mt-5 grid gap-1.5 border-t border-rule pt-4 font-mono text-xs tabular-nums">
        <div className="flex justify-between gap-4">
          <dt className="text-ashdim">Target</dt>
          <dd className="text-ash">
            {level.goal.target} {level.goal.unit}
          </dd>
        </div>
        {level.marker !== undefined && (
          <div className="flex justify-between gap-4">
            <dt className="text-ashdim">Jarak sasaran</dt>
            <dd className="text-ash">{level.marker} m</dd>
          </div>
        )}
      </dl>

      <div className="mt-4 border-t border-rule pt-4">
        <p className="tag">Rumus</p>
        <p className="mt-1.5 font-serif text-base italic leading-snug text-champagne">
          {level.clue.relation}
        </p>
        <ul className="mt-3 grid gap-1">
          {level.clue.given.map((g) => (
            <li key={g} className="font-mono text-[11px] tabular-nums text-ash">
              {g}
            </li>
          ))}
        </ul>
        <p className="mt-2.5 text-[11px] leading-relaxed text-ashdim">{level.clue.hint}</p>
      </div>

      <button
        type="button"
        onClick={() => {
          play("run");
          onRun();
        }}
        className="btn btn-hot mt-5 w-full"
      >
        KIRIM MISI
      </button>
    </aside>
  );
}

function Overlay({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className="absolute inset-0 z-20 flex items-center justify-center p-6"
      style={{ background: "rgb(4 6 9 / 0.82)" }}
    >
      {children}
    </div>
  );
}
