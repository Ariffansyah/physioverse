import { createClient } from "@/lib/supabase/server";

// Hit by cron-job.org so the free Supabase project never idles into a pause.
export async function GET() {
  const supabase = await createClient();
  const { error } = await supabase.from("notice").select("id").limit(1);
  if (error) return Response.json({ ok: false }, { status: 503 });
  return Response.json({ ok: true });
}
