"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { slugify } from "@/lib/format"

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
      slug: slugify(`${input.agency_name}-${user.id.slice(0, 8)}`),
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

export async function uploadAgencyLogo(formData: FormData) {
  const file = formData.get("logo")
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, message: "Sessão expirada. Faça login novamente." }
  }

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Selecione uma imagem." }
  }

  const ext = file.name.split(".").pop() || "png"
  const path = `agency-logos/${user.id}/logo-${Date.now()}.${ext}`
  const { error: uploadError } = await supabase.storage
    .from("travelmatch-images")
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) {
    return { ok: false, message: uploadError.message }
  }

  const { data } = supabase.storage.from("travelmatch-images").getPublicUrl(path)
  const { error } = await supabase
    .from("agency_profiles")
    .update({ logo_url: data.publicUrl })
    .eq("user_id", user.id)

  if (error) {
    return { ok: false, message: error.message }
  }

  revalidatePath("/agencia/perfil")
  return { ok: true, url: data.publicUrl }
}
