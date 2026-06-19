"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { hasSupabaseEnv } from "@/lib/supabase/config"

type LeadInput = {
  package_id?: string | null
  agency_id?: string | null
  traveler_name?: string | null
  traveler_email?: string | null
  traveler_phone?: string | null
  desired_destination?: string | null
  category_slug?: string | null
  message?: string | null
  source?: string | null
  source_page?: string | null
  cta_label?: string | null
  travel_date?: string | null
  travelers_count?: number | null
  budget_range?: string | null
}

export async function createTravelerLead(input: LeadInput) {
  if (!hasSupabaseEnv()) {
    return { ok: false, message: "Supabase não configurado." }
  }

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
    source: input.source?.trim() || null,
    source_page: input.source_page?.trim() || null,
    cta_label: input.cta_label?.trim() || null,
    travel_date: input.travel_date?.trim() || null,
    travelers_count: input.travelers_count || null,
    budget_range: input.budget_range?.trim() || null,
    status: "new",
  })

  if (error) {
    return { ok: false, message: error.message }
  }

  await registerCtaEvent({
    package_id: input.package_id,
    agency_id: agencyId,
    event_type: "lead_submitted",
    cta_label: input.cta_label ?? "Enviar interesse",
    source_page: input.source_page,
  })

  return { ok: true }
}

export async function registerMatchSearch(input: {
  search_term: string
  category_slug?: string | null
  traveler_email?: string | null
}) {
  const searchTerm = input.search_term.trim()

  if (!searchTerm || !hasSupabaseEnv()) {
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

export async function registerPackageView(input: {
  package_id: string
  agency_id: string
}) {
  if (!hasSupabaseEnv()) {
    return { ok: false }
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from("package_views").insert({
    package_id: input.package_id,
    agency_id: input.agency_id,
  })

  return { ok: !error }
}

export async function registerAgencyProfileView(agencyId: string) {
  if (!hasSupabaseEnv()) {
    return { ok: false }
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from("agency_profile_views").insert({
    agency_id: agencyId,
  })

  return { ok: !error }
}

export async function registerCtaEvent(input: {
  package_id?: string | null
  agency_id?: string | null
  event_type: string
  cta_label?: string | null
  source_page?: string | null
}) {
  if (!hasSupabaseEnv() || !input.event_type.trim()) {
    return { ok: false }
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from("cta_events").insert({
    package_id: input.package_id || null,
    agency_id: input.agency_id || null,
    event_type: input.event_type.trim(),
    cta_label: input.cta_label?.trim() || null,
    source_page: input.source_page?.trim() || null,
  })

  return { ok: !error }
}
