import Link from "next/link";
import MainMenu, { type MenuItem } from "@/components/MainMenu";
import Notice from "@/components/Notice";
import SoundToggle from "@/components/SoundToggle";
import SpaceStage from "@/components/SpaceStage";
import { CHAMBERS, LEVELS } from "@/lib/levels";
import { planetOf } from "@/lib/planets";
import { createClient } from "@/lib/supabase/server";


const STEPS = [
  ["Belajar dulu", "Geser kenopnya, simulasinya jalan, hitungannya muncul di sebelah."],
  ["Masuk misi", "Alat dan rumusnya diberi, angkanya tidak. Kamu yang hitung."],
  ["Kirim jawaban", "Ketik hasil hitunganmu, lalu lihat apakah alatnya setuju."],
];


export default async function Landing() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const rooms = Object.values(CHAMBERS);
  const chambers = rooms.length;
  const items: MenuItem[] = [
    {
      label: user ? "Lanjut main" : "Mulai main",
      hint: `${LEVELS.length} misi`,
      href: "/play",
      planet: planetOf("photonics"),
      preview: [...LEVELS.slice(0, 3).map((l) => l.name), `+${LEVELS.length - 3} misi lagi`],
    },
    {
      label: "Belajar dulu",
      hint: `${chambers} ruang`,
      href: "/belajar",
      planet: planetOf("quantum"),
      preview: [...rooms.slice(0, 3).map((c) => c.name), `+${chambers - 3} ruang lagi`],
    },

    ...(user
      ? []
      : [
          {
            label: "Masuk akun",
            hint: "simpan progresmu",
            href: "/auth/login",
            planet: planetOf("kinetics"),
            preview: ["progres tersimpan", "papan peringkat", "lanjut di perangkat lain"],
          },
        ]),
    {
      label: "Tentang",
      hint: "isi situs ini",
      href: "/tentang",
      planet: planetOf("gravity"),
      preview: ["kenapa dibuat", "sumber & lisensi", "kontak"],
    },
  ];

  return (
    <>
      <SpaceStage />
      <Notice />
      <div className="flex min-h-svh flex-col sm:h-svh sm:overflow-hidden">
        <main className="relative z-2 grid flex-1 grid-rows-[1fr_auto] px-6 sm:min-h-0 sm:px-10 lg:px-16">

        <div className="relative mx-auto grid w-full max-w-[1480px] items-end gap-8 self-center py-10 sm:gap-10 sm:py-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
          <div>
            <p className="tag">Game fisika 3D</p>
            <h1 className="halo mt-5 text-[clamp(2.5rem,1.1rem+7vw,min(6.5rem,14vh))] leading-[0.95] tracking-[-0.03em]">
              PhysioVerse
            </h1>
            <p className="mt-3 font-serif text-[clamp(1.25rem,1rem+1vw,1.9rem)] italic leading-tight text-champagne">
              Into the Physics Verse
            </p>
            <p className="mt-5 max-w-[48ch] text-[17px] leading-relaxed text-ash">
              Belajar fisika SMA di dalam lab 3D. Geser alatnya, lihat apa yang berubah,
              dan baca hitungannya langsung di layar. Setelah paham, uji hitunganmu sendiri
              lewat {LEVELS.length} misi di {chambers} ruang uji.
            </p>

            <div className="mt-7">
              <MainMenu items={items} />
            </div>
          </div>

          <aside className="hud bg-graphite/70 p-5 backdrop-blur-sm sm:p-6 lg:mb-2">
            <p className="tag">Cara main</p>
            <ol className="mt-5 grid gap-4">
              {STEPS.map(([title, body], i) => (
                <li key={title} className="flex gap-3.5">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border border-quantum/40 font-mono text-xs text-quantum">
                    {i + 1}
                  </span>
                  <span>
                    <strong className="block font-sans text-[15px] font-medium text-starlight">
                      {title}
                    </strong>
                    <span className="block text-[14px] leading-snug text-ash">{body}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-6 border-t border-rule/60 pt-4 text-[14px] leading-snug text-ashdim">
              Rumusnya selalu diberi. Angkanya kamu yang cari.
            </p>
          </aside>
        </div>

        <div className="relative flex flex-wrap items-center justify-between gap-x-8 gap-y-2 border-t border-rule/50 py-4 font-mono text-[11px] tracking-[0.18em] text-ashdim">
          <span>PHYSIOVERSE</span>
          <nav className="flex flex-wrap items-center gap-x-7 gap-y-1">
            {[
              ["/ketentuan", "KETENTUAN"],
              ["/privasi", "PRIVASI"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="transition-colors duration-500 ease-settle hover:text-champagne"
              >
                {label}
              </Link>
            ))}
            <SoundToggle />
          </nav>
        </div>
        </main>
      </div>
    </>
  );
}
