"use server"

import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { slugify } from "@/lib/format"

type PackageInput = {
  title: string
  destination: string
  categoryId: string
  description: string
  priceFrom: string
  durationDays: string
  status: "draft" | "published"
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
  })

  if (error) {
    return { ok: false, message: error.message }
  }

  redirect("/agencia/pacotes")
}
