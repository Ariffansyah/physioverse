import Link from "next/link";
import Colophon from "@/components/Colophon";
import TopBar from "@/components/TopBar";
import { requireUser } from "@/lib/auth";
import { CHAMBERS, LEVELS, rankFor, type ChamberKey } from "@/lib/levels";

type Run = { level_id: string; elapsed_ms: number };
type Holder = { level_id: string; username: string; elapsed_ms: number };

const secs = (ms: number) => `${(ms / 1000).toFixed(1)} s`;

export default async function ChamberSelect() {
  const { supabase, profile } = await requireUser();

  // Katalog misi hidup di lib/levels.ts, sementara runs.level_id cuma kolom
  // teks tanpa foreign key — jadi baris dari versi katalog lama masih
  // tersimpan. Dibatasi ke id yang sekarang ada, supaya yang tuntas tidak
  // pernah melebihi jumlah misi.
  const ids = LEVELS.map((l) => l.id);

  // Tiga kueri kecil dan berbatas, bukan satu kueri yang menarik seluruh
  // riwayat percobaan ke server tiap kali halaman ini dibuka.
  const [{ data: wins }, { count: attempts }, { data: records }] = await Promise.all([
    supabase
      .from("runs")
      .select("level_id, elapsed_ms")
      .in("level_id", ids)
      .eq("solved", true)
      .order("elapsed_ms", { ascending: true })
      .limit(200)
      .returns<Run[]>(),
    supabase.from("runs").select("*", { count: "exact", head: true }).in("level_id", ids),
    supabase.from("leaderboard").select("level_id, username, elapsed_ms").returns<Holder[]>(),
  ]);

  // Sudah terurut menaik, jadi kemunculan pertama tiap misi adalah yang tercepat.
  const best = new Map<string, number>();
  for (const r of wins ?? []) if (!best.has(r.level_id)) best.set(r.level_id, r.elapsed_ms);
  const holder = new Map((records ?? []).map((r) => [r.level_id, r]));

  const xp = LEVELS.filter((l) => best.has(l.id)).reduce((sum, l) => sum + l.xp, 0);
  const totalXp = LEVELS.reduce((sum, l) => sum + l.xp, 0);

  return (
    <>
      <TopBar profile={profile} rank={rankFor(xp)} />

      <main className="relative z-2 mx-auto w-full max-w-[1480px] flex-1 px-6 py-16 sm:px-10 lg:px-16">
        {/* ── Status ──────────────────────────────────────────────────── */}
        <section className="grid gap-10 border-b border-rule pb-12 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-end">
          <div>
            <p className="tag">Catatan pemain</p>
            <h1 className="mt-4 text-[clamp(2rem,1.2rem+2.4vw,3rem)] leading-tight">
              {profile.username}
            </h1>
            <p className="mt-3 text-[15px] text-ash">
              {best.size} dari {LEVELS.length} misi tuntas. {attempts ?? 0} percobaan
              tercatat, termasuk yang gagal.
            </p>
          </div>

          <div className="grid gap-3">
            <div className="flex items-baseline justify-between">
              <span className="tag">{rankFor(xp)}</span>
              <span className="font-mono text-sm tabular-nums text-quantum">
                {xp} / {totalXp} XP
              </span>
            </div>
            {/* Mistar bergraduasi, bukan bilah progres membulat. */}
            <div className="relative h-px bg-rule">
              <div
                className="absolute inset-y-0 left-0 bg-champagne shadow-[0_0_10px_var(--color-champagne)] transition-[width] duration-1000 ease-spring"
                style={{ width: `${(xp / totalXp) * 100}%` }}
              />
              {LEVELS.map((l, i) => (
                <span
                  key={l.id}
                  className="absolute top-0 h-2 w-px bg-rule"
                  style={{ left: `${(i / (LEVELS.length - 1)) * 100}%` }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── Ruang dan misi ──────────────────────────────────────────── */}
        {(Object.keys(CHAMBERS) as ChamberKey[]).map((key) => {
          const chamber = CHAMBERS[key];
          return (
            <section key={key} className="pt-14">
              <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
                <h2 className="text-2xl" style={{ color: chamber.tint }}>
                  {chamber.name}
                </h2>
                <p className="text-sm text-ashdim">{chamber.blurb}</p>
              </div>

              <ul className="mt-7 border-t border-rule">
                {LEVELS.filter((l) => l.chamber === key).map((level) => {
                  const done = best.has(level.id);
                  const locked = false; // ponytail: all playable immediately — unlock gate if progression matters
                  const record = holder.get(level.id);
                  const globalIdx = LEVELS.indexOf(level);

                  const row = (
                    <div
                      className={`flood grid gap-2 border-b border-rule py-6 md:grid-cols-[4.5rem_minmax(0,15rem)_minmax(0,1fr)_auto] md:items-baseline md:gap-8 ${
                        locked ? "opacity-40" : "group-hover:border-[color:var(--tint)] group-hover:pl-5"
                      }`}
                      style={{ ["--tint" as string]: chamber.tint }}
                    >
                      {/* Nomornya dibesarkan: ini layar pilih level, bukan tabel. */}
                      <span className="font-mono text-[2.4rem] leading-none tabular-nums text-ashdim/40 transition-colors duration-500 ease-settle group-hover:text-[color:var(--tint)]">
                        {String(globalIdx + 1).padStart(2, "0")}
                      </span>

                      <h3 className="text-lg font-light text-starlight transition-transform duration-500 ease-spring group-hover:translate-x-1">
                        {level.name}
                      </h3>

                      <div className="grid gap-1.5">
                        <p className="max-w-[54ch] text-[15px] text-ash">{level.objective}</p>
                        <p className="font-mono text-xs text-quantum/75">{level.clue.relation}</p>
                      </div>

                      <div className="grid justify-items-start gap-1.5 font-mono text-[11px] tabular-nums text-ashdim md:justify-items-end md:text-right">
                        <span
                          className={`rounded-[2px] border px-2 py-1 tracking-[0.18em] ${
                            done
                              ? "border-champagne/55 text-champagne"
                              : locked
                                ? "border-rule"
                                : "border-[color:var(--tint)]/45 text-[color:var(--tint)]"
                          }`}
                        >
                          {done ? "TUNTAS" : locked ? "TERKUNCI" : "SIAP"}
                        </span>
                        {done && <span>waktumu {secs(best.get(level.id)!)}</span>}
                        {record && (
                          <span>
                            rekor {secs(record.elapsed_ms)} {record.username}
                          </span>
                        )}
                        <span>{level.xp} XP</span>
                      </div>
                    </div>
                  );

                  return locked ? (
                    <li key={level.id} className="group cursor-not-allowed">
                      {row}
                    </li>
                  ) : (
                    <li key={level.id} className="group">
                      <Link href={`/play/${level.id}`} className="block">
                        {row}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </main>

      <Colophon />
    </>
  );
}
