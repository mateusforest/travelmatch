import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { assertSupabaseEnv, hasSupabaseEnv } from "@/lib/supabase/config"

export { hasSupabaseEnv }

export async function createSupabaseServerClient() {
  const { supabaseUrl, supabaseAnonKey } = assertSupabaseEnv()
  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Server Components cannot set cookies; middleware/actions refresh them.
        }
      },
    },
  })
}
