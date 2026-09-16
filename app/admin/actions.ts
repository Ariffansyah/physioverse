"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

/** Papan rekor publik: hapus catatan waktu yang janggal. */
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

/** Bekukan / pulihkan akun. Yang beku tidak bisa main dan hilang dari papan rekor. */
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

/**
 * Callsign satu-satunya teks buatan pengguna yang tampil ke pengunjung lain.
 * Tombol ini menggantinya dengan nama netral, bukan menghapus akunnya.
 */
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

/** Pengumuman satu baris yang tampil di menu untuk semua pengunjung. Kosong = mati. */
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
