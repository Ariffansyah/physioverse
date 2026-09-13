import Link from "next/link";

export default function Colophon() {
  return (
    <footer className="relative z-2 border-t border-rule">
      <div className="mx-auto grid w-full max-w-[1480px] gap-9 px-6 pb-20 pt-14 sm:px-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:px-16">
        <nav className="flex flex-wrap gap-x-8 gap-y-1">
          {[
            ["/play", "Ruang uji"],
            ["/ketentuan", "Ketentuan layanan"],
            ["/privasi", "Kebijakan privasi"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="border-b border-transparent py-1.5 text-sm text-ash transition-colors duration-500 ease-settle hover:border-champagne hover:text-starlight"
            >
              {label}
            </Link>
          ))}
        </nav>
        <p className="font-mono text-[13px] leading-[1.8] text-ashdim lg:text-right">
          PhysioVerse
          <br />
          <span className="font-serif italic">Into the Physics Verse</span>
        </p>
      </div>
    </footer>
  );
}
