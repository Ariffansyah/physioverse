import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

export type Profile = {
  id: string;
  username: string;
  role: "player" | "admin";
  banned: boolean;
};

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data } = await supabase
    .from("profiles")
    .select("id, username, role, banned")
    .eq("id", user.id)
    .single<Profile>();

  const profile: Profile = data ?? {
    id: user.id,
    username: user.email?.split("@")[0] ?? "pilot",
    role: "player",
    banned: false,
  };

  if (profile.banned) {
    await supabase.auth.signOut();
    redirect("/auth/login?banned=1");
  }

  return { supabase, profile };
}

export async function requireAdmin() {
  const gate = await requireUser();
  if (gate.profile.role !== "admin") redirect("/play");
  return gate;
}
