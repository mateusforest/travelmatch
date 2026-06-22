"use server"

import { randomUUID } from "crypto"
import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"

const allowedStatuses = new Set([
  "new",
  "contacted",
  "proposal_sent",
  "won",
  "converted",
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

  const { data: updatedLead, error } = await supabase
    .from("traveler_leads")
    .update(update)
    .select("id,agency_id,status")
    .eq("id", leadId)
    .eq("agency_id", agency.id)
    .maybeSingle()

  if (error) {
    return { ok: false, message: error.message }
  }

  if (!updatedLead) {
    return { ok: false, message: "Lead nao encontrado." }
  }

  if (input.status === "won" || input.status === "converted") {
    const admin = createSupabaseAdminClient()
    const { data: existingToken } = await admin
      .from("review_tokens")
      .select("id")
      .eq("lead_id", leadId)
      .maybeSingle()

    if (!existingToken) {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      const token = `${randomUUID().replaceAll("-", "")}${randomUUID().replaceAll("-", "")}`
      const { error: tokenError } = await admin.from("review_tokens").insert({
        lead_id: leadId,
        agency_id: agency.id,
        token,
        expires_at: expiresAt,
      })

      if (tokenError && tokenError.code !== "23505") {
        return { ok: false, message: tokenError.message }
      }

      if (!tokenError) {
        await admin.from("lead_timeline_events").insert({
          lead_id: leadId,
          agency_id: agency.id,
          event_type: "review_token_created",
          title: "Link de avaliação gerado",
          description: "Token público de avaliação criado para o lead ganho.",
          metadata: { expires_at: expiresAt },
          created_by: user.id,
        })
      }
    }
  }

  revalidatePath("/agencia")
  revalidatePath("/agencia/leads")
  revalidatePath(`/agencia/leads/${leadId}`)
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
