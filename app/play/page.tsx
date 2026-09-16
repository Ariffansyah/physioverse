import Link from "next/link";
import Colophon from "@/components/Colophon";
import Notice from "@/components/Notice";
import SpaceStage from "@/components/SpaceStage";
import StageSelect, { type Stage } from "@/components/StageSelect";
import TopBar from "@/components/TopBar";
import { requireUser } from "@/lib/auth";
import { CHAMBERS, LEVELS, rankFor } from "@/lib/levels";

export const metadata = { title: "Pilih misi" };

type Run = { level_id: string; elapsed_ms: number };
type Holder = { level_id: string; username: string; elapsed_ms: number };

export default async function ChamberSelect() {
  const { supabase, profile } = await requireUser();


  const ids = LEVELS.map((l) => l.id);


  const [{ data: wins }, { data: records }] = await Promise.all([
    supabase
      .from("runs")
      .select("level_id, elapsed_ms")
      .in("level_id", ids)
      .eq("solved", true)
      .order("elapsed_ms", { ascending: true })
      .limit(200)
      .returns<Run[]>(),
    supabase
      .from("leaderboard")
      .select("level_id, username, elapsed_ms")
      .returns<Holder[]>(),
  ]);


  const best = new Map<string, number>();
  for (const r of wins ?? [])
    if (!best.has(r.level_id)) best.set(r.level_id, r.elapsed_ms);
  const holder = new Map((records ?? []).map((r) => [r.level_id, r]));

  const xp = LEVELS.filter((l) => best.has(l.id)).reduce(
    (sum, l) => sum + l.xp,
    0,
  );
  const totalXp = LEVELS.reduce((sum, l) => sum + l.xp, 0);


  const stages: Stage[] = LEVELS.map((l, i) => {
    const record = holder.get(l.id);
    return {
      id: l.id,
      idx: i + 1,
      key: l.chamber,
      name: l.name,
      objective: l.objective,
      relation: l.clue.relation,
      tolerance: l.goal.tolerance,
      unit: l.goal.unit,
      xp: l.xp,
      chamber: CHAMBERS[l.chamber].name,
      tint: CHAMBERS[l.chamber].tint,
      solved: best.has(l.id),
      yourMs: best.get(l.id),
      recordMs: record?.elapsed_ms,
      recordBy: record?.username,
    };
  });

  return (
    <>
      <SpaceStage />
      <div className="relative z-2 flex min-h-svh flex-col sm:grid sm:h-svh sm:grid-cols-[minmax(0,1fr)] sm:grid-rows-[auto_1fr_auto] sm:overflow-hidden">
        <Notice />
        <TopBar
          profile={profile}
          rank={rankFor(xp)}
          xp={xp}
          totalXp={totalXp}
        />

        <main className="grid min-h-0 grid-cols-[minmax(0,1fr)] content-center gap-7 py-6">
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4 px-6 sm:px-10 lg:px-16">
            <div>
              <p className="tag">Pilih misi</p>
              <h1 className="mt-2.5 text-[clamp(1.7rem,1.2rem+1.8vw,2.5rem)] leading-tight">
                Mau coba yang mana?
              </h1>
            </div>
            <dl className="flex flex-wrap gap-x-9 gap-y-3">
              {[
                ["Selesai", `${best.size} / ${LEVELS.length}`],
                ["Ruang", `${Object.keys(CHAMBERS).length}`],
                ["Peringkat", rankFor(xp)],
              ].map(([label, value]) => (
                <div key={label} className="grid gap-1.5">
                  <dt className="tag">{label}</dt>
                  <dd className="font-mono text-lg tabular-nums text-quantum">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {best.size === LEVELS.length && (
            <div className="px-6 sm:px-10 lg:px-16">
              <Link
                href="/latihan"
                className="hud flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border border-rule p-5 transition-colors duration-500 ease-settle hover:border-champagne"
              >
                <span className="grid gap-2">
                  <span className="tag text-champagne">Misi bonus terbuka</span>
                  <span className="text-[15px] leading-relaxed text-ash">
                    Dua puluh satu misi habis. Yang tersisa soal yang dibangkitkan sendiri:
                    ruangnya diundi, angkanya diacak, jadi tidak ada lagi yang bisa dihafal.
                  </span>
                </span>
                <span className="font-mono text-[12px] tracking-[0.18em] uppercase text-champagne">
                  Mulai →
                </span>
              </Link>
            </div>
          )}

          <StageSelect stages={stages} />
        </main>

        <Colophon />
      </div>
    </>
  );
}
