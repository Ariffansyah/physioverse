import Link from "next/link";
import { signOut } from "@/app/auth/actions";
import type { Profile } from "@/lib/auth";

export default function TopBar({ profile, rank }: { profile: Profile; rank?: string }) {
  return (
    <header className="relative z-2 flex items-center justify-between border-b border-rule px-6 py-5 sm:px-10 lg:px-16">
      <Link href="/" className="font-serif text-lg tracking-tight">
        PhysioVerse
      </Link>
      <div className="flex items-center gap-6 text-sm">
        <span className="text-ash">{profile.username}</span>
        {rank && <span className="tag hidden sm:inline">{rank}</span>}
        <form action={signOut}>
          <button className="border-b border-transparent py-1 text-ashdim transition-colors duration-500 ease-settle hover:border-oxide hover:text-oxide">
            Keluar
          </button>
        </form>
      </div>
    </header>
  );
}
