import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

export type Profile = { id: string; username: string };

/** Satu-satunya gerbang auth. Redirect, bukan return null, biar tak bisa lupa dicek. */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("id", user.id)
    .single<Profile>();

  // Fallback kalau trigger profil belum sempat jalan — jangan sampai loop redirect.
  const profile: Profile = data ?? { id: user.id, username: user.email?.split("@")[0] ?? "pilot" };
  return { supabase, profile };
}
