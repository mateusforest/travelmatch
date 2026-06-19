"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export type AgencyProfileInput = {
  agency_name: string
  responsible_name: string
  phone: string
  city: string
  state: string
  description: string
  website: string
  instagram: string
  logo_url: string
}

export async function updateAgencyProfile(input: AgencyProfileInput) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, message: "Sessão expirada. Faça login novamente." }
  }

  const { error } = await supabase
    .from("agency_profiles")
    .update({
      agency_name: input.agency_name.trim(),
      responsible_name: input.responsible_name.trim(),
      phone: input.phone.trim() || null,
      city: input.city.trim() || null,
      state: input.state.trim() || null,
      description: input.description.trim() || null,
      website: input.website.trim() || null,
      instagram: input.instagram.trim() || null,
      logo_url: input.logo_url.trim() || null,
    })
    .eq("user_id", user.id)

  if (error) {
    return { ok: false, message: error.message }
  }

  revalidatePath("/agencia/perfil")
  return { ok: true }
}
