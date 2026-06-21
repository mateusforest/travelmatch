"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"

const allowedStatuses = new Set([
  "new",
  "contacted",
  "proposal_sent",
  "won",
  "lost",
  "archived",
])

export async function updateAgencyLead(
  leadId: string,
  input: {
    status?: string
    notes?: string | null
    last_contact_at?: string | null
  },
) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, message: "Sessao expirada." }
  }

  const { data: agency, error: agencyError } = await supabase
    .from("agency_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (agencyError || !agency) {
    return { ok: false, message: "Agencia não encontrada." }
  }

  const update: Record<string, string | null> = {}

  if (input.status) {
    if (!allowedStatuses.has(input.status)) {
      return { ok: false, message: "Status invalido." }
    }
    update.status = input.status
  }

  if (typeof input.notes !== "undefined") {
    update.notes = input.notes?.trim() || null
  }

  if (typeof input.last_contact_at !== "undefined") {
    update.last_contact_at = input.last_contact_at || null
  }

  if (Object.keys(update).length === 0) {
    return { ok: false, message: "Nenhum dado para atualizar." }
  }

  const { error } = await supabase
    .from("traveler_leads")
    .update(update)
    .eq("id", leadId)
    .eq("agency_id", agency.id)

  if (error) {
    return { ok: false, message: error.message }
  }

  revalidatePath("/agencia")
  revalidatePath("/agencia/leads")
  return { ok: true }
}

export async function addAgencyLeadTimelineEvent(
  leadId: string,
  input: {
    title: string
    description?: string | null
  },
) {
  const title = input.title.trim()

  if (!title) {
    return { ok: false, message: "Informe um titulo." }
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, message: "Sessao expirada." }
  }

  const { data: agency } = await supabase
    .from("agency_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!agency) {
    return { ok: false, message: "Agencia não encontrada." }
  }

  const { data: lead } = await supabase
    .from("traveler_leads")
    .select("id")
    .eq("id", leadId)
    .eq("agency_id", agency.id)
    .maybeSingle()

  if (!lead) {
    return { ok: false, message: "Lead não encontrado." }
  }

  const { error } = await supabase.from("lead_timeline_events").insert({
    lead_id: leadId,
    agency_id: agency.id,
    event_type: "manual",
    title,
    description: input.description?.trim() || null,
    created_by: user.id,
  })

  if (error) {
    return { ok: false, message: error.message }
  }

  revalidatePath(`/agencia/leads/${leadId}`)
  return { ok: true }
}
