"use client";

import { useEffect, useState } from "react";


const TIPS = [
  "Tanpa hambatan udara, lemparan terjauh selalu jatuh di sudut 45 derajat.",
  "Gaya hambat udara tumbuh dengan kuadrat laju. Dua kali lebih cepat berarti empat kali lebih berat dilawan.",
  "Benda di orbit tidak berhenti jatuh. Ia cuma terus meleset dari permukaan.",
  "Pita terang celah ganda merenggang kalau layarnya dimundurkan.",
  "Bayangan lensa cembung melar dan menjauh saat bendanya didekatkan ke titik fokus.",
  "Rumus v² = v₀² + 2as tidak membutuhkan waktu sama sekali.",
  "Yang menentukan tinggi puncak lemparan cuma komponen tegak kecepatannya.",
];

export default function Loading({ label = "Menyiapkan ruang uji" }: { label?: string }) {
  const [tip, setTip] = useState(0);


  useEffect(() => {
    const id = setInterval(() => setTip((n) => n + 1), 3400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative z-2 grid size-full place-items-center px-6 py-16">
      <div className="grid w-full max-w-md gap-5">
        <p className="tag">Physioverse</p>
        <p className="font-serif text-2xl leading-tight text-starlight">{label}</p>
        <div className="meter">
          <i className="sweep" />
        </div>
        <p className="min-h-[4.5rem] text-[14px] leading-relaxed text-ash">
          <span className="text-ashdim">Sambil menunggu: </span>
          {TIPS[tip % TIPS.length]}
        </p>
      </div>
    </div>
  );
}
