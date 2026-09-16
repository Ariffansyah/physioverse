import { createClient } from "@/lib/supabase/server";

/**
 * Pengumuman dari pengelola situs. Satu baris di database, tampil ke semua
 * pengunjung termasuk yang belum punya akun. Kosong berarti tidak ada apa-apa
 * untuk disampaikan — dan tidak ada yang dirender.
 */
export default async function Notice() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notice")
    .select("body")
    .eq("id", true)
    .single<{ body: string }>();

  if (!data?.body) return null;

  return (
    <aside className="relative z-2 border-b border-champagne/30 bg-champagne/10 px-6 py-2.5 sm:px-10 lg:px-16">
      <p className="mx-auto flex w-full max-w-[1480px] items-baseline gap-3 text-[14px] leading-snug text-champagne">
        <span className="font-mono text-[11px] tracking-[0.18em] text-champagne/70">INFO</span>
        <span className="text-starlight">{data.body}</span>
      </p>
    </aside>
  );
}
