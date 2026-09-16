"use client";

import { useEffect, useRef, useState } from "react";

/** Held on screen this long after the thing we were waiting for is ready. */
const HOLD_MS = 3500;
const FADE_MS = 700;

const TIPS = [
  "Tanpa hambatan udara, lemparan terjauh selalu jatuh di sudut 45 derajat.",
  "Gaya hambat udara tumbuh dengan kuadrat laju. Dua kali lebih cepat berarti empat kali lebih berat dilawan.",
  "Benda di orbit tidak berhenti jatuh. Ia cuma terus meleset dari permukaan.",
  "Pita terang celah ganda merenggang kalau layarnya dimundurkan.",
  "Bayangan lensa cembung melar dan menjauh saat bendanya didekatkan ke titik fokus.",
  "Rumus v² = v₀² + 2as tidak membutuhkan waktu sama sekali.",
  "Yang menentukan tinggi puncak lemparan cuma komponen tegak kecepatannya.",
];

// Deterministic so the server and the client draw the same sky. Golden angle
// spreads the streaks without clumping; the rest is index arithmetic.
const STREAKS = Array.from({ length: 120 }, (_, i) => ({
  angle: (i * 137.508) % 360,
  dur: 0.9 + ((i * 7) % 12) / 10,
  delay: -(((i * 13) % 21) / 10),
  start: 3 + ((i * 11) % 24),
  tint: i % 9 === 0 ? "var(--color-champagne)" : i % 5 === 0 ? "var(--color-quantum)" : undefined,
}));

export default function Loading({
  label = "Menyiapkan ruang uji",
  done,
}: {
  label?: string;
  /**
   * Flip to true when the real work finished: the warp still runs HOLD_MS more.
   * Leave it out entirely when nobody can report completion — a route-level
   * fallback is yanked by React at any moment, and a numbered bar cut off at
   * 30% reads as broken. Those get the sweep instead.
   */
  done?: boolean;
}) {
  const [tip, setTip] = useState(0);
  const [gone, setGone] = useState(false);
  const bar = useRef<HTMLElement>(null);

  useEffect(() => {
    const id = setInterval(() => setTip((n) => n + 1), 3400);
    return () => clearInterval(id);
  }, []);

  const tracked = done !== undefined;

  // Both halves run on the compositor on purpose: booting a 3D scene blocks the
  // main thread for seconds, and anything driven from there — a timer, or a
  // keyframe carrying a var() — freezes exactly when the user is watching.
  // WAAPI takes the current scale as its implicit start, so no snap either.
  useEffect(() => {
    if (!done || !bar.current) return;
    const run = bar.current.animate([{ transform: "scaleX(1)" }], {
      duration: 700,
      easing: "cubic-bezier(.2,.8,.3,1)",
      fill: "forwards",
    });
    return () => run.cancel();
  }, [done]);

  useEffect(() => {
    if (!done) return;
    const id = setTimeout(() => setGone(true), HOLD_MS);
    return () => clearTimeout(id);
  }, [done]);

  if (gone) return null;

  return (
    <div
      className={`pointer-events-auto relative z-2 grid size-full place-items-center overflow-hidden bg-well px-6 py-16 transition-opacity ease-settle ${done ? "opacity-0" : "opacity-100"}`}
      style={{ transitionDuration: `${FADE_MS}ms`, transitionDelay: done ? `${HOLD_MS - FADE_MS}ms` : "0ms" }}
    >
      <div className={`warp ${done ? "warp-out" : ""}`} aria-hidden="true">
        {STREAKS.map((s) => (
          <i
            key={s.angle}
            style={
              {
                "--a": `${s.angle}deg`,
                "--d": `${s.dur}s`,
                "--t": `${s.delay}s`,
                "--r": `${s.start}vmax`,
                "--c": s.tint,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className="relative grid w-full max-w-md gap-5">
        <p className="tag">Physioverse</p>
        <p className="font-serif text-2xl leading-tight text-starlight">{label}</p>
        <div className="meter">
          {tracked ? <i ref={bar} className="crawl" /> : <i className="sweep" />}
        </div>
        <p className="min-h-[4.5rem] text-[14px] leading-relaxed text-ash">
          <span className="text-ashdim">Sambil menunggu: </span>
          {TIPS[tip % TIPS.length]}
        </p>
      </div>
    </div>
  );
}
