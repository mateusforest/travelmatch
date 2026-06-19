import { createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase/server"

export type FeaturedAgency = {
  id: string
  slug: string | null
  name: string
  rating: string
  editorialLabel: string | null
  score: number
  pinned: boolean
  manualOrder: number | null
}

type FeaturedAgencyRpcRow = {
  id: string
  slug: string | null
  name: string
  rating: string
  editorial_label: string | null
  score: number
  pinned: boolean
  manual_order: number | null
}

export async function getFeaturedAgencies(limit = 6): Promise<FeaturedAgency[]> {
  if (!hasSupabaseEnv()) {
    return []
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.rpc("get_featured_agencies", {
    limit_count: limit,
  })

  if (error) {
    return []
  }

  return ((data ?? []) as FeaturedAgencyRpcRow[]).map((agency) => ({
    id: agency.id,
    slug: agency.slug,
    name: agency.name,
    rating: agency.rating,
    editorialLabel: agency.editorial_label,
    score: agency.score,
    pinned: agency.pinned,
    manualOrder: agency.manual_order,
  }))
}
