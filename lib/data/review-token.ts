import { createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase/server"

export type ReviewTokenDetails = {
  token: string
  leadId: string
  agencyId: string
  agencyName: string
}

type ReviewTokenRow = {
  token: string
  lead_id: string
  agency_id: string
  expires_at: string
  used_at: string | null
  agency_profiles: { agency_name: string }[] | null
}

export async function getReviewTokenDetails(token: string): Promise<ReviewTokenDetails | null> {
  if (!hasSupabaseEnv()) {
    return null
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("review_tokens")
    .select("token,lead_id,agency_id,expires_at,used_at,agency_profiles(agency_name)")
    .eq("token", token)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  const row = data as ReviewTokenRow
  if (row.used_at || new Date(row.expires_at).getTime() <= Date.now()) {
    return null
  }

  return {
    token: row.token,
    leadId: row.lead_id,
    agencyId: row.agency_id,
    agencyName: row.agency_profiles?.[0]?.agency_name ?? "Agencia",
  }
}
