import Link from "next/link";

/** Satu-satunya jalan pulang, bentuknya sama di tiap layar supaya tidak perlu
    dicari: tiap halaman yang bukan menu utama memasang ini di kiri atas. */
export default function MenuLink({ label = "Menu utama" }: { label?: string }) {
  return (
    <Link
      href="/"
      className="group flex items-center gap-2.5 font-mono text-[11px] tracking-[0.18em] uppercase text-ash transition-colors duration-500 ease-settle hover:text-champagne"
    >
      <span
        aria-hidden="true"
        className="transition-transform duration-500 ease-spring group-hover:-translate-x-1"
      >
        ◂
      </span>
      {label}
    </Link>
  );
}
