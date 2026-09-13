import Link from "next/link";
import Colophon from "@/components/Colophon";

export type Clause = { head: string; body: string[] };

export default function LegalPage({
  eyebrow,
  title,
  standfirst,
  clauses,
}: {
  eyebrow: string;
  title: string;
  standfirst: string;
  clauses: Clause[];
}) {
  return (
    <>
      <header className="relative z-2 border-b border-rule px-6 py-5 sm:px-10 lg:px-16">
        <Link href="/" className="font-serif text-lg tracking-tight">
          PhysioVerse
        </Link>
      </header>

      <main className="relative z-2 mx-auto w-full max-w-[1480px] flex-1 px-6 py-20 sm:px-10 lg:px-16">
        <div className="grid gap-4">
          <p className="tag">{eyebrow}</p>
          <h1 className="text-[clamp(2rem,1.2rem+2.6vw,3.25rem)] leading-tight">{title}</h1>
          <p className="max-w-[58ch] text-[15px] leading-relaxed text-ash">{standfirst}</p>
        </div>

        {/* Halaman hukum dapat tipografi yang sama dengan halaman lain,
            bukan tumpukan teks kecil yang dibuang ke bawah. */}
        <ol className="mt-14 border-t border-rule">
          {clauses.map((c, i) => (
            <li
              key={c.head}
              className="grid gap-3 border-b border-rule py-8 md:grid-cols-[4.5rem_minmax(0,1fr)] md:gap-8"
            >
              <span className="font-mono text-[11px] leading-[2.2] tracking-[0.26em] text-ashdim">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="grid gap-3">
                <h2 className="font-serif text-xl font-light leading-snug text-starlight">
                  {c.head}
                </h2>
                {c.body.map((p) => (
                  <p key={p} className="max-w-[64ch] text-[15px] leading-relaxed text-ash">
                    {p}
                  </p>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </main>

      <Colophon />
    </>
  );
}
