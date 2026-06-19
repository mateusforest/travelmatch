"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { slugify } from "@/lib/format"

export type PackageInput = {
  title: string
  destination: string
  categoryId: string
  description: string
  priceFrom: string
  durationDays: string
  status: "draft" | "published"
  imageUrl?: string
}

function numberFromText(value: string) {
  const normalized = value.replace(/[^\d,.-]/g, "").replace(".", "").replace(",", ".")
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

export async function createAgencyPackage(input: PackageInput) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, message: "Sessão expirada. Faça login novamente." }
  }

  const { data: agency, error: agencyError } = await supabase
    .from("agency_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (agencyError || !agency) {
    return { ok: false, message: "Perfil da agência não encontrado." }
  }

  const title = input.title.trim()
  const destination = input.destination.trim()
  const description = input.description.trim()

  if (!title || !destination || !description) {
    return { ok: false, message: "Preencha título, destino e descrição." }
  }

  const { error } = await supabase.from("packages").insert({
    agency_id: agency.id,
    title,
    slug: slugify(`${title}-${Date.now()}`),
    destination,
    category_id: input.categoryId || null,
    description,
    price_from: numberFromText(input.priceFrom),
    duration_days: numberFromText(input.durationDays),
    status: input.status,
    image_url: input.imageUrl?.trim() || null,
  })

  if (error) {
    return { ok: false, message: error.message }
  }

  redirect("/agencia/pacotes")
}

async function getAgencyIdForCurrentUser() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { supabase, agencyId: null, error: "Sessão expirada. Faça login novamente." }
  }

  const { data: agency, error } = await supabase
    .from("agency_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (error || !agency) {
    return { supabase, agencyId: null, error: "Perfil da agência não encontrado." }
  }

  return { supabase, agencyId: agency.id as string, error: null }
}

export async function updateAgencyPackage(packageId: string, input: PackageInput) {
  const { supabase, agencyId, error: agencyError } = await getAgencyIdForCurrentUser()

  if (!agencyId) {
    return { ok: false, message: agencyError }
  }

  const title = input.title.trim()
  const destination = input.destination.trim()
  const description = input.description.trim()

  if (!title || !destination || !description) {
    return { ok: false, message: "Preencha título, destino e descrição." }
  }

  const { error } = await supabase
    .from("packages")
    .update({
      title,
      destination,
      category_id: input.categoryId || null,
      description,
      price_from: numberFromText(input.priceFrom),
      duration_days: numberFromText(input.durationDays),
      status: input.status,
      image_url: input.imageUrl?.trim() || null,
    })
    .eq("id", packageId)
    .eq("agency_id", agencyId)

  if (error) {
    return { ok: false, message: error.message }
  }

  revalidatePath("/agencia/pacotes")
  revalidatePath(`/agencia/pacotes/${packageId}`)
  redirect("/agencia/pacotes")
}

export async function setAgencyPackageStatus(packageId: string, status: "draft" | "published") {
  const { supabase, agencyId, error: agencyError } = await getAgencyIdForCurrentUser()

  if (!agencyId) {
    return { ok: false, message: agencyError }
  }

  const { error } = await supabase
    .from("packages")
    .update({ status })
    .eq("id", packageId)
    .eq("agency_id", agencyId)

  if (error) {
    return { ok: false, message: error.message }
  }

  revalidatePath("/agencia/pacotes")
  revalidatePath(`/agencia/pacotes/${packageId}`)
  return { ok: true }
}

export async function uploadPackageImage(packageId: string, formData: FormData) {
  const file = formData.get("image")
  const { supabase, agencyId, error: agencyError } = await getAgencyIdForCurrentUser()

  if (!agencyId) {
    return { ok: false, message: agencyError }
  }

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Selecione uma imagem." }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, message: "Sessão expirada. Faça login novamente." }
  }

  const { data: pkg, error: pkgError } = await supabase
    .from("packages")
    .select("id")
    .eq("id", packageId)
    .eq("agency_id", agencyId)
    .maybeSingle()

  if (pkgError || !pkg) {
    return { ok: false, message: "Pacote não encontrado." }
  }

  const ext = file.name.split(".").pop() || "png"
  const path = `package-images/${user.id}/${packageId}-${Date.now()}.${ext}`
  const { error: uploadError } = await supabase.storage
    .from("travelmatch-images")
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) {
    return { ok: false, message: uploadError.message }
  }

  const { data } = supabase.storage.from("travelmatch-images").getPublicUrl(path)
  const { error } = await supabase
    .from("packages")
    .update({ image_url: data.publicUrl })
    .eq("id", packageId)
    .eq("agency_id", agencyId)

  if (error) {
    return { ok: false, message: error.message }
  }

  revalidatePath("/agencia/pacotes")
  revalidatePath(`/agencia/pacotes/${packageId}`)
  return { ok: true, url: data.publicUrl }
}

export async function deleteAgencyPackage(packageId: string) {
  const { supabase, agencyId, error: agencyError } = await getAgencyIdForCurrentUser()

  if (!agencyId) {
    return { ok: false, message: agencyError }
  }

  const { error } = await supabase
    .from("packages")
    .delete()
    .eq("id", packageId)
    .eq("agency_id", agencyId)

  if (error) {
    return { ok: false, message: error.message }
  }

  revalidatePath("/agencia/pacotes")
  return { ok: true }
}
