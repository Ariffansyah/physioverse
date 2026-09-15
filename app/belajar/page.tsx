import Link from "next/link";
import Colophon from "@/components/Colophon";
import MenuLink from "@/components/MenuLink";
import SpaceStage from "@/components/SpaceStage";
import { CHAMBERS, LEVELS, type ChamberKey } from "@/lib/levels";
import { LESSONS } from "@/lib/lesson";


export default function LearnIndex() {
  const rooms = Object.keys(LESSONS) as ChamberKey[];

  return (
    <>
      <SpaceStage />
      <header className="relative z-2 flex items-center justify-between gap-6 border-b border-rule bg-obsidian/70 px-6 py-4 backdrop-blur-sm sm:px-10 lg:px-16">
        <MenuLink />
        <span className="chip hidden sm:inline-flex">Belajar</span>
      </header>

      <main className="relative z-2 mx-auto w-full max-w-[1480px] flex-1 px-6 py-12 sm:px-10 lg:px-16">
        <div className="grid gap-4 border-b border-rule pb-8">
          <p className="tag">Mode belajar</p>
          <h1 className="text-[clamp(1.9rem,1.3rem+2.2vw,3rem)] leading-tight">
            Lihat dulu, baru dihitung
          </h1>
          <p className="max-w-[62ch] text-[16px] leading-relaxed text-ash">
            {rooms.length} ruang, {rooms.length} bab fisika. Di sini tidak ada jawaban yang ditutup. Geser kenopnya,
            simulasi 3D-nya berjalan ulang, dan hitungannya ditulis baris demi baris di sebelahnya
            dengan angka yang barusan kamu pilih.
          </p>
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rooms.map((key) => {
            const room = CHAMBERS[key];
            const lesson = LESSONS[key];
            const missions = LEVELS.filter((l) => l.chamber === key).length;
            return (
              <li key={key}>
                <Link
                  href={`/belajar/${key}`}
                  className="hud group grid h-full content-start gap-3 p-6 transition-all duration-500 ease-settle hover:border-[color:var(--tint)]"
                  style={{ ["--tint" as string]: room.tint }}
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className="size-2 rounded-full"
                      style={{ background: room.tint }}
                    />
                    <span className="tag" style={{ color: room.tint }}>
                      {room.name}
                    </span>
                  </span>
                  <h2 className="text-xl leading-snug text-starlight">{lesson.title}</h2>
                  <p className="text-[14px] leading-relaxed text-ash">{lesson.intro}</p>
                  <p className="mt-2 border-t border-rule pt-3 font-mono text-[11px] tracking-[0.18em] text-ashdim">
                    {missions} MISI SETELAHNYA
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </main>

      <Colophon />
    </>
  );
}
