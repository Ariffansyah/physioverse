import { notFound } from "next/navigation";
import Game from "@/components/game/Game";
import { requireUser } from "@/lib/auth";
import { getLevel } from "@/lib/levels";

export default async function PlayLevel(props: PageProps<"/play/[levelId]">) {
  const { levelId } = await props.params;
  await requireUser();

  if (!getLevel(levelId)) notFound();

  return <Game levelId={levelId} />;
}
