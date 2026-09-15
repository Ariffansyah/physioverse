"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CHAMBERS, type Level } from "@/lib/levels";
import { play } from "@/lib/sfx";
import { useTouch } from "@/lib/touch";

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
    <div className="hud pointer-events-none absolute left-3 top-3 max-w-[15.5rem] p-4 sm:left-6 sm:top-6 sm:max-w-xs sm:p-5">
      <p className="tag">Misi kamu</p>
      <p className="mt-2 font-serif text-lg leading-snug text-starlight sm:mt-2.5 sm:text-xl">{level.name}</p>
      <p className="mt-2 text-[13px] leading-relaxed text-ash sm:mt-2.5 sm:text-sm">{level.objective}</p>
      <dl className="mt-3 grid gap-1.5 border-t border-rule pt-3 font-mono text-[11px] tabular-nums sm:mt-4 sm:pt-4 sm:text-xs">
        <div className="flex justify-between gap-4">
          <dt className="text-ashdim">Target</dt>
          <dd className="text-ash">
            {level.goal.label} {level.goal.target} {level.goal.unit}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ashdim">Boleh meleset</dt>
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
  const touch = useTouch();
  return (


    <div
      className={`absolute grid gap-1.5 ${
        touch
          ? "bottom-3 left-3 justify-items-start"
          : "bottom-3 right-3 justify-items-end sm:bottom-6 sm:right-6"
      }`}
    >
      <div className="flex flex-wrap gap-2">
        <Link
          href="/play"
          onClick={() => play("back")}
          className="hud px-3 py-2 font-mono text-[11px] tracking-[0.08em] text-ash transition-colors duration-500 ease-settle hover:border-champagne hover:text-champagne sm:px-4 sm:text-xs"
        >
          ◂ PILIH MISI
        </Link>
        <Link
          href="/"
          onClick={() => play("back")}
          className="hud px-3 py-2 font-mono text-[11px] tracking-[0.08em] text-ash transition-colors duration-500 ease-settle hover:border-champagne hover:text-champagne sm:px-4 sm:text-xs"
        >
          MENU UTAMA
        </Link>
      </div>
      {!touch && (
        <span className="font-mono text-[10px] text-ashdim">ESC lepas kursor, lalu klik</span>
      )}
    </div>
  );
}

export function ClueCard({ level }: { level: Level }) {
  return (
    <div className="hud pointer-events-none absolute right-6 top-6 hidden max-w-[20rem] p-5 lg:block">
      <p className="tag">Petunjuk</p>
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

export function Prompt({ show, text }: { show: boolean; text?: string }) {
  const touch = useTouch();
  const say = text ?? (touch ? "Ketuk alatnya untuk mengatur" : "Tekan E untuk atur");
  if (!show) return null;
  return (
    <div className="pointer-events-none absolute bottom-28 left-1/2 -translate-x-1/2">
      <div className="hud flex items-center gap-3 px-5 py-3">
        {!touch && (
          <kbd className="rounded-md border border-champagne/45 px-2 py-0.5 font-mono text-[11px] text-champagne">
            E
          </kbd>
        )}
        <span className="text-sm text-ash">{say}</span>
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
  const touch = useTouch();
  return (
    <Overlay>
      <div className="panel w-full max-w-xl p-6 sm:p-9">
        <p className="tag">Sebelum mulai</p>
        <h1 className="mt-3 text-[clamp(1.9rem,1.4rem+1.6vw,2.6rem)] leading-tight">{level.name}</h1>
        <p className="mt-5 max-w-[58ch] text-[15px] leading-relaxed text-ash">{level.brief}</p>
        <div className="mt-7 grid gap-2 border-t border-rule pt-5">
          <p className="tag">Target</p>
          <p className="text-[15px] text-starlight">{level.objective}</p>
          <p className="font-mono text-sm tabular-nums text-champagne">
            {level.goal.label} {level.goal.target} {level.goal.unit} · boleh meleset ±{level.goal.tolerance}
          </p>
          <p className="text-xs leading-relaxed text-ashdim">
            Hitung sendiri pakai rumus di bawah, ketik angkanya di panel alat, lalu kirim.
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
          {touch ? (
            <p className="text-xs leading-relaxed text-ashdim">
              Seret layar untuk memutar pandangan, cubit untuk mendekat, dan ketuk alatnya
              untuk membuka panel pengaturan.
            </p>
          ) : (
            KEYS.map(([k, v]) => (
              <span key={k} className="flex items-center gap-2 text-xs text-ashdim">
                <kbd className="rounded-md border border-rule px-1.5 py-0.5 font-mono text-[11px] text-ash">
                  {k}
                </kbd>
                {v}
              </span>
            ))
          )}
        </div>
        <div className="mt-9 grid gap-4 sm:flex sm:items-center sm:gap-6">
          <button
            type="button"
            onClick={() => {
              play("select");
              onEnter();
            }}
            className="btn btn-hot py-3 sm:flex-1"
          >
            Mulai main
          </button>

          <Link
            href={`/belajar/${level.chamber}`}
            onClick={() => play("select")}
            className="font-mono text-[11px] tracking-[0.18em] uppercase text-quantum transition-colors duration-500 ease-settle hover:text-champagne"
          >
            Pelajari dulu
          </Link>
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


  useEffect(() => {
    play(solved ? "win" : "fail");
  }, [solved, elapsed]);
  return (
    <Overlay>
      <div className="panel w-full max-w-md p-6 sm:p-9">
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
        <div className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4">
          <button
            type="button"
            onClick={() => {
              play("select");
              onRetry();
            }}
            className="btn"
          >
            Coba lagi
          </button>
          <Link
            href={solved && nextId ? `/play/${nextId}` : "/play"}
            className="btn btn-hot"
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
  tint,
  onChange,
}: {
  control: Level["controls"][number];
  value: number;
  tint: string;
  onChange: (v: number) => void;
}) {
  const decimals = Math.max(0, -Math.floor(Math.log10(control.step)));
  const [text, setText] = useState(value.toFixed(decimals));

  const clamp = (n: number) => Math.min(control.max, Math.max(control.min, n));

  const set = (n: number) => {
    const safe = clamp(Number(n.toFixed(decimals + 2)));
    setText(safe.toFixed(decimals));
    onChange(safe);
  };

  const commit = () => {
    const n = Number(text);
    set(Number.isFinite(n) ? n : value);
  };

  const bump = (dir: 1 | -1) => {
    set(value + dir * control.step);
    play("move");
  };

  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="tag">{control.label}</span>
        <span className="shrink-0 font-mono text-[11px] tabular-nums text-ashdim">
          {control.min} – {control.max}
        </span>
      </div>
      <div className="field flex items-stretch overflow-hidden">
        <Step onClick={() => bump(-1)} label={`Kurangi ${control.label}`} glyph="−" />
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
          style={{ color: tint }}
          className="w-full min-w-0 bg-transparent py-3 text-center font-mono text-[19px] tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
        {control.unit && (
          <span className="grid shrink-0 place-items-center px-3 font-mono text-[11px] text-ashdim">
            {control.unit}
          </span>
        )}
        <Step onClick={() => bump(1)} label={`Tambah ${control.label}`} glyph="+" />
      </div>
      <input
        type="range"
        min={control.min}
        max={control.max}
        step={control.step}
        value={value}
        onChange={(e) => set(Number(e.target.value))}
        aria-label={`${control.label} geser`}
        style={{ accentColor: tint }}
        className="w-full cursor-pointer"
      />
    </div>
  );
}


function Step({
  onClick,
  label,
  glyph,
}: {
  onClick: () => void;
  label: string;
  glyph: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid w-12 shrink-0 place-items-center border-rule font-mono text-lg leading-none text-ash transition-colors duration-300 ease-settle first:border-r last:border-l hover:bg-graphite-hi hover:text-champagne"
    >
      <span aria-hidden="true">{glyph}</span>
    </button>
  );
}

/** Panel setelan alat. Tampilan sama di HP dan di panel VR desktop; `vr` cuma mengunci lebarnya. */
export function TweakPanel({
  level,
  params,
  onChange,
  onRun,
  onClose,
  vr = false,
}: {
  level: Level;
  params: Record<string, number>;
  onChange: (key: string, v: number) => void;
  onRun: () => void;
  onClose: () => void;
  vr?: boolean;
}) {
  const touch = useTouch();
  const chamber = CHAMBERS[level.chamber];
  const tint = chamber.tint;
  return (
    <aside
      style={{ ["--tint" as string]: tint }}
      className="hud bracket flex max-h-[70dvh] w-[25rem] max-w-[92vw] flex-col overflow-hidden border border-rule shadow-[0_16px_40px_rgb(0_0_0/0.42)] pb-[env(safe-area-inset-bottom)]"
    >
      <header className="flex items-start justify-between gap-3 border-b border-rule p-4 sm:p-5">
        <div className="min-w-0">
          <p className="tag flex items-center gap-2 text-ashdim">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-ashdim" />
            {chamber.name}
          </p>
          <h2 className="mt-2 font-serif text-lg leading-snug text-starlight">{level.name}</h2>
          {vr && (
            <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[10px] tracking-wide text-ashdim">
              <span aria-hidden="true" className="tracking-[-0.16em]">⁙⁙</span> seret ruang kosong untuk geser
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup panel"
          className="grid size-10 shrink-0 place-items-center rounded-lg border border-rule font-mono text-sm text-ashdim transition-colors duration-300 ease-settle hover:border-champagne hover:text-champagne"
        >
          <span aria-hidden="true">✕</span>
        </button>
      </header>

      <div className="flex flex-wrap gap-2 border-b border-rule px-4 py-3 sm:px-5">
        <span className="chip tabular-nums" style={{ ["--tint" as string]: tint }}>
          {level.goal.label} {level.goal.target} {level.goal.unit}
        </span>
        <span className="chip tabular-nums">
          ± {level.goal.tolerance} {level.goal.unit}
        </span>
        {level.marker !== undefined && (
          <span className="chip tabular-nums">sasaran {level.marker} m</span>
        )}
      </div>

      <div className="grid gap-5 overflow-y-auto p-4 sm:p-5">
        {level.controls.map((c) => (
          <NumberField
            key={c.key}
            control={c}
            value={params[c.key]}
            tint={tint}
            onChange={(v) => onChange(c.key, v)}
          />
        ))}

        <details className="group border-t border-rule pt-4">
          <summary className="tag inline-flex items-center gap-2 cursor-pointer select-none list-none rounded-full border border-rule px-3 py-1.5 transition-colors hover:border-champagne hover:text-champagne marker:content-none [&::-webkit-details-marker]:hidden">
            <span aria-hidden className="inline-block transition-transform duration-200 group-open:rotate-90">▸</span>
            Rumus & petunjuk
            <span className="font-mono text-[10px] normal-case tracking-normal text-ashdim">
              — {touch ? "ketuk" : "klik"} untuk lihat
            </span>
          </summary>
          <div className="mt-3 grid gap-2">
            <p className="font-serif text-base italic leading-snug" style={{ color: tint }}>
              {level.clue.relation}
            </p>
            <ul className="grid gap-1">
              {level.clue.given.map((g) => (
                <li key={g} className="font-mono text-[11px] tabular-nums text-ash">
                  {g}
                </li>
              ))}
            </ul>
            <p className="text-[12px] leading-relaxed text-ashdim">{level.clue.hint}</p>
          </div>
        </details>
      </div>

      <div className="border-t border-rule p-4">
        <button
          type="button"
          onClick={() => {
            play("run");
            onRun();
          }}
          style={{ background: tint, borderColor: tint, color: "var(--color-obsidian)" }}
          className="btn w-full py-3 font-medium hover:brightness-110"
        >
          Kirim jawaban
        </button>
      </div>
    </aside>
  );
}

function Overlay({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (


    <div
      onClick={onClick}
      className="absolute inset-0 z-20 overflow-y-auto overscroll-contain p-4 sm:p-6"
      style={{ background: "rgb(4 6 9 / 0.82)" }}
    >
      <div className="flex min-h-full items-center justify-center">{children}</div>
    </div>
  );
}
