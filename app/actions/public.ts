"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { hasSupabaseEnv } from "@/lib/supabase/config"
import { calculateMatchScore } from "@/lib/match-score"

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
  let leadScore = 0

  if (input.package_id) {
    const { data: pkg, error } = await supabase
      .from("packages")
      .select("agency_id,title,destination,description,featured,travel_categories(name,slug),package_views(count),traveler_leads(count)")
      .eq("id", input.package_id)
      .eq("status", "published")
      .maybeSingle()

    if (error || !pkg) {
      return { ok: false, message: "Pacote não encontrado." }
    }

    agencyId = pkg.agency_id
    const category = Array.isArray(pkg.travel_categories) ? pkg.travel_categories[0] : pkg.travel_categories
    leadScore = calculateMatchScore(
      {
        title: pkg.title ?? "",
        destination: pkg.destination ?? "",
        description: pkg.description ?? "",
        categorySlug: category?.slug,
        categoryName: category?.name,
        featured: Boolean(pkg.featured),
        views: Array.isArray(pkg.package_views) ? pkg.package_views[0]?.count ?? 0 : 0,
        leads: Array.isArray(pkg.traveler_leads) ? pkg.traveler_leads[0]?.count ?? 0 : 0,
      },
      {
        query: input.desired_destination || input.message || pkg.destination,
        categorySlug: input.category_slug,
      },
    )
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
    lead_score: leadScore,
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
  lead_id?: string | null
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
    lead_id: input.lead_id || null,
    package_id: input.package_id || null,
    agency_id: input.agency_id || null,
    event_type: input.event_type.trim(),
    cta_label: input.cta_label?.trim() || null,
    source_page: input.source_page?.trim() || null,
  })

  return { ok: !error }
}

export async function registerWhatsAppClick(input: {
  lead_id?: string | null
  package_id?: string | null
  agency_id?: string | null
  source_page?: string | null
  cta_label?: string | null
}) {
  const result = await registerCtaEvent({
    ...input,
    event_type: "whatsapp_click",
    cta_label: input.cta_label ?? "WhatsApp",
  })

  if (!result.ok || !input.lead_id || !input.agency_id || !hasSupabaseEnv()) {
    return result
  }

  const supabase = await createSupabaseServerClient()
  await supabase.from("lead_timeline_events").insert({
    lead_id: input.lead_id,
    agency_id: input.agency_id,
    event_type: "whatsapp_click",
    title: "Clique em WhatsApp",
    description: input.source_page ?? null,
    metadata: { cta_label: input.cta_label ?? "WhatsApp" },
  })

  return result
}

export async function createAgencyReview(input: {
  token?: string | null
  agency_id: string
  lead_id: string
  rating: number
  comment?: string | null
  would_recommend: boolean
}) {
  if (!hasSupabaseEnv()) {
    return { ok: false, message: "Supabase não configurado." }
  }

  const rating = Number(input.rating)
  if (!input.agency_id || !input.lead_id || rating < 1 || rating > 5) {
    return { ok: false, message: "Dados de avaliação invalidos." }
  }

  const supabase = await createSupabaseServerClient()
  if (input.token) {
    const { data: tokenData, error: tokenError } = await supabase
      .from("review_tokens")
      .select("id,lead_id,agency_id,expires_at,used_at")
      .eq("token", input.token)
      .maybeSingle()

    if (
      tokenError ||
      !tokenData ||
      tokenData.used_at ||
      new Date(tokenData.expires_at).getTime() <= Date.now() ||
      tokenData.lead_id !== input.lead_id ||
      tokenData.agency_id !== input.agency_id
    ) {
      return { ok: false, message: "Token de avaliação invalido." }
    }
  }

  const { error } = await supabase.from("agency_reviews").insert({
    agency_id: input.agency_id,
    lead_id: input.lead_id,
    rating,
    comment: input.comment?.trim() || null,
    would_recommend: input.would_recommend,
  })

  if (error) {
    return { ok: false, message: error.message }
  }

  if (input.token) {
    await supabase
      .from("review_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("token", input.token)
      .is("used_at", null)
  }

  return { ok: true }
}
