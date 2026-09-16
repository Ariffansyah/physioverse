"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { getLevel, isSolved, sanitizeParams } from "@/lib/levels";

export async function finishRun(levelId: string, rawParams: unknown, elapsedMs: number) {
  const { supabase, profile } = await requireUser();

  const level = getLevel(levelId);
  if (!level) throw new Error("Level tidak dikenal.");

  const params = sanitizeParams(level, rawParams);
  const value = level.solve(params);
  const solved = isSolved(level, value);

  const { error } = await supabase.from("runs").insert({
    user_id: profile.id,
    level_id: level.id,
    solved,
    value: Number.isFinite(value) ? value : 0,
    elapsed_ms: Math.min(Math.max(Math.round(elapsedMs) || 0, 0), 3_600_000),
  });
  if (error) throw new Error(error.message);

  revalidatePath("/play");
  return { solved, value };
}
