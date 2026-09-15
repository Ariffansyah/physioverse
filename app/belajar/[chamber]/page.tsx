import { notFound } from "next/navigation";
import Study from "@/components/Study";
import { LESSONS } from "@/lib/lesson";
import type { ChamberKey } from "@/lib/levels";

export function generateStaticParams() {
  return Object.keys(LESSONS).map((chamber) => ({ chamber }));
}

export default async function LearnRoom(props: PageProps<"/belajar/[chamber]">) {
  const { chamber } = await props.params;
  if (!(chamber in LESSONS)) notFound();
  return <Study chamber={chamber as ChamberKey} />;
}
