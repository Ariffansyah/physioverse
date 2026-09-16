import Colophon from "@/components/Colophon";
import SpaceStage from "@/components/SpaceStage";
import TopBar from "@/components/TopBar";
import { requireAdmin } from "@/lib/auth";
import { CHAMBERS, LEVELS, rankFor } from "@/lib/levels";
import { deleteRun, maskCallsign, setBan, setNotice } from "./actions";

export const metadata = { title: "Konsol Pengelola · PhysioVerse" };

type Run = {
  id: string;
  user_id: string;
  level_id: string;
  solved: boolean;
  elapsed_ms: number;
  created_at: string;
};
type Player = {
  id: string;
  username: string;
  role: string;
  banned: boolean;
  created_at: string;
};

const secs = (ms: number) => `${(ms / 1000).toFixed(1)} s`;
const when = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" });

const DAY = 86_400_000;

export default async function AdminConsole() {
  const { supabase, profile } = await requireAdmin();

  // ponytail: 500 percobaan terakhir cukup untuk situs sebesar ini. Kalau
  // datanya tumbuh, pindahkan agregasi di bawah ke view SQL.
  const [{ data: runs }, { data: players }, { data: notice }] = await Promise.all([
    supabase
      .from("runs")
      .select("id, user_id, level_id, solved, elapsed_ms, created_at")
      .order("created_at", { ascending: false })
      .limit(500)
      .returns<Run[]>(),
    supabase
      .from("profiles")
      .select("id, username, role, banned, created_at")
      .returns<Player[]>(),
    supabase.from("notice").select("body").eq("id", true).single<{ body: string }>(),
  ]);

  const log = runs ?? [];
  const roster = players ?? [];
  const name = new Map(roster.map((p) => [p.id, p.username]));

  const perLevel = LEVELS.map((l) => {
    const mine = log.filter((r) => r.level_id === l.id);
    const wins = mine.filter((r) => r.solved);
    return {
      level: l,
      tries: mine.length,
      wins: wins.length,
      best: wins.reduce<Run | null>((a, r) => (!a || r.elapsed_ms < a.elapsed_ms ? r : a), null),
    };
  });

  const perPlayer = roster
    .map((p) => {
      const mine = log.filter((r) => r.user_id === p.id);
      const solved = new Set(mine.filter((r) => r.solved).map((r) => r.level_id));
      const xp = LEVELS.filter((l) => solved.has(l.id)).reduce((s, l) => s + l.xp, 0);
      return { ...p, tries: mine.length, solved: solved.size, xp, last: mine[0]?.created_at };
    })
    .sort((a, b) => Number(b.banned) - Number(a.banned) || b.xp - a.xp);

  // Misi yang hampir tidak pernah tuntas biasanya bukan pemainnya yang salah —
  // toleransinya kesempitan atau slidernya tidak sampai ke jawabannya.
  const offBalance = perLevel
    .filter((r) => r.tries >= 5 && r.wins / r.tries < 0.2)
    .sort((a, b) => a.wins / a.tries - b.wins / b.tries);

  const since = Date.now() - 7 * DAY;
  const active = new Set(
    log.filter((r) => Date.parse(r.created_at) > since).map((r) => r.user_id),
  ).size;

  const totals = [
    ["Akun", `${roster.length}`],
    ["Aktif 7 hari", `${active}`],
    ["Percobaan", `${log.length}`],
    ["Dibekukan", `${roster.filter((p) => p.banned).length}`],
  ];

  return (
    <>
      <SpaceStage />
      <div className="relative z-2 flex min-h-svh flex-col">
        <TopBar profile={profile} />

        <main className="mx-auto w-full max-w-[1480px] flex-1 px-6 py-10 sm:px-10 lg:px-16">
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4 border-b border-rule pb-8">
            <div>
              <p className="tag">Pengelola</p>
              <h1 className="mt-2.5 text-[clamp(1.7rem,1.2rem+1.8vw,2.5rem)] leading-tight">
                Konsol situs
              </h1>
              <p className="mt-3 max-w-[58ch] text-[15px] leading-relaxed text-ash">
                Situs ini terbuka untuk siapa saja, jadi ada dua hal buatan pengunjung
                yang sampai ke pengunjung lain: callsign dan catatan waktu di papan
                rekor. Halaman ini mengurus keduanya.
              </p>
            </div>
            <dl className="flex flex-wrap gap-x-9 gap-y-3">
              {totals.map(([label, value]) => (
                <div key={label} className="grid gap-1.5">
                  <dt className="tag">{label}</dt>
                  <dd className="font-mono text-lg tabular-nums text-quantum">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <section className="hud bracket mt-8 grid gap-4 p-6">
            <div>
              <p className="tag">Pengumuman</p>
              <p className="mt-2 max-w-[72ch] text-[15px] leading-relaxed text-ash">
                Satu baris di menu utama dan daftar misi, terlihat juga oleh pengunjung
                yang belum punya akun. Kosongkan untuk mematikannya.
              </p>
            </div>
            <form action={setNotice} className="flex flex-wrap items-center gap-3">
              <input
                name="body"
                defaultValue={notice?.body ?? ""}
                maxLength={240}
                placeholder="Ruang baru dibuka akhir pekan ini."
                className="field min-w-0 flex-1 px-4 py-2.5 text-[15px] text-starlight"
              />
              <button className="btn btn-hot">Pasang</button>
            </form>
          </section>

          {offBalance.length > 0 && (
            <section className="hud bracket mt-6 grid gap-3 p-6 [--tint:var(--color-oxide)]">
              <p className="tag">Perlu dikalibrasi</p>
              <p className="max-w-[72ch] text-[15px] leading-relaxed text-ash">
                Misi yang hampir tidak pernah tuntas — periksa toleransi dan rentang
                slidernya di <code className="font-mono text-[13px] text-champagne">lib/levels.ts</code>:{" "}
                {offBalance.map((r) => `${r.level.name} (${r.wins}/${r.tries})`).join(" · ")}.
              </p>
            </section>
          )}

          <section className="mt-10 grid gap-4">
            <h2 className="tag">Akun</h2>
            <div className="hud overflow-x-auto">
              <table className="w-full min-w-[52rem] text-left text-sm">
                <thead className="font-mono text-[11px] tracking-[0.18em] text-ashdim">
                  <tr className="border-b border-rule">
                    <th className="px-4 py-3 font-normal">CALLSIGN</th>
                    <th className="px-4 py-3 font-normal">STATUS</th>
                    <th className="px-4 py-3 font-normal">PANGKAT</th>
                    <th className="px-4 py-3 font-normal">XP</th>
                    <th className="px-4 py-3 font-normal">TUNTAS</th>
                    <th className="px-4 py-3 font-normal">TERAKHIR MAIN</th>
                    <th className="px-4 py-3 font-normal text-right">MODERASI</th>
                  </tr>
                </thead>
                <tbody>
                  {perPlayer.map((p) => (
                    <tr key={p.id} className="border-b border-rule/50 last:border-0">
                      <td className="px-4 py-3 text-starlight">{p.username || "—"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-mono text-[11px] tracking-[0.18em] ${
                            p.banned
                              ? "text-oxide"
                              : p.role === "admin"
                                ? "text-champagne"
                                : "text-ashdim"
                          }`}
                        >
                          {p.banned ? "BEKU" : p.role === "admin" ? "PENGELOLA" : "PILOT"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ash">{rankFor(p.xp)}</td>
                      <td className="px-4 py-3 font-mono tabular-nums text-quantum">{p.xp}</td>
                      <td className="px-4 py-3 font-mono tabular-nums text-ash">
                        {p.solved} / {LEVELS.length}
                      </td>
                      <td className="px-4 py-3 font-mono text-[12px] tabular-nums text-ashdim">
                        {p.last ? when(p.last) : "belum pernah"}
                      </td>
                      <td className="px-4 py-3">
                        {p.id === profile.id ? (
                          <span className="block text-right font-mono text-[11px] tracking-[0.18em] text-ashdim/50">
                            KAMU
                          </span>
                        ) : (
                          <div className="flex justify-end gap-5">
                            <form action={maskCallsign}>
                              <input type="hidden" name="id" value={p.id} />
                              <button className="font-mono text-[11px] tracking-[0.18em] text-ashdim transition-colors duration-500 ease-settle hover:text-quantum">
                                SAMARKAN
                              </button>
                            </form>
                            <form action={setBan}>
                              <input type="hidden" name="id" value={p.id} />
                              <input type="hidden" name="banned" value={p.banned ? "0" : "1"} />
                              <button
                                className={`font-mono text-[11px] tracking-[0.18em] transition-colors duration-500 ease-settle ${
                                  p.banned
                                    ? "text-quantum hover:text-starlight"
                                    : "text-ashdim hover:text-oxide"
                                }`}
                              >
                                {p.banned ? "PULIHKAN" : "BEKUKAN"}
                              </button>
                            </form>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-10 grid gap-4">
            <h2 className="tag">Papan rekor</h2>
            <div className="hud overflow-x-auto">
              <table className="w-full min-w-[46rem] text-left text-sm">
                <thead className="font-mono text-[11px] tracking-[0.18em] text-ashdim">
                  <tr className="border-b border-rule">
                    <th className="px-4 py-3 font-normal">MISI</th>
                    <th className="px-4 py-3 font-normal">RUANG</th>
                    <th className="px-4 py-3 font-normal">COBA</th>
                    <th className="px-4 py-3 font-normal">TUNTAS</th>
                    <th className="px-4 py-3 font-normal">REKOR</th>
                  </tr>
                </thead>
                <tbody>
                  {perLevel.map((r) => (
                    <tr key={r.level.id} className="border-b border-rule/50 last:border-0">
                      <td className="px-4 py-3 text-starlight">{r.level.name}</td>
                      <td className="px-4 py-3 text-ash">{CHAMBERS[r.level.chamber].name}</td>
                      <td className="px-4 py-3 font-mono tabular-nums text-ash">{r.tries}</td>
                      <td className="px-4 py-3 font-mono tabular-nums text-quantum">
                        {r.wins}
                        {r.tries > 0 && (
                          <span className="text-ashdim">
                            {" "}
                            ({Math.round((r.wins / r.tries) * 100)}%)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono tabular-nums text-champagne">
                        {r.best
                          ? `${secs(r.best.elapsed_ms)} · ${name.get(r.best.user_id) ?? "?"}`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-10 grid gap-4">
            <h2 className="tag">Percobaan terakhir</h2>
            <div className="hud overflow-x-auto">
              <table className="w-full min-w-[46rem] text-left text-sm">
                <thead className="font-mono text-[11px] tracking-[0.18em] text-ashdim">
                  <tr className="border-b border-rule">
                    <th className="px-4 py-3 font-normal">WAKTU</th>
                    <th className="px-4 py-3 font-normal">CALLSIGN</th>
                    <th className="px-4 py-3 font-normal">MISI</th>
                    <th className="px-4 py-3 font-normal">HASIL</th>
                    <th className="px-4 py-3 font-normal">DURASI</th>
                    <th className="px-4 py-3 font-normal" />
                  </tr>
                </thead>
                <tbody>
                  {log.slice(0, 40).map((r) => (
                    <tr key={r.id} className="border-b border-rule/50 last:border-0">
                      <td className="px-4 py-3 font-mono text-[12px] tabular-nums text-ashdim">
                        {when(r.created_at)}
                      </td>
                      <td className="px-4 py-3 text-starlight">{name.get(r.user_id) ?? "—"}</td>
                      <td className="px-4 py-3 text-ash">
                        {LEVELS.find((l) => l.id === r.level_id)?.name ?? r.level_id}
                      </td>
                      <td
                        className={`px-4 py-3 font-mono text-[12px] tracking-[0.18em] ${r.solved ? "text-quantum" : "text-ashdim"}`}
                      >
                        {r.solved ? "TUNTAS" : "GAGAL"}
                      </td>
                      <td className="px-4 py-3 font-mono tabular-nums text-ash">
                        {secs(r.elapsed_ms)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <form action={deleteRun}>
                          <input type="hidden" name="id" value={r.id} />
                          <button className="font-mono text-[11px] tracking-[0.18em] text-ashdim transition-colors duration-500 ease-settle hover:text-oxide">
                            HAPUS
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                  {log.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-ash">
                        Belum ada yang main.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>

        <Colophon />
      </div>
    </>
  );
}
