import Colophon from "@/components/Colophon";
import MenuLink from "@/components/MenuLink";
import RoomPicker, { type Room } from "@/components/RoomPicker";
import SpaceStage from "@/components/SpaceStage";
import { CHAMBERS, LEVELS, type ChamberKey } from "@/lib/levels";
import { LESSONS } from "@/lib/lesson";

export const metadata = { title: "Mode belajar" };

export default function LearnIndex() {
  const keys = Object.keys(LESSONS) as ChamberKey[];
  const rooms: Room[] = keys.map((key) => ({
    key,
    name: CHAMBERS[key].name,
    tint: CHAMBERS[key].tint,
    title: LESSONS[key].title,
    intro: LESSONS[key].intro,
    missions: LEVELS.filter((l) => l.chamber === key).length,
  }));

  return (
    <>
      <SpaceStage />
      <header className="relative z-2 flex items-center justify-between gap-6 border-b border-rule bg-obsidian/70 px-6 py-4 backdrop-blur-sm sm:px-10 lg:px-16">
        <MenuLink />
        <span className="chip hidden sm:inline-flex">Belajar</span>
      </header>

      <main className="relative z-2 mx-auto w-full max-w-[1480px] flex-1 px-6 py-12 sm:px-10 lg:px-16">
        <div className="grid gap-4 border-b border-rule pb-8 lg:w-[34rem] lg:border-b-0">
          <p className="tag">Mode belajar</p>
          <h1 className="text-[clamp(1.9rem,1.3rem+2.2vw,3rem)] leading-tight">
            Lihat dulu, baru dihitung
          </h1>
          <p className="max-w-[62ch] text-[16px] leading-relaxed text-ash">
            {rooms.length} ruang, {rooms.length} bab fisika, satu planet masing-masing. Pilih ruangnya
            <span className="hidden sm:inline"> dari daftar atau lewat planetnya di langit</span> — kenopnya
            bisa digeser di dalam, dan hitungannya ditulis baris demi baris dengan angka yang barusan
            kamu pilih.
          </p>
        </div>

        <RoomPicker rooms={rooms} />
      </main>

      <Colophon />
    </>
  );
}
