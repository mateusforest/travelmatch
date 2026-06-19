"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"

type LeadInput = {
  package_id?: string | null
  agency_id?: string | null
  traveler_name?: string | null
  traveler_email?: string | null
  traveler_phone?: string | null
  desired_destination?: string | null
  category_slug?: string | null
  message?: string | null
}

export async function createTravelerLead(input: LeadInput) {
  const hasMinimum =
    Boolean(input.package_id) ||
    Boolean(input.agency_id) ||
    Boolean(input.traveler_email?.trim()) ||
    Boolean(input.traveler_phone?.trim()) ||
    Boolean(input.desired_destination?.trim()) ||
    Boolean(input.message?.trim())

  if (!hasMinimum) {
    return { ok: false, message: "Informe ao menos um dado de interesse." }
  }

  const supabase = await createSupabaseServerClient()
  let agencyId = input.agency_id?.trim() || null

  if (input.package_id) {
    const { data: pkg, error } = await supabase
      .from("packages")
      .select("agency_id")
      .eq("id", input.package_id)
      .eq("status", "published")
      .maybeSingle()

    if (error || !pkg) {
      return { ok: false, message: "Pacote não encontrado." }
    }

    agencyId = pkg.agency_id
  }

  const { error } = await supabase.from("traveler_leads").insert({
    package_id: input.package_id || null,
    agency_id: agencyId,
    traveler_name: input.traveler_name?.trim() || null,
    traveler_email: input.traveler_email?.trim() || null,
    traveler_phone: input.traveler_phone?.trim() || null,
    desired_destination: input.desired_destination?.trim() || null,
    category_slug: input.category_slug?.trim() || null,
    message: input.message?.trim() || null,
    status: "new",
  })

  if (error) {
    return { ok: false, message: error.message }
  }

  return { ok: true }
}

export async function registerMatchSearch(input: {
  search_term: string
  category_slug?: string | null
  traveler_email?: string | null
}) {
  const searchTerm = input.search_term.trim()

  if (!searchTerm) {
    return { ok: false }
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from("match_searches").insert({
    search_term: searchTerm,
    category_slug: input.category_slug?.trim() || null,
    traveler_email: input.traveler_email?.trim() || null,
  })

  if (error) {
    return { ok: false }
  }

  return { ok: true }
}
