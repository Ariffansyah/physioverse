import { notFound } from "next/navigation";
import Game from "@/components/game/Game";
import { requireUser } from "@/lib/auth";
import { getLevel } from "@/lib/levels";

export default async function PlayLevel(props: PageProps<"/play/[levelId]">) {
  const { levelId } = await props.params;
  await requireUser();

  // Level cuma dilewatkan lewat id: definisinya berisi fungsi `solve`, yang tidak
  // bisa menyeberangi batas server/client. Klien mengimpor katalognya sendiri.
  if (!getLevel(levelId)) notFound();

  return <Game levelId={levelId} />;
}
