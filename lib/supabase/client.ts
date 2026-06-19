"use client"

import { createBrowserClient } from "@supabase/ssr"
import { assertSupabaseEnv } from "@/lib/supabase/config"

export function createSupabaseBrowserClient() {
  const { supabaseUrl, supabaseAnonKey } = assertSupabaseEnv()

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
