import Link from "next/link";
import Colophon from "@/components/Colophon";
import FringeField from "@/components/FringeField";
import MainMenu from "@/components/MainMenu";
import { CHAMBERS, LEVELS, type ChamberKey } from "@/lib/levels";
import { heightAtX, projectile } from "@/lib/physics";

/** Kecepatan pinjaman: hanya penentu bentuk lengkung, bukan angka level. */
const V = 14;

/**
 * Lintasan glyph digambar dari rumus yang sama dengan yang dipakai ruang uji,
 * bukan kurva karangan. Diregangkan ke chord (x0,y0)-(x1,y1) dengan apex
 * setinggi `peak` di atas chord itu — parabola miring tetap parabola.
 */
function arc(deg: number, x0: number, y0: number, x1: number, y1: number, peak: number) {
  const { range, apex } = projectile(V, deg);
  return Array.from({ length: 17 }, (_, i) => {
    const u = i / 16;
    const x = x0 + (x1 - x0) * u;
    const y = y0 + (y1 - y0) * u - (heightAtX(V, deg, u * range) / apex) * peak;
    return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join("");
}

const LOOP = [
  {
    key: "W A S D",
    head: "Jelajahi arena",
    body: "Berjalan di dalam ruangan - lihat cincin, rel, atau ring basket dari dekat. Jarak & tinggi tertulis jelas di lantai dan tiang.",
  },
  {
    key: "E / TAB",
    head: "Atur objeknya langsung",
    body: "Buka konsol yang melayang di depanmu, ketik angkanya di sana - panelnya bisa kamu seret ke mana saja.",
  },
  {
    key: "RUMUS",
    head: "Coba + hitung",
    body: "Rumus tetap ada di samping, tapi hasilnya tidak dibocorkan. Hitung sendiri, kirim, lalu lihat selisihmu.",
  },
  {
    key: "KIRIM MISI",
    head: "Lihat hasilnya",
    body: "Tekan KIRIM MISI - instrumennya jalan sesuai angkamu: bola melayang, sinar terbias, pola fringe muncul. Selisih hasilmu dengan target langsung tampil; masuk toleransi = XP.",
  },
];

const GLYPH: Record<ChamberKey, React.ReactNode> = {
  ballistics: (
    <>
      <path d={arc(52, 2, 40, 46, 40, 30)} strokeDasharray="2 3" />
      <circle cx="2" cy="40" r="2.5" />
      <circle cx="46" cy="40" r="2.5" />
      <path d="M2 40 12 26" />
    </>
  ),
  court: (
    <>
      <ellipse cx="37" cy="24" rx="6" ry="6" />
      <path d={arc(58, 6, 36, 37, 24, 13)} strokeDasharray="2 3" />
      <circle cx="6" cy="36" r="2.5" />
    </>
  ),
  photonics: (
    <>
      <ellipse cx="24" cy="24" rx="5" ry="17" />
      <path d="M0 24h48" strokeDasharray="1 4" />
      <path d="M4 14h20l20 19M4 34h20l20-19" />
    </>
  ),
  kinetics: (
    <>
      <path d="M2 34h44" />
      <path d="M2 38h44" opacity=".4" />
      <rect x="8" y="25" width="11" height="8" />
      <path d="M38 14v20M44 14v20" />
    </>
  ),
  quantum: (
    <>
      <path d="M14 4v16M14 28v16" />
      <circle cx="4" cy="24" r="2" />
      <path d="M6 24h6" strokeDasharray="1 4" />
      <path d="M40 4v40" opacity=".5" />
      {[8, 14, 20, 24, 28, 34, 40].map((y, i) => (
        <path key={y} d={`M${40 - (i % 2 ? 3 : 6)} ${y}h${i % 2 ? 3 : 6}`} />
      ))}
    </>
  ),
  gravity: (
    <>
      <ellipse cx="26" cy="24" rx="20" ry="12" />
      <circle cx="12" cy="24" r="3.5" />
      <circle cx="46" cy="24" r="1.8" />
      <path d="M12 24 46 24" strokeDasharray="1 4" opacity=".5" />
    </>
  ),
};

const EQUATION: Record<ChamberKey, string> = {
  ballistics: "R = v² sin 2θ / g",
  court: "y = h₀ + x·tanθ − g·x²/2v²cos²θ",
  photonics: "1/f = 1/s + 1/s′",
  kinetics: "v² = v₀² + 2as",
  quantum: "Δy = λL / d",
  gravity: "T = 2π √(r³/μ)",
};

export default function Landing() {
  return (
    <>
      <main className="relative z-2 flex-1">
        <header className="relative grid min-h-[96svh] content-end overflow-hidden px-6 pb-14 pt-32 sm:px-10 lg:px-16">
          <FringeField />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(to_top,var(--color-obsidian)_14%,rgb(8_14_26/0.62)_48%,rgb(8_14_26/0.04)_90%)]"
          />

          <div className="relative mx-auto w-full max-w-[1480px]">
            <p className="tag">Laboratorium fisika 3D</p>
            <h1 className="halo mt-6 text-[clamp(3rem,1.1rem+7vw,6.5rem)] leading-[0.95] tracking-[-0.03em]">
              PhysioVerse
            </h1>
            <p className="mt-3 font-serif text-[clamp(1.25rem,1rem+1vw,1.9rem)] italic leading-tight text-champagne">
              Into the Physics Verse
            </p>
            <p className="mt-7 max-w-[52ch] text-[clamp(1.0625rem,1rem+0.3vw,1.1875rem)] text-ash">
              Cahaya tidak pernah memilih satu jalan, dan proyektil tidak pernah
              berunding soal jatuhnya. Enam ruang uji, satu aturan: kamu diberi
              persamaannya, tidak pernah jawabannya.{" "}
              <b className="font-normal text-starlight">
                Atur instrumennya, hitung sendiri di kertas, lalu lihat apakah
                alam sepakat.
              </b>
            </p>

            <div className="mt-10">
              <MainMenu missions={LEVELS.length} chambers={Object.keys(CHAMBERS).length} />
            </div>

            {/* Horizon: satu garis selebar halaman, lalu pembacaan instrumen
                yang hidup di bawahnya. */}
            <dl className="mt-16 grid grid-cols-2 gap-x-10 gap-y-7 border-t border-rule pt-7 sm:grid-cols-4">
              {[
                ["Celah d", "d"],
                ["Layar L", "L"],
                ["Gelombang λ", "w"],
                ["Orde terbaca", "m"],
              ].map(([label, key]) => (
                <div key={key} className="grid gap-2">
                  <dt className="tag">{label}</dt>
                  <dd
                    data-echo={key}
                    className="font-mono text-[clamp(1.05rem,0.9rem+0.4vw,1.35rem)] tabular-nums text-quantum"
                  >
                    &nbsp;
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </header>

        {/* ── Metode ────────────────────────────────────────────────────── */}
        <section
          id="metode"
          className="rise mx-auto w-full max-w-[1480px] px-6 py-24 sm:px-10 lg:px-16"
        >
          <div className="mb-14 grid gap-4">
            <p className="tag">Cara main</p>
            <h2 className="text-[clamp(1.9rem,1.1rem+2.6vw,3.15rem)] leading-tight">
              Empat langkah, lalu ulangi
            </h2>
          </div>

          <ul className="border-t border-rule">
            {LOOP.map((step) => (
              <li
                key={step.key}
                className="group grid gap-2 border-b border-rule py-7 transition-all duration-500 ease-spring hover:border-quantum-deep hover:pl-5 md:grid-cols-[7rem_minmax(0,15rem)_minmax(0,1fr)] md:items-baseline md:gap-8"
              >
                <kbd className="justify-self-start rounded-[2px] border border-rule px-2 py-1 font-mono text-[11px] tracking-[0.14em] text-ash transition-colors duration-500 ease-settle group-hover:border-quantum group-hover:text-quantum">
                  {step.key}
                </kbd>
                <h3 className="text-xl font-light leading-snug text-starlight">
                  {step.head}
                </h3>
                <p className="max-w-[62ch] text-[15px] text-ash">{step.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Ruang uji ─────────────────────────────────────────────────── */}
        <section id="ruang" className="mx-auto w-full max-w-[1480px] px-6 py-24 sm:px-10 lg:px-16">
          <div className="rise mb-12 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-b border-rule pb-4">
            <p className="tag">Ruang uji</p>
            <p className="font-mono text-xs tabular-nums text-ashdim">
              {Object.keys(CHAMBERS).length} ruang · {LEVELS.length} misi ·{" "}
              {LEVELS.reduce((sum, l) => sum + l.xp, 0)} XP
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {(Object.keys(CHAMBERS) as ChamberKey[]).map((key, i) => {
              const chamber = CHAMBERS[key];
              const missions = LEVELS.filter((l) => l.chamber === key);
              return (
                <Link
                  key={key}
                  href="/play"
                  className="rise hud group relative grid content-start gap-3 p-6 transition-all duration-500 ease-spring hover:-translate-y-1 hover:border-[color:var(--tint)]"
                  style={{ ["--tint" as string]: chamber.tint }}
                >
                  {/* Tepi atasnya menyala dan meluruh, bukan kotak berisi. */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,var(--tint),transparent_64%)] opacity-45 transition-opacity duration-700 ease-settle group-hover:opacity-100"
                  />
                  <div className="flex items-start justify-between gap-4">
                    <svg
                      viewBox="0 0 48 48"
                      fill="none"
                      stroke="var(--tint)"
                      strokeWidth="1"
                      aria-hidden="true"
                      className="lamp size-14"
                    >
                      {GLYPH[key]}
                    </svg>
                    <span className="font-mono text-[2rem] leading-none tabular-nums text-ashdim/35 transition-colors duration-500 ease-settle group-hover:text-[color:var(--tint)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-2xl" style={{ color: chamber.tint }}>
                    {chamber.name}
                  </h3>
                  <p className="font-serif text-base italic text-quantum transition-colors duration-500 ease-settle group-hover:text-[color:var(--tint)]">
                    {EQUATION[key]}
                  </p>
                  <p className="text-[14px] text-ash">{chamber.blurb}</p>

                  <ul className="mt-1 border-t border-rule">
                    {missions.map((l) => (
                      <li
                        key={l.id}
                        className="flex items-baseline gap-3 border-b border-rule py-2.5 last:border-b-0"
                      >
                        <span className="font-mono text-[11px] tabular-nums text-ashdim/55">
                          {String(LEVELS.indexOf(l) + 1).padStart(2, "0")}
                        </span>
                        <span className="flex-1 text-[14px] text-starlight">{l.name}</span>
                        {/* Besaran yang dinilai boleh tampil, angkanya tidak:
                            target dibaca dari dalam ruangan, bukan dari sini. */}
                        <span className="font-mono text-[11px] tabular-nums text-ashdim">
                          ± {l.goal.tolerance} {l.goal.unit} · {l.xp} XP
                        </span>
                      </li>
                    ))}
                  </ul>

                  <span className="mt-2 justify-self-end font-mono text-[11px] tracking-[0.18em] text-ashdim transition-colors duration-500 ease-settle group-hover:text-champagne">
                    MASUK ▸
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-3">
            <Link
              href="/play"
              className="rounded-[2px] border border-rule bg-graphite/60 px-7 py-3.5 text-[15px] transition-all duration-500 ease-spring hover:-translate-y-0.5 hover:border-champagne hover:text-champagne hover:shadow-[0_0_28px_-8px_var(--color-champagne)]"
            >
              Lihat daftar misi
            </Link>
            <span className="font-mono text-[13px] text-ashdim">
              W A S D jalan, E buka konsol, KIRIM MISI untuk coba
            </span>
          </div>
        </section>
      </main>

      <Colophon />
    </>
  );
}
