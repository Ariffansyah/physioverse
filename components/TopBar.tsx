import Link from "next/link";
import MenuLink from "@/components/MenuLink";
import { signOut } from "@/app/auth/actions";
import type { Profile } from "@/lib/auth";

export default function TopBar({
  profile,
  rank,
  xp,
  totalXp,
}: {
  profile: Profile;
  rank?: string;
  xp?: number;
  totalXp?: number;
}) {
  const bar = xp !== undefined && totalXp;
  return (
    <header className="relative z-2 flex flex-col gap-3 border-b border-rule bg-obsidian/70 px-6 py-4 backdrop-blur-sm sm:flex-row sm:items-center sm:gap-x-8 sm:px-10 lg:px-16">
      <MenuLink />

      <div className="flex flex-1 items-center justify-between gap-x-6 gap-y-2 overflow-x-auto sm:justify-end">
        <span className="tag">Pilot</span>
        <span className="text-sm text-starlight">{profile.username}</span>
        {rank && <span className="chip [--tint:var(--color-champagne)]">{rank}</span>}

        {bar && (
          <div className="hidden min-w-[9rem] flex-1 items-center gap-3 sm:flex sm:max-w-[16rem]">
            <div className="meter flex-1">
              <i style={{ width: `${Math.min(100, (xp / totalXp) * 100)}%` }} />
            </div>
            <span className="font-mono text-[11px] tabular-nums text-quantum">
              {xp}/{totalXp}
            </span>
          </div>
        )}

        {profile.role === "admin" && (
          <Link
            href="/admin"
            className="font-mono text-[11px] tracking-[0.18em] text-champagne transition-colors duration-500 ease-settle hover:text-starlight"
          >
            KONSOL
          </Link>
        )}

        <form action={signOut}>
          <button className="font-mono text-[11px] tracking-[0.18em] text-ashdim transition-colors duration-500 ease-settle hover:text-oxide">
            KELUAR
          </button>
        </form>
      </div>
    </header>
  );
}
