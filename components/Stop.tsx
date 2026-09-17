import Link from "next/link";
import Colophon from "@/components/Colophon";
import MenuLink from "@/components/MenuLink";

/** Dead end pages: a page that does not exist, or a page that just broke. */
export default function Stop({
  chip,
  code,
  title,
  body,
  action,
}: {
  chip: string;
  code: string;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <>
      <header className="relative z-2 flex items-center justify-between gap-6 border-b border-rule bg-obsidian/70 px-6 py-4 backdrop-blur-sm sm:px-10 lg:px-16">
        <MenuLink />
        <span className="chip hidden sm:inline-flex">{chip}</span>
      </header>

      <main className="relative z-2 mx-auto grid w-full max-w-[1480px] flex-1 place-items-center px-6 py-14 sm:px-10 lg:px-16">
        <div className="hud bracket grid max-w-[58ch] gap-4 p-8 sm:p-10">
          <p className="tag">{code}</p>
          <h1 className="font-serif text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] leading-tight text-starlight">
            {title}
          </h1>
          <p className="text-[15px] leading-relaxed text-ash">{body}</p>
          <div className="mt-2 flex flex-wrap gap-4">
            {action}
            <Link href="/belajar" className="btn">
              Mode belajar
            </Link>
            <Link href="/play" className="btn">
              Daftar misi
            </Link>
            <Link href="/" className="btn">
              Menu utama
            </Link>
          </div>
        </div>
      </main>

      <Colophon />
    </>
  );
}
