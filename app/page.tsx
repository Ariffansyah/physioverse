import Link from "next/link";
import Colophon from "@/components/Colophon";
import FringeField from "@/components/FringeField";
import { CHAMBERS, LEVELS, type ChamberKey } from "@/lib/levels";

const LOOP = [
  {
    key: "W A S D",
    head: "Jelajahi arena",
    body: "Berjalan di dalam ruangan - lihat cincin, rel, atau ring basket dari dekat. Jarak & tinggi tertulis jelas di lantai dan tiang.",
  },
  {
    key: "KETIK",
    head: "Atur objeknya langsung",
    body: "Ketik sudut & tenaga di konsol yang melayang di depanmu - panelnya bisa kamu seret ke mana saja.",
  },
  {
    key: "RUMUS",
    head: "Coba + hitung",
    body: "Rumus tetap ada di samping, tapi hasilnya tidak dibocorkan. Hitung sendiri, kirim, lalu lihat selisihmu.",
  },
  {
    key: "SHOOT",
    head: "Lihat hasilnya",
    body: "Tekan SHOOT - bola/meriam meluncur, apex & landing kelihatan. Tepat masuk = XP, meleset = geser lagi!",
  },
];

const GLYPH: Record<ChamberKey, React.ReactNode> = {
  ballistics: (
    <>
      <path d="M2 40C14 8 34 8 46 40" strokeDasharray="2 3" />
      <circle cx="2" cy="40" r="2.5" />
      <circle cx="46" cy="40" r="2.5" />
      <path d="M2 40 12 26" />
    </>
  ),
  court: (
    <>
      <ellipse cx="37" cy="24" rx="6" ry="6" />
      <path d="M6 36 Q24 6 37 24" strokeDasharray="2 3" />
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
      <path d="M6 24h6" strokeDasharray="1 3" />
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

/** Tiga lebar berbeda, tiga pergeseran berbeda. Bukan tiga kartu sejajar. */
const OFFSET = [
  "max-w-[39rem]",
  "ml-auto max-w-[33rem] lg:mr-20",
  "max-w-[44rem] lg:ml-28",
  "ml-auto max-w-[36rem] lg:mr-40",
  "max-w-[41rem] lg:ml-12",
  "max-w-[38rem] lg:mr-24",
];

export default function Landing() {
  return (
    <>
      <main className="relative z-2 flex-1">
        {/* ── Apertur ───────────────────────────────────────────────────── */}
        <header className="relative grid min-h-[92svh] content-center overflow-hidden px-6 py-28 sm:px-10 lg:px-16">
          <FringeField />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(94deg,var(--color-obsidian)_14%,rgb(10_14_18/0.82)_46%,rgb(10_14_18/0.18)_80%)]"
          />

          <div className="relative mx-auto grid w-full max-w-[1480px] gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="tag">Laboratorium fisika orang pertama</p>
              <h1 className="mt-6 text-[clamp(3rem,1.1rem+7vw,6.5rem)] leading-[0.95] tracking-[-0.03em]">
                PhysioVerse
              </h1>
              <p className="mt-3 font-serif text-[clamp(1.25rem,1rem+1vw,1.9rem)] italic leading-tight text-champagne">
                Into the Physics Verse
              </p>
              <p className="mt-7 max-w-[52ch] text-[clamp(1.0625rem,1rem+0.3vw,1.1875rem)] text-ash">
                Cahaya tidak pernah memilih satu jalan, dan proyektil tidak pernah berunding
                soal jatuhnya. Enam ruang uji, satu aturan: kamu diberi persamaannya, tidak
                pernah jawabannya.{" "}
                <b className="font-normal text-starlight">
                  Atur instrumennya, hitung sendiri di kertas, lalu lihat apakah alam sepakat.
                </b>
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-2">
                <Link
                  href="/play"
                  className="rounded-[2px] border border-rule bg-graphite/60 px-7 py-3.5 text-[15px] transition-all duration-500 ease-settle hover:border-champagne hover:tracking-[0.02em] hover:text-champagne"
                >
                  Masuk laboratorium
                </Link>
                <a
                  href="#metode"
                  className="py-3.5 text-[15px] text-ash transition-all duration-500 ease-settle hover:tracking-[0.02em] hover:text-starlight"
                >
                  Cara kerjanya
                </a>
              </div>
            </div>

            <dl className="grid gap-4 border-l border-rule pl-6 lg:col-span-4 lg:col-start-9 lg:pb-2">
              {[
                ["Celah d", "d"],
                ["Layar L", "L"],
                ["Gelombang λ", "w"],
                ["Orde terbaca", "m"],
              ].map(([label, key]) => (
                <div key={key} className="flex items-baseline justify-between gap-6">
                  <dt className="tag">{label}</dt>
                  <dd
                    data-echo={key}
                    className="font-mono text-[15px] tabular-nums text-quantum"
                  >
                    &nbsp;
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </header>

        {/* ── Metode ────────────────────────────────────────────────────── */}
        <section id="metode" className="mx-auto w-full max-w-[1480px] px-6 py-24 sm:px-10 lg:px-16">
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
                className="grid gap-2 border-b border-rule py-7 transition-all duration-500 ease-settle hover:border-quantum-deep hover:pl-4 md:grid-cols-[7rem_minmax(0,15rem)_minmax(0,1fr)] md:items-baseline md:gap-8"
              >
                <kbd className="justify-self-start rounded-[2px] border border-rule px-2 py-1 font-mono text-[11px] tracking-[0.14em] text-ash">
                  {step.key}
                </kbd>
                <h3 className="text-xl font-light leading-snug text-starlight">{step.head}</h3>
                <p className="max-w-[62ch] text-[15px] text-ash">{step.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Ruang uji ─────────────────────────────────────────────────── */}
        <section className="mx-auto w-full max-w-[1480px] px-6 py-24 sm:px-10 lg:px-16">
          <p className="tag mb-12">Ruang uji</p>

          <div className="grid gap-10 lg:gap-16">
            {(Object.keys(CHAMBERS) as ChamberKey[]).map((key, i) => {
              const chamber = CHAMBERS[key];
              return (
                <article
                  key={key}
                  className={`panel grid gap-4 p-8 transition-colors duration-700 ease-settle hover:border-[color:var(--tint)] ${OFFSET[i]}`}
                  style={{ ["--tint" as string]: chamber.tint }}
                >
                  <svg
                    viewBox="0 0 48 48"
                    fill="none"
                    stroke="var(--tint)"
                    strokeWidth="1"
                    aria-hidden="true"
                    className="size-11"
                  >
                    {GLYPH[key]}
                  </svg>
                  <h3 className="text-2xl" style={{ color: chamber.tint }}>
                    {chamber.name}
                  </h3>
                  <p className="font-serif text-lg italic text-quantum">{EQUATION[key]}</p>
                  <p className="max-w-[58ch] text-[15px] text-ash">{chamber.blurb}</p>

                  <ul className="mt-3">
                    {LEVELS.filter((l) => l.chamber === key).map((l) => (
                      <li
                        key={l.id}
                        className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-rule py-3"
                      >
                        <span className="text-[15px] text-starlight">{l.name}</span>
                        {/* Besaran yang dinilai boleh tampil, angkanya tidak:
                            target dibaca dari dalam ruangan, bukan dari sini. */}
                        <span className="font-mono text-xs tabular-nums text-ashdim">
                          {l.goal.label} · ± {l.goal.tolerance} {l.goal.unit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>

          <div className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-3">
            <Link
              href="/play"
              className="rounded-[2px] border border-rule bg-graphite/60 px-7 py-3.5 text-[15px] transition-all duration-500 ease-settle hover:border-champagne hover:tracking-[0.02em] hover:text-champagne"
            >
              Lihat daftar misi
            </Link>
            <span className="font-mono text-[13px] text-ashdim">W A S D jalan, E atur objek, Shoot untuk coba</span>
          </div>
        </section>
      </main>

      <Colophon />
    </>
  );
}
