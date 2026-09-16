import MenuLink from "@/components/MenuLink";
import SoundToggle from "@/components/SoundToggle";
import SpaceStage from "@/components/SpaceStage";
import LoginForm from "./LoginForm";

export const metadata = { title: "Masuk" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ banned?: string }>;
}) {
  const banned = (await searchParams).banned === "1";

  return (
    <main className="relative z-2 grid min-h-svh grid-rows-[auto_1fr_auto] px-6 sm:px-10 lg:px-16">
      <SpaceStage />
      <header className="flex items-center py-5">
        <MenuLink />
      </header>

      <div className="grid place-items-center gap-5 py-8">
        {banned && (
          <p className="w-full max-w-sm border-l border-oxide pl-4 text-sm leading-relaxed text-oxide">
            Akun ini dibekukan oleh pengelola, jadi misinya tidak bisa dibuka.
            Kalau menurutmu ini keliru, kirim keberatan ke arppwork@gmail.com.
          </p>
        )}
        <LoginForm />
      </div>

      <div className="flex justify-between border-t border-rule/50 py-4 font-mono text-[11px] tracking-[0.18em] text-ashdim">
        <span>PHYSIOVERSE</span>
        <SoundToggle />
      </div>
    </main>
  );
}
