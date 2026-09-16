import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Request-scoped Supabase client. Never share one across requests. */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list) => {
          try {
            for (const { name, value, options } of list) {
              // Tidak ada klien Supabase di browser, jadi token tidak perlu
              // terbaca JavaScript. httpOnly menutup pencurian lewat XSS dan
              // juga jalan pintas menembak REST API langsung dari devtools.
              cookieStore.set(name, value, { ...options, httpOnly: true });
            }
          } catch {
            // Called while rendering a Server Component, where cookies are
            // read-only. proxy.ts already refreshed the session.
          }
        },
      },
    },
  );
}
