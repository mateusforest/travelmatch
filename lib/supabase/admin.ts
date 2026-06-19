import { createClient } from "@supabase/supabase-js"
import { assertSupabaseAdminEnv } from "@/lib/supabase/config"

export function createSupabaseAdminClient() {
  const { supabaseUrl, supabaseServiceRoleKey } = assertSupabaseAdminEnv()

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
