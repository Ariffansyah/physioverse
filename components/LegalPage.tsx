import Link from "next/link";
import Colophon from "@/components/Colophon";
import MenuLink from "@/components/MenuLink";

export type Clause = { head: string; body: string[] };


export default function LegalPage({
  eyebrow,
  title,
  standfirst,
  clauses,
  chip = "Aturan",
}: {
  eyebrow: string;
  title: string;
  standfirst: string;
  clauses: Clause[];
  chip?: string;
}) {
  return (
    <>
      <header className="relative z-2 flex items-center justify-between gap-6 border-b border-rule bg-obsidian/70 px-6 py-4 backdrop-blur-sm sm:px-10 lg:px-16">
        <MenuLink />
        <span className="chip hidden sm:inline-flex">{chip}</span>
      </header>

      <main className="relative z-2 mx-auto w-full max-w-[1480px] flex-1 px-6 py-14 sm:px-10 lg:px-16">
        <div className="grid gap-4 border-b border-rule pb-8">
          <p className="tag">{eyebrow}</p>
          <h1 className="text-[clamp(2rem,1.2rem+2.6vw,3.25rem)] leading-tight">{title}</h1>
          <p className="max-w-[58ch] text-[15px] leading-relaxed text-ash">{standfirst}</p>
        </div>

        <ol className="mt-8 grid gap-4 lg:grid-cols-2">
          {clauses.map((c, i) => (
            <li
              key={c.head}
              className="hud bracket grid content-start gap-3 p-6 transition-colors duration-500 ease-settle hover:border-quantum-deep"
            >
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-[1.6rem] leading-none tabular-nums text-ashdim/35">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="flex-1 font-serif text-xl font-light leading-snug text-starlight">
                  {c.head}
                </h2>
              </div>
              {c.body.map((p) => (
                <p key={p} className="max-w-[64ch] text-[15px] leading-relaxed text-ash">
                  {p}
                </p>
              ))}
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/belajar" className="btn">
            Mode belajar
          </Link>
          <Link href="/play" className="btn">
            Ke daftar misi
          </Link>
          <Link href="/" className="btn">
            Menu utama
          </Link>
        </div>
      </main>

      <Colophon />
    </>
  );
}
