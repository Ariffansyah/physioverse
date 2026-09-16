"use client";

import { useEffect, useRef, useState } from "react";

const HOLD_MS = 4100;
const FADE_MS = 700;
const MIN_MS = 1400;

const TIPS = [
  "Tanpa hambatan udara, lemparan terjauh selalu jatuh di sudut 45 derajat.",
  "Gaya hambat udara tumbuh dengan kuadrat laju. Dua kali lebih cepat berarti empat kali lebih berat dilawan.",
  "Benda di orbit tidak berhenti jatuh. Ia cuma terus meleset dari permukaan.",
  "Pita terang celah ganda merenggang kalau layarnya dimundurkan.",
  "Bayangan lensa cembung melar dan menjauh saat bendanya didekatkan ke titik fokus.",
  "Rumus v² = v₀² + 2as tidak membutuhkan waktu sama sekali.",
  "Yang menentukan tinggi puncak lemparan cuma komponen tegak kecepatannya.",
];

const STREAKS = Array.from({ length: 88 }, (_, i) => ({
  angle: (i * 137.508) % 360,
  dur: 0.9 + ((i * 7) % 12) / 10,
  delay: -(((i * 13) % 21) / 10),
  start: 3 + ((i * 11) % 24),
  tint: i % 9 === 0 ? "var(--color-champagne)" : i % 5 === 0 ? "var(--color-quantum)" : undefined,
}));

export default function Loading({
  label = "Menyiapkan ruang uji",
  done,
  onGone,
}: {
  label?: string;
  done?: boolean;
  onGone?: () => void;
}) {
  const [tip, setTip] = useState(0);
  const [gone, setGone] = useState(false);
  const [ripe, setRipe] = useState(false);
  const bar = useRef<HTMLElement>(null);

  useEffect(() => {
    const id = setTimeout(() => setRipe(true), MIN_MS);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTip((n) => n + 1), 3400);
    return () => clearInterval(id);
  }, []);

  const tracked = done !== undefined;
  const leaving = !!done && ripe;

  useEffect(() => {
    if (!leaving || !bar.current) return;
    const run = bar.current.animate([{ transform: "scaleX(1)" }], {
      duration: 700,
      easing: "cubic-bezier(.2,.8,.3,1)",
      fill: "forwards",
    });
    return () => run.cancel();
  }, [leaving]);

  useEffect(() => {
    if (!leaving) return;
    const id = setTimeout(() => {
      setGone(true);
      onGone?.();
    }, HOLD_MS);
    return () => clearTimeout(id);
  }, [leaving, onGone]);

  if (gone) return null;

  return (
    <div
      className={`pointer-events-auto relative z-2 grid size-full place-items-center overflow-hidden bg-well px-6 py-16 transition-opacity ease-settle ${leaving ? "opacity-0" : "opacity-100"}`}
      style={{
        transitionDuration: `${FADE_MS}ms`,
        transitionDelay: leaving ? `${HOLD_MS - FADE_MS}ms` : "0ms",
      }}
    >
      <div className={`warp ${leaving ? "warp-out" : ""}`} aria-hidden="true">
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

      <div className="load-panel relative grid w-full max-w-md gap-5">
        <p className="tag">Physioverse</p>
        <p className="halo font-serif text-2xl leading-tight text-starlight">{label}</p>
        <div className="meter">
          {tracked ? <i ref={bar} className="crawl" /> : <i className="sweep" />}
        </div>
        <p key={tip} className="tip-in min-h-[4.5rem] text-[14px] leading-relaxed text-ash">
          <span className="text-ashdim">Sambil menunggu: </span>
          {TIPS[tip % TIPS.length]}
        </p>
      </div>
    </div>
  );
}
