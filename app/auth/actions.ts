"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error: string } | null;

export async function authenticate(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const register = formData.get("mode") === "register";

  if (!email || password.length < 6) {
    return { error: "Email wajib diisi dan password minimal 6 karakter." };
  }

  const supabase = await createClient();

  if (register) {
    const username = String(formData.get("username") ?? "").trim();
    if (username.length < 3) return { error: "Callsign minimal 3 karakter." };

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    if (error) return { error: error.message };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  redirect("/play");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
