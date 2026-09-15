import MenuLink from "@/components/MenuLink";
import SoundToggle from "@/components/SoundToggle";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="relative z-2 grid min-h-svh grid-rows-[auto_1fr_auto] px-6 sm:px-10 lg:px-16">
      <header className="flex items-center py-5">
<MenuLink />
      </header>

      <div className="grid place-items-center py-8">
        <LoginForm />
      </div>

      <div className="flex justify-between border-t border-rule/50 py-4 font-mono text-[11px] tracking-[0.18em] text-ashdim">
        <span>GERBANG PILOT</span>
        <SoundToggle />
      </div>
    </main>
  );
}
