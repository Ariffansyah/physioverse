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
              cookieStore.set(name, value, options);
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
