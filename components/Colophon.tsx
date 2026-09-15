import Link from "next/link";
import SoundToggle from "@/components/SoundToggle";

/** Bilah status di kaki layar — bentuknya sama dengan baris kaki di menu utama. */
export default function Colophon() {
  return (
    <footer className="relative z-2 border-t border-rule">
      <div className="mx-auto flex w-full max-w-[1480px] flex-wrap items-center justify-between gap-x-8 gap-y-3 px-6 py-4 font-mono text-[11px] tracking-[0.18em] text-ashdim sm:px-10 lg:px-16">
        <span>PHYSIOVERSE</span>
        <nav className="flex flex-wrap items-center gap-x-7 gap-y-1">
          {[
            ["/play", "MISI"],
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
    </footer>
  );
}
