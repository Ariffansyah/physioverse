import FringeField from "@/components/FringeField";
import MainMenu, { type MenuItem } from "@/components/MainMenu";
import SoundToggle from "@/components/SoundToggle";
import { CHAMBERS, LEVELS } from "@/lib/levels";
import { createClient } from "@/lib/supabase/server";

/**
 * Layar judul. Satu layar penuh, tidak bergulir — katalog ruang uji dan cara
 * main sudah hidup di dalam /play, jadi pintunya tidak perlu ikut menjelaskan.
 */
export default async function Landing() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const chambers = Object.keys(CHAMBERS).length;
  const items: MenuItem[] = [
    user
      ? { label: "Lanjutkan misi", hint: `${LEVELS.length} misi siap`, href: "/play" }
      : { label: "Mulai lab", hint: `${LEVELS.length} misi siap`, href: "/play" },
    // Pintu masuk akun cuma berguna buat yang belum masuk.
    ...(user ? [] : [{ label: "Masuk akun", hint: "pilot terdaftar", href: "/auth/login" }]),
    { label: "Ketentuan", hint: "aturan main", href: "/ketentuan" },
    { label: "Privasi", hint: "data & cookie", href: "/privasi" },
  ];

  return (
    <main className="relative grid h-svh grid-rows-[1fr_auto] overflow-hidden px-6 sm:px-10 lg:px-16">
      <FringeField />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_top,var(--color-obsidian)_4%,rgb(8_14_26/0.34)_38%,transparent_84%)]"
      />
      {/* Limbus planet di kaki layar: piringan gelap dengan satu tepi yang kena
          cahaya. Cakrawala inilah yang bikin medannya terbaca sebagai ruang,
          bukan sebagai latar hitam. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[184vw] left-1/2 aspect-square w-[200vw] -translate-x-1/2 rounded-full border-t border-quantum/35 bg-[radial-gradient(circle_at_50%_9%,#12233a,#0a1422_11%,#070d18_16%)] shadow-[0_-1px_70px_-10px_rgb(99_201_214/0.4)]"
      />

      <div className="relative mx-auto grid w-full max-w-[1480px] self-center items-end gap-10 py-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div>
          <p className="tag">Laboratorium fisika 3D</p>
          <h1 className="halo mt-5 text-[clamp(2.5rem,1.1rem+7vw,min(6.5rem,14vh))] leading-[0.95] tracking-[-0.03em]">
            PhysioVerse
          </h1>
          <p className="mt-3 font-serif text-[clamp(1.25rem,1rem+1vw,1.9rem)] italic leading-tight text-champagne">
            Into the Physics Verse
          </p>
          <p className="mt-5 max-w-[60ch] text-[15px] text-ash">
            {chambers} ruang uji, {LEVELS.length} misi. Kamu diberi persamaannya, tidak
            pernah jawabannya.
          </p>

          <div className="mt-7">
            <MainMenu items={items} />
          </div>
        </div>

        {/* Bacaan instrumen yang hidup: angkanya ditulis FringeField lewat
            data-echo, jadi panel ini menempel ke medan di belakangnya. */}
        <aside className="hud bracket hidden bg-graphite/70 p-5 backdrop-blur-sm sm:block lg:mb-2">
          <p className="tag">Celah ganda · aktif</p>
          <dl className="mt-5 grid gap-2.5">
            {[
              ["Celah d", "d"],
              ["Layar L", "L"],
              ["Gelombang λ", "w"],
              ["Orde terbaca", "m"],
            ].map(([label, key]) => (
              <div
                key={key}
                className="flex items-baseline justify-between gap-4 border-b border-rule/60 pb-2 last:border-b-0 last:pb-0"
              >
                <dt className="tag">{label}</dt>
                <dd data-echo={key} className="font-mono tabular-nums text-quantum">
                  &nbsp;
                </dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>

      <div className="relative flex items-center justify-between border-t border-rule/50 py-4 font-mono text-[11px] tracking-[0.18em] text-ashdim">
        <span>PHYSIOVERSE</span>
        <SoundToggle />
      </div>
    </main>
  );
}
