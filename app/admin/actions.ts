"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

export async function deleteRun(formData: FormData) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("runs")
    .delete()
    .eq("id", String(formData.get("id") ?? ""));
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/play");
}

export async function setBan(formData: FormData) {
  const { supabase, profile } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (id === profile.id) throw new Error("Tidak bisa membekukan akun sendiri.");

  const { error } = await supabase
    .from("profiles")
    .update({ banned: formData.get("banned") === "1" })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/play");
}

export async function maskCallsign(formData: FormData) {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const { error } = await supabase
    .from("profiles")
    .update({ username: `pilot-${id.replace(/-/g, "").slice(0, 6)}` })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/play");
}

export async function setNotice(formData: FormData) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("notice")
    .update({
      body: String(formData.get("body") ?? "").trim().slice(0, 240),
      updated_at: new Date().toISOString(),
    })
    .eq("id", true);
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
}
