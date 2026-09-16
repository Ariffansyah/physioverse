import { redirect } from "next/navigation";
import Game from "@/components/game/Game";
import { requireUser } from "@/lib/auth";
import { LEVELS } from "@/lib/levels";
import { canPractice } from "@/lib/practice";

export const metadata = { title: "Misi bonus" };

type Solved = { level_id: string };

export default async function Bonus() {
  const { supabase, profile } = await requireUser();

  const ids = LEVELS.map((l) => l.id);
  const { data } = await supabase
    .from("runs")
    .select("level_id")
    .eq("user_id", profile.id)
    .eq("solved", true)
    .in("level_id", ids)
    .returns<Solved[]>();

  const done = new Set((data ?? []).map((r) => r.level_id));
  if (done.size < LEVELS.length) redirect("/play");

  const rooms = LEVELS.filter(canPractice).map((l) => l.id);

  return <Game levelId={rooms[0]!} rooms={rooms} practice />;
}
